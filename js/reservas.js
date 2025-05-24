// js/reservas.js - Lógica para a Subaplicação de Gestão de Reservas

document.addEventListener("DOMContentLoaded", async () => {
    // --- Verificação de Cliente Supabase ---
    if (typeof window.getSupabaseClient !== 'function') {
        console.error("ERRO CRÍTICO (reservas.js): getSupabaseClient não está definido.");
        alert("Erro crítico na configuração da aplicação (Reservas). Contacte o suporte.");
        return;
    }
    const supabase = window.getSupabaseClient();
    if (!supabase) {
        console.error("ERRO CRÍTICO (reservas.js): Cliente Supabase não disponível.");
        alert("Erro crítico ao conectar com o sistema (Reservas). Contacte o suporte.");
        return;
    }

    let currentUser = null;
    let userProfile = null;

    // --- Seletores de Elementos DOM ---
    const importReservasFileEl = document.getElementById("importReservasFile");
    const resProcessarImportacaoBtnEl = document.getElementById("resProcessarImportacaoBtn");
    const importacaoStatusEl = document.getElementById("importacaoStatus");
    const loadingImportSpinnerEl = document.getElementById("loadingImportSpinner");
    const resDashboardFiltroDataInicioEl = document.getElementById("resDashboardFiltroDataInicio");
    const resDashboardFiltroDataFimEl = document.getElementById("resDashboardFiltroDataFim");
    const resDashboardFiltroPeriodoEl = document.getElementById("resDashboardFiltroPeriodo");
    const resAplicarFiltrosDashboardBtnEl = document.getElementById("resAplicarFiltrosDashboardBtn");
    const statTotalReservasEl = document.getElementById("statTotalReservas");
    const statTotalReservasPeriodoEl = document.getElementById("statTotalReservasPeriodo");
    const statValorTotalReservasEl = document.getElementById("statValorTotalReservas");
    const statValorTotalReservasPeriodoEl = document.getElementById("statValorTotalReservasPeriodo");
    const statReservasCampanhaEl = document.getElementById("statReservasCampanha");
    const statReservasDiaSemanaEl = document.getElementById("statReservasDiaSemana");
    const resDashboardDataHoraInputEl = document.getElementById("resDashboardDataHoraInput");
    const resDashboardDataHoraDisplayEl = document.getElementById("resDashboardDataHoraDisplay");
    const chartReservasPorHoraEl = document.getElementById("chartReservasPorHora");
    const chartReservasMensalEl = document.getElementById("chartReservasMensal");
    const statReservasHoraConteudoEl = document.getElementById("statReservasHoraConteudo");
    const resSearchTermEl = document.getElementById("resSearchTerm");
    const resSearchBtnEl = document.getElementById("resSearchBtn");
    const resAbrirModalNovaBtnEl = document.getElementById("resAbrirModalNovaBtn");
    const resExportarBtnEl = document.getElementById("resExportarBtn");
    const resFiltroClienteListaEl = document.getElementById("resFiltroClienteLista");
    const resFiltroMatriculaListaEl = document.getElementById("resFiltroMatriculaLista");
    const resFiltroDataEntradaListaEl = document.getElementById("resFiltroDataEntradaLista");
    const resFiltroEstadoListaEl = document.getElementById("resFiltroEstadoLista");
    const resFiltroCampanhaListaEl = document.getElementById("resFiltroCampanhaLista");
    const resFiltroPagamentoOnlineListaEl = document.getElementById("resFiltroPagamentoOnlineLista");
    const resFiltroTipoReservaListaEl = document.getElementById("resFiltroTipoReservaLista");
    const resAplicarFiltrosListaBtnEl = document.getElementById("resAplicarFiltrosListaBtn");
    const reservasTableBodyEl = document.getElementById("reservasTableBody");
    const reservasNenhumaMsgEl = document.getElementById("reservasNenhumaMsg");
    const reservasPaginacaoEl = document.getElementById("reservasPaginacao");
    const loadingTableSpinnerEl = document.getElementById("loadingTableSpinner");
    const reservaFormModalEl = document.getElementById("reservaFormModal");
    const reservaFormModalTitleEl = document.getElementById("reservaFormModalTitle");
    const reservaFormEl = document.getElementById("reservaForm");
    const reservaFormIdEl = document.getElementById("reservaFormId");
    const resFecharModalBtns = document.querySelectorAll(".resFecharModalBtn");
    const reservaLogModalEl = document.getElementById("reservaLogModal");
    const logReservaBookingIdEl = document.getElementById("logReservaBookingId");
    const reservaLogTableBodyEl = document.getElementById("reservaLogTableBody");
    const reservaLogNenhumaMsgEl = document.getElementById("reservaLogNenhumaMsg");
    const resFecharLogModalBtns = document.querySelectorAll(".resFecharLogModalBtn");
    const voltarDashboardBtnReservasEl = document.getElementById("voltarDashboardBtnReservas");
    const reservasTotalCountEl = document.getElementById("reservasTotalCount");
    const somaValoresFiltroEl = document.getElementById("somaValoresFiltro");
    const loadingModalSpinnerFormEl = document.getElementById('loadingModalSpinnerForm');

    const formHtmlIdsToSupabaseMap = {
        reservaFormBookingId: "booking_id",
        reservaFormDataReserva: "booking_date",
        reservaFormNomeCliente: "name_cliente",
        reservaFormApelidoCliente: "lastname_cliente",
        reservaFormEmailCliente: "email_cliente",
        reservaFormTelefoneCliente: "phone_number_cliente", // Importante: A coluna na BD deve ser TEXT
        reservaFormMatricula: "license_plate",
        reservaFormAlocation: "alocation",
        reservaFormDataEntrada: "check_in_previsto",
        reservaFormDataSaida: "check_out_previsto",
        reservaFormParque: "parque_id",
        reservaFormCampanha: "campaign_id_aplicada",
        reservaFormValor: "total_price",
        reservaFormBookingPrice: "booking_price",
        reservaFormEstado: "estado_reserva_atual",
        reservaFormObservacoes: "remarks_cliente"
    };

    // MODIFICAÇÃO: Campos que são estritamente PREÇOS e devem ser validados para NUMERIC(10,2)
    // Se um campo aqui listado receber um valor > 99.999.999,99, causará "numeric field overflow".
    const camposDePrecoSupabase = [
        "booking_price",      // Preço da reserva
        "parking_price",      // Preço do estacionamento
        "delivery_price",     // Preço da entrega
        "extras_price",       // Preço dos extras
        "total_price",        // Preço total (no Excel, pode vir de "priceOnDelivery")
        "corrected_price",    // Preço corrigido
        "price_on_delivery"   // Preço na entrega (se for uma coluna de preço separada na BD)
        // "campaign_pay" foi retirado daqui. Se for um VALOR MONETÁRIO GRANDE, adicione-o de volta.
        // Se for um flag (0/1) ou valor pequeno, pode ser tratado separadamente (ver processarDadosImportacao).
    ];

    // Todos os campos que são fundamentalmente numéricos, incluindo os de preço e outros como flags (0/1)
    // Esta lista ajuda a função 'validarCampoNumerico' a ser chamada para os campos certos.
    const todosCamposNumericosSupabase = [
        "booking_price", "parking_price", "delivery_price", "extras_price",
        "total_price", "campaign_pay", "corrected_price", "price_on_delivery"
        // Adiciona outros campos que são números mas não necessariamente preços grandes, se houver.
    ];


    let todasAsReservasGeral = [];
    let paginaAtualLista = 1;
    const itensPorPaginaLista = 15;
    let totalReservasNaBD = 0;
    let graficoReservasHora, graficoReservasMensal;

    function formatarDataHora(dataISO) {
        if (!dataISO) return "N/A";
        try { return new Date(dataISO).toLocaleString("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" }); }
        catch (e) { console.warn("Erro ao formatar data-hora:", dataISO, e); return dataISO; }
    }

    function formatarDataParaInput(dataISO) {
        if (!dataISO) return "";
        try {
            const d = new Date(dataISO);
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}T${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
        } catch (e) { console.warn("Erro ao formatar data para input:", dataISO, e); return ""; }
    }

    function formatarMoeda(valor) {
        const num = parseFloat(valor);
        if (isNaN(num)) return "0,00 €";
        return num.toLocaleString("pt-PT", { style: "currency", currency: "EUR" });
    }

    function mostrarSpinner(elementId) { const el = document.getElementById(elementId); if (el) el.classList.remove("hidden"); }
    function esconderSpinner(elementId) { const el = document.getElementById(elementId); if (el) el.classList.add("hidden"); }

    function normalizarMatricula(matricula) {
        if (!matricula) return null;
        return String(matricula).replace(/[\s\-\.]/g, '').toUpperCase();
    }

    function converterDataParaISO(dataStr) {
        if (!dataStr) return null;
        if (dataStr instanceof Date) {
            if (isNaN(dataStr.getTime())) { console.warn(`Data inválida para ISO:`, dataStr); return null; }
            return dataStr.toISOString().split('.')[0]; // Remove milissegundos para consistência
        }
        // Formatos comuns do Excel: DD/MM/YYYY, HH:MM ou DD/MM/YYYY
        const formatos = [
            { regex: /(\d{1,2})\/(\d{1,2})\/(\d{4}),?\s*(\d{1,2}):(\d{1,2})/, d: 1, m: 2, a: 3, h: 4, min: 5 }, // DD/MM/YYYY, HH:MM ou DD/MM/YYYY HH:MM
            { regex: /(\d{1,2})\/(\d{1,2})\/(\d{4})/, d: 1, m: 2, a: 3, h: null, min: null } // DD/MM/YYYY
        ];

        for (const fmt of formatos) {
            const match = String(dataStr).match(fmt.regex);
            if (match) {
                const ano = match[fmt.a];
                const mes = match[fmt.m].padStart(2, '0');
                const dia = match[fmt.d].padStart(2, '0');
                const hora = fmt.h ? match[fmt.h].padStart(2, '0') : '00';
                const minuto = fmt.min ? match[fmt.min].padStart(2, '0') : '00';
                return `${ano}-${mes}-${dia}T${hora}:${minuto}:00`;
            }
        }

        // Tentar parse direto se não for um dos formatos acima (pode ser que já esteja em formato aceitável)
        try {
            const d = new Date(dataStr);
            if (!isNaN(d.getTime())) return d.toISOString().split('.')[0];
        } catch(e) { /* Ignora erro de parse, tentará o próximo ou falhará */ }

        console.warn(`Formato de data não reconhecido para ISO: "${dataStr}"`);
        return null; // Retorna null se não conseguir converter
    }

    function validarCampoNumerico(valor) {
        if (valor === null || valor === undefined || String(valor).trim() === "") return null;
        // Remove caracteres não numéricos exceto ponto e sinal negativo no início.
        // Trata vírgula como ponto decimal.
        let numStr = String(valor).replace(',', '.').replace(/[^\d.-]/g, '');
        const numero = parseFloat(numStr);
        return isNaN(numero) ? null : numero;
    }

    async function obterParqueIdPorCodigoComRPC(codigoOuNome) {
        if (!codigoOuNome || String(codigoOuNome).trim() === "") {
            console.warn("Código ou nome do parque vazio, não foi possível obter ID.");
            return null;
        }
        try {
            const codigoNormalizado = String(codigoOuNome).trim();
            // Chama a Remote Procedure Call (RPC) 'obter_parque_id_por_codigo' no Supabase
            const { data, error } = await supabase.rpc('obter_parque_id_por_codigo', {
                p_codigo_ou_nome: codigoNormalizado
            });

            if (error) {
                console.error(`Erro ao chamar RPC obter_parque_id_por_codigo para "${codigoNormalizado}":`, error);
                return null;
            }
            // A RPC deve retornar o UUID do parque_id ou null se não encontrar
            return data;
        } catch (error) {
            console.error(`Exceção ao chamar RPC obter_parque_id_por_codigo para "${codigoOuNome}":`, error);
            return null;
        }
    }

    async function popularFiltroCampanhas() {
        // ... (código existente, parece ok)
        if (!resFiltroCampanhaListaEl) return;
        try {
            const { data, error } = await supabase
                .from('reservas')
                .select('campaign_id_aplicada')
                .not('campaign_id_aplicada', 'is', null)
                .neq('campaign_id_aplicada', '');

            if (error) {
                console.error("Erro ao buscar campanhas distintas:", error);
                return;
            }

            // Limpar opções existentes (exceto a primeira "Todas as Campanhas")
            while (resFiltroCampanhaListaEl.options.length > 1) {
                resFiltroCampanhaListaEl.remove(1);
            }

            if (data && data.length > 0) {
                const campanhasUnicas = [...new Set(data.map(item => item.campaign_id_aplicada))].sort();
                campanhasUnicas.forEach(campanha => {
                    if (campanha) { // Garantir que não adiciona opções vazias/nulas
                        const option = document.createElement('option');
                        option.value = campanha;
                        option.textContent = campanha;
                        resFiltroCampanhaListaEl.appendChild(option);
                    }
                });
            }
        } catch (error) {
            console.error("Erro ao popular filtro de campanhas:", error);
        }
    }


    async function carregarReservasDaLista(pagina = 1, filtros = {}) {
        // ... (código existente, parece ok, mas verifica a coluna de ordenação 'booking_date')
        // Se 'booking_date' não existir ou causar problemas, ajusta para 'created_at_db' ou 'id_pk' como fallback
        if (!reservasTableBodyEl) return;
        mostrarSpinner("loadingTableSpinner");
        reservasTableBodyEl.innerHTML = "";
        if (reservasNenhumaMsgEl) reservasNenhumaMsgEl.classList.add("hidden");
        if (somaValoresFiltroEl) somaValoresFiltroEl.textContent = formatarMoeda(0);

        const rangeFrom = (pagina - 1) * itensPorPaginaLista;
        const rangeTo = rangeFrom + itensPorPaginaLista - 1;

        let query = supabase.from("reservas").select("*, parque_info:parque_id (nome_parque)", { count: "exact" });

        // Aplicar filtros
        if (filtros.searchTerm) {
            query = query.or(`name_cliente.ilike.%${filtros.searchTerm}%,license_plate.ilike.%${filtros.searchTerm}%,booking_id.ilike.%${filtros.searchTerm}%,alocation.ilike.%${filtros.searchTerm}%`);
        }
        if (filtros.estado_reserva_atual && filtros.estado_reserva_atual !== "") {
            query = query.eq("estado_reserva_atual", filtros.estado_reserva_atual);
        }
        if (filtros.check_in_previsto) {
            query = query.gte("check_in_previsto", filtros.check_in_previsto + "T00:00:00");
        }
        if (filtros.cliente) {
            query = query.ilike("name_cliente", `%${filtros.cliente}%`);
        }
        if (filtros.matricula) {
            query = query.ilike("license_plate", `%${filtros.matricula}%`);
        }
        if (filtros.campaign_id_aplicada && filtros.campaign_id_aplicada !== "") {
            query = query.eq("campaign_id_aplicada", filtros.campaign_id_aplicada);
        }
        // Filtro para has_online_payment
        if (filtros.has_online_payment !== undefined && filtros.has_online_payment !== "") {
            if (filtros.has_online_payment === 'true') {
                query = query.is("has_online_payment", true);
            } else if (filtros.has_online_payment === 'false') {
                query = query.or("has_online_payment.is.false,has_online_payment.is.null"); // Considera nulos como false
            }
        }
        // Filtro para tipo_reserva (baseado em remarks_cliente)
        if (filtros.tipo_reserva) {
            if (filtros.tipo_reserva === "telefone") {
                query = query.like("remarks_cliente", "%telres%"); // Procura por 'telres' em remarks_cliente
            } else if (filtros.tipo_reserva === "online") {
                // Considera online se não tiver 'telres' ou se remarks for nulo
                query = query.or("remarks_cliente.not.like.%telres%,remarks_cliente.is.null");
            }
        }


        let orderByColumn = "booking_date"; // Coluna primária para ordenação
        let { data, error, count } = await query.order(orderByColumn, { ascending: false }).range(rangeFrom, rangeTo);

        // Fallback de ordenação se a coluna primária não existir
        if (error && error.message && error.message.includes(`column "reservas.${orderByColumn}" does not exist`)) {
            console.warn(`Coluna de ordenação '${orderByColumn}' não encontrada. Tentando 'created_at_db'.`);
            orderByColumn = "created_at_db"; // Tenta a coluna de timestamp de criação
            // Recria a query base para aplicar a nova ordenação, mantendo os filtros
            let fallbackQuery = supabase.from("reservas").select("*, parque_info:parque_id (nome_parque)", { count: "exact" });
            if (filtros.searchTerm) fallbackQuery = fallbackQuery.or(`name_cliente.ilike.%${filtros.searchTerm}%,license_plate.ilike.%${filtros.searchTerm}%,booking_id.ilike.%${filtros.searchTerm}%,alocation.ilike.%${filtros.searchTerm}%`);
            if (filtros.estado_reserva_atual && filtros.estado_reserva_atual !== "") fallbackQuery = fallbackQuery.eq("estado_reserva_atual", filtros.estado_reserva_atual);
            if (filtros.check_in_previsto) fallbackQuery = fallbackQuery.gte("check_in_previsto", filtros.check_in_previsto + "T00:00:00");
            if (filtros.cliente) fallbackQuery = fallbackQuery.ilike("name_cliente", `%${filtros.cliente}%`);
            if (filtros.matricula) fallbackQuery = fallbackQuery.ilike("license_plate", `%${filtros.matricula}%`);
            if (filtros.campaign_id_aplicada && filtros.campaign_id_aplicada !== "") fallbackQuery = fallbackQuery.eq("campaign_id_aplicada", filtros.campaign_id_aplicada);
            if (filtros.has_online_payment !== undefined && filtros.has_online_payment !== "") { /* ... lógica de filtro ... */ }
            if (filtros.tipo_reserva) { /* ... lógica de filtro ... */ }

            const fallbackResult = await fallbackQuery.order(orderByColumn, { ascending: false }).range(rangeFrom, rangeTo);
            data = fallbackResult.data; error = fallbackResult.error; count = fallbackResult.count;
        }


        try {
            if (error) throw error;
            todasAsReservasGeral = data;
            totalReservasNaBD = count || 0; // Garante que é um número

            if (reservasTotalCountEl) { // Elemento para mostrar contagem total
                reservasTotalCountEl.textContent = totalReservasNaBD;
            }

            let somaValoresPagina = 0; // Para somar valores da página atual
            if (data && data.length > 0) {
                data.forEach(reserva => {
                    somaValoresPagina += (parseFloat(reserva.booking_price) || 0); // Soma booking_price
                    const tr = document.createElement("tr");
                    tr.className = "border-b hover:bg-gray-50";
                    tr.innerHTML = `
                        <td class="py-3 px-4 text-xs">${reserva.booking_id || "N/A"}</td>
                        <td class="py-3 px-4 text-xs">${formatarDataHora(reserva.booking_date)}</td>
                        <td class="py-3 px-4 text-xs">${(reserva.name_cliente || '') + ' ' + (reserva.lastname_cliente || '') || "N/A"}</td>
                        <td class="py-3 px-4 text-xs">${reserva.license_plate || "N/A"}</td>
                        <td class="py-3 px-4 text-xs">${reserva.alocation || "N/A"}</td>
                        <td class="py-3 px-4 text-xs">${formatarDataHora(reserva.check_in_previsto)}</td>
                        <td class="py-3 px-4 text-xs">${formatarDataHora(reserva.check_out_previsto)}</td>
                        <td class="py-3 px-4 text-xs">${reserva.parque_info?.nome_parque || (reserva.parque_id ? `ID: ${String(reserva.parque_id).substring(0,8)}...` : "N/A")}</td>
                        <td class="py-3 px-4 text-xs text-right">${formatarMoeda(reserva.booking_price)}</td> 
                        <td class="py-3 px-4 text-xs"><span class="px-2 py-1 text-xs font-semibold rounded-full ${getEstadoClass(reserva.estado_reserva_atual)}">${reserva.estado_reserva_atual || "N/A"}</span></td>
                        <td class="py-3 px-4 text-xs">
                            <button class="text-blue-600 hover:text-blue-800 editar-reserva-btn" data-id="${reserva.id_pk}">Editar</button>
                            <button class="text-red-600 hover:text-red-800 apagar-reserva-btn ml-2" data-id="${reserva.id_pk}">Apagar</button>
                            <button class="text-gray-600 hover:text-gray-800 log-reserva-btn ml-2" data-booking-id="${reserva.booking_id || reserva.id_pk}" data-reserva-pk="${reserva.id_pk}">Hist.</button>
                        </td>
                    `;
                    reservasTableBodyEl.appendChild(tr);
                });
                configurarBotoesAcao(); // Reconfigura os botões após renderizar
            } else {
                if (reservasNenhumaMsgEl) {
                    reservasNenhumaMsgEl.textContent = "Nenhuma reserva encontrada com os filtros atuais.";
                    reservasNenhumaMsgEl.classList.remove("hidden");
                }
            }
            if (somaValoresFiltroEl) { // Elemento para mostrar soma dos valores filtrados
                somaValoresFiltroEl.textContent = formatarMoeda(somaValoresPagina);
            }

            atualizarPaginacaoLista(pagina, totalReservasNaBD);
            atualizarDashboardStatsGeral(); // Atualiza o dashboard geral se esta função existir
        } catch (error) {
            console.error("Erro ao carregar reservas:", error);
            if (reservasNenhumaMsgEl) {
                reservasNenhumaMsgEl.textContent = `Erro ao carregar dados: ${error.message}. Verifique a consola.`;
                reservasNenhumaMsgEl.classList.remove("hidden");
            }
        } finally {
            esconderSpinner("loadingTableSpinner");
        }
    }


    function getEstadoClass(estado) {
        // ... (código existente, parece ok)
        if (!estado) return 'bg-gray-100 text-gray-700';
        const estadoLower = String(estado).toLowerCase();
        switch (estadoLower) {
            case 'reservado': return 'bg-blue-100 text-blue-700'; // Exemplo
            case 'recolhido': return 'bg-yellow-100 text-yellow-700'; // Exemplo
            case 'entregue': return 'bg-green-100 text-green-700'; // Exemplo
            case 'cancelado': return 'bg-red-100 text-red-700'; // Exemplo
            case 'pendente': return 'bg-yellow-100 text-yellow-700';
            case 'confirmada': return 'bg-green-100 text-green-700'; // Mantido de antes
            case 'concluída': return 'bg-green-100 text-green-700'; // Mantido de antes
            case 'em curso': return 'bg-indigo-100 text-indigo-700';// Mantido de antes
            case 'validadafinanceiramente': return 'bg-purple-100 text-purple-700';// Mantido de antes
            default:
                console.warn(`Estado desconhecido para class: ${estadoLower}`);
                return 'bg-gray-100 text-gray-700'; // Padrão
        }
    }

    function atualizarPaginacaoLista(paginaCorrente, totalItens) {
        // ... (código existente, parece ok)
        if (!reservasPaginacaoEl) return;
        const totalPaginas = Math.ceil(totalItens / itensPorPaginaLista);
        reservasPaginacaoEl.innerHTML = "";
        if (totalPaginas <= 1) return;

        const criarBotao = (texto, pagina, habilitado = true) => {
            const btn = document.createElement("button");
            btn.className = `px-3 py-1 mx-1 rounded ${!habilitado ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : (pagina === paginaCorrente ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-700 hover:bg-blue-200')}`;
            btn.textContent = texto;
            btn.disabled = !habilitado;
            if (habilitado && pagina !== paginaCorrente) {
                btn.addEventListener("click", () => {
                    paginaAtualLista = pagina;
                    carregarReservasDaLista(paginaAtualLista, obterFiltrosAtivos());
                });
            }
            return btn;
        };

        reservasPaginacaoEl.appendChild(criarBotao("Anterior", paginaCorrente - 1, paginaCorrente > 1));
        const maxPaginasVisiveis = 5;
        let startPage = Math.max(1, paginaCorrente - Math.floor(maxPaginasVisiveis / 2));
        let endPage = Math.min(totalPaginas, startPage + maxPaginasVisiveis - 1);
        if (endPage - startPage + 1 < maxPaginasVisiveis) {
            startPage = Math.max(1, endPage - maxPaginasVisiveis + 1);
        }
        for (let i = startPage; i <= endPage; i++) {
            reservasPaginacaoEl.appendChild(criarBotao(i, i, true));
        }
        reservasPaginacaoEl.appendChild(criarBotao("Próximo", paginaCorrente + 1, paginaCorrente < totalPaginas));
    }

    function obterFiltrosAtivos() {
        // ... (código existente, parece ok)
        const filtros = {};
        if (resSearchTermEl && resSearchTermEl.value) filtros.searchTerm = resSearchTermEl.value.trim();
        if (resFiltroClienteListaEl && resFiltroClienteListaEl.value) filtros.cliente = resFiltroClienteListaEl.value.trim();
        if (resFiltroMatriculaListaEl && resFiltroMatriculaListaEl.value) filtros.matricula = resFiltroMatriculaListaEl.value.trim();
        if (resFiltroDataEntradaListaEl && resFiltroDataEntradaListaEl.value) filtros.check_in_previsto = resFiltroDataEntradaListaEl.value;
        if (resFiltroEstadoListaEl && resFiltroEstadoListaEl.value) { // Não adicionar se for "" (Todos)
             filtros.estado_reserva_atual = resFiltroEstadoListaEl.value;
        }
        if (resFiltroCampanhaListaEl && resFiltroCampanhaListaEl.value) { // Adicionado
            filtros.campaign_id_aplicada = resFiltroCampanhaListaEl.value;
        }
        // Adicionado para os novos filtros
        if (resFiltroPagamentoOnlineListaEl && resFiltroPagamentoOnlineListaEl.value !== "") {
            filtros.has_online_payment = resFiltroPagamentoOnlineListaEl.value; // 'true' ou 'false' como string
        }
        if (resFiltroTipoReservaListaEl && resFiltroTipoReservaListaEl.value !== "") {
            filtros.tipo_reserva = resFiltroTipoReservaListaEl.value; // 'online' ou 'telefone'
        }
        return filtros;
    }

    async function atualizarDashboardStatsGeral() {
        // ... (código existente, parece ok)
        try {
            const dataInicioStr = resDashboardFiltroDataInicioEl ? resDashboardFiltroDataInicioEl.value : null;
            const dataFimStr = resDashboardFiltroDataFimEl ? resDashboardFiltroDataFimEl.value : null;

            // Se as datas não estiverem selecionadas, não faz nada ou limpa os stats
            if (!dataInicioStr || !dataFimStr) {
                console.warn("Datas de início e/ou fim não selecionadas para o dashboard.");
                // Poderias limpar os elementos do dashboard aqui se desejado
                if (statTotalReservasEl) statTotalReservasEl.textContent = "-";
                if (statValorTotalReservasEl) statValorTotalReservasEl.textContent = formatarMoeda(0);
                if (statReservasCampanhaEl) statReservasCampanhaEl.innerHTML = "<i>Selecione um período</i>";
                if (statReservasDiaSemanaEl) statReservasDiaSemanaEl.innerHTML = "<i>Selecione um período</i>";
                // Limpar gráficos se existirem
                if (graficoReservasMensal && graficoReservasMensal.data) { // Adicionado graficoReservasMensal.data
                    graficoReservasMensal.data.labels = [];
                    graficoReservasMensal.data.datasets[0].data = [];
                    graficoReservasMensal.update();
                }
                return;
            }

            // Validação básica do formato AAAA-MM-DD
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateRegex.test(dataInicioStr) || !dateRegex.test(dataFimStr)) {
                console.error("Formato de data inválido nos filtros do dashboard. Esperado AAAA-MM-DD.", {dataInicioStr, dataFimStr});
                return; // Interrompe se o formato não for o esperado
            }

            const dataInicioISO = dataInicioStr + "T00:00:00.000Z"; // Adiciona Z para UTC
            const dataFimISO = dataFimStr + "T23:59:59.999Z";   // Adiciona Z para UTC

            // Validação adicional para garantir que as datas são válidas após a construção da string ISO
            if (isNaN(new Date(dataInicioISO).getTime()) || isNaN(new Date(dataFimISO).getTime())) {
                 console.error("Datas de filtro do dashboard inválidas após construção da string ISO.", {dataInicioISO, dataFimISO});
                 return; // Interrompe se as datas forem inválidas
            }


            // Atualizar display de período
            if (statTotalReservasPeriodoEl) statTotalReservasPeriodoEl.textContent = `${formatarDataHora(dataInicioISO).split(' ')[0]} a ${formatarDataHora(dataFimISO).split(' ')[0]}`;
            if (statValorTotalReservasPeriodoEl) statValorTotalReservasPeriodoEl.textContent = `${formatarDataHora(dataInicioISO).split(' ')[0]} a ${formatarDataHora(dataFimISO).split(' ')[0]}`;

            await Promise.all([
                carregarTotalReservas(dataInicioISO, dataFimISO),
                carregarValorTotalReservas(dataInicioISO, dataFimISO), // Passar as datas ISO
                carregarReservasPorCampanha(dataInicioISO, dataFimISO),
                carregarReservasPorDiaSemana(dataInicioISO, dataFimISO),
                carregarGraficoMensal(dataInicioISO, dataFimISO)
            ]);
        } catch (error) { console.error("Erro ao atualizar dashboard:", error); }
    }

    async function carregarTotalReservas(dataInicio, dataFim) {
        // ... (código existente, parece ok)
        try {
            if (!statTotalReservasEl) return;
            const { count, error } = await supabase.from('reservas').select('*', { count: 'exact', head: true }).gte('booking_date', dataInicio).lte('booking_date', dataFim);
            if (error) throw error;
            statTotalReservasEl.textContent = count || 0;
        } catch (error) {
            console.error("Erro ao carregar total de reservas:", error);
            if (statTotalReservasEl) statTotalReservasEl.textContent = "Erro";
        }
    }

    async function carregarValorTotalReservas(dataInicio, dataFim) { // Modificado para usar booking_price
        try {
            if (!statValorTotalReservasEl) return;
            const { data, error } = await supabase.from('reservas')
                .select('booking_price') // Alterado de total_price para booking_price
                .gte('booking_date', dataInicio)
                .lte('booking_date', dataFim);
            if (error) throw error;
            const valorTotal = data.reduce((acc, reserva) => acc + (parseFloat(reserva.booking_price) || 0), 0);
            statValorTotalReservasEl.textContent = formatarMoeda(valorTotal);
        } catch (error) {
            console.error("Erro ao carregar valor total de reservas (booking_price):", error);
            if (statValorTotalReservasEl) statValorTotalReservasEl.textContent = "Erro";
        }
    }


    async function carregarReservasPorCampanha(dataInicio, dataFim) {
        // ... (código existente, parece ok)
        try {
            if (!statReservasCampanhaEl) return;
            const { data, error } = await supabase.from('reservas').select('campaign_id_aplicada').gte('booking_date', dataInicio).lte('booking_date', dataFim);
            if (error) throw error;

            const campanhas = {};
            data.forEach(row => {
                const campanha = row.campaign_id_aplicada || 'Sem Campanha';
                if (!campanhas[campanha]) campanhas[campanha] = 0;
                campanhas[campanha]++;
            });

            const campanhasArray = Object.entries(campanhas).map(([nome, count]) => ({ nome, count })).sort((a, b) => b.count - a.count);

            if (campanhasArray.length > 0) {
                statReservasCampanhaEl.innerHTML = campanhasArray.slice(0, 5).map(c => // Mostra top 5
                    `<div class="flex justify-between"><span>${c.nome}</span><span class="font-semibold">${c.count}</span></div>`
                ).join('');
            } else {
                statReservasCampanhaEl.textContent = "Sem dados de campanhas";
            }
        } catch (error) {
            console.error("Erro ao carregar reservas por campanha:", error);
            if (statReservasCampanhaEl) statReservasCampanhaEl.textContent = "Erro ao carregar dados";
        }
    }

    async function carregarReservasPorDiaSemana(dataInicio, dataFim) {
        // ... (código existente, parece ok)
        try {
            if (!statReservasDiaSemanaEl) return;
            const { data, error } = await supabase.from('reservas').select('booking_date').gte('booking_date', dataInicio).lte('booking_date', dataFim);
            if (error) throw error;

            const diasSemana = [0, 0, 0, 0, 0, 0, 0];
            const nomesDias = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
            data.forEach(reserva => {
                if (reserva.booking_date) {
                    const diaSemana = new Date(reserva.booking_date).getUTCDay(); // Usar getUTCDay para consistência com datas UTC
                    diasSemana[diaSemana]++;
                }
            });
            const maxReservas = Math.max(...diasSemana);
            const diaMaisReservas = diasSemana.indexOf(maxReservas);

            if (maxReservas > 0) {
                statReservasDiaSemanaEl.innerHTML = `
                    <div class="font-semibold text-lg">${nomesDias[diaMaisReservas]}</div>
                    <div class="text-sm">Dia com mais reservas (${maxReservas})</div>
                    <div class="mt-1 grid grid-cols-7 gap-1 text-xs text-center">
                        ${nomesDias.map(dia => `<div>${dia}</div>`).join('')}
                        ${diasSemana.map(count => `<div class="font-semibold">${count}</div>`).join('')}
                    </div>`;
            } else {
                statReservasDiaSemanaEl.textContent = "Sem dados suficientes";
            }
        } catch (error) {
            console.error("Erro ao carregar reservas por dia da semana:", error);
            if (statReservasDiaSemanaEl) statReservasDiaSemanaEl.textContent = "Erro ao carregar dados";
        }
    }

    async function carregarReservasPorHora(dataSelecionada) { // Baseado em booking_date para consistência
        try {
            if (!chartReservasPorHoraEl) return;
            // A data já vem no formato AAAA-MM-DD
            const dataInicioDia = `${dataSelecionada}T00:00:00.000Z`; // Adiciona Z para UTC
            const dataFimDia = `${dataSelecionada}T23:59:59.999Z`;   // Adiciona Z para UTC

            const { data: reservasDoDia, error } = await supabase.from('reservas')
                .select('booking_date') // Usar booking_date para a contagem por hora
                .gte('booking_date', dataInicioDia)
                .lte('booking_date', dataFimDia);
            if (error) throw error;

            const reservasPorHoraArray = Array(24).fill(0);
            if (reservasDoDia && reservasDoDia.length > 0) {
                reservasDoDia.forEach(reserva => {
                    if (reserva.booking_date) {
                        const hora = new Date(reserva.booking_date).getUTCHours(); // Usar getUTCHours para consistência
                        reservasPorHoraArray[hora]++;
                    }
                });
            }

            const chartLabel = 'Nº de Reservas (Hora da Criação)';

            if (graficoReservasHora) {
                graficoReservasHora.data.datasets[0].data = reservasPorHoraArray;
                graficoReservasHora.data.datasets[0].label = chartLabel; // Garante que o label está correto
                graficoReservasHora.update();
            } else {
                graficoReservasHora = new Chart(chartReservasPorHoraEl, {
                    type: 'bar',
                    data: {
                        labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
                        datasets: [{ label: chartLabel, data: reservasPorHoraArray, backgroundColor: 'rgba(54, 162, 235, 0.5)', borderColor: 'rgba(54, 162, 235, 1)', borderWidth: 1 }]
                    },
                    options: { scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }, plugins: { legend: { display: false } } }
                });
            }

            // Atualizar texto informativo
            if (statReservasHoraConteudoEl) {
                const totalDia = reservasPorHoraArray.reduce((a, b) => a + b, 0);
                const maxReservas = Math.max(...reservasPorHoraArray);
                const horasPico = [];
                if (maxReservas > 0) {
                    reservasPorHoraArray.forEach((count, hora) => { if (count === maxReservas) horasPico.push(`${hora}:00`); });
                    statReservasHoraConteudoEl.textContent = `Total no dia: ${totalDia} reservas. Pico às ${horasPico.join(', ')} (${maxReservas} res.)`;
                } else {
                    statReservasHoraConteudoEl.textContent = `Sem reservas criadas neste dia.`;
                }
            }
        } catch (error) {
            console.error("Erro ao carregar reservas por hora (baseado em booking_date):", error);
            if (statReservasHoraConteudoEl) statReservasHoraConteudoEl.textContent = `Erro: ${error.message}`;
        }
    }


    async function carregarGraficoMensal(dataInicioISO, dataFimISO) { // Parâmetros ISO completos
        try {
            if (!chartReservasMensalEl) return;
            // Buscar reservas dentro do período exato
            const { data: reservas, error } = await supabase.from('reservas')
                .select('booking_date') // Usar booking_date para a contagem mensal
                .gte('booking_date', dataInicioISO) // dataInicio já é ISO com hora
                .lte('booking_date', dataFimISO);   // dataFim já é ISO com hora

            if (error) {
                console.error("Erro ao buscar dados para gráfico mensal:", error);
                // Limpar gráfico em caso de erro
                if (graficoReservasMensal && graficoReservasMensal.data) {
                    graficoReservasMensal.data.labels = [];
                    graficoReservasMensal.data.datasets[0].data = [];
                    graficoReservasMensal.update();
                }
                return; // Sai da função se houver erro
            }

            const reservasPorMes = {};
            const labels = [];

            // Determinar os meses a exibir com base no intervalo de datas
            const dInicio = new Date(dataInicioISO); // Já é UTC por causa do 'Z'
            const dFim = new Date(dataFimISO);     // Já é UTC

            let currentMonthDate = new Date(Date.UTC(dInicio.getUTCFullYear(), dInicio.getUTCMonth(), 1));

            while (currentMonthDate <= dFim) {
                const anoMes = `${currentMonthDate.getUTCFullYear()}-${String(currentMonthDate.getUTCMonth() + 1).padStart(2, '0')}`;
                // Formato do label como MM/AAAA
                labels.push(`${String(currentMonthDate.getUTCMonth() + 1).padStart(2, '0')}/${currentMonthDate.getUTCFullYear()}`);
                reservasPorMes[anoMes] = 0;
                currentMonthDate.setUTCMonth(currentMonthDate.getUTCMonth() + 1);
            }


            // Contar reservas por mês
            if (reservas && reservas.length > 0) {
                reservas.forEach(reserva => {
                    if (reserva.booking_date) {
                        try {
                            const dataReserva = new Date(reserva.booking_date); // Data da reserva já deve ser UTC se armazenada corretamente
                            if (isNaN(dataReserva.getTime())) {
                                console.warn("Data de reserva inválida encontrada:", reserva.booking_date);
                                return; // Pula esta reserva se a data for inválida
                            }
                            const anoMes = `${dataReserva.getUTCFullYear()}-${String(dataReserva.getUTCMonth() + 1).padStart(2, '0')}`;
                            if (reservasPorMes.hasOwnProperty(anoMes)) {
                                reservasPorMes[anoMes]++;
                            }
                        } catch (e) {
                            console.error("Erro ao processar data da reserva para gráfico mensal:", reserva.booking_date, e);
                        }
                    }
                });
            }

             // Mapear os totais para os labels corretos
             const dados = labels.map(label => { // label está como MM/AAAA
                const [mes, ano] = label.split('/');
                const anoMesKey = `${ano}-${mes}`; // Chave no formato AAAA-MM
                return reservasPorMes[anoMesKey] || 0;
            });


            if (graficoReservasMensal) {
                graficoReservasMensal.data.labels = labels;
                graficoReservasMensal.data.datasets[0].data = dados;
                graficoReservasMensal.update();
            } else {
                graficoReservasMensal = new Chart(chartReservasMensalEl, {
                    type: 'line',
                    data: {
                        labels: labels, // MM/AAAA
                        datasets: [{ label: 'Nº de Reservas (Data da Criação)', data: dados, backgroundColor: 'rgba(75, 192, 192, 0.2)', borderColor: 'rgba(75, 192, 192, 1)', borderWidth: 2, tension: 0.1 }]
                    },
                    options: { scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }
                });
            }
        } catch (error) { console.error("Erro ao carregar gráfico mensal:", error); }
    }


    // --- Lógica de Importação/Exportação ---
    async function processarImportacao() {
        try {
            if (!importReservasFileEl || !importReservasFileEl.files || importReservasFileEl.files.length === 0) {
                alert("Por favor, selecione um ficheiro para importar."); return;
            }
            const file = importReservasFileEl.files[0];
            if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls') && !file.name.endsWith('.csv')) {
                alert("Por favor, selecione um ficheiro Excel (.xlsx, .xls) ou CSV (.csv)."); return;
            }

            if (loadingImportSpinnerEl) loadingImportSpinnerEl.classList.remove("hidden");
            if (importacaoStatusEl) importacaoStatusEl.textContent = "A processar ficheiro...";

            const reader = new FileReader();
            reader.onload = async function (e) {
                try {
                    const fileData = new Uint8Array(e.target.result);
                    // Usar cellDates:true para tentar converter datas do Excel para objetos Date do JS
                    // raw:false para obter valores formatados como strings (se não forem datas/números puros)
                    // defval:null para que células vazias sejam null em vez de undefined ou strings vazias
                    const workbook = XLSX.read(fileData, { type: 'array', cellDates: true, cellNF: false, cellText:false });
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    // Usar header:1 para obter array de arrays, mais fácil de mapear cabeçalhos customizados se necessário
                    // ou deixar como está se a primeira linha for sempre o cabeçalho correto
                    const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false, defval: null });

                    if (jsonData.length === 0) throw new Error("O ficheiro não contém dados.");
                    if (importacaoStatusEl) importacaoStatusEl.textContent = `A processar ${jsonData.length} registos...`;

                    await processarDadosImportacao(jsonData);

                } catch (error) {
                    console.error("Erro ao processar o ficheiro Excel:", error);
                    if (importacaoStatusEl) importacaoStatusEl.textContent = `Erro ao processar o ficheiro: ${error.message}`;
                    if (loadingImportSpinnerEl) loadingImportSpinnerEl.classList.add("hidden");
                }
            };
            reader.onerror = function () {
                console.error("Erro ao ler o ficheiro.");
                if (importacaoStatusEl) importacaoStatusEl.textContent = "Erro ao ler o ficheiro.";
                if (loadingImportSpinnerEl) loadingImportSpinnerEl.classList.add("hidden");
            };
            reader.readAsArrayBuffer(file);
        } catch (error) {
            console.error("Erro ao iniciar processamento de importação:", error);
            if (importacaoStatusEl) importacaoStatusEl.textContent = `Erro: ${error.message}`;
            if (loadingImportSpinnerEl) loadingImportSpinnerEl.classList.add("hidden");
        }
    }

    async function processarDadosImportacao(jsonData) {
        try {
            const { data: { user: importUser } } = await supabase.auth.getUser();

            // Mapeamento robusto de possíveis nomes de colunas no Excel para colunas do Supabase
            const mapeamentoColunasExcelParaSupabase = {
                // Chave: Possível nome da coluna no Excel (case-insensitive)
                // Valor: Nome da coluna no Supabase
                "licenseplate": "license_plate",
                "matricula": "license_plate",
                "alocation": "alocation",
                "bookingprice": "booking_price",
                "precobooking": "booking_price",
                "actiondate": "action_date", // Data da ação/modificação
                "extras": "extras_price", // Preço dos extras
                "extraservices": "extras_price", // Nome alternativo para extras
                "hasonlinepayment": "has_online_payment", // Pagamento online (true/false)
                "paymentmethod": "payment_method", // Método de pagamento
                "stats": "estado_reserva_atual", // Estado da reserva
                "status": "estado_reserva_atual",
                "estadodareserva": "estado_reserva_atual",
                "parkingprice": "parking_price", // Preço do parque
                "deliveryprice": "delivery_price", // Preço da entrega
                "priceondelivery": "total_price", // Preço na entrega (geralmente o total)
                "totalprice": "total_price",
                "precototal": "total_price",
                "idclient": "id_cliente_externo", // ID externo do cliente
                "name": "name_cliente", // Nome do cliente
                "nome": "name_cliente",
                "lastname": "lastname_cliente", // Apelido do cliente
                "apelido": "lastname_cliente",
                "phonenumber": "phone_number_cliente", // Número de telefone
                "telefone": "phone_number_cliente",
                "email": "email_cliente", // Email
                "brand": "car_info_brand", // Marca do carro
                "marca": "car_info_brand",
                "model": "car_info_model", // Modelo do carro
                "modelo": "car_info_model",
                "color": "car_info_color", // Cor do carro
                "cor": "car_info_color",
                "checkinvideo": "checkin_video_url", // URL do vídeo de check-in
                "parkbrand": "_parque_codigo_excel", // Código/Nome do parque do Excel para lookup
                "parque": "_parque_codigo_excel",
                "row": "row_code", // Código da fila (se aplicável)
                "spot": "spot_code", // Código do lugar (se aplicável)
                "taxname": "nome_fiscal_cliente", // Nome fiscal
                "taxnumber": "nif_cliente", // NIF
                "nif": "nif_cliente",
                "city": "cidade_cliente", // Cidade
                "bookingremarks": "remarks_cliente", // Observações da reserva
                "remarks": "remarks_cliente",
                "observacoes": "remarks_cliente",
                "campaign": "campaign_id_aplicada", // ID/Nome da campanha
                "campanha": "campaign_id_aplicada",
                "campaignpay": "campaign_pay", // Pagamento da campanha (pode ser bool ou valor)
                "condutorentrega": "condutor_entrega_id", // ID do condutor de entrega
                "condutormovimentacao": "condutor_movimentacao_id", // ID do condutor de movimentação
                "checkin": "check_in_previsto", // Data de check-in previsto
                "dataentrada": "check_in_previsto",
                "parkingtype": "parking_type", // Tipo de estacionamento
                "bookingdate": "booking_date", // Data da reserva
                "datareserva": "booking_date",
                "returnflight": "return_flight", // Voo de regresso
                "checkout": "check_out_previsto", // Data de check-out previsto
                "datasaida": "check_out_previsto",
                "checkoutdate": "check_out_real", // Data de check-out real
                "checkindate": "check_in_real",   // Data de check-in real
                "lang": "lang_cliente", // Língua do cliente
                "paymentintentid": "payment_intent_id", // ID da intenção de pagamento
                "booking id": "booking_id", // Booking ID com espaço (comum em exports)
                "bookingid": "booking_id" // Booking ID sem espaço
            };

            let reservasParaUpsert = jsonData.map(rowExcel => {
                const reservaSupabase = {};
                // Normalizar chaves do rowExcel para minúsculas para correspondência case-insensitive
                const rowExcelKeysLower = {};
                for (const key in rowExcel) {
                    rowExcelKeysLower[key.toLowerCase().replace(/\s+/g, '')] = rowExcel[key];
                }

                for (const excelColOriginalCased in mapeamentoColunasExcelParaSupabase) {
                    // Usar a versão normalizada da chave do Excel para procurar no rowExcelKeysLower
                    const excelColLower = excelColOriginalCased.toLowerCase().replace(/\s+/g, '');
                    if (rowExcelKeysLower.hasOwnProperty(excelColLower)) {
                        const valorOriginal = rowExcelKeysLower[excelColLower];
                        if (valorOriginal !== undefined && valorOriginal !== null && String(valorOriginal).trim() !== "") {
                            const supabaseCol = mapeamentoColunasExcelParaSupabase[excelColOriginalCased];
                            let valorProcessado = valorOriginal;

                            if (['booking_date', 'check_in_previsto', 'check_out_previsto', 'action_date', 'check_in_real', 'check_out_real'].includes(supabaseCol)) {
                                valorProcessado = converterDataParaISO(valorOriginal);
                            } else if (todosCamposNumericosSupabase.includes(supabaseCol)) { // Usa a lista mais abrangente para conversão
                                valorProcessado = validarCampoNumerico(valorOriginal);
                                // A validação de overflow para camposDePrecoSupabase é implícita pela BD
                            } else if (supabaseCol === '_parque_codigo_excel') {
                                valorProcessado = String(valorOriginal).trim();
                            } else if (supabaseCol === 'estado_reserva_atual' && valorOriginal) {
                                valorProcessado = String(valorOriginal).trim().toLowerCase();
                            } else {
                                valorProcessado = String(valorOriginal).trim();
                            }
                            reservaSupabase[supabaseCol] = valorProcessado;
                        }
                    }
                }

                if (!reservaSupabase.license_plate || !reservaSupabase.alocation) {
                     console.warn("Reserva ignorada: matrícula ou alocação em falta.", reservaSupabase); return null;
                }
                if (!reservaSupabase.booking_date) { // Booking date é essencial
                    console.warn("Reserva ignorada: booking_date em falta.", reservaSupabase); return null;
                }

                reservaSupabase.license_plate = normalizarMatricula(reservaSupabase.license_plate);

                if (!reservaSupabase.booking_id) { // Gerar booking_id se não existir
                    reservaSupabase.booking_id = `BK${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 1000)}`;
                }

                reservaSupabase.source_file_imported = importReservasFileEl.files[0].name;
                reservaSupabase.user_id_criacao_registo = importUser?.id;
                if (!reservaSupabase.action_date) { // Garante uma data de ação se não vier do Excel
                    reservaSupabase.action_date = new Date().toISOString();
                }

                return reservaSupabase;
            }).filter(Boolean); // Remove nulos (reservas ignoradas)


            if (reservasParaUpsert.length > 0) {
                // Processar parque_id usando RPC antes do upsert
                const loteSize = 50; // Processar em lotes para não sobrecarregar a RPC ou o upsert
                for (let i = 0; i < reservasParaUpsert.length; i += loteSize) {
                    const lote = reservasParaUpsert.slice(i, i + loteSize);
                    // Obter parque_id para todas as reservas no lote atual
                    await Promise.all(lote.map(async (reserva) => {
                        if (reserva._parque_codigo_excel) {
                            reserva.parque_id = await obterParqueIdPorCodigoComRPC(reserva._parque_codigo_excel);
                            delete reserva._parque_codigo_excel; // Remove o campo temporário
                        }
                        // Se parque_id não for encontrado, pode ser definido como null ou um ID padrão,
                        // ou a reserva pode ser marcada como inválida. Por agora, será null se RPC retornar null.
                    }));
                    // Pequena pausa entre lotes para não sobrecarregar o servidor (se necessário)
                    if (i + loteSize < reservasParaUpsert.length) {
                        await new Promise(resolve => setTimeout(resolve, 200)); // 200ms de pausa
                    }
                }
            }


            if (reservasParaUpsert.length === 0 && jsonData.length > 0) {
                 if (importacaoStatusEl) importacaoStatusEl.textContent = "Nenhuma reserva válida para processar (verifique campos obrigatórios como licensePlate, alocation e bookingDate no Excel e os seus formatos).";
                 if (loadingImportSpinnerEl) loadingImportSpinnerEl.classList.add("hidden");
                 return; // Sai da função se não houver nada para inserir
            }


            if (reservasParaUpsert.length > 0) {
                // O onConflict garante que se license_plate + alocation já existir, atualiza; senão, insere.
// Dentro da função processarDadosImportacao, ANTES da linha:
// const { error: upsertError } = await supabase.from("reservas").upsert(reservasParaUpsert, ...);

console.log("Dados DETALHADOS sendo enviados para UPSERT:", JSON.stringify(reservasParaUpsert, null, 2));
reservasParaUpsert.forEach((reserva, index) => {
    console.log(`Reserva índice ${index}:`);
    camposDePrecoSupabase.forEach(campoPreco => { // camposDePrecoSupabase é a tua lista ajustada
        if (reserva.hasOwnProperty(campoPreco)) {
            console.log(`  ${campoPreco}: ${reserva[campoPreco]}`);
            // Verifica se algum é um número muito grande
            if (typeof reserva[campoPreco] === 'number' && Math.abs(reserva[campoPreco]) >= 100000000) {
                console.error(`VALOR GRANDE DETETADO na reserva índice ${index}, campo ${campoPreco}: ${reserva[campoPreco]}`);
            }
        }
    });
});
                const { error: upsertError } = await supabase.from("reservas").upsert(reservasParaUpsert, { onConflict: 'license_plate,alocation', returning: "minimal" });
                if (upsertError) {
                    console.error("Erro detalhado do Supabase (upsert):", upsertError);
                    // O erro "numeric field overflow" seria apanhado aqui
                    throw upsertError; // Lança o erro para ser apanhado pelo catch externo
                }

                if (importacaoStatusEl) {
                    importacaoStatusEl.textContent = `Importação concluída! ${reservasParaUpsert.length} reservas processadas.`;
                    importacaoStatusEl.classList.remove("text-red-500"); importacaoStatusEl.classList.add("text-green-500");
                }
                carregarReservasDaLista(1, obterFiltrosAtivos()); // Recarrega a lista
            } else if (jsonData.length > 0) { // Havia dados no JSON, mas não válidos para upsert
                 if (importacaoStatusEl) {
                    importacaoStatusEl.textContent = "Nenhuma reserva válida para processar (verifique campos obrigatórios e formatos).";
                    importacaoStatusEl.classList.remove("text-green-500"); importacaoStatusEl.classList.add("text-red-500");
                 }
            } else { // jsonData estava vazio
                 if (importacaoStatusEl) importacaoStatusEl.textContent = "O ficheiro Excel parece estar vazio ou não contém dados processáveis.";
            }
        } catch (error) { // Apanha erros do upsert ou de lógica interna
            console.error("Erro ao processar dados de importação:", error);
            if (importacaoStatusEl) {
                // Personaliza a mensagem se for o erro de overflow
                if (error.code === "22003" && error.message.includes("numeric field overflow")) {
                     importacaoStatusEl.textContent = `Erro: Um valor numérico no ficheiro é demasiado grande para a coluna na base de dados (Ex: Preço > ${formatarMoeda(99999999.99)}). Verifique os dados do ficheiro.`;
                } else {
                    importacaoStatusEl.textContent = `Erro ao processar dados: ${error.message}`;
                }
                importacaoStatusEl.classList.remove("text-green-500"); importacaoStatusEl.classList.add("text-red-500");
            }
        } finally {
            if (loadingImportSpinnerEl) loadingImportSpinnerEl.classList.add("hidden");
        }
    }


    async function exportarReservasParaExcel() {
        // ... (código existente, parece ok, mas certifica-te que busca todas as colunas desejadas)
        mostrarSpinner("loadingTableSpinner"); // Usar o spinner da tabela principal
        try {
            const filtros = obterFiltrosAtivos(); // Obtém os filtros atuais da lista
            let query = supabase.from("reservas").select("*, parque_info:parque_id (nome_parque)"); // Inclui nome do parque

            // Aplicar os mesmos filtros da lista
            if (filtros.searchTerm) {
                query = query.or(`name_cliente.ilike.%${filtros.searchTerm}%,license_plate.ilike.%${filtros.searchTerm}%,booking_id.ilike.%${filtros.searchTerm}%,alocation.ilike.%${filtros.searchTerm}%`);
            }
            if (filtros.estado_reserva_atual && filtros.estado_reserva_atual !== "") {
                query = query.eq("estado_reserva_atual", filtros.estado_reserva_atual);
            }
            if (filtros.check_in_previsto) { // Assume que check_in_previsto é uma data AAAA-MM-DD
                query = query.gte("check_in_previsto", filtros.check_in_previsto + "T00:00:00");
            }
            if (filtros.cliente) {
                query = query.ilike("name_cliente", `%${filtros.cliente}%`);
            }
            if (filtros.matricula) {
                query = query.ilike("license_plate", `%${filtros.matricula}%`);
            }
            if (filtros.campaign_id_aplicada && filtros.campaign_id_aplicada !== "") {
                query = query.eq("campaign_id_aplicada", filtros.campaign_id_aplicada);
            }
            if (filtros.has_online_payment !== undefined && filtros.has_online_payment !== "") {
                 if (filtros.has_online_payment === 'true') {
                    query = query.is("has_online_payment", true);
                } else if (filtros.has_online_payment === 'false') {
                    query = query.or("has_online_payment.is.false,has_online_payment.is.null");
                }
            }
            if (filtros.tipo_reserva) {
                if (filtros.tipo_reserva === "telefone") {
                    query = query.like("remarks_cliente", "%telres%");
                } else if (filtros.tipo_reserva === "online") {
                    query = query.or("remarks_cliente.not.like.%telres%,remarks_cliente.is.null");
                }
            }

            // Ordenar pela data da reserva, mais recentes primeiro
            query = query.order("booking_date", { ascending: false });

            // Busca TODOS os dados que correspondem aos filtros (sem paginação para exportação)
            const { data: todasAsReservasFiltradas, error: exportError } = await query;

            if (exportError) {
                console.error("Erro ao buscar dados para exportação:", exportError);
                alert("Erro ao exportar dados. Verifique a consola.");
                return;
            }

            if (!todasAsReservasFiltradas || todasAsReservasFiltradas.length === 0) {
                alert("Nenhuma reserva encontrada para exportar com os filtros atuais.");
                return;
            }

            // Mapear os dados para o formato desejado no Excel
            const dadosParaExcel = todasAsReservasFiltradas.map(reserva => ({
                "Booking ID": reserva.booking_id,
                "Data Reserva": reserva.booking_date ? formatarDataHora(reserva.booking_date) : '',
                "Cliente Nome": reserva.name_cliente,
                "Cliente Apelido": reserva.lastname_cliente,
                "Email": reserva.email_cliente,
                "Telefone": reserva.phone_number_cliente, // Garante que está como texto
                "Matrícula": reserva.license_plate,
                "Alocation": reserva.alocation,
                "Check-in Previsto": reserva.check_in_previsto ? formatarDataHora(reserva.check_in_previsto) : '',
                "Check-out Previsto": reserva.check_out_previsto ? formatarDataHora(reserva.check_out_previsto) : '',
                "Check-in Real": reserva.check_in_real ? formatarDataHora(reserva.check_in_real) : '',
                "Check-out Real": reserva.check_out_real ? formatarDataHora(reserva.check_out_real) : '',
                "Parque": reserva.parque_info?.nome_parque || reserva.parque_id, // Usa nome do parque se disponível
                "Preço Reserva (Booking)": reserva.booking_price, // Usar este para consistência
                "Preço Parque": reserva.parking_price,
                "Preço Entrega": reserva.delivery_price,
                "Preço Extras": reserva.extras_price,
                "Preço Total (Final)": reserva.total_price, // Este deve ser o preço final da reserva
                "Pagamento Online": reserva.has_online_payment ? 'Sim' : 'Não',
                "Método Pagamento": reserva.payment_method,
                "Estado Reserva": reserva.estado_reserva_atual,
                "Tipo Parque": reserva.parking_type,
                "Voo Regresso": reserva.return_flight,
                "Observações Cliente": reserva.remarks_cliente,
                "Marca Carro": reserva.car_info_brand,
                "Modelo Carro": reserva.car_info_model,
                "Cor Carro": reserva.car_info_color,
                "NIF Cliente": reserva.nif_cliente,
                "Nome Fiscal": reserva.nome_fiscal_cliente,
                "Cidade Cliente": reserva.cidade_cliente,
                "Campanha Aplicada": reserva.campaign_id_aplicada,
                "Valor Pago Campanha": reserva.campaign_pay, // Valor ou indicador
                "ID Cliente Externo": reserva.id_cliente_externo,
                "Data Ação": reserva.action_date ? formatarDataHora(reserva.action_date) : ''
                // Adiciona mais campos conforme necessário
            }));

            const worksheet = XLSX.utils.json_to_sheet(dadosParaExcel);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Reservas Filtradas");
            XLSX.writeFile(workbook, "reservas_filtradas_multipark.xlsx");

        } catch (error) {
            console.error("Erro ao exportar para Excel:", error);
            alert("Ocorreu um erro ao tentar exportar os dados.");
        } finally {
            esconderSpinner("loadingTableSpinner"); // Usar o mesmo spinner da tabela
        }
    }


    function configurarEventos() {
        // ... (código existente, parece ok)
        if (resProcessarImportacaoBtnEl) resProcessarImportacaoBtnEl.addEventListener("click", processarImportacao);
        if (resAplicarFiltrosDashboardBtnEl) resAplicarFiltrosDashboardBtnEl.addEventListener("click", atualizarDashboardStatsGeral);
        if (resDashboardFiltroPeriodoEl) {
            resDashboardFiltroPeriodoEl.addEventListener("change", () => {
                const hoje = new Date(); let dataInicio = new Date(hoje); const dataFim = new Date(hoje);
                switch (resDashboardFiltroPeriodoEl.value) {
                    case "hoje": break;
                    case "semana_atual": const dia = hoje.getDay(); dataInicio.setDate(hoje.getDate() - dia + (dia === 0 ? -6 : 1)); break; // Começa na Segunda
                    case "mes_atual": dataInicio.setDate(1); break;
                    case "ultimos_30dias": dataInicio.setDate(hoje.getDate() - 30); break;
                    case "este_ano": dataInicio = new Date(hoje.getFullYear(), 0, 1); break;
                    case "personalizado": return; // Não faz nada, espera input manual
                }
                if (resDashboardFiltroDataInicioEl) resDashboardFiltroDataInicioEl.value = dataInicio.toISOString().split('T')[0];
                if (resDashboardFiltroDataFimEl) resDashboardFiltroDataFimEl.value = dataFim.toISOString().split('T')[0];
                atualizarDashboardStatsGeral(); // Atualiza o dashboard após definir o período
            });
        }
        if (resDashboardDataHoraInputEl) {
            resDashboardDataHoraInputEl.addEventListener("change", async () => {
                const dataSel = resDashboardDataHoraInputEl.value;
                if (dataSel) {
                    if (resDashboardDataHoraDisplayEl) { const [a, m, d] = dataSel.split('-'); resDashboardDataHoraDisplayEl.textContent = `${d}/${m}/${a}`; }
                    await carregarReservasPorHora(dataSel);
                }
            });
        }
        if (resSearchBtnEl) resSearchBtnEl.addEventListener("click", () => { paginaAtualLista = 1; carregarReservasDaLista(1, obterFiltrosAtivos()); });
        if (resSearchTermEl) resSearchTermEl.addEventListener("keypress", (e) => { if (e.key === "Enter") { paginaAtualLista = 1; carregarReservasDaLista(1, obterFiltrosAtivos()); } });
        if (resAplicarFiltrosListaBtnEl) resAplicarFiltrosListaBtnEl.addEventListener("click", () => { paginaAtualLista = 1; carregarReservasDaLista(1, obterFiltrosAtivos()); });
        if (voltarDashboardBtnReservasEl) voltarDashboardBtnReservasEl.addEventListener("click", () => {
            // Idealmente, usa uma função de navegação global se existir, senão fallback
            if (typeof window.navigateToSubApp === 'function') {
                window.navigateToSubApp('index.html#dashboard'); // Ou só 'dashboard' se a função tratar disso
            } else {
                window.location.href = "index.html#dashboard"; // Ou apenas "index.html"
            }
        });

        // Fechar Modais
        resFecharModalBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const modal = btn.closest('.form-modal-backdrop, .log-modal-backdrop'); // Certifica-se que apanha qualquer tipo de modal
                if (modal) {
                    modal.classList.remove('active'); // Para animação de fade-out
                    setTimeout(() => { modal.classList.add('hidden'); }, 300); // Esconde após animação
                }
            });
        });

        if (resAbrirModalNovaBtnEl) resAbrirModalNovaBtnEl.addEventListener('click', abrirModalNovaReserva);

        // Submissão do formulário de reserva (novo/editar)
        const reservaFormSubmitBtnEl = document.getElementById('reservaFormSubmitBtn');
        if (reservaFormSubmitBtnEl && reservaFormEl) {
            reservaFormSubmitBtnEl.addEventListener('click', (event) => {
                 event.preventDefault(); // Previne submissão padrão se o botão for type="submit" dentro do form
                 handleReservaFormSubmit(new Event('submit', { cancelable: true })); // Dispara o evento de submit no formulário
            });
        } else if (reservaFormEl) { // Se o botão não existir, liga diretamente ao form
            reservaFormEl.addEventListener('submit', handleReservaFormSubmit);
        }


        if (resExportarBtnEl) resExportarBtnEl.addEventListener("click", exportarReservasParaExcel);
    }

    function configurarBotoesAcao() { // Assegura que os listeners são removidos e readicionados para evitar duplicação
        document.querySelectorAll('.editar-reserva-btn').forEach(btn => {
            const newBtn = btn.cloneNode(true); // Clona para remover listeners antigos
            btn.parentNode.replaceChild(newBtn, btn); // Substitui o botão antigo pelo novo
            newBtn.addEventListener('click', async (event) => {
                const id = event.currentTarget.getAttribute('data-id'); if (id) await abrirModalEditarReserva(id);
            });
        });
        document.querySelectorAll('.apagar-reserva-btn').forEach(btn => {
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            newBtn.addEventListener('click', async (event) => {
                const id = event.currentTarget.getAttribute('data-id');
                if (id && await mostrarConfirmacaoCustomizada('Tem certeza que deseja apagar esta reserva?')) await apagarReserva(id);
            });
        });
        document.querySelectorAll('.log-reserva-btn').forEach(btn => {
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            newBtn.addEventListener('click', async (event) => {
                const pk = event.currentTarget.getAttribute('data-reserva-pk'); if (pk) await abrirModalLogReserva(pk);
            });
        });
    }


    function abrirModalNovaReserva() {
        // ... (código existente, parece ok)
        if (!reservaFormModalEl || !reservaFormEl || !reservaFormModalTitleEl || !reservaFormIdEl) return;
        reservaFormModalTitleEl.textContent = "Nova Reserva";
        reservaFormEl.reset(); // Limpa o formulário
        reservaFormIdEl.value = ""; // Garante que não há ID (para criação)

        // Limpa o campo booking_id e define placeholder, pois pode ser gerado automaticamente
        const bookingIdField = document.getElementById('reservaFormBookingId');
        if (bookingIdField) {
            bookingIdField.value = ''; // Limpa valor anterior
            bookingIdField.placeholder = 'Gerado automaticamente se não fornecido';
        }

        reservaFormModalEl.classList.remove('hidden');
        void reservaFormModalEl.offsetWidth; // Força reflow para garantir que a transição CSS é aplicada
        reservaFormModalEl.classList.add('active'); // Adiciona classe para animação de fade-in/slide-in
    }

    async function abrirModalEditarReserva(idPk) {
        // ... (código existente, parece ok)
        if (!reservaFormModalEl || !reservaFormEl || !reservaFormModalTitleEl || !reservaFormIdEl) return;

        if(loadingModalSpinnerFormEl) mostrarSpinner('loadingModalSpinnerForm'); // Mostrar spinner específico do modal
        try {
            const { data: r, error } = await supabase.from('reservas').select('*').eq('id_pk', idPk).single();
            if (error || !r) {
                console.error("Erro ao buscar reserva para edição:", error);
                alert("Erro ao carregar os dados da reserva para edição.");
                if(loadingModalSpinnerFormEl) esconderSpinner('loadingModalSpinnerForm');
                return;
            }
            reservaFormModalTitleEl.textContent = "Editar Reserva";
            reservaFormEl.reset();
            reservaFormIdEl.value = r.id_pk; // Define o ID da reserva que está a ser editada

            // Preencher o formulário com os dados da reserva
            for (const [formId, supabaseCol] of Object.entries(formHtmlIdsToSupabaseMap)) {
                const el = document.getElementById(formId);
                if (el) { // Verifica se o elemento existe no HTML
                    if (r[supabaseCol] !== undefined && r[supabaseCol] !== null) {
                        if (el.type === 'datetime-local') {
                            el.value = formatarDataParaInput(r[supabaseCol]);
                        } else if (el.type === 'date') {
                            el.value = r[supabaseCol].split('T')[0]; // Apenas a parte da data para input type="date"
                        } else if (el.type === 'checkbox') { // Para campos checkbox
                            el.checked = r[supabaseCol];
                        }
                        else {
                            el.value = r[supabaseCol];
                        }
                    } else {
                        el.value = ""; // Limpa o campo se o valor for nulo/undefined na BD
                        if (el.type === 'checkbox') el.checked = false;
                    }
                }
            }
            // Caso especial para booking_id, se estiver separado no formHtmlIdsToSupabaseMap
            const bookingIdField = document.getElementById('reservaFormBookingId');
            if (bookingIdField && r.booking_id) {
                bookingIdField.value = r.booking_id;
            }


            reservaFormModalEl.classList.remove('hidden');
            void reservaFormModalEl.offsetWidth;
            reservaFormModalEl.classList.add('active');
        } catch (e) {
            console.error("Exceção ao abrir modal de edição:", e);
            alert("Ocorreu um erro inesperado ao tentar abrir a reserva para edição.");
        } finally {
            if(loadingModalSpinnerFormEl) esconderSpinner('loadingModalSpinnerForm');
        }
    }

    async function handleReservaFormSubmit(event) {
        event.preventDefault(); // Prevenir submissão tradicional do formulário
        console.log("Formulário submetido (handleReservaFormSubmit).");

        if (!reservaFormEl || !currentUser) {
            console.error("Formulário ou utilizador não definidos em handleReservaFormSubmit");
            alert("Erro interno: Formulário ou utilizador não disponíveis.");
            return;
        }

        const dadosReserva = {}; // Usar 'dadosReserva' para clareza
        let formValido = true;
        let primeiroCampoInvalido = null;

        // Iterar sobre o mapeamento para construir o objeto de dados
        for (const [formId, supabaseCol] of Object.entries(formHtmlIdsToSupabaseMap)) {
            const el = document.getElementById(formId);
            if (el) {
                let valor = el.value;
                if (el.type === 'datetime-local' || el.type === 'date') {
                    // Tenta converter para ISO; se o input estiver vazio, converterDataParaISO deve retornar null
                    valor = valor ? converterDataParaISO(new Date(valor)) : null;
                    // Validação de data obrigatória, se aplicável
                    if (el.required && !valor) {
                        console.warn(`Campo de data obrigatório '${formId}' (${supabaseCol}) está vazio ou inválido.`);
                        formValido = false;
                        if (!primeiroCampoInvalido) primeiroCampoInvalido = el;
                    }
                } else if (todosCamposNumericosSupabase.includes(supabaseCol)) { // Usa a lista abrangente para limpar
                    valor = validarCampoNumerico(valor);
                } else if (el.type === 'checkbox') { // Para campos checkbox
                    valor = el.checked;
                }
                // Atribui valor ao objeto, mesmo que seja null (para limpar campos na BD se necessário)
                dadosReserva[supabaseCol] = (typeof valor === 'string' && valor.trim() === "") ? null : valor;

                // Validação de campos obrigatórios (exceto booking_id que pode ser gerado)
                if (el.required && (dadosReserva[supabaseCol] === null || dadosReserva[supabaseCol] === undefined) && supabaseCol !== 'booking_id') {
                     console.warn(`Campo obrigatório '${formId}' (${supabaseCol}) está vazio.`);
                     formValido = false;
                     if (!primeiroCampoInvalido) primeiroCampoInvalido = el;
                }
            } else {
                console.warn(`Elemento de formulário com ID '${formId}' não encontrado.`);
            }
        }

        // Trata o booking_id separadamente se não estiver no mapeamento ou se precisar de lógica especial
        const bookingIdInput = document.getElementById('reservaFormBookingId');
        if (bookingIdInput && bookingIdInput.value.trim() !== "" && !dadosReserva.booking_id) { // Só se não foi já preenchido pelo map
            dadosReserva.booking_id = bookingIdInput.value.trim();
        }


        if (!formValido) {
            alert("Por favor, preencha todos os campos obrigatórios corretamente.");
            primeiroCampoInvalido?.focus(); // Foca no primeiro campo inválido
            return;
        }

        dadosReserva.action_date = new Date().toISOString(); // Timestamp da ação
        const idEdit = reservaFormIdEl.value; // ID para saber se é edição ou criação

        if(loadingModalSpinnerFormEl) mostrarSpinner('loadingModalSpinnerForm');

        try {
            // Limpar o objeto de quaisquer chaves com valor undefined antes de enviar
            Object.keys(dadosReserva).forEach(key => {
                if (dadosReserva[key] === undefined) delete dadosReserva[key];
            });

            console.log("Dados da reserva a serem enviados:", JSON.parse(JSON.stringify(dadosReserva))); // Log para depuração

            let resultadoOperacao;
            if (idEdit) { // É uma atualização
                console.log(`A atualizar reserva com id_pk: ${idEdit}`);
                dadosReserva.user_id_modificacao_registo = currentUser.id; // Quem modificou
                resultadoOperacao = await supabase.from('reservas').update(dadosReserva).eq('id_pk', idEdit).select(); // Adiciona .select() para obter feedback
            } else { // É uma criação
                console.log("A criar nova reserva...");
                if (!dadosReserva.booking_date) { // Garante que booking_date existe para novas reservas
                    alert("Data da reserva (Booking Date) é obrigatória para novas reservas.");
                    if(loadingModalSpinnerFormEl) esconderSpinner('loadingModalSpinnerForm');
                    return;
                }
                dadosReserva.user_id_criacao_registo = currentUser.id; // Quem criou
                resultadoOperacao = await supabase.from('reservas').insert([dadosReserva]).select(); // Adiciona .select()
            }

            const { data: opData, error: opError } = resultadoOperacao;

            if (opError) throw opError; // Lança o erro para o catch

            console.log(idEdit ? "Resposta da atualização:" : "Resposta da inserção:", opData);
            alert(idEdit ? 'Reserva atualizada com sucesso!' : 'Reserva criada com sucesso!');


            if (reservaFormModalEl) { // Fechar o modal
                 reservaFormModalEl.classList.remove('active');
                 setTimeout(() => { reservaFormModalEl.classList.add('hidden'); }, 300);
            }
            carregarReservasDaLista(idEdit ? paginaAtualLista : 1, obterFiltrosAtivos()); // Recarrega a lista
            atualizarDashboardStatsGeral(); // Atualiza o dashboard

        } catch (err) { // Apanha erros do Supabase ou de lógica
            console.error('Erro ao salvar reserva:', err);
            // Verifica se é o erro de "numeric field overflow"
            if (err.code === "22003" && err.message.includes("numeric field overflow")) {
                 alert(`Erro: Um valor numérico é demasiado grande para a coluna na base de dados (Ex: Preço > ${formatarMoeda(99999999.99)}). Verifique os dados inseridos.`);
            } else {
                alert(`Erro ao salvar reserva: ${err.message || 'Ocorreu um erro desconhecido.'}`);
            }
        }
        finally { // Esconde o spinner independentemente do resultado
            if(loadingModalSpinnerFormEl) esconderSpinner('loadingModalSpinnerForm');
        }
    }


    async function apagarReserva(idPk) {
        // ... (código existente, parece ok)
        try {
            const { error } = await supabase.from('reservas').delete().eq('id_pk', idPk);
            if (error) throw error; alert('Reserva apagada!');
            carregarReservasDaLista(paginaAtualLista, obterFiltrosAtivos());
            atualizarDashboardStatsGeral();
        } catch (err) { console.error('Erro apagar:', err); alert(`Erro: ${err.message}`); }
    }

    async function abrirModalLogReserva(reservaPk) { // Modificado para usar id_pk
        // ... (código existente, parece ok)
        if (!reservaLogModalEl) return;
        logReservaBookingIdEl.textContent = `Logs Reserva PK: ${reservaPk.substring(0,8)}...`; // Mostra parte do PK
        reservaLogTableBodyEl.innerHTML = '<tr><td colspan="4" class="text-center py-4">A carregar...</td></tr>';
        reservaLogNenhumaMsgEl.classList.add('hidden');
        reservaLogModalEl.classList.remove('hidden');
        reservaLogModalEl.classList.add('active');
        try {
            const { data: logs, error } = await supabase.from('reservas_logs').select('*').eq('reserva_id_pk', reservaPk).order('timestamp_log', { ascending: false });
            if (error) throw error;
            if (logs && logs.length > 0) {
                reservaLogTableBodyEl.innerHTML = "";
                logs.forEach(log => {
                    const tr = document.createElement('tr'); tr.className = "border-b";
                    tr.innerHTML = `<td class="py-2 px-3 text-xs">${formatarDataHora(log.timestamp_log)}</td><td class="py-2 px-3 text-xs">${log.user_email || log.user_id || 'Sistema'}</td><td class="py-2 px-3 text-xs">${log.acao || 'N/A'}</td><td class="py-2 px-3 text-xs">${log.detalhes || ''}</td>`;
                    reservaLogTableBodyEl.appendChild(tr);
                });
            } else {
                reservaLogTableBodyEl.innerHTML = ""; reservaLogNenhumaMsgEl.textContent = "Nenhum log."; reservaLogNenhumaMsgEl.classList.remove('hidden');
            }
        } catch (err) {
            console.error("Erro logs:", err); reservaLogTableBodyEl.innerHTML = "";
            reservaLogNenhumaMsgEl.textContent = `Erro logs: ${err.message}`; reservaLogNenhumaMsgEl.classList.remove('hidden');
        }
    }

    async function mostrarConfirmacaoCustomizada(mensagem) {
        // ... (código existente, parece ok)
        return new Promise(resolve => resolve(confirm(mensagem)));
    }


    // Certifica-te de que esta função substitui a tua função initReservasPage existente
async function initReservasPage() {
    try {
        // Assegura que a verificação de autenticação global foi concluída
        if (typeof window.checkAuthStatus !== 'function') {
             console.error("ERRO CRÍTICO (reservas.js): checkAuthStatus não definido. auth_global.js não carregado ou falhou?");
             alert("Erro crítico na configuração de autenticação. Contacte o suporte.");
             return; 
        }
        console.log("Reservas.js: A chamar window.checkAuthStatus()...");
        await window.checkAuthStatus(); // Espera que auth_global.js verifique o estado inicial e redirecione se necessário.
        console.log("Reservas.js: window.checkAuthStatus() concluído.");

        // **** MODIFICAÇÃO PRINCIPAL AQUI: Voltar a obter o utilizador diretamente ****
        console.log("Reservas.js: A obter utilizador diretamente do Supabase Auth...");
        const { data: { user: supabaseUser }, error: userError } = await supabase.auth.getUser();

        if (userError) {
            console.error("Reservas.js: Erro ao obter utilizador do Supabase Auth:", userError);
            // Considera redirecionar para o login ou mostrar uma mensagem de erro
            // window.location.href = "index.html"; // Exemplo de redirecionamento
            return;
        }

        currentUser = supabaseUser; // Define currentUser com o resultado direto
        console.log("Reservas.js: Utilizador obtido de supabase.auth.getUser():", currentUser);

        if (!currentUser) {
            console.error("Reservas.js: Utilizador não autenticado após supabase.auth.getUser(). Redirecionamento deveria ter ocorrido por auth_global.js.");
            // Se auth_global.js não redirecionou e chegamos aqui sem utilizador, algo está errado.
            // Forçar redirecionamento como fallback.
            window.location.href = "index.html";
            return;
        }

        // Tenta obter o perfil do utilizador do localStorage (como na versão antiga)
        const userProfileStr = localStorage.getItem('userProfile');
        if (userProfileStr) {
            try {
                userProfile = JSON.parse(userProfileStr);
            } catch (e) {
                console.error("Reservas.js: Erro ao parsear userProfile do localStorage:", e);
                userProfile = null; // Garante que userProfile é null se houver erro
            }
        } else {
            userProfile = null; // Garante que userProfile é null se não estiver no localStorage
        }
        // Alternativamente, se window.getCurrentUserProfile() for mais fiável no teu auth_global.js:
        // userProfile = window.getCurrentUserProfile && window.getCurrentUserProfile();

        console.log("Reservas.js: Utilizador autenticado:", currentUser.email);
        if (userProfile) console.log("Reservas.js: Perfil do utilizador:", userProfile.full_name || "Nome não disponível no perfil");

        // O resto da tua função initReservasPage continua como na versão mais recente:
        configurarEventos();
        await popularFiltroCampanhas(); 

        if (resDashboardFiltroDataInicioEl && resDashboardFiltroDataFimEl && !resDashboardFiltroDataInicioEl.value) {
            const hoje = new Date();
            const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
            const ultimoDiaMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
            resDashboardFiltroDataInicioEl.value = primeiroDiaMes.toISOString().split('T')[0];
            resDashboardFiltroDataFimEl.value = ultimoDiaMes.toISOString().split('T')[0];
            if(resDashboardFiltroPeriodoEl) resDashboardFiltroPeriodoEl.value = "mes_atual";
        }

        if (resDashboardDataHoraInputEl) {
            const dataAtualInput = resDashboardDataHoraInputEl.value || new Date().toISOString().split('T')[0];
            resDashboardDataHoraInputEl.value = dataAtualInput; 
            if (resDashboardDataHoraDisplayEl) {
                 const [a, m, d] = dataAtualInput.split('-'); resDashboardDataHoraDisplayEl.textContent = `<span class="math-inline">\{d\}/</span>{m}/${a}`;
            }
            await carregarReservasPorHora(dataAtualInput); 
        }
        await carregarReservasDaLista(1); 

    } catch (error) {
        console.error("Erro ao inicializar a página de reservas:", error);
    }
}

    // Garante que auth_global.js carregou e verificou o estado antes de iniciar a página.
    // O script auth_global.js deve ser carregado ANTES de reservas.js no HTML.
    if (typeof window.checkAuthStatus === 'function') {
        initReservasPage();
    } else {
        // Fallback caso reservas.js seja carregado antes de auth_global.js ter definido as funções.
        console.warn("reservas.js: checkAuthStatus ainda não definido. A aguardar que auth_global.js carregue...");
        const checkAuthInterval = setInterval(() => {
            if (typeof window.checkAuthStatus === 'function' && typeof window.getCurrentUser === 'function' && typeof window.getCurrentUserProfile === 'function') {
                clearInterval(checkAuthInterval);
                console.log("reservas.js: Funções de autenticação global agora disponíveis. A iniciar página.");
                initReservasPage();
            }
        }, 100);
        // Timeout para evitar loop infinito se auth_global.js nunca carregar corretamente
        setTimeout(() => {
            if (typeof window.checkAuthStatus !== 'function') {
                clearInterval(checkAuthInterval);
                console.error("ERRO CRÍTICO (reservas.js): Funções de auth_global.js não ficaram disponíveis. A inicialização falhou.");
                alert("Erro crítico na inicialização da aplicação. Contacte o suporte.");
            }
        }, 5000);
    }
});
