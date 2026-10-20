package com.taskflow.estrutura;

import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.taskflow.TaskFlowApplication;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import org.hibernate.tool.schema.spi.SchemaManagementException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.WebApplicationType;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.context.annotation.Configuration;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@Testcontainers
class DivergenciaEsquemaIntegrationTest {

    @Container
    private static final MySQLContainer<?> MYSQL =
            new MySQLContainer<>("mysql:8.4");

    @Test
    @DisplayName("HIST-002-fundacao/C02 - inicialização falha quando esquema diverge do mapeamento")
    void inicializacaoFalhaComEsquemaDivergente() throws SQLException {
        assertThatThrownBy(this::iniciarAplicacaoComEntidadeDeTeste)
                .hasRootCauseInstanceOf(SchemaManagementException.class);
        assertThat(tabelasCriadasNoBanco()).isZero();
    }

    private void iniciarAplicacaoComEntidadeDeTeste() {
        new SpringApplicationBuilder(TaskFlowApplication.class, MapeamentoDeTeste.class)
                .web(WebApplicationType.NONE)
                .properties(
                        "spring.datasource.url=" + MYSQL.getJdbcUrl(),
                        "spring.datasource.username=" + MYSQL.getUsername(),
                        "spring.datasource.password=" + MYSQL.getPassword(),
                        "spring.datasource.driver-class-name=" + MYSQL.getDriverClassName(),
                        "spring.flyway.enabled=false")
                .run();
    }

    private int tabelasCriadasNoBanco() throws SQLException {
        try (Connection connection = MYSQL.createConnection("");
                Statement statement = connection.createStatement();
                ResultSet result = statement.executeQuery(
                        "SELECT COUNT(*) FROM information_schema.tables "
                                + "WHERE table_schema = DATABASE()")) {
            result.next();
            return result.getInt(1);
        }
    }

    @Configuration(proxyBeanMethods = false)
    @EntityScan(basePackageClasses = EntidadeDeTeste.class)
    static class MapeamentoDeTeste {
    }
}
