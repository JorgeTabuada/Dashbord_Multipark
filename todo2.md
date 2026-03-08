# Barni — Todo

## Estrutura Base
- [x] Schema da BD (roles, despesas, projetos, categorias, logs)
- [x] Migração da BD
- [x] Layout base com sidebar e DashboardLayout
- [x] Sistema de autenticação com roles (Super Admin, Admin, Team Leader, Backoffice, Extra)
- [x] Proteção de rotas por role
- [x] Design system Barni (Navy + Amber)
- [x] Landing page / login

## Módulo de Despesas
- [x] Listagem de despesas com filtros e pesquisa
- [x] Formulário de criação/edição de despesa
- [x] Upload de imagem de fatura para S3
- [x] Extração automática de dados da fatura via LLM (OCR)
- [x] Associação de despesas a projetos
- [x] Categorização de despesas por departamento
- [x] Dashboard de despesas (diário, semanal, mensal)
- [x] Relatórios por empresa, departamento e utilizador
- [x] Alertas automáticos de datas de pagamento ao Super Admin
- [x] Filtros avançados (período, projeto, utilizador, categoria)
- [x] Marcar despesas como pagas
- [x] Verificação de despesas em atraso
- [x] Exportação de despesas filtradas para Excel (XLSX)

## Gestão de Utilizadores
- [x] Listagem de utilizadores
- [x] Atribuição de roles e permissões (Super Admin)

## Logs
- [x] Registo de todas as ações por utilizador (apenas Super Admin)

## Testes
- [x] Vitest: controlo de acesso por role
- [x] Vitest: auth logout

## Módulo RH
- [x] Schema BD: employees, employee_documents, time_records, schedules, salary_configs
- [x] Backend: routers e db helpers para RH
- [x] Listagem de colaboradores com foto e estado
- [x] Ficha individual do colaborador (dados pessoais, posto, documentos)
- [x] Upload de documentos (BI, carta de condução, NIB, contrato, seguro)
- [x] Registo de ponto com foto (câmara) e GPS
- [x] Horários: definição de horários por colaborador
- [x] Extras: 5 níveis de pagamento (8.5€, 7€, 6€, 5€, + nível 5)
- [x] Cálculo de salários mensais (funcionários + extras)
- [x] Dashboard RH: total colaboradores, horas trabalhadas, custo mensal
- [x] Captura de foto via câmara no check-in e check-out
- [x] Upload da foto para S3 e guardar URL na BD
- [x] Mostrar PIN GPS com coordenadas no histórico de ponto
- [x] Pré-visualização da foto no histórico de ponto

## Melhorias RH — Documentos
- [x] Upload múltiplo de ficheiros por categoria (Foto, BI/CC, Carta de Condução, NIB, Morada, Contrato, Termos Assinados)
- [x] Galeria organizada por tipo com pré-visualização inline
- [x] Indicador visual de documentos em falta (checklist de obrigatórios por colaborador)
- [x] Badge/indicador na listagem de colaboradores mostrando docs em falta

## Módulo Projetos
- [x] Schema BD: projects (árvore com level group/brand/city/project), project_employees, tasks
- [x] Backend: routers e db helpers para Projetos e Tarefas
- [x] Página de Projetos com árvore (Grupo → Marca → Cidade → Projeto)
- [x] Criar/editar/eliminar projetos em cada nível
- [x] Atribuir colaboradores a projetos
- [x] Definir responsável (manager) por projeto
- [x] Sidebar: Projetos e Tarefas adicionados à navegação

## Módulo Tarefas
- [x] Quadro Kanban (Backlog, A Fazer, Em Curso, Revisão, Concluído)
- [x] Criar/editar/mover/eliminar tarefas
- [x] Filtrar tarefas por projeto
- [x] Prioridades (baixa, média, alta, urgente) com cores
- [x] Indicador de tarefas em atraso
- [x] Stats: total, por estado, atrasadas

## Próximos Módulos (futuro)
- [x] Módulo de Marketing (Google Ads, Meta Ads)
- [x] Módulo Operacional (GPS, Zilo)
- [x] Módulo de Reclamações (tickets)
- [x] Módulo de Perdidos e Achados
- [x] Módulo de Críticas Google
- [x] Módulo de Avaliação de Desempenho
- [x] Módulo de Ocorrências
- [x] Módulo de Serviços
- [x] Módulo de Formação e Apoio
- [x] Módulo de Faturação
- [x] Módulo de Parcerias
- [x] Módulo Anual

## Bugs
- [x] Corrigir erro no módulo de Projetos
- [x] Corrigir erro no módulo de Tarefas

## Módulo Marketing
- [x] Schema BD: campaigns, campaign_daily_stats, marketing_expenses
- [x] Backend: routers e db helpers para Marketing
- [x] Dashboard Marketing: KPIs (gasto total, reservas, custo por reserva, ROI)
- [x] Campanhas Google Ads: importação diária de dados (CSV/manual)
- [x] Campanhas Meta Ads: importação diária de dados (CSV/manual)
- [x] Reservas por projeto/marca (Airpark, Red, Sky) com valor médio
- [x] Custo por reserva por campanha e por projeto
- [x] Despesas de marketing consolidadas (flyers, instagramers, etc.)
- [x] Gráficos: evolução mensal de gastos vs reservas
- [x] Acesso: importação por qualquer admin, dados visíveis só Super Admin
- [x] Sidebar: adicionar link para Marketing

## Módulo Operacional
- [x] Schema BD: vehicles, vehicle_movements, speed_alerts, radio_transcriptions
- [x] Backend: routers e db helpers para Operacional
- [x] Gestão de viaturas (CRUD, matrícula, marca, modelo, estado)
- [x] Registo de movimentos de viaturas (condutor, entrada/saída, km)
- [x] Alertas de velocidade (quando condutor excede limite da via)
- [x] Dashboard operacional: viaturas ativas, alertas do dia, movimentos recentes
- [x] Transcrições de rádio (upload áudio + transcrição via Whisper)
- [x] Histórico de condutor por viatura (quem mexeu em cada carro)
- [x] Sidebar: adicionar link para Operacional

## API REST — Integração Externa
- [x] Endpoint POST /api/external/speed-alert (Zilo GPS envia alertas de velocidade)
- [x] Endpoint POST /api/external/vehicle-movement (registo automático de movimentos)
- [x] Endpoint POST /api/external/radio-upload (upload de áudio + transcrição automática)
- [x] Endpoint GET /api/external/vehicles (listar viaturas para integração)
- [x] Endpoint GET /api/external/employees (listar colaboradores para integração)
- [x] Autenticação por API key (header X-API-Key)
- [x] Gestão de API keys no painel (Super Admin)
- [x] Documentação dos endpoints na app

## Módulo Reclamações
- [x] Schema BD: complaints, complaint_messages, complaint_photos
- [x] Backend: routers e db helpers para Reclamações
- [x] Quadro Kanban (Novo, Em Análise, A Aguardar Cliente, Resolvido, Fechado)
- [x] Criação de reclamação com tipo (dano, lavagem, atraso, outro)
- [x] Associação a viatura (matrícula) + histórico de condutores automático
- [x] Upload de fotos do cliente (S3)
- [x] Mensagens/notas internas no ticket
- [x] Prazos de resposta com indicador visual (SLA)
- [x] Dados da reserva (nome cliente, datas, contacto)
- [x] Filtros por estado, tipo, viatura, responsável
- [x] Sidebar: adicionar link para Reclamações

## Módulo Críticas Google
- [x] Schema BD: google_reviews
- [x] Backend: routers e db helpers para Críticas
- [x] Importação manual de reviews (nome, rating, texto, data)
- [x] Resposta automática com IA para reviews 4-5 estrelas (agradecimento natural)
- [x] Reviews ≤3 estrelas: conversão automática em reclamação
- [x] Cruzamento de dados: buscar cliente por nome/email/matrícula no histórico
- [x] Dashboard de reputação: média de estrelas, evolução mensal, distribuição
- [x] Listagem com filtros por rating, estado de resposta, projeto
- [x] Edição de resposta antes de publicar
- [x] Sidebar: adicionar link para Críticas

## Módulo Formação e Apoio
- [x] Schema BD: training_categories, training_videos, training_manuals, faqs, quiz_questions, quiz_attempts, career_exams, career_exam_attempts
- [x] Backend: routers e db helpers para Formação
- [x] Vídeos: upload por categorias (Reserva, Atendimento, Backoffice, Zilo, Condução, Regras, Penalizações, MultiGrupo)
- [x] Manuais: blog/wiki com artigos densos + atualizações de serviços
- [x] FAQs: perguntas frequentes dos clientes com respostas
- [x] Jogo interativo: quiz com perguntas sobre manuais, ranking e pontuação
- [x] Exames de carreira: Extra (70%), Condutor (70%), Sénior (80%), Team Leader (90%), Supervisor
- [x] Ranking de pontuação entre colaboradores (gamificação)
- [x] Sidebar: adicionar link para Formação

## Módulo Perdidos e Achados
- [x] Schema BD: lost_found_items, lost_found_photos, lost_found_messages
- [x] Backend: routers e db helpers para Perdidos e Achados
- [x] Registo de objetos perdidos (tipo, descrição, valor estimado, viatura, cliente)
- [x] Upload de fotos do cliente (S3)
- [x] Associação a viatura + histórico automático de condutores
- [x] Kanban (Novo, Em Investigação, Encontrado, Devolvido, Fechado)
- [x] Mensagens/notas internas no caso
- [x] Cruzamento de dados: ranking de condutores que mexeram nos carros com ocorrências
- [x] Painel de padrões: condutores que aparecem repetidamente em carros com desaparecimentos
- [x] Sidebar: adicionar link para Perdidos e Achados

## Módulo Ocorrências
- [x] Schema BD: incidents (tipo, gravidade, estado, semana)
- [x] Backend: routers e db helpers para Ocorrências
- [x] Dashboard com stats: total, abertas, resolvidas, críticas
- [x] Distribuição por tipo de ocorrência
- [x] Filtros por estado e gravidade
- [x] Alerta visual para ocorrências não resolvidas em 48h
- [x] Notificação ao owner para ocorrências críticas
- [x] Resolver ocorrência com campo de resolução
- [x] Sidebar: adicionar link para Ocorrências

## Módulo Avaliação de Desempenho
- [x] Schema BD: performance_evaluations (semana, pontos, movimentações, alertas)
- [x] Backend: routers e db helpers para Avaliação
- [x] Geração automática de avaliação semanal (horas, movimentações, alertas, ocorrências)
- [x] Ranking de condutores com medalhas (ouro, prata, bronze)
- [x] Sistema de pontos: +2 por movimentação, +5 por ocorrência reportada, -10 por alerta velocidade, -5 por ocorrência atribuída
- [x] Dashboard com totais semanais
- [x] Sidebar: adicionar link para Avaliação

## Módulo Serviços
- [x] Schema BD: services (tipo, receita, custo, comissão)
- [x] Backend: routers e db helpers para Serviços
- [x] Tabs por tipo de serviço (Lavagem, Carregamento Elétrico, Valet Flex, Outro)
- [x] Ranking de condutores por número de serviços angariados
- [x] Análise mensal: total, receita, custos, lucro
- [x] Distribuição por tipo de serviço
- [x] Sidebar: adicionar link para Serviços

## Módulo Faturação
- [x] Schema BD: invoices (número, cliente, NIF, valor, estado)
- [x] Backend: routers e db helpers para Faturação
- [x] Listagem com pesquisa (nº fatura, cliente, NIF)
- [x] Filtros por estado (rascunho, emitida, paga, vencida, cancelada)
- [x] Dashboard: total, valor total, pagas, vencidas, rascunhos
- [x] Alteração de estado inline
- [x] Sidebar: adicionar link para Faturação

## Módulo Parcerias
- [x] Schema BD: partnerships, partnership_transactions
- [x] Backend: routers e db helpers para Parcerias
- [x] Cards de parceiros com tipo (Agregador, Agência, Cliente Pro)
- [x] Detalhe de parceria com contacto, financeiro e acordo
- [x] Transações: reservas, comissões, pagamentos, ajustes
- [x] Filtros por tipo e estado
- [x] Sidebar: adicionar link para Parcerias

## Módulo Anual
- [x] Schema BD: annual_reports (mês, receita, despesas, partilha)
- [x] Backend: routers e db helpers para Anual
- [x] Geração automática de relatório anual (receitas vs despesas por mês)
- [x] Gráfico de barras mensal (receita vs despesas)
- [x] Tabela detalhada com partilha 60/40 (parceiro/empresa)
- [x] Filtro por ano e projeto
- [x] Sidebar: adicionar link para Anual

## Notificações Email — Documentos RH
- [ ] Campo expiryDate nos documentos (schema + migration)
- [ ] Tabela notification_logs para histórico de notificações enviadas
- [ ] Lógica backend: verificar docs em falta e docs a expirar (30/15/7 dias)
- [ ] Envio de email via notifyOwner para alertas de documentos
- [ ] Endpoint manual para disparar verificação de notificações
- [ ] Frontend: campo de data de validade no upload de documentos
- [ ] Frontend: indicador visual de docs a expirar na checklist
- [ ] Frontend: painel de histórico de notificações enviadas
- [ ] Testes vitest para lógica de notificações

## Feedback Jorge — Bugs e Melhorias (Mar 2026)
- [x] BUG: Serviços — condutores não aparecem no dropdown, erro NaN no employeeId
- [x] Serviços — adicionar edição de registos
- [x] Despesas — adicionar campo funcionário (buyer) + filtro por funcionário
- [ ] Despesas — adicionar campo cidade + filtro (pendente: requer alteração de schema)
- [x] Despesas — filtros rápidos por semana/mês
- [x] Despesas — permitir editar registos depois de criados (pre-fill completo)
- [x] Tarefas — drag & drop entre colunas do Kanban
- [x] Tarefas — vista lista alternativa ao Kanban
- [x] Edição de registos em TODOS os módulos (Reclamações, Ocorrências, Perdidos, Faturação, Parcerias)
- [x] Formação — manuais em PDF/apresentação (não só markdown). Separar Manuais de Procedimentos
- [x] Parcerias — calcular comissão automaticamente nas reservas
- [x] Parcerias — resumo mensal de pagamentos pendentes
- [x] Anual — divisão configurável (não sempre 60/40)
- [x] Anual — clarificar de onde vem a receita (dialog de fontes de dados)
- [x] Anual — edição manual de cada mês
- [x] Anual — receita agora inclui Faturas + Serviços
- [x] Marketing — upload de ficheiros Excel (Google Ads/Meta) com mapeamento automático de colunas
- [ ] Marketing — preparar integração API Google Ads/Meta
- [ ] Operacional — viaturas via API Zello (não criar manual)
- [ ] Reclamações — importar via email
- [ ] Críticas Google — importar reviews via email
- [ ] Perdidos e Achados — importar de sistema externo
- [ ] Ocorrências — receber por email
- [ ] Faturação — receber faturas por email
- [ ] Utilizadores — permissões granulares por módulo
- [x] Guardar API key Zello (via webdev_request_secrets)

## Integração API MultiPark Backoffice
- [x] Guardar API key MultiPark (MULTIPARK_API_KEY)
- [x] Descobrir endpoints disponíveis (health, availability, bookings, parks)
- [x] Testar conectividade com a API (health check OK, v1.0.0)
- [x] Criar helpers server-side para chamar a API MultiPark (multipark.ts)
- [x] Schema BD: multipark_bookings + multipark_sync_logs
- [x] Backend tRPC: testConnection, checkAvailability, listParks, bookings, stats, syncLogs, triggerSync
- [x] Frontend: página MultiPark API com 5 tabs (Dashboard, Disponibilidade, Reservas, Parques, Sincronização)
- [x] Sidebar: link para MultiPark API
- [x] Testes vitest: 11 testes para rotas MultiPark (27 total a passar)
- [ ] Sincronização automática de reservas (aguarda endpoint de listagem na API)
- [ ] Integrar dados de viaturas/movimentos no Operacional (endpoint requer JWT separado)
- [ ] Integrar dados de clientes (endpoint não disponível na API atual)

## Integração MultiPark → Cruzamento de Dados nos Módulos
- [ ] Explorar todos os endpoints da API MultiPark (reservas com datas, receita, ocorrências, agentes)
- [ ] Puxar reservas com data de criação, parque, cidade, valor, origem → alimentar Marketing (ROI campanhas)
- [ ] Puxar receita diária por parque → alimentar Dashboard e Faturação (ingressos vs despesas)
- [ ] Puxar ocorrências do dia → alimentar módulo Ocorrências
- [ ] Puxar reservas de agentes/pros → alimentar módulo Parcerias (comissões)
- [ ] Atualizar dashboards dos módulos para mostrar dados cruzados da MultiPark
- [ ] Testes vitest para a nova lógica de sincronização

## Integração MultiPark v2 — KPIs Agregados (não duplicar BD)
- [x] Schema BD: multipark_daily_snapshots (KPIs diários por parque/cidade)
- [x] Schema BD: sync_logs reutilizado para importações Excel
- [x] Backend: rota de importação Excel (parse + agregar KPIs por dia/parque/cidade)
- [x] Backend: rotas tRPC para consultar KPIs agregados (kpis, snapshots com filtros)
- [x] Backend: sync automático via API (disponibilidade + parques → KPIs)
- [x] Frontend: Dashboard MultiPark com KPIs reais (receita, reservas, check-ins/outs, por parque/cidade)
- [x] Frontend: Importador Excel com click-to-upload
- [x] Frontend: Tabela de evolução diária (receita, reservas, check-ins/outs)
- [x] Frontend: Campanhas externas (Parclick, Parkvia, etc.) com badges e contagem
- [x] Testes vitest: 13 testes para rotas MultiPark (29 total a passar)

## Bugs
- [x] Fix: missing unique key prop in ExpensesPage list render (SelectContent static+mapped children → single array pattern)
- [ ] Known: Radix UI Primitive.div key warning (React 19 + Radix 2.2.6 compat issue, cosmético, só dev mode)

## Gestão de Utilizadores — CRUD Completo
- [x] Backend: rota para criar utilizador manualmente (nome, email, role, departamento)
- [x] Backend: rota para editar utilizador (role, departamento, isActive)
- [x] Backend: rota para ativar/desativar utilizador
- [x] Backend: rota para listar utilizadores com filtros (role, departamento, estado)
- [x] Frontend: página de gestão de utilizadores com listagem em tabela
- [x] Frontend: formulário de criação de utilizador (modal)
- [x] Frontend: edição modal de utilizador
- [x] Frontend: toggle ativar/desativar com Switch
- [x] Frontend: filtros por role, estado + pesquisa por nome/email
- [x] Frontend: KPIs (total, ativos, inativos, admins)
- [x] Sidebar: link para Utilizadores já existia
- [x] Testes vitest: 13 testes para rotas de utilizadores (42 total a passar)

## Bugs e Melhorias Despesas (batch 2)
- [x] Bug: userId NaN — filtro de funcionário envia NaN em vez de número
- [x] Bug: dropdown de funcionário vazio — corrigido para usar users.list
- [x] Melhoria: lista de despesas mais detalhada (mais colunas visíveis)
- [x] Melhoria: clicar numa despesa abre detalhe completo (Sheet lateral)
- [x] Melhoria: totais dinâmicos (KPI cards: total, pendente, pago, em atraso)

## Logs de Atividade
- [x] Bug: logs mostram apenas "Updated Name" sem detalhes úteis — corrigido acesso a {log,user}

## Sistema de Convites por Email
- [x] Implementar convites por email para novos utilizadores criados manualmente
- [x] Tabela invite_tokens criada
- [x] Rotas backend: sendInvite, acceptInvite, completeInvite
- [x] Página /convite/:token com fluxo OAuth
- [x] Botão "Enviar Convite" na página de Utilizadores (só para users manuais)
- [x] Dialog com link copiável

## Ronda 6 — Utilizadores ↔ Funcionários + Self-Edit
- [x] Bug: não consigo editar o meu próprio nome de utilizador (botão desativado para o próprio user)
- [x] Ligar utilizadores a funcionários (cada funcionário precisa de estar cadastrado para picar ponto)
- [x] Permitir editar/alterar funcionários a partir da gestão de utilizadores

## Ronda 7 — Filtro conta na lista RH
- [x] Filtro "com/sem conta" na lista de funcionários do RH

## Ronda 8 — Edição completa de funcionários
- [x] Formulário de edição inline no detalhe do funcionário (nome, email, telefone, NIF, NIB, morada, posto, salário, contrato, etc.)

## Ronda 9 — Folha de Ordenados, Horas e Exportações
- [x] Cálculo mensal de horas normais por funcionário
- [x] Extras: calcular ao valor/hora definido nas taxas
- [x] Não-extras: calcular salário base + provisão 13º mês (Natal) + horas extra
- [x] Nova aba "Ordenados" no RH para gerar folha salarial mensal para contabilistas
- [x] Exportar lista completa de funcionários (CSV/Excel)
- [x] Exportar folha de ponto mensal (CSV/Excel) para contabilistas

## Ronda 10 — Upload Docs, PDF Ordenados, Gmail
- [x] Upload de documentos para funcionários (foto, BI, carta condução, NIB, morada, contrato, termos) — já existia
- [x] Gerar folha de ordenados em PDF formatado para impressão
- [x] Integrar Gmail para enviar folha de ordenados ao contabilista automaticamente

## Ronda 11 — Recibos de Vencimento Individuais
- [x] Gerar recibo de vencimento individual em PDF por funcionário
- [x] Rota backend para gerar payslip individual (employeeId + mês/ano)
- [x] Botão "Recibo" por funcionário na aba Ordenados
- [x] Botão "Gerar Todos os Recibos" para download em bulk

## Ronda 12 — Histórico de Recibos
- [ ] Tabela payslip_history no schema (employeeId, mês, ano, url, tipo, geradoPor, data)
- [ ] Guardar automaticamente cada recibo/folha gerado na tabela
- [ ] Rota backend para listar histórico de recibos (filtro por mês/ano/funcionário)
- [ ] UI "Histórico de Recibos" na aba Ordenados com filtros e links de download

## Ronda 12 — Projetos e Tarefas (melhorias)
- [x] Projeto: campo managerId (responsável do projeto) + budget
- [x] Projeto: equipa de colaboradores (projectEmployees melhorado)
- [x] Hierarquia: responsável do projeto herda notificações de cidade/marca
- [x] Tarefas: multi-assignee (vários responsáveis por tarefa)
- [x] Tarefas: prazo obrigatório com tracking
- [x] Notificação email: tarefa concluída → avisa responsáveis + hierarquia
- [x] Notificação email: prazo expirado sem conclusão → avisa responsáveis + hierarquia
- [x] UI Projetos: mostrar responsável, equipa, budget, despesas
- [x] UI Tarefas: multi-assignee, prazos, alertas

## Ronda 13 — Bug fix câmara despesas
- [x] Bug: upload de foto na despesa não permite abrir câmara no mobile — separado em 2 inputs (câmara + ficheiro)

## Ronda 14 — Dashboard Custos por Projeto
- [x] Backend: query agregada de custos por projeto (despesas + salários dos colaboradores atribuídos)
- [x] Backend: comparação custos vs budget definido no projeto
- [x] Frontend: dashboard com KPIs globais (total budget, total gasto, margem)
- [x] Frontend: tabela por projeto (budget, despesas, salários, total, % utilizado)
- [x] Frontend: barra de progresso visual (verde/amarelo/vermelho conforme % do budget)
- [x] Frontend: filtro por nível (grupo/marca/cidade/projeto)
- [x] Frontend: gráfico top 10 projetos por custo (barras empilhadas despesas + salários)
- [x] Frontend: gráfico pie custos por cidade
- [x] Frontend: tabela hierárquica expansível (grupo → marca → cidade → projeto)
- [x] Frontend: exportação CSV custos por projeto
- [x] Frontend: painel de alertas (projetos excedidos / em risco)
- [x] Sidebar: link para Custos Projetos
- [x] Botão "Custos" na página de Projetos
- [x] Testes vitest: 7 testes para custos de projetos (75 total a passar)

## Ronda 15 — Parcerias v2 (Reformulação Completa)
- [x] Dashboard de parcerias com KPIs (total parceiros, faturas pendentes, valor a receber, alertas)
- [x] Tabs por tipo de parceiro: Agregadores, Agências, Empresarial, Avenças
- [x] Pipeline/estados por parceria (etapas diferentes por tipo)
- [x] Faturação integrada: definir preço, confirmar envio de fatura
- [x] Alertas de cobrança: se fatura não paga até fim do mês, alerta visual
- [x] Controlo de pagamentos: tracking de quem pagou e quem não pagou
- [x] Testes vitest para novas funcionalidades de parcerias (75 testes a passar)

## Bugs — Ronda 16
- [x] Fix: DialogContent sem DialogTitle na página /despesas (erro acessibilidade)

## Ronda 17 — Atualizar API Multipark
- [x] Trocar MULTIPARK_API_KEY pela nova chave
- [x] Testar se a nova chave funciona com a API

## Ronda 18 — Alocação Hierárquica (Grupo → Marca → Cidade → Projeto)
- [ ] Schema: adicionar groupId, brandId, cityId a despesas (expenses) para alocação multi-nível
- [ ] Schema: adicionar groupId, brandId, cityId a funcionários (employees) para alocação multi-nível
- [ ] Schema: adicionar groupId, brandId, cityId a campanhas marketing para alocação multi-nível
- [ ] Schema: adicionar budget a grupos, marcas e cidades (não só projetos)
- [ ] Backend: queries agregadas em cascata (cada nível = soma filhos + próprio)
- [ ] Backend: dashboard custos hierárquico com rollup automático
- [ ] Frontend: formulários de despesas/funcionários/campanhas com seleção de nível (grupo/marca/cidade/projeto)
- [ ] Frontend: dashboard custos atualizado com cascata visual
- [ ] Testes vitest para lógica de agregação hierárquica

## Ronda 19 — Trocar Cidade ↔ Marca na hierarquia
- [x] Trocar hierarquia completa (valores + labels): Grupo → Cidade → Marca → Projeto
- [x] Migrar dados na BD: trocar brand↔city nos projetos existentes

## Bugs — Ronda 20
- [x] Fix: Dashboard custos projetos mostra tudo a zero (despesas, salários, gráficos vazios)

## Ronda 21 — Melhorias Despesas + Ordenados + Custos
- [x] Despesas: acrescentar categorias Consumíveis e Água/Luz
- [x] HR Schema: campo subsídio alimentação (valor/dia) no perfil funcionário
- [x] HR Cálculo: subsídio de férias (14º mês) em duodécimos a somar ao mês
- [x] HR Cálculo: 13º mês já existe mas não está a somar — corrigir
- [x] HR Cálculo: horas noturnas e fins de semana (valor legal PT)
- [x] HR Cálculo: horas extra como "real seguros" no recibo
- [x] HR Cálculo: subsídio alimentação = valor/dia × dias trabalhados
- [x] Dashboard custos: fix rollup hierárquico (grupo=soma filhos+próprio)

## Ronda 22 — Integração Zello Work no Operacional
- [x] Autenticar na API Zello (network: airpark, user: admin)
- [x] Explorar endpoints: users, canais, GPS, histórico
- [x] Integrar dados Zello no módulo operacional

## Ronda 22 — Zello Operacional + Alertas Velocidade
- [x] Helper Zello server-side (auth, users, GPS, canais)
- [x] Schema: tabelas speed_limits + speed_violations
- [x] Backend: monitorizar GPS, detetar excesso >10% do limite, registar infração
- [x] Backend: enviar notificação quando alguém excede velocidade
- [x] Frontend: tab GPS Tempo Real (localizações, canais, users Zello)
- [x] Frontend: tab Velocidade (infrações, limites, verificar agora, top infratores)
- [x] Testes vitest para Zello API (77 testes a passar)

## Ronda 23 — Operacional Completo (Histórico + PDAs + Alertas)
- [x] Schema: tabela daily_driver_history (km, horas trabalhadas, paradas, vel. média/máx, bateria)
- [x] Schema: tabela pdas (id, nome, número, IMEI, estado, foto)
- [x] Schema: tabela pda_checkins (extra, PDA, user Zello, foto entrada, foto saída, dados móveis)
- [x] Schema: tabela gps_alerts (user desligou GPS/Zello, timestamp)
- [x] Backend: job automático às 2h — puxa histórico Zello de 2 dias antes para todos os condutores
- [x] Backend: cálculo km feitos, horas trabalhadas vs paradas, velocidades médias/máximas
- [x] Backend: alerta quando funcionário desliga localização ou Zello
- [x] Backend: CRUD PDAs + check-in/check-out extras com fotos
- [x] Backend: associação user Zello ↔ PDA quando extra faz check-in
- [x] Frontend: tab Histórico Diário (tabela por condutor/dia com km, horas, velocidades, bateria)
- [x] Frontend: tab PDAs/Extras (lista PDAs, check-in com fotos, associação user)
- [x] Frontend: alertas GPS/Zello desligado no painel operacional
- [x] Testes vitest: 27 testes operacionais (104 total a passar)

## Ronda 24 — Importação Google Ads CSV com Proteção Duplicados
- [x] Parser CSV Google Ads (UTF-16, formato PT com vírgulas decimais, separador tab)
- [x] Backend: importar dados de campanhas com deteção de duplicados (campanha + período)
- [x] Frontend: feedback claro ao utilizador sobre dados importados vs ignorados (duplicados)
- [x] Testes vitest para importação com dedup (114 testes a passar)

## Ronda 25 — Gmail Polling: Ocorrências + Críticas Google
- [x] Schema: campos extras em incidents e googleReviews para source email, LLM classification
- [x] Backend: Gmail polling helper (buscar emails por subject, parse ocorrências e críticas)
- [x] Backend: LLM pré-classificação ocorrências (gravidade, categoria)
- [x] Backend: LLM pré-resposta críticas Google (rascunho para aprovação)
- [x] Backend: job agendado às 0h e 12h (Lisbon time)
- [x] Backend: endpoint manual para trigger sync
- [x] Frontend: botão "Sincronizar Gmail" nas Ocorrências e Críticas Google
- [x] Frontend: mostrar pré-classificação LLM e pré-resposta para aprovação
- [x] Frontend: badges Gmail, IA classification, GPS link nas ocorrências importadas
- [x] Testes vitest (130 testes a passar)

## Bug — Gmail Sync não importa emails
- [x] Fix: Gmail sync não funciona — MCP só existe no sandbox, app server não tem acesso
- [x] Implementar solução alternativa: script sandbox + task agendada Manus

## Bug Fix — Gmail Sync via Make (não MCP)
- [x] Criar API key na app para autenticação externa
- [x] Endpoint API externo /api/external/gmail-import funcional
- [x] Script sandbox: busca Gmail via MCP, parseia, envia para API
- [x] Remover scheduler MCP-dependente do servidor
- [x] Task agendada Manus: corre 2x/dia (0h e 12h)
- [x] Testado: 6 ocorrências + 2 reviews importadas com sucesso, duplicados ignorados

## Bugs — Ronda 27 (Operacional)
- [x] Fix: Velocidades absurdas (612 km/h) — Zello retorna m/s, adicionada conversão *3.6 para km/h
- [x] Fix: Filtro GPS noise (>150 km/h descartado como irrealista)
- [x] Fix: Erro ao tirar foto no PDA check-in — multer instalado + endpoint /api/upload
- [x] Fix: DriverHistoryTab missing key prop em lista React (React.Fragment com key)
- [x] Fix: Timestamps Zello — adicionado fallback para lastReport quando timestamp/time não existe
