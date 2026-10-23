package com.taskflow.email;

import com.taskflow.erro.LoggingCentralizado;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.nio.charset.StandardCharsets;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;

public class SpringMailEmailSender implements EmailSender {

    private final JavaMailSender mailSender;
    private final String remetente;
    private final LoggingCentralizado logging;

    public SpringMailEmailSender(
            JavaMailSender mailSender,
            String remetente,
            LoggingCentralizado logging) {
        this.mailSender = mailSender;
        this.remetente = remetente;
        this.logging = logging;
    }

    @Override
    @Async
    public void enviar(String destinatario, String assunto, String corpoHtml) {
        try {
            enviarMensagem(destinatario, assunto, corpoHtml);
        } catch (MailException | MessagingException falha) {
            logging.registrarFalhaEnvioEmail(falha);
        }
    }

    private void enviarMensagem(String destinatario, String assunto, String corpoHtml)
            throws MessagingException {
        MimeMessage mensagem = mailSender.createMimeMessage();
        MimeMessageHelper helper =
                new MimeMessageHelper(mensagem, StandardCharsets.UTF_8.name());
        helper.setFrom(remetente);
        helper.setTo(destinatario);
        helper.setSubject(assunto);
        helper.setText(corpoHtml, true);
        mailSender.send(mensagem);
    }
}
