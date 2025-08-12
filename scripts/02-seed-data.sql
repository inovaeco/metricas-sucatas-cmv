-- Dados iniciais para teste do sistema CMV

-- Inserir sucatas de exemplo
INSERT INTO sucatas (marca, modelo, ano, custo, data_entrada, lote, status) VALUES
('Volkswagen', 'Gol', 2015, 8000.00, '2024-01-15', 'LOTE-001', 'ativa'),
('Fiat', 'Palio', 2012, 6500.00, '2024-01-20', 'LOTE-002', 'ativa'),
('Chevrolet', 'Celta', 2010, 5500.00, '2024-01-25', 'LOTE-003', 'ativa'),
('Ford', 'Ka', 2014, 7200.00, '2024-02-01', 'LOTE-004', 'ativa'),
('Renault', 'Sandero', 2016, 9800.00, '2024-02-05', 'LOTE-005', 'ativa')
ON CONFLICT (lote) DO NOTHING;

-- Inserir vendas de exemplo (usando os IDs das sucatas)
INSERT INTO vendas (sucata_id, nome_peca, valor, data_venda, canal)
SELECT 
  s.id,
  v.nome_peca,
  v.valor,
  v.data_venda,
  v.canal
FROM sucatas s
CROSS JOIN (
  VALUES 
    ('Motor 1.0', 2500.00, '2024-01-25', 'mercado-livre'),
    ('Porta Dianteira', 450.00, '2024-01-28', 'balcao'),
    ('Farol', 280.00, '2024-02-02', 'mercado-livre'),
    ('Retrovisor', 120.00, '2024-02-05', 'balcao')
) AS v(nome_peca, valor, data_venda, canal)
WHERE s.lote IN ('LOTE-001', 'LOTE-002')
LIMIT 4;
