package com.taskflow.auth.service;

import com.taskflow.erro.MensagensApi;

public class ErroCadastro extends RuntimeException {

    private final String campo;
    private final String codigoCampo;

    private ErroCadastro(String campo, String codigoCampo) {
        super(MensagensApi.MENSAGEM_CAMPO_INVALIDO);
        this.campo = campo;
        this.codigoCampo = codigoCampo;
    }

    public String campo() {
        return campo;
    }

    public String codigoCampo() {
        return codigoCampo;
    }

    public static ErroCadastro senhaComTamanhoExcedido() {
        return new ErroCadastro(
                MensagensApi.CAMPO_SENHA, MensagensApi.CODIGO_TAMANHO_EXCEDIDO);
    }

    public static ErroCadastro senhaForaDaPolitica() {
        return new ErroCadastro(
                MensagensApi.CAMPO_SENHA, MensagensApi.CODIGO_SENHA_FORA_DA_POLITICA);
    }

    public static ErroCadastro nomeComTamanhoExcedido() {
        return new ErroCadastro(MensagensApi.CAMPO_NOME, MensagensApi.CODIGO_TAMANHO_EXCEDIDO);
    }

    public static ErroCadastro emailComTamanhoExcedido() {
        return new ErroCadastro(MensagensApi.CAMPO_EMAIL, MensagensApi.CODIGO_TAMANHO_EXCEDIDO);
    }
}
