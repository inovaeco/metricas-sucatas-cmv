-- Criação das tabelas para o sistema CMV da INOVA ECOPEÇAS

-- Tabela de sucatas (veículos para desmontagem)
CREATE TABLE IF NOT EXISTS sucatas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  marca VARCHAR(100) NOT NULL,
  modelo VARCHAR(100) NOT NULL,
  ano INTEGER NOT NULL,
  custo DECIMAL(10,2) NOT NULL,
  data_entrada DATE NOT NULL,
  lote VARCHAR(50) NOT NULL UNIQUE,
  status VARCHAR(20) DEFAULT 'ativa' CHECK (status IN ('ativa', 'liquidada')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de vendas
CREATE TABLE IF NOT EXISTS vendas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sucata_id UUID NOT NULL REFERENCES sucatas(id) ON DELETE CASCADE,
  nome_peca VARCHAR(200) NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  data_venda DATE NOT NULL,
  canal VARCHAR(20) NOT NULL CHECK (canal IN ('mercado-livre', 'balcao')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_sucatas_status ON sucatas(status);
CREATE INDEX IF NOT EXISTS idx_sucatas_data_entrada ON sucatas(data_entrada);
CREATE INDEX IF NOT EXISTS idx_sucatas_lote ON sucatas(lote);
CREATE INDEX IF NOT EXISTS idx_vendas_sucata_id ON vendas(sucata_id);
CREATE INDEX IF NOT EXISTS idx_vendas_data_venda ON vendas(data_venda);
CREATE INDEX IF NOT EXISTS idx_vendas_canal ON vendas(canal);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_sucatas_updated_at BEFORE UPDATE ON sucatas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendas_updated_at BEFORE UPDATE ON vendas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
