package com.taskflow;

import static org.assertj.core.api.Assertions.assertThatCode;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class TaskFlowApplicationTest {

    @Test
    @DisplayName("HIST-001-fundacao/C01 - aplicação Spring Boot inicia")
    void aplicacaoSpringBootInicia() {
        assertThatCode(() -> TaskFlowApplication.main(new String[0]))
                .doesNotThrowAnyException();
    }
}
