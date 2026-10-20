package com.taskflow.email;

import com.taskflow.erro.LoggingCentralizado;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.EnableAsync;

@Configuration(proxyBeanMethods = false)
@EnableAsync
public class ConfiguracaoEmail {

    @Bean
    @ConditionalOnProperty(prefix = "spring.mail", name = "host")
    @ConditionalOnMissingBean(EmailSender.class)
    public EmailSender springMailEmailSender(
            JavaMailSender mailSender,
            LoggingCentralizado logging,
            @Value("${taskflow.email.from}") String remetente) {
        return new SpringMailEmailSender(mailSender, remetente, logging);
    }
}
