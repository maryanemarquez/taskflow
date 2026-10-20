package com.taskflow.auth.service;

import com.taskflow.auth.dto.CadastroRequest;
import com.taskflow.auth.dto.SessaoResponse;
import com.taskflow.auth.repository.CadastroRepository;
import com.taskflow.auth.repository.DadosNovoUsuario;
import java.time.Clock;
import java.nio.charset.StandardCharsets;
import java.util.Locale;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CadastroService {

    private static final int MINIMO_CARACTERES_SENHA = 8;
    private static final int MAXIMO_BYTES_SENHA = 72;
    private static final String PADRAO_LETRA = ".*\\p{L}.*";
    private static final String PADRAO_NUMERO = ".*\\d.*";
    private final CadastroRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final TokenSessaoService tokenSessaoService;
    private final Clock clock;

    // qualidade-exceção: construtor de injeção reúne as dependências do serviço.
    public CadastroService(
            CadastroRepository repository,
            PasswordEncoder passwordEncoder,
            TokenSessaoService tokenSessaoService,
            Clock clock) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
        this.tokenSessaoService = tokenSessaoService;
        this.clock = clock;
    }

    @Transactional
    public SessaoResponse cadastrar(CadastroRequest cadastro) {
        validarSenha(cadastro.senha());
        String nome = cadastro.nome().trim();
        String email = cadastro.email().trim().toLowerCase(Locale.ROOT);
        long usuarioId = repository.criarUsuario(new DadosNovoUsuario(
                nome, email, passwordEncoder.encode(cadastro.senha()), clock.instant()));
        long workspaceId = repository.criarWorkspace(
                MensagensCadastro.nomeWorkspace(nome), clock.instant());
        repository.vincularProprietario(usuarioId, workspaceId, clock.instant());
        return tokenSessaoService.emitir(usuarioId);
    }

    private void validarSenha(String senha) {
        if (senha.getBytes(StandardCharsets.UTF_8).length > MAXIMO_BYTES_SENHA) {
            throw ErroCadastro.senhaComTamanhoExcedido();
        }
        if (senha.length() < MINIMO_CARACTERES_SENHA
                || !senha.matches(PADRAO_LETRA)
                || !senha.matches(PADRAO_NUMERO)) {
            throw ErroCadastro.senhaForaDaPolitica();
        }
    }
}
