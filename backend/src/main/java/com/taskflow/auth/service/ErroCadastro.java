package com.taskflow.auth.service;

import com.taskflow.erro.MensagensApi;

public class ErroCadastro extends RuntimeException {

    private final String codigoCampo;

    private ErroCadastro(String codigoCampo) {
        super(MensagensApi.MENSAGEM_CAMPO_INVALIDO);
        this.codigoCampo = codigoCampo;
    }

    public String codigoCampo() {
        return codigoCampo;
    }

    public static ErroCadastro senhaComTamanhoExcedido() {
        return new ErroCadastro(MensagensApi.CODIGO_TAMANHO_EXCEDIDO);
    }

    public static ErroCadastro senhaForaDaPolitica() {
        return new ErroCadastro(MensagensApi.CODIGO_SENHA_FORA_DA_POLITICA);
    }
}
