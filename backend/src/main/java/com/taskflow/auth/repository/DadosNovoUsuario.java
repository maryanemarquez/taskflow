package com.taskflow.auth.repository;

import java.time.Instant;

// qualidade-exceção: DTO agrupa os quatro valores gravados no registro de usuário.
public record DadosNovoUsuario(String nome, String email, String senhaHash, Instant criadoEm) {
}
