package com.taskflow.erro;

import org.springframework.http.HttpStatus;

public enum CodigoErroApi {
    VALIDACAO(MensagensApi.CODIGO_VALIDACAO, HttpStatus.BAD_REQUEST);

    private final String codigo;
    private final HttpStatus status;

    CodigoErroApi(String codigo, HttpStatus status) {
        this.codigo = codigo;
        this.status = status;
    }

    public String codigo() {
        return codigo;
    }

    public HttpStatus status() {
        return status;
    }
}
