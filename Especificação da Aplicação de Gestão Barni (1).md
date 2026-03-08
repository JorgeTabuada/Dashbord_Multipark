# Especificação da Aplicação de Gestão Barni

## 1. Introdução

Este documento detalha os requisitos para a aplicação de gestão de negócios da Barni. A aplicação será uma plataforma centralizada para gerir várias áreas da empresa, desde operações e finanças até recursos humanos e marketing. O objetivo é fornecer uma visão 360º do negócio, automatizar processos e melhorar a tomada de decisões através de dados consolidados e análises em tempo real.

## 2. Requisitos Gerais

- **Autenticação e Acessos:** A aplicação terá um sistema de login unificado. Os utilizadores terão diferentes níveis de acesso (Super Admin, Admin, Team Leader, Backoffice, etc.), com permissões granulares para cada módulo e funcionalidade.
- **Base de Dados:** A aplicação utilizará uma base de dados para armazenar todos os dados, incluindo documentos, faturas, logs e informações dos utilizadores.
- **API:** A aplicação irá integrar-se com sistemas externos através de APIs, como o backoffice da Multipark e o Zilo, para recolha e troca de dados.
- **Relatórios e Dashboards:** A maioria dos módulos incluirá dashboards visuais para apresentar dados de forma clara e concisa, permitindo uma análise rápida do desempenho.
- **Auditoria:** Todas as ações realizadas na aplicação serão registadas (logs), incluindo o utilizador, data, hora e a ação específica (criação, modificação, exclusão).

## 3. Módulos da Aplicação

### 3.1. Despesas

- **Objetivo:** Gerir todas as despesas da empresa.
- **Funcionalidades:**
    - Digitalizar faturas através da câmara do telemóvel.
    - Extrair e armazenar dados da fatura: fornecedor, descrição, valor, método de pagamento, comprador e data de inserção.
    - Associar despesas a projetos específicos.
    - Notificar o Super Admin sobre datas de pagamento de faturas.
    - Gerar relatórios de despesas diários, semanais e mensais, agregados por empresa, departamento e utilizador.

### 3.2. Recursos Humanos (RH)

- **Objetivo:** Gerir colaboradores, contratos, horários e salários.
- **Funcionalidades:**
    - Armazenar documentos dos colaboradores (BI, carta de condução, comprovativo de morada, NIB, etc.).
    - Gerir contratos de trabalho e de prestação de serviços (extras).
    - Registo de ponto (entrada e saída) com fotografia e geolocalização.
    - Definição de horários para funcionários.
    - Cálculo de horas trabalhadas para extras, com 5 níveis de remuneração.
    - Cálculo e processamento de salários.

### 3.3. Projetos

- **Objetivo:** Gerir e acompanhar o progresso de todos os projetos da empresa.
- **Funcionalidades:**
    - Estrutura de projetos em árvore (ex: MultiGrupo > Multipark > Projetos de Cidade > Campanhas).
    - Atribuição de projetos a funcionários.
    - Integração com o módulo de Tarefas para gestão de atividades do projeto.
    - Controlo de acessos baseado na hierarquia do projeto.

### 3.4. Tarefas

- **Objetivo:** Gerir tarefas individuais e de projetos.
- **Funcionalidades:**
    - Visualização de tarefas em modo "Kanban".
    - Notificações para supervisores e admins sobre prazos a expirar e tarefas atrasadas.
    - Integração com o módulo de Projetos.

### 3.5. Marketing

- **Objetivo:** Medir o desempenho e os custos das atividades de marketing.
- **Funcionalidades:**
    - Integração com o módulo de Despesas para registo de custos de marketing (Google Ads, Meta Ads, material promocional, etc.).
    - Importação diária de dados de campanhas do Google Ads.
    - Integração com o backoffice da Multipark para obter o número de reservas e o valor faturado.
    - Análise do custo por reserva.

### 3.6. Operacional

- **Objetivo:** Monitorizar a frota e o desempenho dos condutores.
- **Funcionalidades:**
    - Integração com a aplicação Zilo para monitorização de GPS e velocidade dos veículos em tempo real.
    - Alertas para excesso de velocidade.
    - Integração com o backoffice da Multipark para associar condutores a veículos.
    - Transcrição de conversas do Zilo (a verificar viabilidade via API).

### 3.7. Reclamações

- **Objetivo:** Gerir e resolver reclamações de clientes.
- **Funcionalidades:**
    - Registo de reclamações com associação a uma viatura e reserva específica.
    - Integração com o backoffice da Multipark para obter o histórico da viatura.
    - Anexo de fotografias e vídeos.
    - Identificação de todos os condutores que interagiram com a viatura.
    - Gestão de reclamações em formato de "tickets" com prazos de resposta.
    - Visualização em modo "Kanban".

### 3.8. Perdidos e Achados

- **Objetivo:** Gerir itens perdidos e achados nos veículos.
- **Funcionalidades:**
    - Semelhante ao módulo de Reclamações, mas focado em itens desaparecidos.
    - Cruzamento de informação para identificar padrões e possíveis responsáveis.

### 3.9. Críticas (Avaliações Google)

- **Objetivo:** Gerir as avaliações recebidas no Google.
- **Funcionalidades:**
    - **Avaliações >= 4 estrelas:** Resposta automática de agradecimento (gerada por IA para soar natural).
    - **Avaliações <= 3 estrelas:** Tratamento como uma reclamação. A aplicação deverá:
        - Identificar o cliente (via API, pelo nome, email ou matrícula).
        - Obter o histórico completo do cliente e da reserva.
        - Alertar um utilizador para resolver a situação.
        - Permitir a resposta à crítica após a resolução.

### 3.10. Avaliação de Desempenho

- **Objetivo:** Avaliar o desempenho dos condutores semanalmente.
- **Funcionalidades:**
    - Recolha de dados semanais do backoffice da Multipark e do módulo de RH (ocorrências, horas trabalhadas, etc.).
    - Análise de velocidade (via Zilo).
    - Dashboard com ranking de condutores, horas trabalhadas, movimentações por hora e ocorrências.
    - Sistema de pontos: positivos para boas práticas e negativos para infrações (ex: excesso de velocidade, ocorrências).

### 3.11. Ocorrências

- **Objetivo:** Gerir e analisar as ocorrências reportadas.
- **Funcionalidades:**
    - Recolha semanal de ocorrências do backoffice da Multipark.
    - Dashboard para o supervisor com as ocorrências e a sua gravidade.
    - Alertas para ocorrências graves não resolvidas em 48 horas.
    - Análise da evolução do número e tipo de ocorrências por condutor ao longo do tempo.

### 3.12. Serviços

- **Objetivo:** Monitorizar a venda de serviços extra (lavagens, carregamentos elétricos, etc.).
- **Funcionalidades:**
    - Ranking de condutores por número de lavagens angariadas.
    - Análise mensal do total de lavagens, receita, custos (produtos, comissões) e lucro.
    - Abas separadas para diferentes serviços (carregamentos elétricos, Valet Flex, etc.).

### 3.13. Formação e Apoio

- **Objetivo:** Centralizar materiais de formação e apoio para os colaboradores.
- **Funcionalidades:**
    - **Conteúdos:** Vídeos, manuais, FAQs, blog com atualizações.
    - **Gamificação:** Jogo interativo com perguntas sobre os manuais e cenários práticos, com sistema de pontuação e ranking.
    - **Progressão de Carreira:** Secção com descrição dos projetos do grupo e exames para progressão (Extra, Condutor, Sénior, Team Leader, Supervisor), com percentagens de aprovação definidas.

### 3.14. Faturação

- **Objetivo:** Consultar a faturação diária.
- **Funcionalidades:**
    - A aplicação irá buscar diariamente (no dia D+1) ao backoffice da Multipark as faturas emitidas no dia D.
    - Apresentação do total faturado (com e sem NIF) e listagem das faturas.
    - Funcionalidade de pesquisa de faturas.

### 3.15. Parcerias

- **Objetivo:** Gerir e analisar o desempenho de parceiros (agregadores, agências, clientes Pro, avenças).
- **Funcionalidades:**
    - Relatórios mensais por parceiro com número de reservas, valor médio, receita total e comissão.
    - Gestão de avenças (mensais e anuais) com faturação automática e controlo de pagamento.

### 3.16. Gestão de Utilizadores e Logs

- **Objetivo:** Gerir acessos e auditar a utilização da aplicação.
- **Funcionalidades:**
    - **Logs:** Registo detalhado de todas as ações na aplicação, acessível apenas ao Super Admin.
    - **Acessos:** Atribuição de permissões granulares por utilizador, permitindo o acesso a parques, cidades e funcionalidades específicas de cada módulo.

### 3.17. Anual

- **Objetivo:** Consolidar os dados de todos os módulos para uma visão anual do negócio.
- **Funcionalidades:**
    - Relatório mensal que agrega:
        - Faturação diária (do backoffice).
        - Despesas operacionais e de marketing.
        - Custos com pessoal (extras).
    - Relatórios por parque e por cidade.
    - Visão anual com a divisão de receitas entre a Multipark (40%) e os parceiros (60%).
