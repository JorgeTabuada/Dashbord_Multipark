-- Criar tabela para despesas
CREATE TABLE IF NOT EXISTS expenses (
  id BIGSERIAL PRIMARY KEY,
  date DATE NOT NULL,
  type VARCHAR(50) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  method VARCHAR(50) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'Pendente' CHECK (status IN ('Pendente', 'Aprovada', 'Rejeitada')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_expenses_status ON expenses(status);
CREATE INDEX IF NOT EXISTS idx_expenses_type ON expenses(type);

-- Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar trigger para atualizar updated_at
DROP TRIGGER IF EXISTS update_expenses_updated_at ON expenses;
CREATE TRIGGER update_expenses_updated_at
    BEFORE UPDATE ON expenses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar Row Level Security (RLS)
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Criar política para permitir todas as operações (ajusta conforme necessário)
-- NOTA: Esta política permite acesso total. Em produção, deves restringir por utilizador
CREATE POLICY "Enable all access for expenses" ON expenses
    FOR ALL USING (true);

-- Comentários para documentação
COMMENT ON TABLE expenses IS 'Tabela para gerir despesas da organização';
COMMENT ON COLUMN expenses.id IS 'Identificador único da despesa';
COMMENT ON COLUMN expenses.date IS 'Data da despesa';
COMMENT ON COLUMN expenses.type IS 'Tipo de despesa (combustível, manutenção, etc.)';
COMMENT ON COLUMN expenses.amount IS 'Valor da despesa em euros';
COMMENT ON COLUMN expenses.method IS 'Método de pagamento utilizado';
COMMENT ON COLUMN expenses.description IS 'Descrição detalhada da despesa';
COMMENT ON COLUMN expenses.status IS 'Estado da despesa (Pendente, Aprovada, Rejeitada)';
