package com.taskflow.email;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.taskflow.erro.LoggingCentralizado;
import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import java.util.Properties;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.MailException;
import org.springframework.mail.MailSendException;
import org.springframework.mail.javamail.JavaMailSender;

@ExtendWith(MockitoExtension.class)
class FalhaEnvioEmailTest {

    @Mock
    private JavaMailSender mailSender;

    @Mock
    private LoggingCentralizado logging;

    @Test
    @DisplayName("HIST-002-fundacao/C09 - falha SMTP é registrada sem propagar ao chamador")
    void falhaDeEnvioERegistradaSemPropagar() {
        MimeMessage mensagem = new MimeMessage(Session.getInstance(new Properties()));
        when(mailSender.createMimeMessage()).thenReturn(mensagem);
        doThrow(new MailSendException("SQL_INTERNO_TESTE TOKEN_INTERNO_TESTE"))
                .when(mailSender).send(mensagem);
        SpringMailEmailSender adaptador =
                new SpringMailEmailSender(mailSender, "teste@taskflow.invalid", logging);

        assertThatCode(() -> adaptador.enviar(
                "destinatario@taskflow.invalid",
                "Assunto de teste",
                "<p>Conteúdo de teste</p>"))
                .doesNotThrowAnyException();
        verify(logging).registrarFalhaEnvioEmail(any(MailException.class));
    }
}
