package com.taskflow.erro;

public class ErroDeAplicacao extends RuntimeException {

    private final CodigoErroApi codigo;

    public ErroDeAplicacao(CodigoErroApi codigo, Throwable causa) {
        super(MensagensApi.detalhe(codigo.codigo()), causa);
        this.codigo = codigo;
    }

    public CodigoErroApi codigo() {
        return codigo;
    }
}
