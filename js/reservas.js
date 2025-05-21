// Função para normalizar matrículas (adaptada para formato internacional sem hífens)
function normalizarMatricula(matricula) {
    if (!matricula) return "";
    
    // Remove espaços, hífens e converte para maiúsculas
    let normalizada = matricula.toString().toUpperCase().replace(/[\s\-]/g, "");
    
    // Não adiciona hífens, mantém apenas o formato limpo para compatibilidade internacional
    return normalizada;
}

// Função local para calcular reservas por hora em um dia específico
async function carregarReservasPorHora(data) {
    try {
        // Formato da data: YYYY-MM-DD
        const dataInicio = `${data}T00:00:00`;
        const dataFim = `${data}T23:59:59.999Z`;
        
        // Buscar todas as reservas do dia
        const { data: reservas, error } = await supabase
            .from('reservas')
            .select('*')
            .gte('check_in_datetime', dataInicio)
            .lte('check_in_datetime', dataFim);
            
        if (error) throw error;
        
        // Agrupar por hora
        const reservasPorHora = Array(24).fill(0);
        
        if (reservas && reservas.length > 0) {
            reservas.forEach(reserva => {
                if (reserva.check_in_datetime) {
                    const hora = new Date(reserva.check_in_datetime).getHours();
                    reservasPorHora[hora]++;
                }
            });
        }
        
        return {
            labels: Array.from({length: 24}, (_, i) => `${i}:00`),
            data: reservasPorHora
        };
    } catch (error) {
        console.error("Erro ao carregar reservas por hora:", error);
        return { labels: [], data: [] };
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    // --- Verificação de Cliente Supabase ---
    if (typeof window.getSupabaseClient !== 'function') {
        console.error("ERRO CRÍTICO: getSupabaseClient não está definido. Verifique a inicialização no HTML.");
        alert("Erro crítico na configuração da aplicação (Reservas). Contacte o suporte.");
        document.querySelectorAll('.action-button').forEach(btn => btn.disabled = true);
        return;
    }
    const supabase = window.getSupabaseClient();
    if (!supabase) {
        console.error("ERRO CRÍTICO: Cliente Supabase não disponível (Reservas).");
        alert("Erro crítico ao conectar com o sistema (Reservas). Contacte o suporte.");
        document.querySelectorAll('.action-button').forEach(btn => btn.disabled = true);
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
    const resAplicarFiltrosListaBtnEl = document.getElementById("resAplicarFiltrosListaBtn");
    const resFiltroClienteListaEl = document.getElementById("resFiltroClienteLista");
    const resFiltroMatriculaListaEl = document.getElementById("resFiltroMatriculaLista");
    const resFiltroDataEntradaListaEl = document.getElementById("resFiltroDataEntradaLista");
    const resFiltroEstadoListaEl = document.getElementById("resFiltroEstadoLista");
    const reservasTableBodyEl = document.getElementById("reservasTableBody");
    const reservasNenhumaMsgEl = document.getElementById("reservasNenhumaMsg");
    const reservasTotalCountEl = document.getElementById("reservasTotalCount");
    const reservasPaginacaoEl = document.getElementById("reservasPaginacao");
    const loadingTableSpinnerEl = document.getElementById("loadingTableSpinner");

    const reservaFormModalEl = document.getElementById("reservaFormModal");
    const reservaFormModalTitleEl = document.getElementById("reservaFormModalTitle");
    const reservaFormEl = document.getElementById("reservaForm");
    const reservaFormIdEl = document.getElementById("reservaFormId");
    const reservaFormBookingIdEl = document.getElementById("reservaFormBookingId");
    const reservaFormDataReservaEl = document.getElementById("reservaFormDataReserva");
    const reservaFormNomeClienteEl = document.getElementById("reservaFormNomeCliente");
    const reservaFormEmailClienteEl = document.getElementById("reservaFormEmailCliente");
    const reservaFormTelefoneClienteEl = document.getElementById("reservaFormTelefoneCliente");
    const reservaFormMatriculaEl = document.getElementById("reservaFormMatricula");
    const reservaFormAlocationEl = document.getElementById("reservaFormAlocation");
    const reservaFormDataEntradaEl = document.getElementById("reservaFormDataEntrada");
    const reservaFormDataSaidaEl = document.getElementById("reservaFormDataSaida");
    const reservaFormParqueEl = document.getElementById("reservaFormParque");
    const reservaFormCampanhaEl = document.getElementById("reservaFormCampanha");
    const reservaFormValorEl = document.getElementById("reservaFormValor");
    const reservaFormEstadoEl = document.getElementById("reservaFormEstado");
    const reservaFormObservacoesEl = document.getElementById("reservaFormObservacoes");
    const reservaFormSubmitBtnEl = document.getElementById("reservaFormSubmitBtn");
    const resFecharModalBtnEls = document.querySelectorAll(".resFecharModalBtn");

    const reservaLogModalEl = document.getElementById("reservaLogModal");
    const logReservaBookingIdEl = document.getElementById("logReservaBookingId");
    const reservaLogTableBodyEl = document.getElementById("reservaLogTableBody");
    const reservaLogNenhumaMsgEl = document.getElementById("reservaLogNenhumaMsg");
    const resFecharLogModalBtnEls = document.querySelectorAll(".resFecharLogModalBtn");

    const voltarDashboardBtnReservasEl = document.getElementById("voltarDashboardBtnReservas");

    // --- Variáveis de Estado ---
    let reservasData = [];
    let filtrosAtivos = {
        termo: "",
        cliente: "",
        matricula: "",
        dataEntrada: "",
        estado: ""
    };
    let paginaAtual = 1;
    const itensPorPagina = 10;
    let reservaEmEdicao = null;
    let chartReservasPorHora = null;
    let chartReservasMensal = null;
    let dataHoraAtual = null;

    // --- Inicialização ---
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
            initDatePickers();
            configurarEventos();
            carregarParques();
            
            // Carregar dados iniciais
            await carregarDashboard();
            await carregarReservas();
            
        } catch (error) {
            console.error("Erro ao inicializar página de reservas:", error);
        }
    }

    // --- Inicialização de Componentes ---
    function initDatePickers() {
        // Inicializar datepickers com flatpickr
        if (typeof flatpickr === 'function') {
            // Configuração para datas simples
            const configData = {
                dateFormat: "Y-m-d",
                locale: "pt",
                allowInput: true
            };
            
            // Configuração para data e hora
            const configDataHora = {
                dateFormat: "Y-m-d H:i",
                enableTime: true,
                time_24hr: true,
                locale: "pt",
                allowInput: true
            };
            
            // Aplicar aos elementos
            if (resDashboardFiltroDataInicioEl) flatpickr(resDashboardFiltroDataInicioEl, configData);
            if (resDashboardFiltroDataFimEl) flatpickr(resDashboardFiltroDataFimEl, configData);
            if (resFiltroDataEntradaListaEl) flatpickr(resFiltroDataEntradaListaEl, configData);
            if (resDashboardDataHoraInputEl) flatpickr(resDashboardDataHoraInputEl, configData);
            
            // Datepickers do formulário
            if (reservaFormDataReservaEl) flatpickr(reservaFormDataReservaEl, configDataHora);
            if (reservaFormDataEntradaEl) flatpickr(reservaFormDataEntradaEl, configDataHora);
            if (reservaFormDataSaidaEl) flatpickr(reservaFormDataSaidaEl, configDataHora);
        } else {
            console.warn("Flatpickr não disponível. Os seletores de data usarão o padrão do navegador.");
        }
    }

    function configurarEventos() {
        // Eventos de Dashboard
        if (resAplicarFiltrosDashboardBtnEl) {
            resAplicarFiltrosDashboardBtnEl.addEventListener("click", carregarDashboard);
        }
        
        if (resDashboardFiltroPeriodoEl) {
            resDashboardFiltroPeriodoEl.addEventListener("change", atualizarFiltrosPeriodo);
        }
        
        if (resDashboardDataHoraInputEl) {
            resDashboardDataHoraInputEl.addEventListener("change", async (e) => {
                const data = e.target.value;
                if (data) {
                    dataHoraAtual = data;
                    resDashboardDataHoraDisplayEl.textContent = formatarData(data);
                    await atualizarGraficoReservasPorHora(data);
                }
            });
        }
        
        // Eventos de Pesquisa e Filtros
        if (resSearchBtnEl) {
            resSearchBtnEl.addEventListener("click", () => {
                filtrosAtivos.termo = resSearchTermEl.value.trim();
                paginaAtual = 1;
                carregarReservas();
            });
        }
        
        if (resSearchTermEl) {
            resSearchTermEl.addEventListener("keypress", (e) => {
                if (e.key === "Enter") {
                    filtrosAtivos.termo = resSearchTermEl.value.trim();
                    paginaAtual = 1;
                    carregarReservas();
                }
            });
        }
        
        if (resAplicarFiltrosListaBtnEl) {
            resAplicarFiltrosListaBtnEl.addEventListener("click", () => {
                filtrosAtivos.cliente = resFiltroClienteListaEl.value.trim();
                filtrosAtivos.matricula = resFiltroMatriculaListaEl.value.trim();
                filtrosAtivos.dataEntrada = resFiltroDataEntradaListaEl.value;
                filtrosAtivos.estado = resFiltroEstadoListaEl.value;
                paginaAtual = 1;
                carregarReservas();
            });
        }
        
        // Eventos de Formulário
        if (resAbrirModalNovaBtnEl) {
            resAbrirModalNovaBtnEl.addEventListener("click", abrirModalNovaReserva);
        }
        
        if (reservaFormEl) {
            reservaFormEl.addEventListener("submit", (e) => {
                e.preventDefault();
                salvarReserva();
            });
        }
        
        if (resFecharModalBtnEls) {
            resFecharModalBtnEls.forEach(btn => {
                btn.addEventListener("click", () => {
                    reservaFormModalEl.classList.remove("active");
                });
            });
        }
        
        if (resFecharLogModalBtnEls) {
            resFecharLogModalBtnEls.forEach(btn => {
                btn.addEventListener("click", () => {
                    reservaLogModalEl.classList.remove("active");
                });
            });
        }
        
        // Eventos de Importação
        if (resProcessarImportacaoBtnEl) {
            resProcessarImportacaoBtnEl.addEventListener("click", processarImportacao);
        }
        
        // Eventos de Exportação
        if (resExportarBtnEl) {
            resExportarBtnEl.addEventListener("click", exportarReservas);
        }
        
        // Evento de Voltar ao Dashboard
        if (voltarDashboardBtnReservasEl) {
            voltarDashboardBtnReservasEl.addEventListener("click", () => {
                window.location.href = "index.html";
            });
        }
    }

    async function carregarParques() {
        try {
            const { data: parques, error } = await supabase
                .from('parques')
                .select('id, nome')
                .order('nome');
                
            if (error) throw error;
            
            if (parques && parques.length > 0 && reservaFormParqueEl) {
                // Limpar opções existentes, exceto a primeira
                while (reservaFormParqueEl.options.length > 1) {
                    reservaFormParqueEl.remove(1);
                }
                
                // Adicionar novas opções
                parques.forEach(parque => {
                    const option = document.createElement('option');
                    option.value = parque.id;
                    option.textContent = parque.nome;
                    reservaFormParqueEl.appendChild(option);
                });
            }
        } catch (error) {
            console.error("Erro ao carregar parques:", error);
        }
    }

    // --- Funções de Dashboard ---
    async function carregarDashboard() {
        try {
            const { inicio, fim } = obterPeriodoFiltro();
            
            // Mostrar período selecionado
            if (inicio && fim) {
                const periodoTexto = `${formatarData(inicio)} a ${formatarData(fim)}`;
                if (statTotalReservasPeriodoEl) statTotalReservasPeriodoEl.textContent = periodoTexto;
                if (statValorTotalReservasPeriodoEl) statValorTotalReservasPeriodoEl.textContent = periodoTexto;
            }
            
            // Carregar estatísticas
            await Promise.all([
                carregarTotalReservas(inicio, fim),
                carregarValorTotalReservas(inicio, fim),
                carregarReservasPorCampanha(inicio, fim),
                carregarReservasPorDiaSemana(inicio, fim),
                carregarGraficoMensal(inicio, fim)
            ]);
            
            // Inicializar gráfico por hora com a data atual se não estiver definida
            if (!dataHoraAtual) {
                const hoje = new Date().toISOString().split('T')[0];
                dataHoraAtual = hoje;
                if (resDashboardDataHoraInputEl) resDashboardDataHoraInputEl.value = hoje;
                if (resDashboardDataHoraDisplayEl) resDashboardDataHoraDisplayEl.textContent = formatarData(hoje);
                await atualizarGraficoReservasPorHora(hoje);
            }
            
        } catch (error) {
            console.error("Erro ao carregar dashboard:", error);
        }
    }

    function obterPeriodoFiltro() {
        let inicio = null;
        let fim = null;
        
        const periodoSelecionado = resDashboardFiltroPeriodoEl ? resDashboardFiltroPeriodoEl.value : 'mes_atual';
        
        if (periodoSelecionado === 'personalizado') {
            inicio = resDashboardFiltroDataInicioEl ? resDashboardFiltroDataInicioEl.value : null;
            fim = resDashboardFiltroDataFimEl ? resDashboardFiltroDataFimEl.value : null;
        } else {
            const { dataInicio, dataFim } = calcularPeriodo(periodoSelecionado);
            inicio = dataInicio;
            fim = dataFim;
            
            // Atualizar campos de data
            if (resDashboardFiltroDataInicioEl) resDashboardFiltroDataInicioEl.value = dataInicio;
            if (resDashboardFiltroDataFimEl) resDashboardFiltroDataFimEl.value = dataFim;
        }
        
        return { inicio, fim };
    }

    function calcularPeriodo(periodo) {
        const hoje = new Date();
        let dataInicio, dataFim;
        
        switch (periodo) {
            case 'hoje':
                dataInicio = hoje.toISOString().split('T')[0];
                dataFim = dataInicio;
                break;
                
            case 'semana_atual':
                const primeiroDiaSemana = new Date(hoje);
                primeiroDiaSemana.setDate(hoje.getDate() - hoje.getDay()); // Domingo
                dataInicio = primeiroDiaSemana.toISOString().split('T')[0];
                
                const ultimoDiaSemana = new Date(primeiroDiaSemana);
                ultimoDiaSemana.setDate(primeiroDiaSemana.getDate() + 6); // Sábado
                dataFim = ultimoDiaSemana.toISOString().split('T')[0];
                break;
                
            case 'mes_atual':
                dataInicio = `${hoje.getFullYear()}-${(hoje.getMonth() + 1).toString().padStart(2, '0')}-01`;
                
                const ultimoDiaMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
                dataFim = ultimoDiaMes.toISOString().split('T')[0];
                break;
                
            case 'ultimos_30dias':
                const trintaDiasAtras = new Date(hoje);
                trintaDiasAtras.setDate(hoje.getDate() - 30);
                dataInicio = trintaDiasAtras.toISOString().split('T')[0];
                dataFim = hoje.toISOString().split('T')[0];
                break;
                
            case 'este_ano':
                dataInicio = `${hoje.getFullYear()}-01-01`;
                dataFim = `${hoje.getFullYear()}-12-31`;
                break;
                
            default:
                dataInicio = `${hoje.getFullYear()}-${(hoje.getMonth() + 1).toString().padStart(2, '0')}-01`;
                const ultimoDia = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
                dataFim = ultimoDia.toISOString().split('T')[0];
        }
        
        return { dataInicio, dataFim };
    }

    function atualizarFiltrosPeriodo() {
        const periodoSelecionado = resDashboardFiltroPeriodoEl ? resDashboardFiltroPeriodoEl.value : 'mes_atual';
        
        // Habilitar/desabilitar campos de data personalizada
        const camposDataDesabilitados = periodoSelecionado !== 'personalizado';
        if (resDashboardFiltroDataInicioEl) resDashboardFiltroDataInicioEl.disabled = camposDataDesabilitados;
        if (resDashboardFiltroDataFimEl) resDashboardFiltroDataFimEl.disabled = camposDataDesabilitados;
        
        // Se não for personalizado, atualizar com as datas calculadas
        if (periodoSelecionado !== 'personalizado') {
            const { dataInicio, dataFim } = calcularPeriodo(periodoSelecionado);
            if (resDashboardFiltroDataInicioEl) resDashboardFiltroDataInicioEl.value = dataInicio;
            if (resDashboardFiltroDataFimEl) resDashboardFiltroDataFimEl.value = dataFim;
        }
    }

    async function carregarTotalReservas(dataInicio, dataFim) {
        try {
            // Consulta para total geral
            const { count: totalGeral, error: errorGeral } = await supabase
                .from('reservas')
                .select('*', { count: 'exact', head: true });
                
            if (errorGeral) throw errorGeral;
            
            // Consulta para total no período
            let totalPeriodo = 0;
            if (dataInicio && dataFim) {
                const { count, error } = await supabase
                    .from('reservas')
                    .select('*', { count: 'exact', head: true })
                    .gte('data_reserva', `${dataInicio}T00:00:00`)
                    .lte('data_reserva', `${dataFim}T23:59:59.999Z`);
                    
                if (error) throw error;
                totalPeriodo = count || 0;
            }
            
            // Atualizar UI
            if (statTotalReservasEl) statTotalReservasEl.textContent = totalGeral || 0;
            
        } catch (error) {
            console.error("Erro ao carregar total de reservas:", error);
            if (statTotalReservasEl) statTotalReservasEl.textContent = "Erro";
        }
    }

    async function carregarValorTotalReservas(dataInicio, dataFim) {
        try {
            // Consulta para valor total geral
            const { data: reservasGeral, error: errorGeral } = await supabase
                .from('reservas')
                .select('total_price');
                
            if (errorGeral) throw errorGeral;
            
            const valorTotalGeral = reservasGeral.reduce((total, reserva) => {
                return total + (reserva.total_price || 0);
            }, 0);
            
            // Consulta para valor total no período
            let valorTotalPeriodo = 0;
            if (dataInicio && dataFim) {
                const { data: reservasPeriodo, error } = await supabase
                    .from('reservas')
                    .select('total_price')
                    .gte('data_reserva', `${dataInicio}T00:00:00`)
                    .lte('data_reserva', `${dataFim}T23:59:59.999Z`);
                    
                if (error) throw error;
                
                valorTotalPeriodo = reservasPeriodo.reduce((total, reserva) => {
                    return total + (reserva.total_price || 0);
                }, 0);
            }
            
            // Atualizar UI
            if (statValorTotalReservasEl) {
                statValorTotalReservasEl.textContent = formatarMoeda(valorTotalGeral);
            }
            
        } catch (error) {
            console.error("Erro ao carregar valor total de reservas:", error);
            if (statValorTotalReservasEl) statValorTotalReservasEl.textContent = "Erro";
        }
    }

    async function carregarReservasPorCampanha(dataInicio, dataFim) {
        try {
            let query = supabase
                .from('reservas')
                .select('campaign_name, count');
                
            if (dataInicio && dataFim) {
                query = query
                    .gte('data_reserva', `${dataInicio}T00:00:00`)
                    .lte('data_reserva', `${dataFim}T23:59:59.999Z`);
            }
            
            // Agrupar por campanha (simulado no cliente)
            const { data: reservas, error } = await query;
            
            if (error) throw error;
            
            const campanhas = {};
            reservas.forEach(reserva => {
                const campanha = reserva.campaign_name || 'Sem Campanha';
                if (!campanhas[campanha]) {
                    campanhas[campanha] = 0;
                }
                campanhas[campanha]++;
            });
            
            // Ordenar e formatar para exibição
            const campanhasOrdenadas = Object.entries(campanhas)
                .sort((a, b) => b[1] - a[1])
                .map(([nome, count]) => `${nome}: ${count}`);
                
            // Atualizar UI
            if (statReservasCampanhaEl) {
                if (campanhasOrdenadas.length > 0) {
                    statReservasCampanhaEl.innerHTML = campanhasOrdenadas.slice(0, 5).join('<br>');
                } else {
                    statReservasCampanhaEl.textContent = "Sem dados";
                }
            }
            
        } catch (error) {
            console.error("Erro ao carregar reservas por campanha:", error);
            if (statReservasCampanhaEl) statReservasCampanhaEl.textContent = "Erro";
        }
    }

    async function carregarReservasPorDiaSemana(dataInicio, dataFim) {
        try {
            let query = supabase
                .from('reservas')
                .select('data_reserva');
                
            if (dataInicio && dataFim) {
                query = query
                    .gte('data_reserva', `${dataInicio}T00:00:00`)
                    .lte('data_reserva', `${dataFim}T23:59:59.999Z`);
            }
            
            const { data: reservas, error } = await query;
            
            if (error) throw error;
            
            // Agrupar por dia da semana
            const diasSemana = [0, 0, 0, 0, 0, 0, 0]; // Dom, Seg, Ter, Qua, Qui, Sex, Sáb
            const nomesDiasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
            
            reservas.forEach(reserva => {
                if (reserva.data_reserva) {
                    const data = new Date(reserva.data_reserva);
                    const diaSemana = data.getDay(); // 0 = Domingo, 6 = Sábado
                    diasSemana[diaSemana]++;
                }
            });
            
            // Ordenar e formatar para exibição
            const diasOrdenados = nomesDiasSemana.map((nome, index) => ({
                nome,
                count: diasSemana[index]
            })).sort((a, b) => b.count - a.count);
            
            // Atualizar UI
            if (statReservasDiaSemanaEl) {
                if (diasOrdenados.some(dia => dia.count > 0)) {
                    statReservasDiaSemanaEl.innerHTML = diasOrdenados
                        .filter(dia => dia.count > 0)
                        .map(dia => `${dia.nome}: ${dia.count}`)
                        .join('<br>');
                } else {
                    statReservasDiaSemanaEl.textContent = "Sem dados";
                }
            }
            
        } catch (error) {
            console.error("Erro ao carregar reservas por dia da semana:", error);
            if (statReservasDiaSemanaEl) statReservasDiaSemanaEl.textContent = "Erro";
        }
    }

    async function atualizarGraficoReservasPorHora(data) {
        try {
            if (!chartReservasPorHoraEl) return;
            
            // Usar a função local para calcular reservas por hora
            const resultado = await carregarReservasPorHora(data);
            
            // Atualizar ou criar o gráfico
            if (chartReservasPorHora) {
                chartReservasPorHora.data.labels = resultado.labels;
                chartReservasPorHora.data.datasets[0].data = resultado.data;
                chartReservasPorHora.update();
            } else {
                chartReservasPorHora = new Chart(chartReservasPorHoraEl, {
                    type: 'bar',
                    data: {
                        labels: resultado.labels,
                        datasets: [{
                            label: 'Reservas por Hora',
                            data: resultado.data,
                            backgroundColor: 'rgba(54, 162, 235, 0.5)',
                            borderColor: 'rgba(54, 162, 235, 1)',
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
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
            
            // Atualizar texto de estatísticas
            if (statReservasHoraConteudoEl) {
                const total = resultado.data.reduce((sum, val) => sum + val, 0);
                if (total > 0) {
                    const horaMaxima = resultado.data.indexOf(Math.max(...resultado.data));
                    statReservasHoraConteudoEl.textContent = `Total: ${total} reservas. Hora mais movimentada: ${horaMaxima}:00 (${resultado.data[horaMaxima]} reservas)`;
                } else {
                    statReservasHoraConteudoEl.textContent = "Sem reservas neste dia.";
                }
            }
            
        } catch (error) {
            console.error("Erro ao atualizar gráfico de reservas por hora:", error);
            if (statReservasHoraConteudoEl) statReservasHoraConteudoEl.textContent = "Erro ao carregar dados.";
        }
    }

    async function carregarGraficoMensal(dataInicio, dataFim) {
        try {
            if (!chartReservasMensalEl) return;
            
            // Determinar o período para o gráfico mensal
            const hoje = new Date();
            const anoAtual = hoje.getFullYear();
            const mesAtual = hoje.getMonth();
            
            // Buscar dados dos últimos 12 meses
            const dataInicioGrafico = new Date(anoAtual, mesAtual - 11, 1).toISOString().split('T')[0];
            const dataFimGrafico = new Date(anoAtual, mesAtual + 1, 0).toISOString().split('T')[0];
            
            const { data: reservas, error } = await supabase
                .from('reservas')
                .select('data_reserva')
                .gte('data_reserva', `${dataInicioGrafico}T00:00:00`)
                .lte('data_reserva', `${dataFimGrafico}T23:59:59.999Z`);
                
            if (error) throw error;
            
            // Agrupar por mês
            const meses = Array(12).fill(0);
            const nomesMeses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
            const labels = [];
            
            // Gerar labels para os últimos 12 meses
            for (let i = 0; i < 12; i++) {
                const m = (mesAtual - 11 + i + 12) % 12; // Garantir que o índice seja positivo
                labels.push(nomesMeses[m]);
            }
            
            // Contar reservas por mês
            reservas.forEach(reserva => {
                if (reserva.data_reserva) {
                    const data = new Date(reserva.data_reserva);
                    const mes = data.getMonth();
                    const ano = data.getFullYear();
                    
                    // Calcular o índice no array de meses (relativo ao mês atual)
                    const indice = (mes - (mesAtual - 11) + 12) % 12;
                    
                    // Só contar se estiver dentro dos últimos 12 meses
                    if (indice >= 0 && indice < 12) {
                        meses[indice]++;
                    }
                }
            });
            
            // Atualizar ou criar o gráfico
            if (chartReservasMensal) {
                chartReservasMensal.data.labels = labels;
                chartReservasMensal.data.datasets[0].data = meses;
                chartReservasMensal.update();
            } else {
                chartReservasMensal = new Chart(chartReservasMensalEl, {
                    type: 'line',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: 'Reservas por Mês',
                            data: meses,
                            backgroundColor: 'rgba(75, 192, 192, 0.2)',
                            borderColor: 'rgba(75, 192, 192, 1)',
                            borderWidth: 2,
                            tension: 0.1
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        }
                    }
                });
            }
            
        } catch (error) {
            console.error("Erro ao carregar gráfico mensal:", error);
        }
    }

    // --- Funções de Listagem de Reservas ---
    async function carregarReservas() {
        try {
            if (loadingTableSpinnerEl) loadingTableSpinnerEl.classList.remove("hidden");
            
            // Construir query base
            let query = supabase
                .from('reservas')
                .select('*');
            
            // Aplicar filtros
            if (filtrosAtivos.termo) {
                query = query.or(`booking_id.ilike.%${filtrosAtivos.termo}%,matricula.ilike.%${filtrosAtivos.termo}%,alocation.ilike.%${filtrosAtivos.termo}%,nome_cliente.ilike.%${filtrosAtivos.termo}%`);
            }
            
            if (filtrosAtivos.cliente) {
                query = query.ilike('nome_cliente', `%${filtrosAtivos.cliente}%`);
            }
            
            if (filtrosAtivos.matricula) {
                query = query.ilike('matricula', `%${filtrosAtivos.matricula}%`);
            }
            
            if (filtrosAtivos.dataEntrada) {
                const dataInicio = `${filtrosAtivos.dataEntrada}T00:00:00`;
                const dataFim = `${filtrosAtivos.dataEntrada}T23:59:59.999Z`;
                query = query.gte('check_in_datetime', dataInicio).lte('check_in_datetime', dataFim);
            }
            
            if (filtrosAtivos.estado) {
                query = query.eq('estado_reserva', filtrosAtivos.estado);
            }
            
            // Ordenar por data de criação (mais recentes primeiro)
            query = query.order('created_at_db', { ascending: false });
            
            // Executar query
            const { data: reservas, error, count } = await query;
            
            if (error) throw error;
            
            // Armazenar dados
            reservasData = reservas || [];
            
            // Atualizar contagem total
            if (reservasTotalCountEl) reservasTotalCountEl.textContent = reservasData.length;
            
            // Renderizar tabela
            renderizarTabelaReservas();
            
        } catch (error) {
            console.error("Erro ao carregar reservas:", error);
            if (reservasTableBodyEl) {
                reservasTableBodyEl.innerHTML = `<tr><td colspan="11" class="text-center py-4 text-red-500">Erro ao carregar reservas: ${error.message}</td></tr>`;
            }
        } finally {
            if (loadingTableSpinnerEl) loadingTableSpinnerEl.classList.add("hidden");
        }
    }

    function renderizarTabelaReservas() {
        if (!reservasTableBodyEl) return;
        
        // Calcular paginação
        const inicio = (paginaAtual - 1) * itensPorPagina;
        const fim = inicio + itensPorPagina;
        const reservasPaginadas = reservasData.slice(inicio, fim);
        
        // Verificar se há reservas
        if (reservasPaginadas.length === 0) {
            reservasTableBodyEl.innerHTML = `<tr><td colspan="11" class="text-center py-4">Nenhuma reserva encontrada.</td></tr>`;
            if (reservasNenhumaMsgEl) reservasNenhumaMsgEl.classList.remove("hidden");
            return;
        }
        
        if (reservasNenhumaMsgEl) reservasNenhumaMsgEl.classList.add("hidden");
        
        // Renderizar linhas da tabela
        let html = '';
        reservasPaginadas.forEach(reserva => {
            html += `
                <tr>
                    <td>${reserva.booking_id || '-'}</td>
                    <td>${formatarData(reserva.data_reserva) || '-'}</td>
                    <td>${reserva.nome_cliente || '-'}</td>
                    <td>${reserva.matricula || '-'}</td>
                    <td>${reserva.alocation || '-'}</td>
                    <td>${formatarDataHora(reserva.check_in_datetime) || '-'}</td>
                    <td>${formatarDataHora(reserva.check_out_datetime) || '-'}</td>
                    <td>${reserva.physical_park_name || '-'}</td>
                    <td>${formatarMoeda(reserva.total_price) || '-'}</td>
                    <td>${formatarEstado(reserva.estado_reserva) || '-'}</td>
                    <td class="actions-cell">
                        <button onclick="window.verReserva('${reserva.id}')" class="bg-blue-500 hover:bg-blue-600 text-white rounded px-2 py-1">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button onclick="window.editarReserva('${reserva.id}')" class="bg-yellow-500 hover:bg-yellow-600 text-white rounded px-2 py-1">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="window.verHistoricoReserva('${reserva.id}')" class="bg-gray-500 hover:bg-gray-600 text-white rounded px-2 py-1">
                            <i class="fas fa-history"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
        
        reservasTableBodyEl.innerHTML = html;
        
        // Renderizar paginação
        renderizarPaginacao();
        
        // Adicionar funções globais para os botões
        window.verReserva = verReserva;
        window.editarReserva = editarReserva;
        window.verHistoricoReserva = verHistoricoReserva;
    }

    function renderizarPaginacao() {
        if (!reservasPaginacaoEl) return;
        
        const totalPaginas = Math.ceil(reservasData.length / itensPorPagina);
        
        let html = '';
        
        // Botão Anterior
        html += `
            <button 
                class="px-3 py-1 rounded ${paginaAtual === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}"
                ${paginaAtual === 1 ? 'disabled' : 'onclick="window.mudarPagina(' + (paginaAtual - 1) + ')"'}
            >
                &laquo;
            </button>
        `;
        
        // Páginas
        const maxPaginas = 5; // Máximo de botões de página a mostrar
        let inicio = Math.max(1, paginaAtual - Math.floor(maxPaginas / 2));
        let fim = Math.min(totalPaginas, inicio + maxPaginas - 1);
        
        if (fim - inicio + 1 < maxPaginas) {
            inicio = Math.max(1, fim - maxPaginas + 1);
        }
        
        for (let i = inicio; i <= fim; i++) {
            html += `
                <button 
                    class="px-3 py-1 rounded ${i === paginaAtual ? 'bg-blue-700 text-white' : 'bg-blue-500 text-white hover:bg-blue-600'}"
                    onclick="window.mudarPagina(${i})"
                >
                    ${i}
                </button>
            `;
        }
        
        // Botão Próxima
        html += `
            <button 
                class="px-3 py-1 rounded ${paginaAtual === totalPaginas ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}"
                ${paginaAtual === totalPaginas ? 'disabled' : 'onclick="window.mudarPagina(' + (paginaAtual + 1) + ')"'}
            >
                &raquo;
            </button>
        `;
        
        reservasPaginacaoEl.innerHTML = html;
        
        // Adicionar função global para mudar página
        window.mudarPagina = mudarPagina;
    }

    function mudarPagina(pagina) {
        paginaAtual = pagina;
        renderizarTabelaReservas();
        window.scrollTo(0, document.querySelector('.table-container').offsetTop - 20);
    }

    // --- Funções de Formulário ---
    function abrirModalNovaReserva() {
        // Limpar formulário
        reservaFormEl.reset();
        reservaFormIdEl.value = '';
        reservaFormBookingIdEl.value = 'Será gerado automaticamente';
        reservaFormBookingIdEl.disabled = true;
        
        // Definir data atual nos campos de data
        const agora = new Date().toISOString().slice(0, 16);
        reservaFormDataReservaEl.value = agora;
        reservaFormDataEntradaEl.value = agora;
        
        // Data de saída padrão (1 dia depois)
        const amanha = new Date();
        amanha.setDate(amanha.getDate() + 1);
        reservaFormDataSaidaEl.value = amanha.toISOString().slice(0, 16);
        
        // Atualizar título
        reservaFormModalTitleEl.textContent = 'Nova Reserva';
        
        // Limpar reserva em edição
        reservaEmEdicao = null;
        
        // Mostrar modal
        reservaFormModalEl.classList.add("active");
    }

    function editarReserva(id) {
        const reserva = reservasData.find(r => r.id === id);
        if (!reserva) {
            console.error("Reserva não encontrada:", id);
            return;
        }
        
        // Preencher formulário
        reservaFormIdEl.value = reserva.id;
        reservaFormBookingIdEl.value = reserva.booking_id || 'Não definido';
        reservaFormBookingIdEl.disabled = true;
        
        reservaFormDataReservaEl.value = reserva.data_reserva ? new Date(reserva.data_reserva).toISOString().slice(0, 16) : '';
        reservaFormNomeClienteEl.value = reserva.nome_cliente || '';
        reservaFormEmailClienteEl.value = reserva.email_cliente || '';
        reservaFormTelefoneClienteEl.value = reserva.telefone_cliente || '';
        reservaFormMatriculaEl.value = reserva.matricula || '';
        reservaFormAlocationEl.value = reserva.alocation || '';
        
        reservaFormDataEntradaEl.value = reserva.check_in_datetime ? new Date(reserva.check_in_datetime).toISOString().slice(0, 16) : '';
        reservaFormDataSaidaEl.value = reserva.check_out_datetime ? new Date(reserva.check_out_datetime).toISOString().slice(0, 16) : '';
        
        if (reserva.physical_park_id) {
            reservaFormParqueEl.value = reserva.physical_park_id;
        } else {
            reservaFormParqueEl.selectedIndex = 0;
        }
        
        reservaFormCampanhaEl.value = reserva.campaign_name || '';
        reservaFormValorEl.value = reserva.total_price || '';
        
        if (reserva.estado_reserva) {
            reservaFormEstadoEl.value = reserva.estado_reserva;
        } else {
            reservaFormEstadoEl.selectedIndex = 0;
        }
        
        reservaFormObservacoesEl.value = reserva.observacoes || '';
        
        // Atualizar título
        reservaFormModalTitleEl.textContent = `Editar Reserva ${reserva.booking_id || ''}`;
        
        // Armazenar reserva em edição
        reservaEmEdicao = reserva;
        
        // Mostrar modal
        reservaFormModalEl.classList.add("active");
    }

    function verReserva(id) {
        // Implementar visualização detalhada da reserva
        console.log("Ver reserva:", id);
        
        // Por enquanto, apenas abre o formulário em modo de edição
        editarReserva(id);
    }

    function verHistoricoReserva(id) {
        const reserva = reservasData.find(r => r.id === id);
        if (!reserva) {
            console.error("Reserva não encontrada:", id);
            return;
        }
        
        // Atualizar título
        logReservaBookingIdEl.textContent = reserva.booking_id || 'Sem ID';
        
        // Carregar histórico
        carregarHistoricoReserva(id);
        
        // Mostrar modal
        reservaLogModalEl.classList.add("active");
    }

    async function carregarHistoricoReserva(id) {
        try {
            // Limpar tabela
            reservaLogTableBodyEl.innerHTML = '<tr><td colspan="4" class="text-center py-4">Carregando histórico...</td></tr>';
            
            // Buscar histórico
            const { data: historico, error } = await supabase
                .from('reservas_log')
                .select('*')
                .eq('reserva_id', id)
                .order('created_at', { ascending: false });
                
            if (error) throw error;
            
            // Verificar se há registros
            if (!historico || historico.length === 0) {
                reservaLogTableBodyEl.innerHTML = '<tr><td colspan="4" class="text-center py-4">Nenhum registro de histórico encontrado.</td></tr>';
                if (reservaLogNenhumaMsgEl) reservaLogNenhumaMsgEl.classList.remove("hidden");
                return;
            }
            
            if (reservaLogNenhumaMsgEl) reservaLogNenhumaMsgEl.classList.add("hidden");
            
            // Renderizar linhas da tabela
            let html = '';
            historico.forEach(log => {
                html += `
                    <tr>
                        <td>${formatarDataHora(log.created_at)}</td>
                        <td>${log.action || '-'}</td>
                        <td>${log.user_name || '-'}</td>
                        <td>${log.details || '-'}</td>
                    </tr>
                `;
            });
            
            reservaLogTableBodyEl.innerHTML = html;
            
        } catch (error) {
            console.error("Erro ao carregar histórico da reserva:", error);
            reservaLogTableBodyEl.innerHTML = `<tr><td colspan="4" class="text-center py-4 text-red-500">Erro ao carregar histórico: ${error.message}</td></tr>`;
        }
    }

    async function salvarReserva() {
        try {
            // Validar formulário
            if (!reservaFormEl.checkValidity()) {
                alert("Por favor, preencha todos os campos obrigatórios.");
                return;
            }
            
            // Obter dados do formulário
            const dadosReserva = {
                data_reserva: reservaFormDataReservaEl.value,
                nome_cliente: reservaFormNomeClienteEl.value,
                email_cliente: reservaFormEmailClienteEl.value,
                telefone_cliente: reservaFormTelefoneClienteEl.value,
                matricula: normalizarMatricula(reservaFormMatriculaEl.value),
                alocation: reservaFormAlocationEl.value,
                check_in_datetime: reservaFormDataEntradaEl.value,
                check_out_datetime: reservaFormDataSaidaEl.value,
                physical_park_id: reservaFormParqueEl.value,
                physical_park_name: reservaFormParqueEl.options[reservaFormParqueEl.selectedIndex].text,
                campaign_name: reservaFormCampanhaEl.value,
                total_price: parseFloat(reservaFormValorEl.value),
                estado_reserva: reservaFormEstadoEl.value,
                observacoes: reservaFormObservacoesEl.value,
                updated_at: new Date().toISOString()
            };
            
            // Obter usuário atual
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                dadosReserva.user_id_last_modified = user.id;
            }
            
            let resultado;
            
            if (reservaEmEdicao) {
                // Atualizar reserva existente
                const { data, error } = await supabase
                    .from('reservas')
                    .update(dadosReserva)
                    .eq('id', reservaEmEdicao.id)
                    .select();
                    
                if (error) throw error;
                resultado = data;
                
                // Registrar no histórico
                await registrarHistoricoReserva(reservaEmEdicao.id, 'Atualização', 'Reserva atualizada');
                
            } else {
                // Criar nova reserva
                // Gerar booking_id
                dadosReserva.booking_id = `RES-${Date.now().toString().slice(-5)}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
                dadosReserva.created_at = new Date().toISOString();
                
                if (user) {
                    dadosReserva.user_id_created = user.id;
                }
                
                const { data, error } = await supabase
                    .from('reservas')
                    .insert(dadosReserva)
                    .select();
                    
                if (error) throw error;
                resultado = data;
                
                // Registrar no histórico
                if (data && data[0]) {
                    await registrarHistoricoReserva(data[0].id, 'Criação', 'Nova reserva criada');
                }
            }
            
            // Fechar modal
            reservaFormModalEl.classList.remove("active");
            
            // Recarregar lista
            await carregarReservas();
            
            // Mostrar mensagem de sucesso
            alert(reservaEmEdicao ? "Reserva atualizada com sucesso!" : "Reserva criada com sucesso!");
            
        } catch (error) {
            console.error("Erro ao salvar reserva:", error);
            alert(`Erro ao salvar reserva: ${error.message}`);
        }
    }

    async function registrarHistoricoReserva(reservaId, acao, detalhes) {
        try {
            // Obter usuário atual
            const { data: { user } } = await supabase.auth.getUser();
            
            const dadosLog = {
                reserva_id: reservaId,
                action: acao,
                details: detalhes,
                created_at: new Date().toISOString()
            };
            
            if (user) {
                dadosLog.user_id = user.id;
                dadosLog.user_name = user.email;
            }
            
            const { error } = await supabase
                .from('reservas_log')
                .insert(dadosLog);
                
            if (error) throw error;
            
        } catch (error) {
            console.error("Erro ao registrar histórico da reserva:", error);
        }
    }

    // --- Funções de Importação/Exportação ---
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
            const { data: { user: importUser } } = await supabase.auth.getUser(); // Obter o utilizador que está a importar

            // Mapeamento mais robusto e adaptado ao schema_final.md
            const mapeamentoColunas = {
                // Coluna no Excel : Coluna no Supabase
                "licensePlate": "matricula", "alocation": "alocation", "bookingPrice": "total_price",
                "action": "last_action", "actionUser": "last_action_user_details", "actionDate": "last_action_date",
                "extraServices": "extra_services", "hasOnlinePayment": "has_online_payment", "stats": "estado_reserva",
                "parkBrand": "park_brand", "parkingPrice": "parking_price", "deliveryPrice": "delivery_price",
                "deliveryName": "delivery_name", "imported": "is_imported", "idClient": "client_external_id",
                "name": "nome_cliente_primeiro", "lastname": "nome_cliente_ultimo", "phoneNumber": "telefone_cliente",
                "carInfo": "car_info_details", "brand": "car_brand", "model": "car_model", "color": "car_color",
                "infoBasedOnLicensePlate": "info_from_license_plate", "carLocation": "car_location_description",
                "checkInVideo": "check_in_video_url", "park": "physical_park_name", "row": "parking_row",
                "spot": "parking_spot", "deliveryLocation": "delivery_location", "taxName": "tax_name",
                "taxNumber": "tax_number", "city": "client_city", "bookingRemarks": "observacoes",
                "terms": "terms_agreed", "campaign": "campaign_name", "campaignPay": "campaign_payment_details",
                "condutorRecolha": "pickup_driver_name", "checkIn": "check_in_datetime",
                "parkingType": "parking_type", "bookingDate": "data_reserva", "returnFlight": "flight_number",
                "checkOut": "check_out_datetime", "email": "email_cliente",
                "Booking ID": "booking_id_excel" // Se o Booking ID vier do Excel e for diferente do gerado
            };
            
            const reservasParaUpsert = jsonData.map(row => {
                const reservaSupabase = {};
                for (const excelCol in mapeamentoColunas) {
                    if (row[excelCol] !== undefined && row[excelCol] !== null) {
                        const supabaseCol = mapeamentoColunas[excelCol];
                        // Tratamento de Datas
                        if (["data_reserva", "check_in_datetime", "check_out_datetime", "last_action_date"].includes(supabaseCol)) {
                            if (row[excelCol] instanceof Date) {
                                reservaSupabase[supabaseCol] = row[excelCol].toISOString();
                            } else if (typeof row[excelCol] === 'number') { // Data do Excel como número
                                reservaSupabase[supabaseCol] = new Date(XLSX.SSF.format("yyyy-mm-dd hh:mm:ss", row[excelCol])).toISOString();
                            } else if (typeof row[excelCol] === 'string' && !isNaN(new Date(row[excelCol]).getTime())) {
                                reservaSupabase[supabaseCol] = new Date(row[excelCol]).toISOString();
                            } else {
                                reservaSupabase[supabaseCol] = null; // Data inválida
                            }
                        } 
                        // Tratamento de Booleanos
                        else if (["has_online_payment", "is_imported", "terms_agreed"].includes(supabaseCol)) {
                            reservaSupabase[supabaseCol] = ['true', '1', 'sim', 'yes', true].includes(String(row[excelCol]).toLowerCase());
                        }
                        // Tratamento de Números (total_price, parking_price, delivery_price)
                        else if (["total_price", "parking_price", "delivery_price"].includes(supabaseCol)) {
                            const valorLimpo = String(row[excelCol]).replace(/[^0-9.,-]/g, '').replace(',', '.');
                            reservaSupabase[supabaseCol] = parseFloat(valorLimpo);
                            if (isNaN(reservaSupabase[supabaseCol])) reservaSupabase[supabaseCol] = null;
                        }
                        else {
                            reservaSupabase[supabaseCol] = row[excelCol];
                        }
                    }
                }

                // Combinar nome e apelido
                let nomeCompleto = "";
                if (reservaSupabase.nome_cliente_primeiro) nomeCompleto += reservaSupabase.nome_cliente_primeiro;
                if (reservaSupabase.nome_cliente_ultimo) nomeCompleto += (nomeCompleto ? " " : "") + reservaSupabase.nome_cliente_ultimo;
                reservaSupabase.nome_cliente = nomeCompleto.trim() || null;
                delete reservaSupabase.nome_cliente_primeiro;
                delete reservaSupabase.nome_cliente_ultimo;

                // Gerar booking_id se não vier do Excel ou se for para ser gerado sempre
                if (!reservaSupabase.booking_id_excel) { // Se não houver uma coluna "Booking ID" no Excel
                    reservaSupabase.booking_id = `IMP-${Date.now().toString().slice(-5)}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
                } else {
                    reservaSupabase.booking_id = reservaSupabase.booking_id_excel; // Usar o do Excel
                }
                delete reservaSupabase.booking_id_excel;


                reservaSupabase.user_id_created = importUser ? importUser.id : null;
                reservaSupabase.created_at = new Date().toISOString();
                reservaSupabase.updated_at = new Date().toISOString();
                reservaSupabase.user_id_last_modified = importUser ? importUser.id : null;
                reservaSupabase.is_imported = true;
                reservaSupabase.last_update_source = 'Import Excel Reservas';
                
                // Garantir que chaves de conflito (matricula, alocation) existem
                if (!reservaSupabase.matricula || !reservaSupabase.alocation) {
                    console.warn("Reserva ignorada por falta de matrícula ou alocation:", reservaSupabase);
                    return null; // Ignorar esta reserva
                }
                reservaSupabase.matricula = normalizarMatricula(reservaSupabase.matricula);


                return reservaSupabase;
            }).filter(Boolean); // Remover nulos (reservas ignoradas)

            console.log("Reservas para Upsert:", reservasParaUpsert);

            if (reservasParaUpsert.length > 0) {
                // Usar UPSERT: se a combinação matricula + alocation já existir, atualiza. Senão, insere.
                const { data: upsertedData, error: upsertError } = await supabase
                    .from("reservas")
                    .upsert(reservasParaUpsert, { 
                        onConflict: 'matricula,alocation', // Colunas para verificar conflito
                        returning: "minimal" // Não precisamos dos dados de retorno
                    });
                
                if (upsertError) throw upsertError;
                
                // Atualizar status
                if (importacaoStatusEl) {
                    importacaoStatusEl.textContent = `Importação concluída com sucesso! ${reservasParaUpsert.length} reservas processadas.`;
                    importacaoStatusEl.classList.remove("text-red-500");
                    importacaoStatusEl.classList.add("text-green-500");
                }
                
                // Recarregar lista
                await carregarReservas();
                
                // Recarregar dashboard
                await carregarDashboard();
                
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

    async function exportarReservas() {
        try {
            // Obter todas as reservas (com filtros aplicados)
            let query = supabase
                .from('reservas')
                .select('*');
            
            // Aplicar filtros
            if (filtrosAtivos.termo) {
                query = query.or(`booking_id.ilike.%${filtrosAtivos.termo}%,matricula.ilike.%${filtrosAtivos.termo}%,alocation.ilike.%${filtrosAtivos.termo}%,nome_cliente.ilike.%${filtrosAtivos.termo}%`);
            }
            
            if (filtrosAtivos.cliente) {
                query = query.ilike('nome_cliente', `%${filtrosAtivos.cliente}%`);
            }
            
            if (filtrosAtivos.matricula) {
                query = query.ilike('matricula', `%${filtrosAtivos.matricula}%`);
            }
            
            if (filtrosAtivos.dataEntrada) {
                const dataInicio = `${filtrosAtivos.dataEntrada}T00:00:00`;
                const dataFim = `${filtrosAtivos.dataEntrada}T23:59:59.999Z`;
                query = query.gte('check_in_datetime', dataInicio).lte('check_in_datetime', dataFim);
            }
            
            if (filtrosAtivos.estado) {
                query = query.eq('estado_reserva', filtrosAtivos.estado);
            }
            
            // Ordenar por data de criação (mais recentes primeiro)
            query = query.order('created_at_db', { ascending: false });
            
            // Executar query
            const { data: reservas, error } = await query;
            
            if (error) throw error;
            
            if (!reservas || reservas.length === 0) {
                alert("Não há reservas para exportar com os filtros atuais.");
                return;
            }
            
            // Preparar dados para exportação
            const dadosExportacao = reservas.map(reserva => {
                return {
                    'ID': reserva.booking_id || '',
                    'Data Reserva': formatarData(reserva.data_reserva) || '',
                    'Cliente': reserva.nome_cliente || '',
                    'Email': reserva.email_cliente || '',
                    'Telefone': reserva.telefone_cliente || '',
                    'Matrícula': reserva.matricula || '',
                    'Alocation': reserva.alocation || '',
                    'Check-in': formatarDataHora(reserva.check_in_datetime) || '',
                    'Check-out': formatarDataHora(reserva.check_out_datetime) || '',
                    'Parque': reserva.physical_park_name || '',
                    'Valor': reserva.total_price || '',
                    'Estado': reserva.estado_reserva || '',
                    'Campanha': reserva.campaign_name || '',
                    'Observações': reserva.observacoes || ''
                };
            });
            
            // Criar workbook
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(dadosExportacao);
            
            // Adicionar worksheet ao workbook
            XLSX.utils.book_append_sheet(wb, ws, "Reservas");
            
            // Gerar nome do ficheiro
            const dataHora = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
            const nomeArquivo = `Reservas_Export_${dataHora}.xlsx`;
            
            // Exportar
            XLSX.writeFile(wb, nomeArquivo);
            
        } catch (error) {
            console.error("Erro ao exportar reservas:", error);
            alert(`Erro ao exportar reservas: ${error.message}`);
        }
    }

    // --- Funções Utilitárias ---
    function formatarData(dataStr) {
        if (!dataStr) return '';
        
        try {
            const data = new Date(dataStr);
            return data.toLocaleDateString('pt-PT');
        } catch (e) {
            return dataStr;
        }
    }

    function formatarDataHora(dataStr) {
        if (!dataStr) return '';
        
        try {
            const data = new Date(dataStr);
            return `${data.toLocaleDateString('pt-PT')} ${data.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}`;
        } catch (e) {
            return dataStr;
        }
    }

    function formatarMoeda(valor) {
        if (valor === null || valor === undefined) return '';
        
        return new Intl.NumberFormat('pt-PT', {
            style: 'currency',
            currency: 'EUR'
        }).format(valor);
    }

    function formatarEstado(estado) {
        if (!estado) return '';
        
        const estados = {
            'pendente': 'Pendente',
            'confirmada': 'Confirmada',
            'cancelada': 'Cancelada',
            'concluida': 'Concluída'
        };
        
        return estados[estado] || estado;
    }

    // --- Inicialização da Página ---
    initReservasPage();
});
