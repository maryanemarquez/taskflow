package com.taskflow.auth.repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.sql.Timestamp;
import java.time.Instant;
import org.springframework.jdbc.core.PreparedStatementCreator;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.stereotype.Repository;

@Repository
public class CadastroRepository {

    private static final String PAPEL_PROPRIETARIO = "PROPRIETARIO";
    private static final int INDICE_NOME = 1;
    private static final int INDICE_EMAIL = 2;
    private static final int INDICE_SENHA_HASH = 3;
    private static final int INDICE_CRIADO_EM_USUARIO = 4;
    private static final int INDICE_CRIADO_EM_WORKSPACE = 2;
    private final JdbcTemplate jdbcTemplate;

    public CadastroRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public long criarUsuario(DadosNovoUsuario usuario) {
        return inserirId(conexao -> {
            PreparedStatement comando = conexao.prepareStatement(
                    "INSERT INTO usuario (nome, email, senha_hash, criado_em) VALUES (?, ?, ?, ?)",
                    Statement.RETURN_GENERATED_KEYS);
            comando.setString(INDICE_NOME, usuario.nome());
            comando.setString(INDICE_EMAIL, usuario.email());
            comando.setString(INDICE_SENHA_HASH, usuario.senhaHash());
            comando.setTimestamp(INDICE_CRIADO_EM_USUARIO, Timestamp.from(usuario.criadoEm()));
            return comando;
        });
    }

    public long criarWorkspace(String nome, Instant criadoEm) {
        return inserirId(conexao -> {
            PreparedStatement comando = conexao.prepareStatement(
                    "INSERT INTO workspace (nome, criado_em) VALUES (?, ?)",
                    Statement.RETURN_GENERATED_KEYS);
            comando.setString(INDICE_NOME, nome);
            comando.setTimestamp(INDICE_CRIADO_EM_WORKSPACE, Timestamp.from(criadoEm));
            return comando;
        });
    }

    public void vincularProprietario(long usuarioId, long workspaceId, Instant criadoEm) {
        jdbcTemplate.update(
                "INSERT INTO usuario_workspace (usuario_id, workspace_id, papel, criado_em) "
                        + "VALUES (?, ?, ?, ?)",
                usuarioId, workspaceId, PAPEL_PROPRIETARIO, Timestamp.from(criadoEm));
    }

    public void criarRefreshToken(DadosRefreshToken refreshToken) {
        jdbcTemplate.update(
                "INSERT INTO refresh_token (usuario_id, token_hash, criado_em, expira_em) "
                        + "VALUES (?, ?, ?, ?)",
                refreshToken.usuarioId(),
                refreshToken.tokenHash(),
                Timestamp.from(refreshToken.criadoEm()),
                Timestamp.from(refreshToken.expiraEm()));
    }

    private long inserirId(PreparedStatementCreator criador) {
        GeneratedKeyHolder chave = new GeneratedKeyHolder();
        jdbcTemplate.update(criador, chave);
        return chave.getKey().longValue();
    }
}
