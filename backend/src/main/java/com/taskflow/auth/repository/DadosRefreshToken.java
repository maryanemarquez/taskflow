package com.taskflow.auth.repository;

import java.time.Instant;

// qualidade-exceção: DTO agrupa os quatro valores persistidos do refresh token.
public record DadosRefreshToken(
        long usuarioId, String tokenHash, Instant criadoEm, Instant expiraEm) {
}
