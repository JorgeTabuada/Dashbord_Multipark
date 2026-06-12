# Comparador de Pagamentos - Multipark

Aplicação desktop para comparar ficheiros de caixa, extratos Viva Wallet, Balance History Stripe e condutores validados.

## Como usar

1. Faz duplo-clique em `instalar_e_abrir.bat` (instala dependências e abre a app)
2. Ou corre manualmente: `python comparador_pagamentos.py`

## Funcionalidades

### Carregamento de Ficheiros
- **Auto-Carregar Pasta**: Deteta automaticamente todos os ficheiros de uma pasta
- Suporta múltiplas sheets em Excel
- Parseia CSV do Stripe (formato especial com vírgulas decimais)

### Comparações Disponíveis
1. **Online - campaignPay**: Valida se campaignPay=True tem pagamento online confirmado
2. **MB vs Viva Wallet**: Cruza pagamentos Multibanco com o extrato Viva Wallet (por email/valor)
3. **Online vs Stripe**: Cruza pagamentos online com Balance History Stripe
4. **Condutores vs Caixa**: Compara valores dos condutores validados com a caixa
5. **Valores Incoerentes**: Verifica se totalPaid + totalLeftToPay = totalGeral
6. **Stats vs Real**: Compara estatísticas reportadas com valores calculados
7. **Método vs Online**: Verifica coerência entre método de pagamento e hasOnlinePayment
8. **Por Receber**: Lista reservas com valores pendentes

### Exportação
- Exportar resultados para Excel (.xlsx)
- Exportar relatório para texto (.txt)
- Excel detalhado com múltiplas sheets (Todos, Erros, Avisos, Resumo)

## Requisitos
- Python 3.10+
- pandas
- openpyxl
- customtkinter
