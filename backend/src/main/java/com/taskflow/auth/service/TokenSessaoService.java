package com.taskflow.auth.service;

import com.taskflow.auth.dto.SessaoResponse;
import com.taskflow.auth.repository.CadastroRepository;
import com.taskflow.auth.repository.DadosRefreshToken;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.GeneralSecurityException;
import java.security.SecureRandom;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class TokenSessaoService {

    private static final Duration VALIDADE_ACESSO = Duration.ofMinutes(15);
    private static final Duration VALIDADE_REFRESH = Duration.ofDays(7);
    private static final String ALGORITMO = "HmacSHA256";
    private static final String ALGORITMO_HASH = "SHA-256";
    private static final int TAMANHO_TOKEN_BYTES = 32;
    private static final String TIPO_TOKEN = "Bearer";
    private final CadastroRepository repository;
    private final Clock clock;
    private final String segredo;
    private final SecureRandom secureRandom = new SecureRandom();

    public TokenSessaoService(
            CadastroRepository repository,
            Clock clock,
            @Value("${taskflow.security.jwt.secret}") String segredo) {
        this.repository = repository;
        this.clock = clock;
        this.segredo = segredo;
    }

    public SessaoResponse emitir(long usuarioId) {
        Instant agora = clock.instant();
        Instant expiraAcesso = agora.plus(VALIDADE_ACESSO);
        Instant expiraRefresh = agora.plus(VALIDADE_REFRESH);
        String refresh = novoRefreshToken();
        repository.criarRefreshToken(new DadosRefreshToken(
                usuarioId, sha256(refresh), agora, expiraRefresh));
        return new SessaoResponse(
                TIPO_TOKEN, criarJwt(usuarioId, agora, expiraAcesso), expiraAcesso, refresh, expiraRefresh);
    }

    private String novoRefreshToken() {
        byte[] bytes = new byte[TAMANHO_TOKEN_BYTES];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String criarJwt(long usuarioId, Instant emitidoEm, Instant expiraEm) {
        String cabecalho = codificar("{\"alg\":\"HS256\",\"typ\":\"JWT\"}");
        String payload = codificar("{\"sub\":\"" + usuarioId + "\",\"iat\":"
                + emitidoEm.getEpochSecond() + ",\"exp\":" + expiraEm.getEpochSecond() + "}");
        String assinatura = assinar(cabecalho + "." + payload);
        return cabecalho + "." + payload + "." + assinatura;
    }

    private String assinar(String conteudo) {
        try {
            Mac mac = Mac.getInstance(ALGORITMO);
            mac.init(new SecretKeySpec(segredo.getBytes(StandardCharsets.UTF_8), ALGORITMO));
            return Base64.getUrlEncoder().withoutPadding()
                    .encodeToString(mac.doFinal(conteudo.getBytes(StandardCharsets.UTF_8)));
        } catch (GeneralSecurityException erro) {
            throw new IllegalStateException(erro);
        }
    }

    private String sha256(String token) {
        try {
            byte[] hash = MessageDigest.getInstance(ALGORITMO_HASH)
                    .digest(token.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (GeneralSecurityException erro) {
            throw new IllegalStateException(erro);
        }
    }

    private String codificar(String valor) {
        return Base64.getUrlEncoder().withoutPadding()
                .encodeToString(valor.getBytes(StandardCharsets.UTF_8));
    }
}
