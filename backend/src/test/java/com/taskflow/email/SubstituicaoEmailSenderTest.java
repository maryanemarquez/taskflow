package com.taskflow.email;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig;

@SpringJUnitConfig({ConfiguracaoEmail.class, SubstituicaoEmailSenderTest.FakeConfig.class})
class SubstituicaoEmailSenderTest {

    private static final String DESTINATARIO = "teste@taskflow.invalid";
    private static final String ASSUNTO = "Assunto de teste";
    private static final String CORPO_HTML = "<p>Conteúdo de teste</p>";

    @Autowired
    private ComponenteEmailTeste componente;

    @Autowired
    private EmailSenderDuble dublê;

    @Test
    @DisplayName("HIST-002-fundacao/C08 - porta substituída envia sem conexão SMTP")
    void portaDeTesteSubstituiAdaptadorSmtp() {
        componente.enviar(DESTINATARIO, ASSUNTO, CORPO_HTML);

        assertThat(dublê.destinatario).isEqualTo(DESTINATARIO);
        assertThat(dublê.assunto).isEqualTo(ASSUNTO);
        assertThat(dublê.corpoHtml).isEqualTo(CORPO_HTML);
    }

    @TestConfiguration
    static class FakeConfig {

        @Bean
        EmailSenderDuble emailSenderDuble() {
            return new EmailSenderDuble();
        }

        @Bean
        EmailSender emailSender(EmailSenderDuble dublê) {
            return dublê;
        }

        @Bean
        ComponenteEmailTeste componenteEmailTeste(EmailSender emailSender) {
            return new ComponenteEmailTeste(emailSender);
        }
    }

    static class EmailSenderDuble implements EmailSender {

        private String destinatario;
        private String assunto;
        private String corpoHtml;

        @Override
        public void enviar(String destinatario, String assunto, String corpoHtml) {
            this.destinatario = destinatario;
            this.assunto = assunto;
            this.corpoHtml = corpoHtml;
        }
    }

    static class ComponenteEmailTeste {

        private final EmailSender emailSender;

        ComponenteEmailTeste(EmailSender emailSender) {
            this.emailSender = emailSender;
        }

        void enviar(String destinatario, String assunto, String corpoHtml) {
            emailSender.enviar(destinatario, assunto, corpoHtml);
        }
    }
}
