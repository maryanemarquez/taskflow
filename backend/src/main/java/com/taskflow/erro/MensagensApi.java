package com.taskflow.erro;

import java.util.Map;

public final class MensagensApi {

    public static final String PREFIXO_TIPO = "urn:taskflow:erro:";
    public static final String CODIGO_VALIDACAO = "VALIDACAO";
    public static final String CODIGO_ERRO_INTERNO = "ERRO_INTERNO";
    public static final String CODIGO_TAMANHO_EXCEDIDO = "TAMANHO_EXCEDIDO";
    public static final String CODIGO_SENHA_FORA_DA_POLITICA = "SENHA_FORA_DA_POLITICA";
    public static final String CAMPO_SENHA = "senha";
    public static final String MENSAGEM_CAMPO_INVALIDO = "O valor informado é inválido.";
    public static final String TITULO_VALIDACAO = "Dados inválidos";
    public static final String DETALHE_VALIDACAO = "Um ou mais campos são inválidos.";
    public static final String TITULO_ERRO_INTERNO = "Erro interno";
    public static final String DETALHE_ERRO_INTERNO = "Ocorreu um erro inesperado.";
    public static final String LOG_FALHA_INTERNA = "Falha interna de tipo {}";
    public static final String LOG_FALHA_EMAIL = "Falha no envio de e-mail de tipo {}";

    private MensagensApi() {
    }

    public static String titulo(String codigo) {
        return CODIGO_VALIDACAO.equals(codigo)
                ? TITULO_VALIDACAO
                : TITULO_ERRO_INTERNO;
    }

    public static String detalhe(String codigo) {
        return CODIGO_VALIDACAO.equals(codigo)
                ? DETALHE_VALIDACAO
                : DETALHE_ERRO_INTERNO;
    }

    public static Map<String, String> campo(String nome, String codigoCampo) {
        return Map.of(
                "campo", nome,
                "codigo", codigoCampo,
                "mensagem", MENSAGEM_CAMPO_INVALIDO);
    }
}
