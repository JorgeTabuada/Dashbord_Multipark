# Feedback Jorge — Screenshots + Áudio

## Bugs Identificados
1. **Serviços — Condutores não aparecem**: dropdown de condutores está vazio, dá erro NaN no employeeId
2. **Despesas — Falta campo funcionário**: precisa de campo para associar despesa a funcionário + filtro por funcionário
3. **Despesas — Não dá para editar**: depois de criar, não há como corrigir/editar uma despesa
4. **Despesas — Filtro por semana/mês/cidade**: precisa de filtros mais práticos (semana, mês) e campo cidade
5. **Tarefas — Drag & drop**: não dá para arrastar tarefas entre colunas, só botões. Quer também vista lista
6. **Marketing — Import Excel**: além da importação manual, quer upload de ficheiros Excel dos dados do Google Ads/Meta
7. **Marketing — API integration**: preparar para ligar APIs do Google Ads/Meta Ads
8. **Operacional — Viaturas**: não deve ser criar manual, deve ir buscar a outra app (Zello API)
9. **Reclamações — Import email**: quer importar reclamações automaticamente via email
10. **Críticas Google — Import email**: "importar review" deve importar de emails, não criar manual
11. **Formação — Manuais**: só permite markdown, quer PDF/apresentações. Separar "Manuais" (PDF) de "Procedimentos" (markdown)
12. **Perdidos e Achados — Import**: quer importar de outro sistema, não criar manual. Cruzamento de dados via API externa
13. **Ocorrências — Import email**: receber ocorrências por email
14. **Avaliação — Explicar lógica**: não percebe de onde vêm os dados do ranking
15. **Faturação — Email**: receber faturas por email
16. **Parcerias — Comissão automática**: ao criar reserva, calcular comissão automaticamente. Resumo mensal de pagamentos
17. **Anual — Receita**: não percebe de onde vem a receita. Divisão não é sempre 60/40
18. **Utilizadores — Permissões granulares**: quer dar permissões específicas a cada utilizador
19. **Edição geral**: em todo o lado falta poder editar registos depois de criados
20. **Zello API key**: OHB9BAA637JVW8V4FQNUPZS9ELZFX2SJ

## Prioridades Imediatas (bugs/fixes rápidos)
- Fix condutores no Serviços (dropdown vazio + NaN)
- Adicionar edição de registos em todos os módulos
- Adicionar campo funcionário + cidade nas despesas
- Drag & drop nas tarefas + vista lista
- Filtros semana/mês nas despesas
