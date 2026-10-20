package com.taskflow.estrutura;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "tabela_ausente_de_teste")
public class EntidadeDeTeste {

    @Id
    private Long id;
}
