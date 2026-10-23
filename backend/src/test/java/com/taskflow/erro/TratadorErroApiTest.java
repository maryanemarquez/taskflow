package com.taskflow.erro;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(controllers = ControladorErroTeste.class)
@Import({TratadorErroApi.class, LoggingCentralizado.class})
class TratadorErroApiTest {

    private static final String ERRO_TRATADO = "/teste/erros/tratado";
    private static final String ERRO_INESPERADO = "/teste/erros/inesperado";

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("HIST-002-fundacao/C03 - erro tratado responde com os campos RFC 7807")
    void erroTratadoRespondeNoFormatoRfc7807() throws Exception {
        mockMvc.perform(get(ERRO_TRATADO))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
                .andExpect(jsonPath("$.type").value("urn:taskflow:erro:validacao"))
                .andExpect(jsonPath("$.title").value("Dados inválidos"))
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.detail").value("Um ou mais campos são inválidos."))
                .andExpect(jsonPath("$.instance").value(ERRO_TRATADO))
                .andExpect(jsonPath("$.codigo").value("VALIDACAO"));
    }

    @Test
    @DisplayName("HIST-002-fundacao/C04 - erro tratado não expõe conteúdo interno")
    void erroTratadoNaoExpõeConteudoInterno() throws Exception {
        mockMvc.perform(get(ERRO_TRATADO))
                .andExpect(content().string(not(containsString("SQL_INTERNO_TESTE"))))
                .andExpect(content().string(not(containsString("TOKEN_INTERNO_TESTE"))))
                .andExpect(content().string(not(containsString("java.lang"))));
    }

    @Test
    @DisplayName("HIST-002-fundacao/C05 - erro inesperado responde de forma genérica")
    void erroInesperadoRespondeComCorpoGenerico() throws Exception {
        mockMvc.perform(get(ERRO_INESPERADO))
                .andExpect(status().isInternalServerError())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
                .andExpect(jsonPath("$.type").value("urn:taskflow:erro:erro_interno"))
                .andExpect(jsonPath("$.title").value("Erro interno"))
                .andExpect(jsonPath("$.status").value(500))
                .andExpect(jsonPath("$.detail").value("Ocorreu um erro inesperado."))
                .andExpect(jsonPath("$.instance").value(ERRO_INESPERADO))
                .andExpect(jsonPath("$.codigo").value("ERRO_INTERNO"))
                .andExpect(content().string(not(containsString("SQL_INTERNO_TESTE"))));
    }
}
