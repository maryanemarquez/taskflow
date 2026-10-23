package com.taskflow.tempo;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig;

@SpringJUnitConfig({ConfiguracaoTempo.class, ClockInjetadoTest.ClockFixoTestConfig.class})
class ClockInjetadoTest {

    private static final Instant INSTANTE_FIXO = Instant.parse("2026-10-20T12:00:00Z");

    @Autowired
    private ComponenteComClock componente;

    @Test
    @DisplayName("HIST-002-fundacao/C06 - componente obtém o instante do Clock fixo injetado")
    void componenteUsaInstanteDoClockFixo() {
        assertThat(componente.instanteAtual()).isEqualTo(INSTANTE_FIXO);
    }

    @TestConfiguration
    static class ClockFixoTestConfig {

        @Bean
        @Primary
        Clock clockFixo() {
            return Clock.fixed(INSTANTE_FIXO, ZoneOffset.UTC);
        }

        @Bean
        ComponenteComClock componenteComClock(Clock clock) {
            return new ComponenteComClock(clock);
        }
    }
}
