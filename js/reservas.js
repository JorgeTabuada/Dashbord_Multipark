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
    const calendarioReservasContainerEl = document.getElementById("calendarioReservasContainer");
    const chartReservasPorHoraEl = document.getElementById("chartReservasPorHora");
    const chartReservasMensalEl = document.getElementById("chartReservasMensal");
    const statReservasHoraConteudoEl = document.getElementById("statReservasHoraConteudo");

    const resSearchTermEl = document.getElementById("resSearchTerm");
    const resSearchBtnEl = document.getElementById("resSearchBtn");

    const resAbrirModalNovaBtnEl = document.getElementById("resAbrirModalNovaBtn");
    const resExportarBtnEl = document.getElementById("resExportarBtn");

    const resFiltroClienteListaEl = document.getElementById("resFiltroClienteLista");
    const resFiltroMatriculaListaEl = document.getElementById("resFiltroMatriculaLista");
    const resFiltroDataEntradaListaEl = document.getElementById("resFiltroDataEntradaLista"); // Usado para filtrar por check_in_previsto
    const resFiltroEstadoListaEl = document.getElementById("resFiltroEstadoLista"); // Usado para filtrar por estado_reserva_atual
    const resAplicarFiltrosListaBtnEl = document.getElementById("resAplicarFiltrosListaBtn");
    const reservasTableBodyEl = document.getElementById("reservasTableBody");
    const reservasNenhumaMsgEl = document.getElementById("reservasNenhumaMsg");
    const reservasPaginacaoEl = document.getElementById("reservasPaginacao");
    const loadingTableSpinnerEl = document.getElementById("loadingTableSpinner"); 

    const reservaFormModalEl = document.getElementById("reservaFormModal");
    const reservaFormModalTitleEl = document.getElementById("reservaFormModalTitle");
    const reservaFormEl = document.getElementById("reservaForm");
    const reservaFormIdEl = document.getElementById("reservaFormId"); // Este ID no form HTML será usado para o id_pk da reserva
    const resFecharModalBtns = document.querySelectorAll(".resFecharModalBtn");
    
    const reservaLogModalEl = document.getElementById("reservaLogModal");
    const logReservaBookingIdEl = document.getElementById("logReservaBookingId");
    const reservaLogTableBodyEl = document.getElementById("reservaLogTableBody");
    const reservaLogNenhumaMsgEl = document.getElementById("reservaLogNenhumaMsg");
    const resFecharLogModalBtns = document.querySelectorAll(".resFecharLogModalBtn");

    const voltarDashboardBtnReservasEl = document.getElementById("voltarDashboardBtnReservas");
    
    // Mapeamento de IDs de campos do formulário HTML para as colunas da BD Supabase
    const formHtmlIdsToSupabaseMap = {
        reservaFormBookingId: "booking_id",       // O campo no HTML com ID "reservaFormBookingId" mapeia para a coluna "booking_id"
        reservaFormDataReserva: "booking_date",
        reservaFormNomeCliente: "name_cliente",   // Assumindo que o HTML tem um campo para nome completo
        // Se o HTML tiver campos separados para nome e apelido, eles precisarão ser combinados antes de enviar para 'name_cliente' e 'lastname_cliente'
        reservaFormEmailCliente: "email_cliente",
        reservaFormTelefoneCliente: "phone_number_cliente",
        reservaFormMatricula: "license_plate",
        reservaFormAlocation: "alocation",
        reservaFormDataEntrada: "check_in_previsto",
        reservaFormDataSaida: "check_out_previsto",
        reservaFormParque: "parque_id",           // O valor deste select no HTML deve ser o id_pk do parque
        reservaFormCampanha: "campaign_id_aplicada",
        reservaFormValor: "total_price",          // Ou booking_price? Clarificar qual preço este campo representa. Usando total_price por agora.
        reservaFormEstado: "estado_reserva_atual",
        reservaFormObservacoes: "remarks_cliente"
        // Adicionar outros IDs de campos do formulário HTML e suas colunas Supabase correspondentes aqui
    };

    let todasAsReservasGeral = []; 
    let paginaAtualLista = 1;
    const itensPorPaginaLista = 15;
    let totalReservasNaBD = 0;
    let graficoReservasHora, graficoReservasMensal;

    // --- Funções Utilitárias ---
    function formatarDataHora(dataISO) {
        if (!dataISO) return "N/A";
        try { return new Date(dataISO).toLocaleString("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" }); } 
        catch (e) { return dataISO; }
    }
    function formatarDataParaInput(dataISO) {
        if (!dataISO) return "";
        try {
            const d = new Date(dataISO);
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}T${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
        } catch (e) { return ""; }
    }
    function formatarMoeda(valor) {
        if (valor === null || valor === undefined || isNaN(parseFloat(valor))) return "0,00 €";
        return parseFloat(valor).toLocaleString("pt-PT", { style: "currency", currency: "EUR" });
    }
    function mostrarSpinner(elementId) { const el = document.getElementById(elementId); if (el) el.classList.remove("hidden"); }
    function esconderSpinner(elementId) { const el = document.getElementById(elementId); if (el) el.classList.add("hidden"); }
    function normalizarMatricula(matricula) {
        if (!matricula) return null;
        return String(matricula).replace(/[\s\-\.]/g, '').toUpperCase();
    }
    
    // Função para converter datas do formato DD/MM/YYYY, HH:MM para o formato ISO 8601
    function converterDataParaISO(dataStr) {
        if (!dataStr) return null;
        
        // Verificar se é uma data no formato DD/MM/YYYY, HH:MM
        const regexData = /(\d{2})\/(\d{2})\/(\d{4}),?\s*(\d{2}):(\d{2})/;
        const match = String(dataStr).match(regexData);
        
        if (match) {
            const [_, dia, mes, ano, hora, minuto] = match;
            return `${ano}-${mes}-${dia}T${hora}:${minuto}:00`;
        }
        
        return dataStr;
    }

    // --- Lógica de Carregamento de Reservas (READ) ---
    async function carregarReservasDaLista(pagina = 1, filtros = {}) {
        if (!reservasTableBodyEl) return;
        mostrarSpinner("loadingTableSpinner"); 
        reservasTableBodyEl.innerHTML = ""; 
        if(reservasNenhumaMsgEl) reservasNenhumaMsgEl.classList.add("hidden");

        const rangeFrom = (pagina - 1) * itensPorPaginaLista;
        const rangeTo = rangeFrom + itensPorPaginaLista - 1;

        let query = supabase.from("reservas").select("*, parque_info:parque_id (nome_parque)", { count: "exact" });

        if (filtros.searchTerm) {
            query = query.or(`name_cliente.ilike.%${filtros.searchTerm}%,license_plate.ilike.%${filtros.searchTerm}%,booking_id.ilike.%${filtros.searchTerm}%,alocation.ilike.%${filtros.searchTerm}%`);
        }
        if (filtros.estado_reserva_atual && filtros.estado_reserva_atual !== "" && filtros.estado_reserva_atual !== "Todos") {
            query = query.eq("estado_reserva_atual", filtros.estado_reserva_atual);
        }
        if (filtros.check_in_previsto) { 
            query = query.gte("check_in_previsto", filtros.check_in_previsto + "T00:00:00");
        }
        if (filtros.cliente) { 
            query = query.ilike("name_cliente", `%${filtros.cliente}%`); // Assumindo que name_cliente é o campo principal para nome
        }
        if (filtros.matricula) { 
             query = query.ilike("license_plate", `%${filtros.matricula}%`);
        }
        
        let orderByColumn = "booking_date"; 
        let { data, error, count } = await query.order(orderByColumn, { ascending: false }).range(rangeFrom, rangeTo);
            
        if (error && error.message && error.message.includes(`column "reservas.${orderByColumn}" does not exist`)) {
            console.warn(`Coluna de ordenação '${orderByColumn}' não encontrada. Tentando ordenar por 'created_at_db'.`);
            orderByColumn = "created_at_db"; 
            query = supabase.from("reservas").select("*, parque_info:parque_id (nome_parque)", { count: "exact" }); // Recriar query base
            if (filtros.searchTerm) query = query.or(`name_cliente.ilike.%${filtros.searchTerm}%,license_plate.ilike.%${filtros.searchTerm}%,booking_id.ilike.%${filtros.searchTerm}%,alocation.ilike.%${filtros.searchTerm}%`);
            if (filtros.estado_reserva_atual && filtros.estado_reserva_atual !== "" && filtros.estado_reserva_atual !== "Todos") query = query.eq("estado_reserva_atual", filtros.estado_reserva_atual);
            if (filtros.check_in_previsto) query = query.gte("check_in_previsto", filtros.check_in_previsto + "T00:00:00");
            if (filtros.cliente) query = query.ilike("name_cliente", `%${filtros.cliente}%`);
            if (filtros.matricula) query = query.ilike("license_plate", `%${filtros.matricula}%`);
            
            const fallbackResult1 = await query.order(orderByColumn, { ascending: false }).range(rangeFrom, rangeTo);
            data = fallbackResult1.data; error = fallbackResult1.error; count = fallbackResult1.count;

            if (error && error.message && error.message.includes(`column "reservas.${orderByColumn}" does not exist`)) {
                console.warn(`Coluna de ordenação '${orderByColumn}' não encontrada. Tentando ordenar por 'id_pk'.`);
                orderByColumn = "id_pk";
                query = supabase.from("reservas").select("*, parque_info:parque_id (nome_parque)", { count: "exact" }); // Recriar query base
                if (filtros.searchTerm) query = query.or(`name_cliente.ilike.%${filtros.searchTerm}%,license_plate.ilike.%${filtros.searchTerm}%,booking_id.ilike.%${filtros.searchTerm}%,alocation.ilike.%${filtros.searchTerm}%`);
                if (filtros.estado_reserva_atual && filtros.estado_reserva_atual !== "" && filtros.estado_reserva_atual !== "Todos") query = query.eq("estado_reserva_atual", filtros.estado_reserva_atual);
                if (filtros.check_in_previsto) query = query.gte("check_in_previsto", filtros.check_in_previsto + "T00:00:00");
                if (filtros.cliente) query = query.ilike("name_cliente", `%${filtros.cliente}%`);
                if (filtros.matricula) query = query.ilike("license_plate", `%${filtros.matricula}%`);

                const fallbackResult2 = await query.order(orderByColumn, { ascending: false }).range(rangeFrom, rangeTo);
                data = fallbackResult2.data; error = fallbackResult2.error; count = fallbackResult2.count;
            }
        }
        try {
            if (error) throw error; 

            todasAsReservasGeral = data; 
            totalReservasNaBD = count;    

            if (data && data.length > 0) {
                data.forEach(reserva => {
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
                        <td class="py-3 px-4 text-xs">${reserva.parque_info?.nome_parque || reserva.parque_id || "N/A"}</td>
                        <td class="py-3 px-4 text-xs text-right">${formatarMoeda(reserva.total_price)}</td>
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
                if(reservasNenhumaMsgEl) {
                    reservasNenhumaMsgEl.textContent = "Nenhuma reserva encontrada com os filtros atuais.";
                    reservasNenhumaMsgEl.classList.remove("hidden");
                }
            }
            atualizarPaginacaoLista(pagina, totalReservasNaBD); 
            atualizarDashboardStatsGeral(); 
        } catch (error) {
            console.error("Erro ao carregar reservas:", error);
            if(reservasNenhumaMsgEl) {
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
            case 'confirmada': return 'bg-green-100 text-green-700';
            case 'pendente': return 'bg-yellow-100 text-yellow-700';
            case 'cancelada': return 'bg-red-100 text-red-700';
            case 'concluída': case 'validadafinanceiramente': return 'bg-blue-100 text-blue-700';
            case 'em curso': return 'bg-indigo-100 text-indigo-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    }

    function atualizarPaginacaoLista(paginaCorrente, totalItens) {
        if (!reservasPaginacaoEl) return;
        
        const totalPaginas = Math.ceil(totalItens / itensPorPaginaLista);
        reservasPaginacaoEl.innerHTML = "";
        
        if (totalPaginas <= 1) return;
        
        // Botão Anterior
        const btnAnterior = document.createElement("button");
        btnAnterior.className = `px-3 py-1 rounded ${paginaCorrente === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`;
        btnAnterior.textContent = "Anterior";
        btnAnterior.disabled = paginaCorrente === 1;
        btnAnterior.addEventListener("click", () => {
            if (paginaCorrente > 1) {
                paginaAtualLista = paginaCorrente - 1;
                carregarReservasDaLista(paginaAtualLista, obterFiltrosAtivos());
            }
        });
        reservasPaginacaoEl.appendChild(btnAnterior);
        
        // Números de Página
        const maxPaginasVisiveis = 5;
        let startPage = Math.max(1, paginaCorrente - Math.floor(maxPaginasVisiveis / 2));
        let endPage = Math.min(totalPaginas, startPage + maxPaginasVisiveis - 1);
        
        if (endPage - startPage + 1 < maxPaginasVisiveis) {
            startPage = Math.max(1, endPage - maxPaginasVisiveis + 1);
        }
        
        for (let i = startPage; i <= endPage; i++) {
            const btnPagina = document.createElement("button");
            btnPagina.className = `px-3 py-1 mx-1 rounded ${i === paginaCorrente ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`;
            btnPagina.textContent = i;
            btnPagina.addEventListener("click", () => {
                if (i !== paginaCorrente) {
                    paginaAtualLista = i;
                    carregarReservasDaLista(paginaAtualLista, obterFiltrosAtivos());
                }
            });
            reservasPaginacaoEl.appendChild(btnPagina);
        }
        
        // Botão Próximo
        const btnProximo = document.createElement("button");
        btnProximo.className = `px-3 py-1 rounded ${paginaCorrente === totalPaginas ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`;
        btnProximo.textContent = "Próximo";
        btnProximo.disabled = paginaCorrente === totalPaginas;
        btnProximo.addEventListener("click", () => {
            if (paginaCorrente < totalPaginas) {
                paginaAtualLista = paginaCorrente + 1;
                carregarReservasDaLista(paginaAtualLista, obterFiltrosAtivos());
            }
        });
        reservasPaginacaoEl.appendChild(btnProximo);
    }
    
    function obterFiltrosAtivos() {
        const filtros = {};
        
        if (resSearchTermEl && resSearchTermEl.value) {
            filtros.searchTerm = resSearchTermEl.value.trim();
        }
        
        if (resFiltroClienteListaEl && resFiltroClienteListaEl.value) {
            filtros.cliente = resFiltroClienteListaEl.value.trim();
        }
        
        if (resFiltroMatriculaListaEl && resFiltroMatriculaListaEl.value) {
            filtros.matricula = resFiltroMatriculaListaEl.value.trim();
        }
        
        if (resFiltroDataEntradaListaEl && resFiltroDataEntradaListaEl.value) {
            filtros.check_in_previsto = resFiltroDataEntradaListaEl.value;
        }
        
        if (resFiltroEstadoListaEl && resFiltroEstadoListaEl.value) {
            filtros.estado_reserva_atual = resFiltroEstadoListaEl.value;
        }
        
        return filtros;
    }

    // --- Lógica de Dashboard e Estatísticas ---
    async function atualizarDashboardStatsGeral() {
        try {
            // Obter datas de filtro
            const dataInicio = resDashboardFiltroDataInicioEl ? resDashboardFiltroDataInicioEl.value : null;
            const dataFim = resDashboardFiltroDataFimEl ? resDashboardFiltroDataFimEl.value : null;
            
            if (!dataInicio || !dataFim) return;
            
            const dataInicioISO = `${dataInicio}T00:00:00`;
            const dataFimISO = `${dataFim}T23:59:59.999Z`;
            
            // Atualizar período exibido
            if (statTotalReservasPeriodoEl) {
                statTotalReservasPeriodoEl.textContent = `${formatarDataHora(dataInicioISO).split(' ')[0]} a ${formatarDataHora(dataFimISO).split(' ')[0]}`;
            }
            if (statValorTotalReservasPeriodoEl) {
                statValorTotalReservasPeriodoEl.textContent = `${formatarDataHora(dataInicioISO).split(' ')[0]} a ${formatarDataHora(dataFimISO).split(' ')[0]}`;
            }
            
            // Carregar estatísticas
            await Promise.all([
                carregarTotalReservas(dataInicioISO, dataFimISO),
                carregarValorTotalReservas(dataInicioISO, dataFimISO),
                carregarReservasPorCampanha(dataInicioISO, dataFimISO),
                carregarReservasPorDiaSemana(dataInicioISO, dataFimISO),
                carregarGraficoMensal(dataInicioISO, dataFimISO)
            ]);
            
        } catch (error) {
            console.error("Erro ao atualizar dashboard:", error);
        }
    }
    
    async function carregarTotalReservas(dataInicio, dataFim) {
        try {
            if (!statTotalReservasEl) return;
            
            const { count, error } = await supabase
                .from('reservas')
                .select('*', { count: 'exact', head: true })
                .gte('booking_date', dataInicio)
                .lte('booking_date', dataFim);
                
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
            
            const { data, error } = await supabase
                .from('reservas')
                .select('total_price')
                .gte('booking_date', dataInicio)
                .lte('booking_date', dataFim);
                
            if (error) throw error;
            
            const valorTotal = data.reduce((acc, reserva) => {
                const valor = parseFloat(reserva.total_price || 0);
                return acc + (isNaN(valor) ? 0 : valor);
            }, 0);
            
            statValorTotalReservasEl.textContent = formatarMoeda(valorTotal);
            
        } catch (error) {
            console.error("Erro ao carregar valor total de reservas:", error);
            if (statValorTotalReservasEl) statValorTotalReservasEl.textContent = "Erro";
        }
    }
    
    async function carregarReservasPorCampanha(dataInicio, dataFim) {
        try {
            if (!statReservasCampanhaEl) return;
            
            const { data, error } = await supabase
                .from('reservas')
                .select('campaign_id_aplicada')
                .gte('booking_date', dataInicio)
                .lte('booking_date', dataFim)
                .not('campaign_id_aplicada', 'is', null);
                
            if (error) throw error;
            
            // Agrupar por campanha manualmente em JavaScript
            const campanhas = {};
            data.forEach(row => {
                const campanha = row.campaign_id_aplicada || 'Sem Campanha';
                if (!campanhas[campanha]) campanhas[campanha] = 0;
                campanhas[campanha]++;
            });
            
            // Converter para array e ordenar
            const campanhasArray = Object.entries(campanhas)
                .map(([nome, count]) => ({ nome, count }))
                .sort((a, b) => b.count - a.count);
            
            // Exibir top 3 campanhas
            if (campanhasArray.length > 0) {
                const topCampanhas = campanhasArray.slice(0, 3);
                statReservasCampanhaEl.innerHTML = topCampanhas.map(c => 
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
            
            const { data, error } = await supabase
                .from('reservas')
                .select('booking_date')
                .gte('booking_date', dataInicio)
                .lte('booking_date', dataFim);
                
            if (error) throw error;
            
            // Agrupar por dia da semana
            const diasSemana = [0, 0, 0, 0, 0, 0, 0]; // Dom, Seg, Ter, Qua, Qui, Sex, Sáb
            const nomesDias = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
            
            data.forEach(reserva => {
                if (reserva.booking_date) {
                    const data = new Date(reserva.booking_date);
                    const diaSemana = data.getDay(); // 0 = Domingo, 6 = Sábado
                    diasSemana[diaSemana]++;
                }
            });
            
            // Encontrar o dia com mais reservas
            const maxReservas = Math.max(...diasSemana);
            const diaMaisReservas = diasSemana.indexOf(maxReservas);
            
            // Exibir resultado
            if (maxReservas > 0) {
                statReservasDiaSemanaEl.innerHTML = `
                    <div class="font-semibold text-lg">${nomesDias[diaMaisReservas]}</div>
                    <div class="text-sm">Dia com mais reservas (${maxReservas})</div>
                    <div class="mt-1 grid grid-cols-7 gap-1 text-xs text-center">
                        ${nomesDias.map((dia, i) => `<div>${dia}</div>`).join('')}
                        ${diasSemana.map(count => `<div class="font-semibold">${count}</div>`).join('')}
                    </div>
                `;
            } else {
                statReservasDiaSemanaEl.textContent = "Sem dados suficientes";
            }
            
        } catch (error) {
            console.error("Erro ao carregar reservas por dia da semana:", error);
            if (statReservasDiaSemanaEl) statReservasDiaSemanaEl.textContent = "Erro ao carregar dados";
        }
    }
    
    async function carregarReservasPorHora(data) {
        try {
            if (!chartReservasPorHoraEl) return;
            
            // Formato da data: YYYY-MM-DD
            const dataInicio = `${data}T00:00:00`;
            const dataFim = `${data}T23:59:59.999Z`;
            
            // Buscar todas as reservas do dia
            const { data: reservas, error } = await supabase
                .from('reservas')
                .select('*')
                .gte('check_in_previsto', dataInicio)
                .lte('check_in_previsto', dataFim);
                
            if (error) throw error;
            
            // Agrupar por hora
            const reservasPorHora = Array(24).fill(0);
            
            if (reservas && reservas.length > 0) {
                reservas.forEach(reserva => {
                    if (reserva.check_in_previsto) {
                        const hora = new Date(reserva.check_in_previsto).getHours();
                        reservasPorHora[hora]++;
                    }
                });
            }
            
            // Atualizar gráfico
            if (graficoReservasHora) {
                graficoReservasHora.data.datasets[0].data = reservasPorHora;
                graficoReservasHora.update();
            } else {
                graficoReservasHora = new Chart(chartReservasPorHoraEl, {
                    type: 'bar',
                    data: {
                        labels: Array.from({length: 24}, (_, i) => `${i}:00`),
                        datasets: [{
                            label: 'Reservas',
                            data: reservasPorHora,
                            backgroundColor: 'rgba(54, 162, 235, 0.5)',
                            borderColor: 'rgba(54, 162, 235, 1)',
                            borderWidth: 1
                        }]
                    },
                    options: {
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    stepSize: 1
                                }
                            }
                        },
                        plugins: {
                            legend: {
                                display: false
                            }
                        }
                    }
                });
            }
            
            // Atualizar texto informativo
            if (statReservasHoraConteudoEl) {
                const totalDia = reservasPorHora.reduce((a, b) => a + b, 0);
                const horasPico = [];
                const maxReservas = Math.max(...reservasPorHora);
                
                if (maxReservas > 0) {
                    reservasPorHora.forEach((count, hora) => {
                        if (count === maxReservas) {
                            horasPico.push(`${hora}:00`);
                        }
                    });
                    
                    statReservasHoraConteudoEl.textContent = `Total: ${totalDia} reservas. Hora(s) de pico: ${horasPico.join(', ')} com ${maxReservas} reservas.`;
                } else {
                    statReservasHoraConteudoEl.textContent = `Sem reservas neste dia.`;
                }
            }
            
            return {
                labels: Array.from({length: 24}, (_, i) => `${i}:00`),
                data: reservasPorHora
            };
            
        } catch (error) {
            console.error("Erro ao carregar reservas por hora:", error);
            if (statReservasHoraConteudoEl) statReservasHoraConteudoEl.textContent = `Erro: ${error.message}`;
            return { labels: [], data: [] };
        }
    }
    
    async function carregarGraficoMensal(dataInicio, dataFim) {
        try {
            if (!chartReservasMensalEl) return;
            
            // Obter o primeiro dia do mês anterior e o último dia do mês seguinte
            const dataInicioObj = new Date(dataInicio);
            const dataFimObj = new Date(dataFim);
            
            const anoInicio = dataInicioObj.getFullYear();
            const mesInicio = dataInicioObj.getMonth();
            
            const anoFim = dataFimObj.getFullYear();
            const mesFim = dataFimObj.getMonth();
            
            // Calcular o número de meses entre as datas
            const mesesTotal = (anoFim - anoInicio) * 12 + (mesFim - mesInicio) + 1;
            
            // Limitar a 12 meses para não sobrecarregar o gráfico
            const mesesAExibir = Math.min(mesesTotal, 12);
            
            // Criar array de labels e dados
            const labels = [];
            const dados = [];
            
            // Buscar dados de reservas por mês
            const { data: reservas, error } = await supabase
                .from('reservas')
                .select('booking_date')
                .gte('booking_date', dataInicio)
                .lte('booking_date', dataFim);
                
            if (error) throw error;
            
            // Agrupar por mês
            const reservasPorMes = {};
            
            for (let i = 0; i < mesesAExibir; i++) {
                const data = new Date(anoInicio, mesInicio + i, 1);
                const anoMes = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
                const label = data.toLocaleDateString('pt-PT', { month: 'short', year: 'numeric' });
                
                labels.push(label);
                reservasPorMes[anoMes] = 0;
            }
            
            // Contar reservas por mês
            reservas.forEach(reserva => {
                if (reserva.booking_date) {
                    const data = new Date(reserva.booking_date);
                    const anoMes = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
                    
                    if (reservasPorMes[anoMes] !== undefined) {
                        reservasPorMes[anoMes]++;
                    }
                }
            });
            
            // Converter para array de dados
            for (let i = 0; i < mesesAExibir; i++) {
                const data = new Date(anoInicio, mesInicio + i, 1);
                const anoMes = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
                dados.push(reservasPorMes[anoMes]);
            }
            
            // Atualizar gráfico
            if (graficoReservasMensal) {
                graficoReservasMensal.data.labels = labels;
                graficoReservasMensal.data.datasets[0].data = dados;
                graficoReservasMensal.update();
            } else {
                graficoReservasMensal = new Chart(chartReservasMensalEl, {
                    type: 'line',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: 'Reservas',
                            data: dados,
                            backgroundColor: 'rgba(75, 192, 192, 0.2)',
                            borderColor: 'rgba(75, 192, 192, 1)',
                            borderWidth: 2,
                            tension: 0.1
                        }]
                    },
                    options: {
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    stepSize: 1
                                }
                            }
                        }
                    }
                });
            }
            
        } catch (error) {
            console.error("Erro ao carregar gráfico mensal:", error);
        }
    }

    // --- Lógica de Importação/Exportação ---
    async function processarImportacao() {
        try {
            if (!importReservasFileEl || !importReservasFileEl.files || importReservasFileEl.files.length === 0) {
                alert("Por favor, selecione um ficheiro para importar.");
                return;
            }
            
            const file = importReservasFileEl.files[0];
            
            // Verificar tipo de ficheiro
            if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls') && !file.name.endsWith('.csv')) {
                alert("Por favor, selecione um ficheiro Excel (.xlsx, .xls) ou CSV (.csv).");
                return;
            }
            
            // Mostrar loading
            if (loadingImportSpinnerEl) loadingImportSpinnerEl.classList.remove("hidden");
            if (importacaoStatusEl) importacaoStatusEl.textContent = "Processando ficheiro...";
            
            // Ler ficheiro
            const reader = new FileReader();
            
            reader.onload = async function(e) {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    
                    // Obter primeira folha
                    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                    
                    // Converter para JSON
                    const jsonData = XLSX.utils.sheet_to_json(firstSheet);
                    
                    if (jsonData.length === 0) {
                        throw new Error("O ficheiro não contém dados.");
                    }
                    
                    if (importacaoStatusEl) importacaoStatusEl.textContent = `Processando ${jsonData.length} registros...`;
                    
                    // Processar dados
                    await processarDadosImportacao(jsonData);
                    
                } catch (error) {
                    console.error("Erro ao processar o ficheiro Excel:", error);
                    if (importacaoStatusEl) importacaoStatusEl.textContent = `Erro ao processar o ficheiro Excel: ${error.message}`;
                    if (loadingImportSpinnerEl) loadingImportSpinnerEl.classList.add("hidden");
                }
            };
            
            reader.onerror = function() {
                console.error("Erro ao ler o ficheiro.");
                if (importacaoStatusEl) importacaoStatusEl.textContent = "Erro ao ler o ficheiro.";
                if (loadingImportSpinnerEl) loadingImportSpinnerEl.classList.add("hidden");
            };
            
            reader.readAsArrayBuffer(file);
            
        } catch (error) {
            console.error("Erro ao processar importação:", error);
            if (importacaoStatusEl) importacaoStatusEl.textContent = `Erro ao processar importação: ${error.message}`;
            if (loadingImportSpinnerEl) loadingImportSpinnerEl.classList.add("hidden");
        }
    }

    async function processarDadosImportacao(jsonData) {
        try {
            // Obter usuário atual
            const { data: { user: importUser } } = await supabase.auth.getUser();

            // Mapeamento de colunas do Excel para colunas do Supabase
            const mapeamentoColunas = {
                // Coluna no Excel : Coluna no Supabase
                "licensePlate": "license_plate",
                "alocation": "alocation",
                "bookingDate": "booking_date",
                "checkIn": "check_in_previsto",
                "checkOut": "check_out_previsto",
                "name": "name_cliente",
                "lastname": "lastname_cliente",
                "phoneNumber": "phone_number_cliente",
                "email": "email_cliente",
                "bookingPrice": "booking_price",
                "parkingPrice": "parking_price",
                "deliveryPrice": "delivery_price",
                "totalPrice": "total_price",
                "hasOnlinePayment": "has_online_payment",
                "parkingType": "parking_type",
                "returnFlight": "return_flight",
                "bookingRemarks": "remarks_cliente",
                "brand": "car_info_brand",
                "model": "car_info_model",
                "color": "car_info_color",
                "taxNumber": "nif_cliente",
                "city": "cidade_cliente",
                "idClient": "id_cliente_externo",
                "bookingId": "booking_id"
            };
            
            const reservasParaUpsert = jsonData.map(row => {
                const reservaSupabase = {};
                
                // Mapear colunas do Excel para colunas do Supabase
                for (const excelCol in mapeamentoColunas) {
                    if (row[excelCol] !== undefined && row[excelCol] !== null) {
                        const supabaseCol = mapeamentoColunas[excelCol];
                        
                        // ALTERAÇÃO: Converter datas para formato ISO
                        if (supabaseCol.includes('date') || supabaseCol.includes('check_in') || supabaseCol.includes('check_out')) {
                            reservaSupabase[supabaseCol] = converterDataParaISO(row[excelCol]);
                        } else {
                            reservaSupabase[supabaseCol] = row[excelCol];
                        }
                    }
                }
                
                // Garantir que chaves de conflito (license_plate, alocation) existem
                if (!reservaSupabase.license_plate || !reservaSupabase.alocation) {
                    console.warn("Reserva ignorada por falta de license_plate ou alocation:", reservaSupabase);
                    return null; // Ignorar esta reserva
                }
                
                // Normalizar matrícula
                reservaSupabase.license_plate = normalizarMatricula(reservaSupabase.license_plate);
                
                // Gerar booking_id se não existir
                if (!reservaSupabase.booking_id) {
                    reservaSupabase.booking_id = `BK${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 1000)}`;
                }
                
                // Adicionar metadados de importação
                reservaSupabase.source_file_imported = importReservasFileEl.files[0].name;
                reservaSupabase.user_id_criacao_registo = importUser?.id;
                reservaSupabase.action_date = new Date().toISOString();
                
                return reservaSupabase;
            }).filter(Boolean); // Remover nulos (reservas ignoradas)

            console.log("Reservas para Upsert:", reservasParaUpsert);

            if (reservasParaUpsert.length > 0) {
                // Usar UPSERT: se a combinação license_plate + alocation já existir, atualiza. Senão, insere.
                const { data: upsertedData, error: upsertError } = await supabase
                    .from("reservas")
                    .upsert(reservasParaUpsert, { 
                        onConflict: 'license_plate,alocation', // Colunas para verificar conflito
                        returning: "minimal" // Não precisamos dos dados de retorno
                    });
                
                if (upsertError) throw upsertError;
                
                // Atualizar status
                if (importacaoStatusEl) {
                    importacaoStatusEl.textContent = `Importação concluída com sucesso! ${reservasParaUpsert.length} reservas processadas.`;
                    importacaoStatusEl.classList.remove("text-red-500");
                    importacaoStatusEl.classList.add("text-green-500");
                }
                
                // Recarregar lista de reservas
                carregarReservasDaLista(1, obterFiltrosAtivos());
                
            } else {
                throw new Error("Nenhuma reserva válida encontrada no ficheiro.");
            }
            
        } catch (error) {
            console.error("Erro ao processar dados de importação:", error);
            if (importacaoStatusEl) {
                importacaoStatusEl.textContent = `Erro ao processar dados: ${error.message}`;
                importacaoStatusEl.classList.remove("text-green-500");
                importacaoStatusEl.classList.add("text-red-500");
            }
        } finally {
            if (loadingImportSpinnerEl) loadingImportSpinnerEl.classList.add("hidden");
        }
    }

    // --- Configuração de Eventos ---
    function configurarEventos() {
        // Eventos de Importação
        if (resProcessarImportacaoBtnEl) {
            resProcessarImportacaoBtnEl.addEventListener("click", processarImportacao);
        }
        
        // Eventos de Dashboard
        if (resAplicarFiltrosDashboardBtnEl) {
            resAplicarFiltrosDashboardBtnEl.addEventListener("click", atualizarDashboardStatsGeral);
        }
        
        if (resDashboardFiltroPeriodoEl) {
            resDashboardFiltroPeriodoEl.addEventListener("change", () => {
                const hoje = new Date();
                const dataFim = new Date(hoje);
                let dataInicio = new Date(hoje);
                
                switch (resDashboardFiltroPeriodoEl.value) {
                    case "hoje":
                        // Não mudar dataInicio, já é hoje
                        break;
                    case "semana_atual":
                        dataInicio.setDate(hoje.getDate() - hoje.getDay()); // Domingo desta semana
                        break;
                    case "mes_atual":
                        dataInicio.setDate(1); // Primeiro dia do mês atual
                        break;
                    case "ultimos_30dias":
                        dataInicio.setDate(hoje.getDate() - 30);
                        break;
                    case "este_ano":
                        dataInicio = new Date(hoje.getFullYear(), 0, 1); // 1 de Janeiro do ano atual
                        break;
                    case "personalizado":
                        // Não mudar as datas, deixar o usuário escolher
                        return;
                }
                
                if (resDashboardFiltroDataInicioEl) {
                    resDashboardFiltroDataInicioEl.value = dataInicio.toISOString().split('T')[0];
                }
                if (resDashboardFiltroDataFimEl) {
                    resDashboardFiltroDataFimEl.value = dataFim.toISOString().split('T')[0];
                }
            });
        }
        
        if (resDashboardDataHoraInputEl) {
            resDashboardDataHoraInputEl.addEventListener("change", async () => {
                const dataHora = resDashboardDataHoraInputEl.value;
                if (dataHora) {
                    if (resDashboardDataHoraDisplayEl) {
                        const dataFormatada = new Date(dataHora).toLocaleDateString('pt-PT');
                        resDashboardDataHoraDisplayEl.textContent = dataFormatada;
                    }
                    await carregarReservasPorHora(dataHora);
                }
            });
            
            // Inicializar com a data de hoje
            const hoje = new Date().toISOString().split('T')[0];
            resDashboardDataHoraInputEl.value = hoje;
            if (resDashboardDataHoraDisplayEl) {
                resDashboardDataHoraDisplayEl.textContent = new Date(hoje).toLocaleDateString('pt-PT');
            }
            carregarReservasPorHora(hoje);
        }
        
        // Eventos de Lista
        if (resSearchBtnEl) {
            resSearchBtnEl.addEventListener("click", () => {
                paginaAtualLista = 1;
                carregarReservasDaLista(paginaAtualLista, obterFiltrosAtivos());
            });
        }
        
        if (resSearchTermEl) {
            resSearchTermEl.addEventListener("keypress", (e) => {
                if (e.key === "Enter") {
                    paginaAtualLista = 1;
                    carregarReservasDaLista(paginaAtualLista, obterFiltrosAtivos());
                }
            });
        }
        
        if (resAplicarFiltrosListaBtnEl) {
            resAplicarFiltrosListaBtnEl.addEventListener("click", () => {
                paginaAtualLista = 1;
                carregarReservasDaLista(paginaAtualLista, obterFiltrosAtivos());
            });
        }
        
        // Evento de Voltar ao Dashboard
        if (voltarDashboardBtnReservasEl) {
            voltarDashboardBtnReservasEl.addEventListener("click", () => {
                window.location.href = "index.html";
            });
        }
        
        // Inicializar datas do dashboard
        if (resDashboardFiltroDataInicioEl && resDashboardFiltroDataFimEl) {
            const hoje = new Date();
            const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
            const ultimoDiaMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
            
            resDashboardFiltroDataInicioEl.value = primeiroDiaMes.toISOString().split('T')[0];
            resDashboardFiltroDataFimEl.value = ultimoDiaMes.toISOString().split('T')[0];
        }
    }
    
    function configurarBotoesAcao() {
        // Configurar botões de editar
        document.querySelectorAll('.editar-reserva-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const reservaId = btn.getAttribute('data-id');
                if (reservaId) {
                    await abrirModalEditarReserva(reservaId);
                }
            });
        });
        
        // Configurar botões de apagar
        document.querySelectorAll('.apagar-reserva-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const reservaId = btn.getAttribute('data-id');
                if (reservaId && confirm('Tem certeza que deseja apagar esta reserva?')) {
                    await apagarReserva(reservaId);
                }
            });
        });
        
        // Configurar botões de log
        document.querySelectorAll('.log-reserva-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const bookingId = btn.getAttribute('data-booking-id');
                const reservaPk = btn.getAttribute('data-reserva-pk');
                if (bookingId || reservaPk) {
                    await abrirModalLogReserva(bookingId || reservaPk);
                }
            });
        });
    }

    // --- Inicialização da Página ---
    async function initReservasPage() {
        try {
            // Verificar autenticação
            await window.checkAuthStatus();
            
            // Obter usuário atual
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError) throw userError;
            
            if (!user) {
                console.error("Usuário não autenticado.");
                return;
            }
            
            currentUser = user;
            
            // Obter perfil do usuário
            const userProfileStr = localStorage.getItem('userProfile');
            if (userProfileStr) {
                try {
                    userProfile = JSON.parse(userProfileStr);
                } catch (e) {
                    console.error("Erro ao parsear perfil do usuário:", e);
                }
            }
            
            // Inicializar componentes
            configurarEventos();
            
            // Carregar dados iniciais
            await carregarReservasDaLista(1);
            await atualizarDashboardStatsGeral();
            
        } catch (error) {
            console.error("Erro ao inicializar página de reservas:", error);
        }
    }

    // Iniciar a página
    initReservasPage();
});
