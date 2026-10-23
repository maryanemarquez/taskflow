package com.taskflow.erro;

import com.taskflow.auth.service.ErroCadastro;
import java.net.URI;
import java.util.List;
import java.util.Locale;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class TratadorErroApi {

    private final LoggingCentralizado logging;

    public TratadorErroApi(LoggingCentralizado logging) {
        this.logging = logging;
    }

    @ExceptionHandler(ErroDeAplicacao.class)
    public ResponseEntity<ProblemDetail> tratarErroAplicacao(
            ErroDeAplicacao erro,
            HttpServletRequest requisicao) {
        CodigoErroApi codigo = erro.codigo();
        return criarResposta(
                codigo.status(),
                codigo.codigo(),
                requisicao.getRequestURI());
    }

    @ExceptionHandler(ErroCadastro.class)
    public ResponseEntity<ProblemDetail> tratarErroCadastro(
            ErroCadastro erro,
            HttpServletRequest requisicao) {
        ProblemDetail problema = ProblemDetail.forStatusAndDetail(
                HttpStatus.BAD_REQUEST, MensagensApi.detalhe(MensagensApi.CODIGO_VALIDACAO));
        problema.setType(URI.create(
                MensagensApi.PREFIXO_TIPO
                        + MensagensApi.CODIGO_VALIDACAO.toLowerCase(Locale.ROOT)));
        problema.setTitle(MensagensApi.titulo(MensagensApi.CODIGO_VALIDACAO));
        problema.setInstance(URI.create(requisicao.getRequestURI()));
        problema.setProperty("codigo", MensagensApi.CODIGO_VALIDACAO);
        problema.setProperty("erros", List.of(
                MensagensApi.campo(erro.campo(), erro.codigoCampo())));
        return ResponseEntity.badRequest()
                .contentType(MediaType.APPLICATION_PROBLEM_JSON)
                .body(problema);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ProblemDetail> tratarErroInesperado(
            Exception erro,
            HttpServletRequest requisicao) {
        logging.registrarFalhaInterna(erro);
        return criarResposta(
                HttpStatus.INTERNAL_SERVER_ERROR,
                MensagensApi.CODIGO_ERRO_INTERNO,
                requisicao.getRequestURI());
    }

    private ResponseEntity<ProblemDetail> criarResposta(
            HttpStatus status,
            String codigo,
            String caminho) {
        ProblemDetail problema = ProblemDetail.forStatusAndDetail(status, MensagensApi.detalhe(codigo));
        problema.setType(URI.create(MensagensApi.PREFIXO_TIPO + codigo.toLowerCase(Locale.ROOT)));
        problema.setTitle(MensagensApi.titulo(codigo));
        problema.setInstance(URI.create(caminho));
        problema.setProperty("codigo", codigo);
        return ResponseEntity.status(status)
                .contentType(MediaType.APPLICATION_PROBLEM_JSON)
                .body(problema);
    }
}
