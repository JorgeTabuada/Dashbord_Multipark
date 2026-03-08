# Análise Hierárquica — Alocação Multi-nível

## Situação Atual

### Tabelas com `projectId` (alocação a qualquer nível da árvore):
- `expenses` → projectId (int, nullable) — JÁ pode apontar para grupo/marca/cidade/projeto
- `employees` → projectId (int, nullable) — JÁ pode apontar para qualquer nível
- `campaigns` → projectId (int, nullable) — JÁ pode apontar para qualquer nível
- `marketingExpenses` → projectId (int, nullable) — JÁ pode apontar para qualquer nível
- `projectEmployees` → projectId (int, NOT NULL) — assignment table
- `projects` → budget (decimal, nullable) — JÁ tem budget em todos os níveis

### Hierarquia de Projetos (tabela `projects`):
- level: group | brand | city | project
- parentId: referência ao pai
- budget: já existe em todos os níveis

## Conclusão

O schema JÁ suporta alocação a qualquer nível! O `projectId` nas tabelas de despesas, funcionários e campanhas pode apontar para um projeto de qualquer nível (group, brand, city, project).

## O que falta:
1. **Backend**: query de agregação em cascata — somar custos dos filhos + próprios
2. **Frontend**: nos formulários, mostrar a hierarquia completa para seleção (não só projetos leaf)
3. **Frontend**: no dashboard de custos, mostrar rollup correto (nível = próprio + soma filhos)
4. **Frontend**: permitir selecionar grupo/marca/cidade nos formulários de despesas/funcionários/campanhas
