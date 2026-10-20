package com.taskflow.estrutura;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class BancoVersionadoIntegrationTest {

    @Test
    @DisplayName("HIST-002-fundacao/C11 - migração inicial não cria tabelas de negócio")
    void migracaoInicialNaoCriaTabelasDeNegocio() throws IOException {
        try (InputStream migracao = getClass().getResourceAsStream(
                "/db/migration/V1__base_tecnica.sql")) {
            String sql = new String(migracao.readAllBytes(), StandardCharsets.UTF_8);
            assertThat(sql).contains("SELECT 1").doesNotContain("CREATE TABLE");
        }
    }
}
