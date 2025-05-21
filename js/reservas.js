// js/reservas.js - Lógica para a Subaplicação de Gestão de Reservas (Versão corrigida sem booking_id)

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
    // Removido: const logReservaBookingIdEl = document.getElementById("logReservaBookingId");
    const reservaLogTableBodyEl = document.getElementById("reservaLogTableBody");
    const reservaLogNenhumaMsgEl = document.getElementById("reservaLogNenhumaMsg");
    const resFecharLogModalBtns = document.querySelectorAll(".resFecharLogModalBtn");

    const voltarDashboardBtnReservasEl = document.getElementById("voltarDashboardBtnReservas");
    
    // Mapeamento de IDs de campos do formulário HTML para as colunas da BD Supabase
    const formHtmlIdsToSupabaseMap = {
        // Removido: reservaFormBookingId: "booking_id",
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
            query = query.or(`name_cliente.ilike.%${filtros.searchTerm}%,license_plate.ilike.%${filtros.searchTerm}%,alocation.ilike.%${filtros.searchTerm}%`);
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
            if (filtros.searchTerm) query = query.or(`name_cliente.ilike.%${filtros.searchTerm}%,license_plate.ilike.%${filtros.searchTerm}%,alocation.ilike.%${filtros.searchTerm}%`);
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
                if (filtros.searchTerm) query = query.or(`name_cliente.ilike.%${filtros.searchTerm}%,license_plate.ilike.%${filtros.searchTerm}%,alocation.ilike.%${filtros.searchTerm}%`);
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
                        <td class="py-3 px-4 text-xs">${reserva.id_pk || "N/A"}</td>
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
                            <button class="text-gray-600 hover:text-gray-800 log-reserva-btn ml-2" data-reserva-pk="${reserva.id_pk}">Hist.</button>
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
                "idClient": "id_cliente_externo"
                // Removido: "bookingId": "booking_id"
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
                
                // Removido: Geração de booking_id
                
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
                const reservaPk = btn.getAttribute('data-reserva-pk');
                if (reservaPk) {
                    await abrirModalLogReserva(reservaPk);
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
