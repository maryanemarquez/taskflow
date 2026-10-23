package com.taskflow.configuracao;

import java.security.SecureRandom;
import java.util.Base64;

public final class ConfiguracaoTeste {

    private static final String SEGREDO = gerarSegredo();

    private ConfiguracaoTeste() {
    }

    public static String segredoJwt() {
        return SEGREDO;
    }

    public static String senhaMail() {
        return SEGREDO;
    }

    private static String gerarSegredo() {
        byte[] bytes = new byte[32];
        new SecureRandom().nextBytes(bytes);
        return Base64.getEncoder().encodeToString(bytes);
    }
}
