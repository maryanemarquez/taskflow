package com.taskflow.auth.controller;

import com.taskflow.auth.dto.CadastroRequest;
import com.taskflow.auth.dto.SessaoResponse;
import com.taskflow.auth.service.CadastroService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(PREFIXO_AUTH)
public class CadastroController {

    private static final String PREFIXO_AUTH = "/api/v1/auth";
    private static final String ROTA_CADASTRO = "/cadastro";
    private final CadastroService cadastroService;

    public CadastroController(CadastroService cadastroService) {
        this.cadastroService = cadastroService;
    }

    @PostMapping(ROTA_CADASTRO)
    public ResponseEntity<SessaoResponse> cadastrar(@RequestBody CadastroRequest cadastro) {
        return ResponseEntity.status(HttpStatus.CREATED).body(cadastroService.cadastrar(cadastro));
    }
}
