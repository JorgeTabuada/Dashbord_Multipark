-- 🔄 CRIAR TABELA comentarios_reclamacoes
-- =========================================

-- 1. Criar a tabela principal
CREATE TABLE IF NOT EXISTS public.comentarios_reclamacoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Tipo e informações básicas
  tipo TEXT CHECK (tipo IN ('comentario', 'reclamacao', 'sugestao')) DEFAULT 'comentario',
  cliente TEXT NOT NULL,
  telefone TEXT,
  email TEXT,
  
  -- Conteúdo
  assunto TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  
  -- Categorização
  categoria TEXT CHECK (categoria IN ('atendimento', 'entrega', 'produto', 'tecnologia', 'pagamento', 'outro')) DEFAULT 'outro',
  prioridade TEXT CHECK (prioridade IN ('baixa', 'media', 'alta')) DEFAULT 'media',
  status TEXT CHECK (status IN ('pendente', 'em_andamento', 'fechado')) DEFAULT 'pendente',
  
  -- Avaliação e resposta
  avaliacao INTEGER CHECK (avaliacao >= 1 AND avaliacao <= 5),
  data TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responsavel TEXT,
  resposta TEXT,
  
  -- Relacionamento com reservas
  reservation_id TEXT,
  source TEXT DEFAULT 'manual', -- 'manual', 'firebase', 'form', 'email'
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_comentarios_tipo ON public.comentarios_reclamacoes(tipo);
CREATE INDEX IF NOT EXISTS idx_comentarios_status ON public.comentarios_reclamacoes(status);
CREATE INDEX IF NOT EXISTS idx_comentarios_prioridade ON public.comentarios_reclamacoes(prioridade);
CREATE INDEX IF NOT EXISTS idx_comentarios_categoria ON public.comentarios_reclamacoes(categoria);
CREATE INDEX IF NOT EXISTS idx_comentarios_reservation ON public.comentarios_reclamacoes(reservation_id);
CREATE INDEX IF NOT EXISTS idx_comentarios_data ON public.comentarios_reclamacoes(data DESC);
CREATE INDEX IF NOT EXISTS idx_comentarios_cliente ON public.comentarios_reclamacoes(cliente);

-- 3. Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_comentarios_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_comentarios_updated_at ON public.comentarios_reclamacoes;
CREATE TRIGGER update_comentarios_updated_at
    BEFORE UPDATE ON public.comentarios_reclamacoes
    FOR EACH ROW
    EXECUTE FUNCTION update_comentarios_updated_at();

-- 4. RLS (Row Level Security)
ALTER TABLE public.comentarios_reclamacoes ENABLE ROW LEVEL SECURITY;

-- Política para leitura (todos podem ler)
DROP POLICY IF EXISTS "Enable read access for all users" ON public.comentarios_reclamacoes;
CREATE POLICY "Enable read access for all users" 
    ON public.comentarios_reclamacoes FOR SELECT 
    USING (true);

-- Política para inserção (todos podem inserir)
DROP POLICY IF EXISTS "Enable insert for all users" ON public.comentarios_reclamacoes;
CREATE POLICY "Enable insert for all users" 
    ON public.comentarios_reclamacoes FOR INSERT 
    WITH CHECK (true);

-- Política para atualização (apenas autenticados)
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.comentarios_reclamacoes;
CREATE POLICY "Enable update for authenticated users" 
    ON public.comentarios_reclamacoes FOR UPDATE 
    USING (true);

-- 5. Views para estatísticas
CREATE OR REPLACE VIEW comentarios_stats AS
SELECT 
    COUNT(*) as total,
    COUNT(CASE WHEN tipo = 'comentario' THEN 1 END) as total_comentarios,
    COUNT(CASE WHEN tipo = 'reclamacao' THEN 1 END) as total_reclamacoes,
    COUNT(CASE WHEN tipo = 'sugestao' THEN 1 END) as total_sugestoes,
    COUNT(CASE WHEN status = 'pendente' THEN 1 END) as pendentes,
    COUNT(CASE WHEN status = 'em_andamento' THEN 1 END) as em_andamento,
    COUNT(CASE WHEN status = 'fechado' THEN 1 END) as fechados,
    COUNT(CASE WHEN prioridade = 'alta' THEN 1 END) as prioridade_alta,
    AVG(avaliacao) as avaliacao_media,
    DATE(data) as data_ref
FROM public.comentarios_reclamacoes
GROUP BY DATE(data);

-- 6. Inserir dados de exemplo (opcional)
INSERT INTO public.comentarios_reclamacoes (
    tipo, cliente, telefone, email, assunto, mensagem, 
    categoria, prioridade, status, avaliacao, responsavel, resposta
) VALUES 
(
    'comentario',
    'João Silva',
    '+351 91 234 5678',
    'joao.silva@email.com',
    'Excelente serviço',
    'Muito satisfeito com a qualidade do atendimento e rapidez na entrega.',
    'atendimento',
    'baixa',
    'fechado',
    5,
    'Ana Costa',
    'Obrigado pelo feedback positivo!'
),
(
    'reclamacao',
    'Maria Santos',
    '+351 92 345 6789',
    'maria.santos@email.com',
    'Atraso na entrega',
    'Pedido com 2 horas de atraso. Não recebi nenhuma notificação.',
    'entrega',
    'alta',
    'em_andamento',
    2,
    'Carlos Oliveira',
    'Estamos a investigar o ocorrido. Entraremos em contacto brevemente.'
),
(
    'sugestao',
    'Pedro Ferreira',
    '+351 93 456 7890',
    'pedro.ferreira@email.com',
    'App móvel',
    'Seria útil ter uma aplicação móvel para acompanhar os pedidos.',
    'tecnologia',
    'media',
    'pendente',
    NULL,
    NULL,
    NULL
)
ON CONFLICT DO NOTHING;

-- 7. Grants necessários
GRANT ALL ON public.comentarios_reclamacoes TO authenticated;
GRANT ALL ON public.comentarios_reclamacoes TO service_role;
GRANT ALL ON public.comentarios_reclamacoes TO anon;
GRANT SELECT ON comentarios_stats TO authenticated;
GRANT SELECT ON comentarios_stats TO anon;

-- 8. Comentários na tabela
COMMENT ON TABLE public.comentarios_reclamacoes IS 'Tabela para gestão de comentários, reclamações e sugestões dos clientes';
COMMENT ON COLUMN public.comentarios_reclamacoes.tipo IS 'Tipo: comentario, reclamacao, sugestao';
COMMENT ON COLUMN public.comentarios_reclamacoes.categoria IS 'Categoria: atendimento, entrega, produto, tecnologia, pagamento, outro';
COMMENT ON COLUMN public.comentarios_reclamacoes.prioridade IS 'Prioridade: baixa, media, alta';
COMMENT ON COLUMN public.comentarios_reclamacoes.status IS 'Status: pendente, em_andamento, fechado';
COMMENT ON COLUMN public.comentarios_reclamacoes.avaliacao IS 'Avaliação de 1 a 5 estrelas';

-- ✅ Tabela criada com sucesso!
