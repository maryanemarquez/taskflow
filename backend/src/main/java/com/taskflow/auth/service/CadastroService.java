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
    private static final int MAXIMO_CARACTERES_NOME = 100;
    private static final int MAXIMO_CARACTERES_EMAIL = 150;
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
        String nome = cadastro.nome().trim();
        String email = cadastro.email().trim().toLowerCase(Locale.ROOT);
        validarSenha(cadastro.senha());
        validarNomeEmail(nome, email);
        long usuarioId = repository.criarUsuario(new DadosNovoUsuario(
                nome, email, passwordEncoder.encode(cadastro.senha()), clock.instant()));
        long workspaceId = repository.criarWorkspace(
                MensagensCadastro.nomeWorkspace(nome), clock.instant());
        repository.vincularProprietario(usuarioId, workspaceId, clock.instant());
        return tokenSessaoService.emitir(usuarioId);
    }

    private void validarNomeEmail(String nome, String email) {
        if (nome.codePointCount(0, nome.length()) > MAXIMO_CARACTERES_NOME) {
            throw ErroCadastro.nomeComTamanhoExcedido();
        }
        if (email.codePointCount(0, email.length()) > MAXIMO_CARACTERES_EMAIL) {
            throw ErroCadastro.emailComTamanhoExcedido();
        }
    }

    private void validarSenha(String senha) {
        if (senha.getBytes(StandardCharsets.UTF_8).length > MAXIMO_BYTES_SENHA) {
            throw ErroCadastro.senhaComTamanhoExcedido();
        }
        if (senha.codePointCount(0, senha.length()) < MINIMO_CARACTERES_SENHA
                || !senha.matches(PADRAO_LETRA)
                || !senha.matches(PADRAO_NUMERO)) {
            throw ErroCadastro.senhaForaDaPolitica();
        }
    }
}
