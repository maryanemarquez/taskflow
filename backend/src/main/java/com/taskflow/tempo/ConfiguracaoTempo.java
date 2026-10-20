package com.taskflow.tempo;

import java.time.Clock;
import java.util.TimeZone;
import jakarta.annotation.PostConstruct;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration(proxyBeanMethods = false)
public class ConfiguracaoTempo {

    @PostConstruct
    void configurarFusoDaJvm() {
        TimeZone.setDefault(TimeZone.getTimeZone("UTC"));
    }

    @Bean
    public Clock clockUtc() {
        return Clock.systemUTC();
    }
}
