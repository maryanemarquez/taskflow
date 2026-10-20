package com.taskflow.auth.dto;

import java.time.Instant;

// qualidade-exceção: DTO representa todos os campos definidos para o par de tokens da sessão.
public record SessaoResponse(
        String tipo,
        String accessToken,
        Instant accessTokenExpiraEm,
        String refreshToken,
        Instant refreshTokenExpiraEm) {
}
