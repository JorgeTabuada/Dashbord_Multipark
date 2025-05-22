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

    const formHtmlIdsToSupabaseMap = {
        reservaFormBookingId: "booking_id",
        reservaFormDataReserva: "booking_date",
        reservaFormNomeCliente: "name_cliente",
        reservaFormApelidoCliente: "lastname_cliente",
        reservaFormEmailCliente: "email_cliente",
        reservaFormTelefoneCliente: "phone_number_cliente",
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

    const camposNumericosSupabase = [
        "booking_price", "parking_price", "delivery_price", "extras_price",
        "total_price", "campaign_pay", "corrected_price", "price_on_delivery"
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
            return dataStr.toISOString().split('.')[0];
        }
        const formatos = [
            { regex: /(\d{1,2})\/(\d{1,2})\/(\d{4}),?\s*(\d{1,2}):(\d{1,2})/, d: 1, m: 2, a: 3, h: 4, min: 5 },
            { regex: /(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{1,2})/, d: 1, m: 2, a: 3, h: 4, min: 5 },
            { regex: /(\d{1,2})\/(\d{1,2})\/(\d{4})/, d: 1, m: 2, a: 3, h: null, min: null }
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
        try {
            const d = new Date(dataStr);
            if (!isNaN(d.getTime())) return d.toISOString().split('.')[0];
        } catch(e) { /* Ignora */ }
        console.warn(`Formato de data não reconhecido para ISO: "${dataStr}"`);
        return null;
    }

    function validarCampoNumerico(valor) {
        if (valor === null || valor === undefined || String(valor).trim() === "") return null;
        let numStr = String(valor).replace(',', '.').replace(/[^\d.-]/g, '');
        const numero = parseFloat(numStr);
        return isNaN(numero) ? null : numero;
    }

    async function obterParqueIdPorCodigoComRPC(codigoOuNome) {
        if (!codigoOuNome || String(codigoOuNome).trim() === "") {
            return null;
        }
        try {
            const codigoNormalizado = String(codigoOuNome).trim();
            const { data, error } = await supabase.rpc('obter_parque_id_por_codigo', {
                p_codigo_ou_nome: codigoNormalizado 
            });

            if (error) {
                console.error(`Erro ao chamar RPC obter_parque_id_por_codigo para "${codigoNormalizado}":`, error);
                return null;
            }
            return data; 
        } catch (error) {
            console.error(`Exceção ao chamar RPC obter_parque_id_por_codigo para "${codigoOuNome}":`, error);
            return null;
        }
    }
    
    async function popularFiltroCampanhas() {
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
            
            while (resFiltroCampanhaListaEl.options.length > 1) {
                resFiltroCampanhaListaEl.remove(1);
            }

            if (data && data.length > 0) {
                const campanhasUnicas = [...new Set(data.map(item => item.campaign_id_aplicada))].sort();
                campanhasUnicas.forEach(campanha => {
                    if (campanha) { 
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
        if (!reservasTableBodyEl) return;
        mostrarSpinner("loadingTableSpinner");
        reservasTableBodyEl.innerHTML = "";
        if (reservasNenhumaMsgEl) reservasNenhumaMsgEl.classList.add("hidden");
        if (somaValoresFiltroEl) somaValoresFiltroEl.textContent = formatarMoeda(0); 

        const rangeFrom = (pagina - 1) * itensPorPaginaLista;
        const rangeTo = rangeFrom + itensPorPaginaLista - 1;

        let query = supabase.from("reservas").select("*, parque_info:parque_id (nome_parque)", { count: "exact" });

        if (filtros.searchTerm) {
            query = query.or(`name_cliente.ilike.%${filtros.searchTerm}%,license_plate.ilike.%${filtros.searchTerm}%,booking_id.ilike.%${filtros.searchTerm}%,alocation.ilike.%${filtros.searchTerm}%`);
        }
        if (filtros.estado_reserva_atual && filtros.estado_reserva_atual !== "") { // "Todos" é ""
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
                 // Para ser 'online', não pode ter 'telres' E remarks_cliente não pode ser NULL (ou pode, dependendo da lógica de negócio)
                 // Se remarks_cliente for NULL, não é telefone.
                query = query.or("remarks_cliente.not.like.%telres%,remarks_cliente.is.null");
            }
        }

        let orderByColumn = "booking_date";
        let { data, error, count } = await query.order(orderByColumn, { ascending: false }).range(rangeFrom, rangeTo);
        
        // Fallback de ordenação (mantido, mas a query principal já inclui os novos filtros)
        if (error && error.message && error.message.includes(`column "reservas.${orderByColumn}" does not exist`)) {
            orderByColumn = "created_at_db"; 
            let fallbackQuery = supabase.from("reservas").select("*, parque_info:parque_id (nome_parque)", { count: "exact" });
            if (filtros.searchTerm) fallbackQuery = fallbackQuery.or(`name_cliente.ilike.%${filtros.searchTerm}%,license_plate.ilike.%${filtros.searchTerm}%,booking_id.ilike.%${filtros.searchTerm}%,alocation.ilike.%${filtros.searchTerm}%`);
            if (filtros.estado_reserva_atual && filtros.estado_reserva_atual !== "") fallbackQuery = fallbackQuery.eq("estado_reserva_atual", filtros.estado_reserva_atual);
            if (filtros.check_in_previsto) fallbackQuery = fallbackQuery.gte("check_in_previsto", filtros.check_in_previsto + "T00:00:00");
            if (filtros.cliente) fallbackQuery = fallbackQuery.ilike("name_cliente", `%${filtros.cliente}%`);
            if (filtros.matricula) fallbackQuery = fallbackQuery.ilike("license_plate", `%${filtros.matricula}%`);
            if (filtros.campaign_id_aplicada && filtros.campaign_id_aplicada !== "") fallbackQuery = fallbackQuery.eq("campaign_id_aplicada", filtros.campaign_id_aplicada);
            if (filtros.has_online_payment !== undefined && filtros.has_online_payment !== "") {
                if (filtros.has_online_payment === 'true') fallbackQuery = fallbackQuery.is("has_online_payment", true);
                else if (filtros.has_online_payment === 'false') fallbackQuery = fallbackQuery.or("has_online_payment.is.false,has_online_payment.is.null");
            }
            if (filtros.tipo_reserva === "telefone") fallbackQuery = fallbackQuery.like("remarks_cliente", "%telres%");
            else if (filtros.tipo_reserva === "online") fallbackQuery = fallbackQuery.or("remarks_cliente.not.like.%telres%,remarks_cliente.is.null");
            
            const fallbackResult = await fallbackQuery.order(orderByColumn, { ascending: false }).range(rangeFrom, rangeTo);
            data = fallbackResult.data; error = fallbackResult.error; count = fallbackResult.count;
        }

        try {
            if (error) throw error;
            todasAsReservasGeral = data; 
            totalReservasNaBD = count || 0; 

            if (reservasTotalCountEl) { 
                reservasTotalCountEl.textContent = totalReservasNaBD;
            }

            let somaValoresPagina = 0;
            if (data && data.length > 0) {
                data.forEach(reserva => {
                    somaValoresPagina += (parseFloat(reserva.booking_price) || 0);
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
                configurarBotoesAcao();
            } else {
                if (reservasNenhumaMsgEl) {
                    reservasNenhumaMsgEl.textContent = "Nenhuma reserva encontrada com os filtros atuais.";
                    reservasNenhumaMsgEl.classList.remove("hidden");
                }
            }
            if (somaValoresFiltroEl) { 
                somaValoresFiltroEl.textContent = formatarMoeda(somaValoresPagina);
            }

            atualizarPaginacaoLista(pagina, totalReservasNaBD);
            atualizarDashboardStatsGeral(); 
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
        if (!estado) return 'bg-gray-100 text-gray-700'; 
        switch (String(estado).toLowerCase()) {
            case 'reservado': return 'bg-blue-100 text-blue-700'; 
            case 'recolhido': return 'bg-yellow-100 text-yellow-700'; 
            case 'entregue': return 'bg-green-100 text-green-700'; 
            case 'cancelado': return 'bg-red-100 text-red-700'; 
            case 'pendente': return 'bg-yellow-100 text-yellow-700';
            case 'confirmada': return 'bg-green-100 text-green-700'; 
            case 'concluída': return 'bg-green-100 text-green-700'; 
            case 'em curso': return 'bg-indigo-100 text-indigo-700';
            case 'validadafinanceiramente': return 'bg-purple-100 text-purple-700';
            default: return 'bg-gray-100 text-gray-700'; 
        }
    }

    function atualizarPaginacaoLista(paginaCorrente, totalItens) {
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
        const filtros = {};
        if (resSearchTermEl && resSearchTermEl.value) filtros.searchTerm = resSearchTermEl.value.trim();
        if (resFiltroClienteListaEl && resFiltroClienteListaEl.value) filtros.cliente = resFiltroClienteListaEl.value.trim();
        if (resFiltroMatriculaListaEl && resFiltroMatriculaListaEl.value) filtros.matricula = resFiltroMatriculaListaEl.value.trim();
        if (resFiltroDataEntradaListaEl && resFiltroDataEntradaListaEl.value) filtros.check_in_previsto = resFiltroDataEntradaListaEl.value;
        if (resFiltroEstadoListaEl && resFiltroEstadoListaEl.value) { // Adicionado para ler o filtro de estado
             filtros.estado_reserva_atual = resFiltroEstadoListaEl.value;
        }
        if (resFiltroCampanhaListaEl && resFiltroCampanhaListaEl.value) {
            filtros.campaign_id_aplicada = resFiltroCampanhaListaEl.value;
        }
        if (resFiltroPagamentoOnlineListaEl && resFiltroPagamentoOnlineListaEl.value !== "") {
            filtros.has_online_payment = resFiltroPagamentoOnlineListaEl.value; 
        }
        if (resFiltroTipoReservaListaEl && resFiltroTipoReservaListaEl.value !== "") {
            filtros.tipo_reserva = resFiltroTipoReservaListaEl.value; 
        }
        return filtros;
    }

    async function atualizarDashboardStatsGeral() {
        try {
            const dataInicioStr = resDashboardFiltroDataInicioEl ? resDashboardFiltroDataInicioEl.value : null;
            const dataFimStr = resDashboardFiltroDataFimEl ? resDashboardFiltroDataFimEl.value : null;

            if (!dataInicioStr || !dataFimStr) {
                if (statTotalReservasEl) statTotalReservasEl.textContent = "-";
                if (statValorTotalReservasEl) statValorTotalReservasEl.textContent = formatarMoeda(0);
                if (statReservasCampanhaEl) statReservasCampanhaEl.innerHTML = "<i>Selecione um período</i>";
                if (statReservasDiaSemanaEl) statReservasDiaSemanaEl.innerHTML = "<i>Selecione um período</i>";
                if (graficoReservasMensal && graficoReservasMensal.data) { 
                    graficoReservasMensal.data.labels = [];
                    graficoReservasMensal.data.datasets[0].data = [];
                    graficoReservasMensal.update();
                }
                return;
            }

            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateRegex.test(dataInicioStr) || !dateRegex.test(dataFimStr)) {
                console.error("Formato de data inválido nos filtros do dashboard. Esperado AAAA-MM-DD.", {dataInicioStr, dataFimStr});
                return;
            }
            
            const dataInicioISO = dataInicioStr + "T00:00:00.000Z"; 
            const dataFimISO = dataFimStr + "T23:59:59.999Z";   

            if (isNaN(new Date(dataInicioISO).getTime()) || isNaN(new Date(dataFimISO).getTime())) {
                 console.error("Datas de filtro do dashboard inválidas após construção da string ISO.", {dataInicioISO, dataFimISO});
                 return;
            }

            if (statTotalReservasPeriodoEl) statTotalReservasPeriodoEl.textContent = `${formatarDataHora(dataInicioISO).split(' ')[0]} a ${formatarDataHora(dataFimISO).split(' ')[0]}`;
            if (statValorTotalReservasPeriodoEl) statValorTotalReservasPeriodoEl.textContent = `${formatarDataHora(dataInicioISO).split(' ')[0]} a ${formatarDataHora(dataFimISO).split(' ')[0]}`;

            await Promise.all([
                carregarTotalReservas(dataInicioISO, dataFimISO),
                carregarValorTotalReservas(dataInicioISO, dataFimISO), 
                carregarReservasPorCampanha(dataInicioISO, dataFimISO),
                carregarReservasPorDiaSemana(dataInicioISO, dataFimISO),
                carregarGraficoMensal(dataInicioISO, dataFimISO)
            ]);
        } catch (error) { console.error("Erro ao atualizar dashboard:", error); }
    }

    async function carregarTotalReservas(dataInicio, dataFim) {
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
    
    async function carregarValorTotalReservas(dataInicio, dataFim) { 
        try {
            if (!statValorTotalReservasEl) return;
            const { data, error } = await supabase.from('reservas')
                .select('booking_price') 
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
                statReservasCampanhaEl.innerHTML = campanhasArray.slice(0, 5).map(c => 
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
        try {
            if (!statReservasDiaSemanaEl) return;
            const { data, error } = await supabase.from('reservas').select('booking_date').gte('booking_date', dataInicio).lte('booking_date', dataFim);
            if (error) throw error;

            const diasSemana = [0, 0, 0, 0, 0, 0, 0];
            const nomesDias = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
            data.forEach(reserva => {
                if (reserva.booking_date) {
                    const diaSemana = new Date(reserva.booking_date).getUTCDay(); 
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

    async function carregarReservasPorHora(dataSelecionada) { 
        try {
            if (!chartReservasPorHoraEl) return;
            const dataInicioDia = `${dataSelecionada}T00:00:00.000Z`; 
            const dataFimDia = `${dataSelecionada}T23:59:59.999Z`;   

            const { data: reservasDoDia, error } = await supabase.from('reservas')
                .select('booking_date')
                .gte('booking_date', dataInicioDia)
                .lte('booking_date', dataFimDia);
            if (error) throw error;

            const reservasPorHoraArray = Array(24).fill(0);
            if (reservasDoDia && reservasDoDia.length > 0) {
                reservasDoDia.forEach(reserva => {
                    if (reserva.booking_date) {
                        const hora = new Date(reserva.booking_date).getUTCHours(); 
                        reservasPorHoraArray[hora]++;
                    }
                });
            }

            const chartLabel = 'Nº de Reservas (Hora da Criação)';

            if (graficoReservasHora) {
                graficoReservasHora.data.datasets[0].data = reservasPorHoraArray;
                graficoReservasHora.data.datasets[0].label = chartLabel;
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

    async function carregarGraficoMensal(dataInicioISO, dataFimISO) { 
        try {
            if (!chartReservasMensalEl) return;
            const { data: reservas, error } = await supabase.from('reservas')
                .select('booking_date')
                .gte('booking_date', dataInicioISO) 
                .lte('booking_date', dataFimISO);  
            
            if (error) {
                console.error("Erro ao buscar dados para gráfico mensal:", error);
                if (graficoReservasMensal && graficoReservasMensal.data) {
                    graficoReservasMensal.data.labels = [];
                    graficoReservasMensal.data.datasets[0].data = [];
                    graficoReservasMensal.update();
                }
                return; 
            }

            const reservasPorMes = {};
            const labels = [];
            const dInicio = new Date(dataInicioISO); 
            const dFim = new Date(dataFimISO);

            let currentMonthDate = new Date(Date.UTC(dInicio.getUTCFullYear(), dInicio.getUTCMonth(), 1));

            while (currentMonthDate <= dFim) {
                const anoMes = `${currentMonthDate.getUTCFullYear()}-${String(currentMonthDate.getUTCMonth() + 1).padStart(2, '0')}`;
                labels.push(`${String(currentMonthDate.getUTCMonth() + 1).padStart(2, '0')}/${currentMonthDate.getUTCFullYear()}`); 
                reservasPorMes[anoMes] = 0;
                currentMonthDate.setUTCMonth(currentMonthDate.getUTCMonth() + 1);
            }

            if (reservas && reservas.length > 0) {
                reservas.forEach(reserva => {
                    if (reserva.booking_date) {
                        try {
                            const dataReserva = new Date(reserva.booking_date);
                            if (isNaN(dataReserva.getTime())) {
                                return; 
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

             const dados = labels.map(label => { 
                const [mes, ano] = label.split('/');
                const anoMesKey = `${ano}-${mes}`; 
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
                        labels: labels, 
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
                    const workbook = XLSX.read(fileData, { type: 'array', cellDates: true, cellNF: false, cellText:false });
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
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

            const mapeamentoColunasExcelParaSupabase = {
                "licensePlate": "license_plate",
                "alocation": "alocation",
                "bookingPrice": "booking_price",
                "actionDate": "action_date", 
                "extras": "extras_price", 
                "extraServices": "extras_price", 
                "hasOnlinePayment": "has_online_payment",
                "paymentMethod": "payment_method",
                "stats": "estado_reserva_atual", 
                "parkingPrice": "parking_price",
                "deliveryPrice": "delivery_price",
                "priceOnDelivery": "total_price", 
                "idClient": "id_cliente_externo",
                "name": "name_cliente",
                "lastname": "lastname_cliente",
                "phoneNumber": "phone_number_cliente",
                "email": "email_cliente", 
                "brand": "car_info_brand",
                "model": "car_info_model",
                "color": "car_info_color",
                "checkInVideo": "checkin_video_url",
                "parkBrand": "_parque_codigo_excel", 
                "row": "row_code",
                "spot": "spot_code",
                "taxName": "nome_fiscal_cliente", 
                "taxNumber": "nif_cliente",
                "city": "cidade_cliente",
                "bookingRemarks": "remarks_cliente", 
                "remarks": "remarks_cliente", 
                "campaign": "campaign_id_aplicada",
                "campaignPay": "campaign_pay",
                "condutorEntrega": "condutor_entrega_id", 
                "condutorMovimentacao": "condutor_movimentacao_id", 
                "checkIn": "check_in_previsto",
                "parkingType": "parking_type",
                "bookingDate": "booking_date",
                "returnFlight": "return_flight",
                "checkOut": "check_out_previsto", 
                "checkoutDate": "check_out_real", 
                "checkinDate": "check_in_real",   
                "lang": "lang_cliente",
                "paymentIntentId": "payment_intent_id",
                "Booking ID": "booking_id", 
            };
            
            let reservasParaUpsert = jsonData.map(row => {
                const reservaSupabase = {};
                for (const excelCol in mapeamentoColunasExcelParaSupabase) {
                    if (row.hasOwnProperty(excelCol) && row[excelCol] !== undefined && row[excelCol] !== null && String(row[excelCol]).trim() !== "") {
                        const supabaseCol = mapeamentoColunasExcelParaSupabase[excelCol];
                        let valor = row[excelCol];

                        if (['booking_date', 'check_in_previsto', 'check_out_previsto', 'action_date', 'check_in_real', 'check_out_real'].includes(supabaseCol)) {
                            reservaSupabase[supabaseCol] = converterDataParaISO(valor);
                        } else if (camposNumericosSupabase.includes(supabaseCol)) {
                            reservaSupabase[supabaseCol] = validarCampoNumerico(valor);
                        } else if (supabaseCol === '_parque_codigo_excel') { 
                            reservaSupabase._parque_codigo_excel = String(valor).trim();
                        }
                        else {
                            reservaSupabase[supabaseCol] = String(valor).trim();
                        }
                    }
                }
                
                if (!reservaSupabase.license_plate || !reservaSupabase.alocation) {
                    return null; 
                }
                if (!reservaSupabase.booking_date) { 
                    return null;
                }
                
                reservaSupabase.license_plate = normalizarMatricula(reservaSupabase.license_plate);
                
                if (!reservaSupabase.booking_id && row.hasOwnProperty("Booking ID") && row["Booking ID"]) {
                     reservaSupabase.booking_id = String(row["Booking ID"]).trim();
                } else if (!reservaSupabase.booking_id && row.hasOwnProperty("bookingId") && row["bookingId"]) {
                     reservaSupabase.booking_id = String(row["bookingId"]).trim();
                } else if (!reservaSupabase.booking_id) {
                    reservaSupabase.booking_id = `BK${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 1000)}`;
                }
                
                reservaSupabase.source_file_imported = importReservasFileEl.files[0].name;
                reservaSupabase.user_id_criacao_registo = importUser?.id;
                if (!reservaSupabase.action_date) { 
                    reservaSupabase.action_date = new Date().toISOString();
                }
                
                return reservaSupabase;
            }).filter(Boolean);

            if (reservasParaUpsert.length > 0) {
                const loteSize = 50; 
                for (let i = 0; i < reservasParaUpsert.length; i += loteSize) {
                    const lote = reservasParaUpsert.slice(i, i + loteSize);
                    await Promise.all(lote.map(async (reserva) => {
                        if (reserva._parque_codigo_excel) {
                            reserva.parque_id = await obterParqueIdPorCodigoComRPC(reserva._parque_codigo_excel);
                            delete reserva._parque_codigo_excel; 
                        }
                    }));
                    if (i + loteSize < reservasParaUpsert.length) {
                        await new Promise(resolve => setTimeout(resolve, 200)); 
                    }
                }
            }

            if (reservasParaUpsert.length === 0 && jsonData.length > 0) {
                 if (importacaoStatusEl) importacaoStatusEl.textContent = "Nenhuma reserva válida para processar (verifique campos obrigatórios como licensePlate, alocation e bookingDate no Excel e os seus formatos).";
                 return;
            }

            if (reservasParaUpsert.length > 0) {
                const { error: upsertError } = await supabase.from("reservas").upsert(reservasParaUpsert, { onConflict: 'license_plate,alocation', returning: "minimal" });
                if (upsertError) { console.error("Erro detalhado do Supabase (upsert):", upsertError); throw upsertError; }
                
                if (importacaoStatusEl) {
                    importacaoStatusEl.textContent = `Importação concluída! ${reservasParaUpsert.length} reservas processadas.`;
                    importacaoStatusEl.classList.remove("text-red-500"); importacaoStatusEl.classList.add("text-green-500");
                }
                carregarReservasDaLista(1, obterFiltrosAtivos());
            } else if (jsonData.length > 0) {
                 if (importacaoStatusEl) {
                    importacaoStatusEl.textContent = "Nenhuma reserva válida para processar (verifique campos obrigatórios e formatos).";
                    importacaoStatusEl.classList.remove("text-green-500"); importacaoStatusEl.classList.add("text-red-500");
                 }
            } else {
                 if (importacaoStatusEl) importacaoStatusEl.textContent = "O ficheiro Excel parece estar vazio ou não contém dados processáveis.";
            }
        } catch (error) {
            console.error("Erro ao processar dados de importação:", error);
            if (importacaoStatusEl) {
                importacaoStatusEl.textContent = `Erro ao processar dados: ${error.message}`;
                importacaoStatusEl.classList.remove("text-green-500"); importacaoStatusEl.classList.add("text-red-500");
            }
        } finally {
            if (loadingImportSpinnerEl) loadingImportSpinnerEl.classList.add("hidden");
        }
    }

    async function exportarReservasParaExcel() {
        mostrarSpinner("loadingTableSpinner"); 
        try {
            const filtros = obterFiltrosAtivos();
            let query = supabase.from("reservas").select("*, parque_info:parque_id (nome_parque)"); 

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
            query = query.order("booking_date", { ascending: false });

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

            const dadosParaExcel = todasAsReservasFiltradas.map(reserva => ({
                "Booking ID": reserva.booking_id,
                "Data Reserva": reserva.booking_date ? formatarDataHora(reserva.booking_date) : '',
                "Cliente Nome": reserva.name_cliente,
                "Cliente Apelido": reserva.lastname_cliente,
                "Email": reserva.email_cliente,
                "Telefone": reserva.phone_number_cliente,
                "Matrícula": reserva.license_plate,
                "Alocation": reserva.alocation,
                "Check-in Previsto": reserva.check_in_previsto ? formatarDataHora(reserva.check_in_previsto) : '',
                "Check-out Previsto": reserva.check_out_previsto ? formatarDataHora(reserva.check_out_previsto) : '',
                "Check-in Real": reserva.check_in_real ? formatarDataHora(reserva.check_in_real) : '',
                "Check-out Real": reserva.check_out_real ? formatarDataHora(reserva.check_out_real) : '',
                "Parque": reserva.parque_info?.nome_parque || reserva.parque_id,
                "Preço Reserva": reserva.booking_price,
                "Preço Parque": reserva.parking_price,
                "Preço Entrega": reserva.delivery_price,
                "Preço Extras": reserva.extras_price,
                "Preço Total": reserva.total_price, // Este vem de priceOnDelivery do Excel
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
                "Valor Pago Campanha": reserva.campaign_pay,
            }));

            const worksheet = XLSX.utils.json_to_sheet(dadosParaExcel);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Reservas Filtradas");
            XLSX.writeFile(workbook, "reservas_filtradas_multipark.xlsx");

        } catch (error) {
            console.error("Erro ao exportar para Excel:", error);
            alert("Ocorreu um erro ao tentar exportar os dados.");
        } finally {
            esconderSpinner("loadingTableSpinner");
        }
    }


    function configurarEventos() {
        if (resProcessarImportacaoBtnEl) resProcessarImportacaoBtnEl.addEventListener("click", processarImportacao);
        if (resAplicarFiltrosDashboardBtnEl) resAplicarFiltrosDashboardBtnEl.addEventListener("click", atualizarDashboardStatsGeral);
        if (resDashboardFiltroPeriodoEl) {
            resDashboardFiltroPeriodoEl.addEventListener("change", () => {
                const hoje = new Date(); let dataInicio = new Date(hoje); const dataFim = new Date(hoje);
                switch (resDashboardFiltroPeriodoEl.value) {
                    case "hoje": break;
                    case "semana_atual": const dia = hoje.getDay(); dataInicio.setDate(hoje.getDate() - dia + (dia === 0 ? -6 : 1)); break;
                    case "mes_atual": dataInicio.setDate(1); break;
                    case "ultimos_30dias": dataInicio.setDate(hoje.getDate() - 30); break;
                    case "este_ano": dataInicio = new Date(hoje.getFullYear(), 0, 1); break;
                    case "personalizado": return;
                }
                if (resDashboardFiltroDataInicioEl) resDashboardFiltroDataInicioEl.value = dataInicio.toISOString().split('T')[0];
                if (resDashboardFiltroDataFimEl) resDashboardFiltroDataFimEl.value = dataFim.toISOString().split('T')[0];
                atualizarDashboardStatsGeral();
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
        if (voltarDashboardBtnReservasEl) voltarDashboardBtnReservasEl.addEventListener("click", () => { window.location.href = "index.html"; });
        resFecharModalBtns.forEach(btn => btn.addEventListener('click', () => { if (reservaFormModalEl) reservaFormModalEl.classList.add('hidden'); }));
        resFecharLogModalBtns.forEach(btn => btn.addEventListener('click', () => { if (reservaLogModalEl) reservaLogModalEl.classList.add('hidden'); }));
        if (resAbrirModalNovaBtnEl) resAbrirModalNovaBtnEl.addEventListener('click', abrirModalNovaReserva);
        if (reservaFormEl) reservaFormEl.addEventListener('submit', handleReservaFormSubmit);
        if (resExportarBtnEl) resExportarBtnEl.addEventListener("click", exportarReservasParaExcel); 
    }
    
    function configurarBotoesAcao() {
        document.querySelectorAll('.editar-reserva-btn').forEach(btn => {
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn); // Substitui o botão para remover listeners antigos
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
        if (!reservaFormModalEl || !reservaFormEl || !reservaFormModalTitleEl || !reservaFormIdEl) return;
        reservaFormModalTitleEl.textContent = "Nova Reserva"; reservaFormEl.reset(); reservaFormIdEl.value = ""; 
        reservaFormModalEl.classList.remove('hidden');
        reservaFormModalEl.classList.add('active'); // Para ativar a transição de opacidade/visibilidade
    }

    async function abrirModalEditarReserva(idPk) {
        if (!reservaFormModalEl || !reservaFormEl || !reservaFormModalTitleEl || !reservaFormIdEl) return;
        const { data: r, error } = await supabase.from('reservas').select('*').eq('id_pk', idPk).single();
        if (error || !r) { console.error("Erro reserva edição:", error); alert("Erro ao carregar reserva."); return; }
        reservaFormModalTitleEl.textContent = "Editar Reserva"; reservaFormEl.reset(); reservaFormIdEl.value = r.id_pk;
        for (const [fid, scol] of Object.entries(formHtmlIdsToSupabaseMap)) {
            const el = document.getElementById(fid);
            if (el && r[scol] !== undefined && r[scol] !== null) {
                if (el.type === 'datetime-local') el.value = formatarDataParaInput(r[scol]);
                else if (el.type === 'date') el.value = r[scol].split('T')[0];
                else el.value = r[scol];
            } else if (el) el.value = "";
        }
        reservaFormModalEl.classList.remove('hidden');
        reservaFormModalEl.classList.add('active');
    }

    async function handleReservaFormSubmit(event) {
        event.preventDefault();
        if (!reservaFormEl || !currentUser) return;
        const rd = {};
        for (const [fid, scol] of Object.entries(formHtmlIdsToSupabaseMap)) {
            const el = document.getElementById(fid);
            if (el) {
                let val = el.value;
                if (el.type === 'datetime-local' || el.type === 'date') val = val ? converterDataParaISO(new Date(val)) : null;
                else if (camposNumericosSupabase.includes(scol)) val = validarCampoNumerico(val);
                rd[scol] = (val === "" || val === undefined) ? null : val;
            }
        }
        rd.action_date = new Date().toISOString();
        const idEdit = reservaFormIdEl.value;
        const spinner = document.getElementById('loadingModalSpinner');
        try {
            if(spinner) spinner.classList.remove('hidden');
            if (idEdit) {
                rd.user_id_modificacao_registo = currentUser.id;
                const { error } = await supabase.from('reservas').update(rd).eq('id_pk', idEdit);
                if (error) throw error; alert('Reserva atualizada!');
            } else {
                if (!rd.booking_date) { alert("Data da reserva é obrigatória."); if(spinner) spinner.classList.add('hidden'); return; }
                rd.user_id_criacao_registo = currentUser.id;
                const { error } = await supabase.from('reservas').insert([rd]);
                if (error) throw error; alert('Reserva criada!');
            }
            if (reservaFormModalEl) {
                 reservaFormModalEl.classList.remove('active');
                 // Adicionar um pequeno delay para a transição antes de esconder completamente
                 setTimeout(() => { reservaFormModalEl.classList.add('hidden'); }, 300);
            }
            carregarReservasDaLista(idEdit ? paginaAtualLista : 1, obterFiltrosAtivos());
            atualizarDashboardStatsGeral();
        } catch (err) { console.error('Erro reserva:', err); alert(`Erro: ${err.message}`); }
        finally { if(spinner) spinner.classList.add('hidden'); }
    }

    async function apagarReserva(idPk) {
        try {
            const { error } = await supabase.from('reservas').delete().eq('id_pk', idPk);
            if (error) throw error; alert('Reserva apagada!');
            carregarReservasDaLista(paginaAtualLista, obterFiltrosAtivos());
            atualizarDashboardStatsGeral();
        } catch (err) { console.error('Erro apagar:', err); alert(`Erro: ${err.message}`); }
    }
    
    async function abrirModalLogReserva(reservaPk) {
        if (!reservaLogModalEl) return;
        logReservaBookingIdEl.textContent = `Logs Reserva PK: ${reservaPk.substring(0,8)}...`;
        reservaLogTableBodyEl.innerHTML = '<tr><td colspan="4" class="text-center py-4">A carregar...</td></tr>';
        reservaLogNenhumaMsgEl.classList.add('hidden');
        reservaLogModalEl.classList.remove('hidden');
        reservaLogModalEl.classList.add('active');
        try {
            // Assumindo que tens uma tabela 'reservas_logs'
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
        // TODO: Substituir por um modal de confirmação customizado
        return new Promise(resolve => resolve(confirm(mensagem)));
    }

    async function initReservasPage() {
        try {
            if (typeof window.checkAuthStatus !== 'function') {
                 console.error("ERRO CRÍTICO: checkAuthStatus não definido."); alert("Erro config Auth."); return;
            }
            await window.checkAuthStatus();
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError || !user) { console.error("Utilizador não autenticado:", userError); return; }
            currentUser = user;
            const usp = localStorage.getItem('userProfile'); if (usp) try { userProfile = JSON.parse(usp); } catch (e) { console.error("Erro parse perfil:", e); }
            
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
                     const [a, m, d] = dataAtualInput.split('-'); resDashboardDataHoraDisplayEl.textContent = `${d}/${m}/${a}`;
                }
                await carregarReservasPorHora(dataAtualInput); 
            }
            await carregarReservasDaLista(1); 
        } catch (error) { console.error("Erro inicializar reservas:", error); }
    }

    window.showPagePrincipal = function(page) { if (page === 'login') window.location.href = 'index.html'; };
    initReservasPage();
});
