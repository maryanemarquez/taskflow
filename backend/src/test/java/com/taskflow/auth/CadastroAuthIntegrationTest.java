package com.taskflow.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.taskflow.configuracao.ConfiguracaoTeste;
import java.nio.charset.StandardCharsets;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Testcontainers
class CadastroAuthIntegrationTest {

    private static final String CADASTRO = "/api/v1/auth/cadastro";
    private static final String SENHA_72_BYTES = "a1" + "á".repeat(35);
    private static final String SENHA_73_BYTES = "a1" + "á".repeat(35) + "a";

    @Container
    private static final MySQLContainer<?> MYSQL = new MySQLContainer<>("mysql:8.4");

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @BeforeEach
    void limparBanco() {
        jdbcTemplate.update("DELETE FROM usuario_workspace");
        jdbcTemplate.update("DELETE FROM refresh_token");
        jdbcTemplate.update("DELETE FROM workspace");
        jdbcTemplate.update("DELETE FROM usuario");
    }

    @DynamicPropertySource
    static void configurarBanco(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", MYSQL::getJdbcUrl);
        registry.add("spring.datasource.username", MYSQL::getUsername);
        registry.add("spring.datasource.password", MYSQL::getPassword);
        registry.add("spring.datasource.driver-class-name", MYSQL::getDriverClassName);
        registry.add("taskflow.security.jwt.secret", ConfiguracaoTeste::segredoJwt);
        registry.add("taskflow.security.bcrypt-strength", () -> "4");
    }

    @Test
    @DisplayName("HIST-001-auth/C01 - cadastro válido cria usuário, workspace e vínculo")
    void cadastroValidoCriaUsuarioWorkspaceEVinculo() throws Exception {
        enviarCadastro("Ana", "ana.c01@taskflow.invalid", "senha1234")
                .andExpect(status().isCreated());

        assertThat(contar("usuario")).isEqualTo(1);
        assertThat(contar("workspace")).isEqualTo(1);
        assertThat(contar("usuario_workspace")).isEqualTo(1);
        assertThat(jdbcTemplate.queryForObject(
                "SELECT nome FROM workspace", String.class)).isEqualTo("Workspace de Ana");
        assertThat(jdbcTemplate.queryForObject(
                "SELECT papel FROM usuario_workspace", String.class)).isEqualTo("PROPRIETARIO");
    }

    @Test
    @DisplayName("HIST-001-auth/C02 - cadastro válido devolve par de tokens")
    void cadastroValidoDevolveParDeTokens() throws Exception {
        enviarCadastro("Bia", "bia.c02@taskflow.invalid", "senha1234")
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.tipo").value("Bearer"))
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.refreshToken").isNotEmpty());
    }

    @Test
    @DisplayName("HIST-001-auth/C03 - senha com exatamente 72 bytes UTF-8 é aceita")
    void senhaCom72BytesUtf8EAceita() throws Exception {
        assertThat(SENHA_72_BYTES.getBytes(StandardCharsets.UTF_8)).hasSize(72);

        enviarCadastro("Caio", "caio.c03@taskflow.invalid", SENHA_72_BYTES)
                .andExpect(status().isCreated());
    }

    @Test
    @DisplayName("HIST-001-auth/C04 - senha com 73 bytes é rejeitada sem criar registros")
    void senhaCom73BytesERejeitadaSemCriarRegistros() throws Exception {
        assertThat(SENHA_73_BYTES.getBytes(StandardCharsets.UTF_8)).hasSize(73);

        enviarCadastro("Dani", "dani.c04@taskflow.invalid", SENHA_73_BYTES)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.codigo").value("VALIDACAO"))
                .andExpect(jsonPath("$.erros[0].codigo").value("TAMANHO_EXCEDIDO"));

        assertThat(contar("usuario")).isZero();
        assertThat(contar("workspace")).isZero();
        assertThat(contar("usuario_workspace")).isZero();
    }

    private org.springframework.test.web.servlet.ResultActions enviarCadastro(
            String nome,
            String email,
            String senha) throws Exception {
        String corpo = """
                {"nome":"%s","email":"%s","senha":"%s"}
                """.formatted(nome, email, senha);
        return mockMvc.perform(post(CADASTRO)
                .contentType(MediaType.APPLICATION_JSON)
                .content(corpo));
    }

    private int contar(String tabela) {
        return jdbcTemplate.queryForObject("SELECT COUNT(*) FROM " + tabela, Integer.class);
    }
}
