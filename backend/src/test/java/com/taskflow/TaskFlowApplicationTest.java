package com.taskflow;

import static org.assertj.core.api.Assertions.assertThat;

import com.taskflow.configuracao.ConfiguracaoTeste;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@SpringBootTest
@ActiveProfiles("test")
@Testcontainers
class TaskFlowApplicationTest {

    @Container
    private static final MySQLContainer<?> MYSQL =
            new MySQLContainer<>("mysql:8.4");

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @DynamicPropertySource
    static void configurarBanco(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", MYSQL::getJdbcUrl);
        registry.add("spring.datasource.username", MYSQL::getUsername);
        registry.add("spring.datasource.password", MYSQL::getPassword);
        registry.add("spring.datasource.driver-class-name", MYSQL::getDriverClassName);
        registry.add("taskflow.security.jwt.secret", ConfiguracaoTeste::segredoJwt);
        registry.add("spring.mail.host", () -> "localhost");
        registry.add("spring.mail.port", () -> "1025");
        registry.add("spring.mail.username", () -> "usuario-mail-teste");
        registry.add("spring.mail.password", ConfiguracaoTeste::senhaMail);
        registry.add("taskflow.email.from", () -> "teste@taskflow.invalid");
        registry.add("taskflow.email.base-url", () -> "http://localhost:3000");
    }

    @Test
    @DisplayName("HIST-002-fundacao/C01 - Flyway aplica a migração e Hibernate valida o esquema")
    void flywayAplicaMigracaoEhibernateValidaEsquema() {
        Integer migracoesAplicadas = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM flyway_schema_history WHERE success = TRUE",
                Integer.class);

        assertThat(migracoesAplicadas).isEqualTo(1);
    }
}
