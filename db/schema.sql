-- =============================================================================
-- pmpc — esquema único da base de dados (PostgreSQL 16+)
-- Produtos, fornecedores e preços, com tipos explícitos e chaves estrangeiras.
-- Idempotente: usa IF NOT EXISTS onde aplicável (novas instalações / reaplicar).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- produtos
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS produtos (
  id BIGINT GENERATED ALWAYS AS IDENTITY,
  nome TEXT NOT NULL,
  CONSTRAINT pk_produtos PRIMARY KEY (id),
  CONSTRAINT ck_produtos_nome_nao_vazio
    CHECK (char_length(trim(nome)) > 0)
);

COMMENT ON TABLE produtos IS 'Catálogo de produtos (ex.: combustíveis).';
COMMENT ON COLUMN produtos.id IS 'Identificador interno (surrogate key).';
COMMENT ON COLUMN produtos.nome IS 'Denominação do produto.';

-- -----------------------------------------------------------------------------
-- fornecedores
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS fornecedores (
  id BIGINT GENERATED ALWAYS AS IDENTITY,
  nome TEXT NOT NULL,
  cnpj VARCHAR(14) NOT NULL,
  CONSTRAINT pk_fornecedores PRIMARY KEY (id),
  CONSTRAINT ck_fornecedores_nome_nao_vazio
    CHECK (char_length(trim(nome)) > 0),
  CONSTRAINT ck_fornecedores_cnpj_formato
    CHECK (cnpj ~ '^[0-9]{14}$'),
  CONSTRAINT uq_fornecedores_cnpj UNIQUE (cnpj)
);

COMMENT ON TABLE fornecedores IS 'Fornecedores/postos; CNPJ único (14 dígitos, sem máscara).';
COMMENT ON COLUMN fornecedores.cnpj IS 'Cadastro Nacional de Pessoa Jurídica, 14 caracteres numéricos.';

-- -----------------------------------------------------------------------------
-- precos
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS precos (
  id BIGINT GENERATED ALWAYS AS IDENTITY,
  id_produto BIGINT NOT NULL,
  id_fornecedor BIGINT NOT NULL,
  valor_por_litro NUMERIC(12, 4) NOT NULL,
  data_vigor DATE NOT NULL,
  CONSTRAINT pk_precos PRIMARY KEY (id),
  CONSTRAINT fk_precos_produto
    FOREIGN KEY (id_produto)
    REFERENCES produtos (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT fk_precos_fornecedor
    FOREIGN KEY (id_fornecedor)
    REFERENCES fornecedores (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT ck_precos_valor_por_litro_positivo
    CHECK (valor_por_litro > 0)
);

COMMENT ON TABLE precos IS 'Histórico de preços por produto e fornecedor; vários registos por dia permitidos.';
COMMENT ON COLUMN precos.valor_por_litro IS 'Valor monetário por litro (BRL), até 8 dígitos inteiros e 4 decimais.';
COMMENT ON COLUMN precos.data_vigor IS 'Data a partir da qual o preço se aplica.';

-- -----------------------------------------------------------------------------
-- Índices (consultas por produto/data, fornecedor, comparativo DISTINCT ON)
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_precos_produto_data
  ON precos (id_produto, data_vigor DESC);

CREATE INDEX IF NOT EXISTS idx_precos_fornecedor
  ON precos (id_fornecedor);

CREATE INDEX IF NOT EXISTS idx_precos_produto_fornecedor_data_id
  ON precos (id_produto, id_fornecedor, data_vigor DESC, id DESC);
