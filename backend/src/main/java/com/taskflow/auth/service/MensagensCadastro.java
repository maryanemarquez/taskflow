package com.taskflow.auth.service;

public final class MensagensCadastro {

    private static final String PREFIXO_WORKSPACE = "Workspace de ";

    private MensagensCadastro() {
    }

    public static String nomeWorkspace(String nomeUsuario) {
        return PREFIXO_WORKSPACE + nomeUsuario;
    }
}
