package com.taskflow.erro;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class LoggingCentralizado {

    private static final Logger LOGGER = LoggerFactory.getLogger(LoggingCentralizado.class);

    public void registrarFalhaInterna(Throwable falha) {
        LOGGER.error(MensagensApi.LOG_FALHA_INTERNA, falha.getClass().getName());
    }
}
