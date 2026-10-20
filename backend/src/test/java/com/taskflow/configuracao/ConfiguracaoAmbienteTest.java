package com.taskflow.configuracao;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class ConfiguracaoAmbienteTest {

    private static final List<String> PERFIS = List.of("dev", "test", "prod");
    private static final List<String> VARIAVEIS_SECRETAS =
            List.of("DB_PASSWORD", "JWT_SECRET", "MAIL_PASSWORD");
    private static final List<String> VARIAVEIS_DE_AMBIENTE = List.of(
            "DB_HOST", "DB_PORT", "DB_NAME", "DB_USER", "DB_PASSWORD", "JWT_SECRET",
            "MAIL_HOST", "MAIL_PORT", "MAIL_USER", "MAIL_PASSWORD", "MAIL_FROM", "APP_BASE_URL");

    @Test
    @DisplayName("HIST-002-fundacao/C10 - perfis usam variáveis de ambiente sem segredos reais")
    void perfisReferenciamVariaveisSemCredenciaisReais() throws IOException {
        for (String perfil : PERFIS) {
            String configuracao = lerRecurso("/application-" + perfil + ".yml");
            assertThat(configuracao).contains(VARIAVEIS_SECRETAS.stream()
                    .map(variavel -> "${" + variavel + "}")
                    .toArray(String[]::new));
            assertThat(configuracao).contains(
                    "${DB_USER}", "${MAIL_USER}", "${APP_BASE_URL}");
            assertLinhasSecretasUsamVariaveis(configuracao);
        }
        assertExemploDeAmbienteSemValoresSecretos();
    }

    private void assertLinhasSecretasUsamVariaveis(String configuracao) {
        assertThat(configuracao.lines()
                .filter(linha -> linha.toLowerCase().contains("password")
                        || linha.toLowerCase().contains("username")
                        || linha.toLowerCase().contains("secret"))
                .toList())
                .allSatisfy(linha -> assertThat(linha).contains("${"));
    }

    private void assertExemploDeAmbienteSemValoresSecretos() throws IOException {
        String exemplo = Files.readString(Path.of(".env.example"), StandardCharsets.UTF_8);
        List<String> linhas = exemplo.lines().toList();
        for (String variavel : VARIAVEIS_DE_AMBIENTE) {
            assertThat(linhas.stream()
                    .filter(linha -> linha.startsWith(variavel + "="))
                    .toList())
                    .containsExactly(variavel + "=");
        }
    }

    private String lerRecurso(String caminho) throws IOException {
        try (InputStream recurso = getClass().getResourceAsStream(caminho)) {
            return new String(recurso.readAllBytes(), StandardCharsets.UTF_8);
        }
    }
}
