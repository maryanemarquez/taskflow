package com.taskflow.estrutura;

import static org.assertj.core.api.Assertions.assertThat;

import java.nio.file.Files;
import java.nio.file.Path;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class EstruturaBackendTest {

    @Test
    @DisplayName("HIST-001-fundacao/C04 - estrutura mínima contém pom.xml e mvnw")
    void estruturaMinimaContemPomEWrapper() {
        Path raizDoModulo = Path.of("").toAbsolutePath();

        assertThat(Files.isRegularFile(raizDoModulo.resolve("pom.xml"))).isTrue();
        assertThat(Files.isRegularFile(raizDoModulo.resolve("mvnw"))).isTrue();
    }
}
