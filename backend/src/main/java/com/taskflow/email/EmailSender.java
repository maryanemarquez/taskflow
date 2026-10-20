package com.taskflow.email;

public interface EmailSender {

    void enviar(String destinatario, String assunto, String corpoHtml);
}
