// js/cancelamentos_multipark.js - Lógica para a Subaplicação de Gestão de Cancelamentos

document.addEventListener("DOMContentLoaded", async () => {
    // --- Verificação e Inicialização do Cliente Supabase ---
    if (typeof window.getSupabaseClient !== 'function') {
        console.error("ERRO CRÍTICO (cancelamentos.js): getSupabaseClient não está definido.");
        alert("Erro crítico na config. da aplicação (Cancelamentos). Contacte o suporte.");
        return;
    }
    const supabase = window.getSupabaseClient();
    if (!supabase) {
        console.error("ERRO CRÍTICO (cancelamentos.js): Cliente Supabase não disponível.");
        alert("Erro crítico ao conectar com o sistema (Cancelamentos). Contacte o suporte.");
        return;
    }
    if (typeof flatpickr !== "undefined") {
        flatpickr.localize(flatpickr.l10ns.pt);
    } else {
        console.warn("Flatpickr não carregado (Cancelamentos).");
    }

    let currentUser = null;
    let userProfile = null;
    let motivosCancelamentoDistintosCache = [];

    // --- Seletores de Elementos DOM (Consistentes com cancelamentos.html) ---
    const importCancelamentosFileEl = document.getElementById('importCancelamentosFile');
    const cancProcessarImportacaoBtnEl = document.getElementById('cancProcessarImportacaoBtn');
    const importacaoCancelamentosStatusEl = document.getElementById('importacaoCancelamentosStatus');
    const loadingCancelamentosImportSpinnerEl = document.getElementById('loadingCancelamentosImportSpinner');

    const cancDashboardFiltroDataInicioEl = document.getElementById('cancDashboardFiltroDataInicio');
    const cancDashboardFiltroDataFimEl = document.getElementById('cancDashboardFiltroDataFim');
    const cancDashboardFiltroPeriodoEl = document.getElementById('cancDashboardFiltroPeriodo');
    const cancDashboardFiltroMotivoEl = document.getElementById('cancDashboardFiltroMotivo');
    const cancAplicarFiltrosDashboardBtnEl = document.getElementById('cancAplicarFiltrosDashboardBtn');

    const statTotalCancelamentosEl = document.getElementById('statTotalCancelamentos');
    const statTotalCancelamentosPeriodoEl = document.getElementById('statTotalCancelamentosPeriodo');
    const statPercCancelamentosEl = document.getElementById('statPercCancelamentos');
    const statPercCancelamentosPeriodoEl = document.getElementById('statPercCancelamentosPeriodo');
    const statCancelamentosSemMotivoEl = document.getElementById('statCancelamentosSemMotivo');
    const statCancelamentosSemMotivoPeriodoEl = document.getElementById('statCancelamentosSemMotivoPeriodo');
    const statValorPerdidoCancelamentosEl = document.getElementById('statValorPerdidoCancelamentos');
    const statValorPerdidoCancelamentosPeriodoEl = document.getElementById('statValorPerdidoCancelamentosPeriodo');

    const cancDashboardDataHoraInputEl = document.getElementById('cancDashboardDataHoraInput');
    const cancDashboardDataHoraDisplayEl = document.getElementById('cancDashboardDataHoraDisplay');
    const chartCancelamentosPorHoraEl = document.getElementById('chartCancelamentosPorHora')?.getContext('2d');
    const chartMotivosCancelamentoEl = document.getElementById('chartMotivosCancelamento')?.getContext('2d');

    const cancFiltroBookingIdListaEl = document.getElementById('cancFiltroBookingIdLista');
    const cancFiltroMatriculaListaEl = document.getElementById('cancFiltroMatriculaLista');
    const cancFiltroDataCancelamentoListaEl = document.getElementById('cancFiltroDataCancelamentoLista');
    const cancFiltroMotivoListaEl = document.getElementById('cancFiltroMotivoLista');
    const cancAplicarFiltrosListaBtnEl = document.getElementById('cancAplicarFiltrosListaBtn');
    const cancelamentosTableBodyEl = document.getElementById('cancelamentosTableBody');
    const cancelamentosNenhumaMsgEl = document.getElementById('cancelamentosNenhumaMsg');
    const cancelamentosPaginacaoEl = document.getElementById('cancelamentosPaginacao');
    const loadingCancelamentosTableSpinnerEl = document.getElementById('loadingCancelamentosTableSpinner');
    const cancelamentosTotalCountEl = document.getElementById('cancelamentosTotalCount');
    
    const cancExportarListaBtnEl = document.getElementById('cancExportarListaBtn');
    const cancAbrirModalNovoBtnEl = document.getElementById('cancAbrirModalNovoBtn');
    const voltarDashboardBtnCancelamentosEl = document.getElementById('voltarDashboardBtnCancelamentos');

    const cancelamentoFormModalEl = document.getElementById('cancelamentoFormModal');
    const cancelamentoFormModalTitleEl = document.getElementById('cancelamentoFormModalTitle');
    const cancelamentoFormEl = document.getElementById('cancelamentoForm');
    const cancelamentoFormReservaIdPkEl = document.getElementById('cancelamentoFormReservaIdPk');
    const cancelamentoFormMatriculaEl = document.getElementById('cancelamentoFormMatricula');
    const cancelamentoFormAlocationEl = document.getElementById('cancelamentoFormAlocation');
    const cancBuscarReservaBtnEl = document.getElementById('cancBuscarReservaBtn');
    const dadosReservaOriginalInfoEl = document.getElementById('dadosReservaOriginalInfo');
    const infoBookingIdCancEl = document.getElementById('infoBookingIdCanc');
    const infoClienteCancEl = document.getElementById('infoClienteCanc');
    const infoDatasCancEl = document.getElementById('infoDatasCanc');
    const infoEstadoAtualCancEl = document.getElementById('infoEstadoAtualCanc');
    const cancelamentoFormDataEl = document.getElementById('cancelamentoFormData');
    const cancelamentoFormMotivoSelectEl = document.getElementById('cancelamentoFormMotivoSelect');
    const cancelamentoFormMotivoTextoEl = document.getElementById('cancelamentoFormMotivoTexto');
    const cancelamentoFormQuemCancelouEl = document.getElementById('cancelamentoFormQuemCancelou');
    const cancelamentoFormTipoEl = document.getElementById('cancelamentoFormTipo');
    const cancFecharModalBtns = document.querySelectorAll('.cancFecharModalBtn');
    const cancelamentoFormStatusEl = document.getElementById('cancelamentoFormStatus');
    const loadingModalSpinnerCancelamentoEl = document.getElementById("loadingModalSpinnerCancelamento");

    let paginaAtualCancelamentos = 1;
    const itensPorPaginaCancelamentos = 15;
    let graficoCancelamentosPorHora, graficoMotivosCancelamento;

    // --- Funções Utilitárias ---
    function formatarDataHora(dataISO, includeSeconds = false) {
        if (!dataISO) return "N/A";
        try {
            const date = new Date(dataISO);
            if (isNaN(date.getTime())) return "Data Inválida";
            const options = { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" };
            if (includeSeconds) options.second = "2-digit";
            return date.toLocaleString("pt-PT", options);
        } catch (e) { console.warn("Erro formatar data-hora (Cancelamentos):", dataISO, e); return String(dataISO).split('T')[0]; }
    }
    function formatarDataParaInputDateTimeLocal(dataISO) {
        if (!dataISO) return "";
        try {
            const d = new Date(dataISO);
            if (isNaN(d.getTime())) return "";
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}T${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
        } catch (e) { console.warn("Erro formatar data input datetime-local (Cancelamentos):", dataISO, e); return ""; }
    }
     function formatarDataParaInputDate(dataISO) {
        if (!dataISO) return "";
        try {
            const d = new Date(dataISO);
            if (isNaN(d.getTime())) return "";
            return d.toISOString().split('T')[0];
        } catch (e) { console.warn("Erro formatar data input date (Cancelamentos):", dataISO, e); return "";}
    }
    function converterDataParaISO(dataStr) { 
        if (!dataStr) return null;
        if (dataStr instanceof Date) {
            if (isNaN(dataStr.getTime())) { console.warn(`Data inválida para ISO:`, dataStr); return null; }
            return dataStr.toISOString().split('.')[0];
        }
        const formatos = [
            { regex: /^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})/, d: 1, m: 2, a: 3, h: 4, min: 5 },
            { regex: /^(\d{2})\/(\d{2})\/(\d{4})$/, d: 1, m: 2, a: 3, h: null, min: null },
            { regex: /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/, a: 1, m: 2, d: 3, h: 4, min: 5 } 
        ];
        for (const fmt of formatos) {
            const match = String(dataStr).match(fmt.regex);
            if (match) {
                const ano = match[fmt.a]; const mes = match[fmt.m].padStart(2, '0'); const dia = match[fmt.d].padStart(2, '0');
                const hora = fmt.h ? match[fmt.h].padStart(2, '0') : '00'; const minuto = fmt.min ? match[fmt.min].padStart(2, '0') : '00';
                return `${ano}-${mes}-${dia}T${hora}:${minuto}:00`;
            }
        }
        try { const d = new Date(dataStr); if (!isNaN(d.getTime())) return d.toISOString().split('.')[0]; } catch(e) {}
        console.warn(`Formato de data não reconhecido para ISO (Cancelamentos): "${dataStr}"`);
        return null;
    }
    function validarCampoNumerico(valor) { 
        if (valor === null || valor === undefined || String(valor).trim() === "") return null;
        let numStr = String(valor).replace(',', '.').replace(/[^\d.-]/g, '');
        const numero = parseFloat(numStr);
        return isNaN(numero) ? null : numero;
    }
    function mostrarSpinner(spinnerId, show = true) { document.getElementById(spinnerId)?.classList.toggle('hidden', !show); }
    function formatarMoeda(valor) {
        const num = parseFloat(valor);
        if (isNaN(num)) return "0,00 €";
        return num.toLocaleString("pt-PT", { style: "currency", currency: "EUR" });
    }
    function normalizarMatricula(matricula) { 
        if (!matricula) return null;
        return String(matricula).replace(/[\s\-\.]/g, '').toUpperCase();
    }

    // --- Carregar Motivos de Cancelamento Distintos ---
    async function carregarMotivosDistintosParaFiltros() {
        // ... (código da resposta anterior para esta função, parece OK) ...
    }
    // (Função popularSelectMotivos também como na resposta anterior)

    // --- Lógica de Importação de Ficheiro de Cancelamentos ---
    async function processarFicheiroCancelamentosImport() {
        // ... (adaptar a lógica de importação de entregas/recolhas)
        // Foco: encontrar reserva por booking_id ou matricula+alocation
        // Atualizar: estado_reserva_atual="Cancelado", data_cancelamento_registo, motivo_cancelamento_texto, user_id_cancelamento, cancel_type
        // Usar mapeamentoCancelamentos que definiste
    }
    
    // --- Lógica da Lista de Cancelamentos (READ) ---
    async function carregarCancelamentosDaLista(pagina = 1, filtrosParams = null) {
        // ... (adaptar lógica de entregas/recolhas)
        // Query: .eq('estado_reserva_atual', 'Cancelado') e outros filtros
        // Colunas a mostrar: Booking ID, Matrícula, Alocation, Cliente, Data Cancelamento, Motivo, Parque, Cancelado Por
    }
    function atualizarPaginacaoCancelamentosLista(paginaCorrente, totalItens) { /* ... */ }
    function obterFiltrosCancelamentosLista() { /* ... */ }
    // getEstadoClass pode não ser tão necessária aqui se só listamos "Cancelado", ou pode ser usada para consistência.

    // --- Lógica do Dashboard de Cancelamentos ---
    async function carregarDadosDashboardCancelamentos() {
        // ... (implementar queries/RPCs para:
        //      - statTotalCancelamentos,
        //      - statPercCancelamentos (requer total de reservas no período),
        //      - statCancelamentosSemMotivo,
        //      - statValorPerdidoCancelamentos (soma de booking_price das canceladas),
        //      - chartCancelamentosPorHora,
        //      - chartMotivosCancelamento (pie/donut chart seria bom)
        // )
    }
    
    // --- Modal de Registo de Cancelamento Manual ---
    function configurarBotoesAcaoCancelamentos(){ /* ... (botão para ver detalhes da reserva original, talvez?) ... */ }
    async function abrirModalNovoCancelamento() { /* ... (preparar modal para novo cancelamento) ... */ }
    async function buscarDadosReservaParaCancelarManualmente() { /* ... (lógica do teu JS anterior) ... */ }
    async function submeterFormularioCancelamentoManual(event) { /* ... (lógica do teu JS anterior, adaptada) ... */ }

    // --- Configuração de Event Listeners ---
    function configurarEventosCancelamentos() { /* ... (todos os listeners para botões, filtros, modal) ... */ }

    // --- Inicialização da Página de Cancelamentos ---
    async function initCancelamentosPage() {
        console.log("Cancelamentos.js: Iniciando initCancelamentosPage...");
        if (!currentUser) { console.warn("Cancelamentos.js: currentUser não definido."); return; }
        console.log("Cancelamentos.js: Utilizador autenticado, prosseguindo com init.");
        
        configurarEventosCancelamentos();
        await carregarMotivosDistintosParaFiltros();
        
        const dateInputs = [ /* IDs dos inputs de data flatpickr para Cancelamentos */ ];
        dateInputs.forEach(el => { if (el) flatpickr(el, { dateFormat: "Y-m-d", locale: "pt", allowInput: true }); });
        // ... (flatpickr para datetime-local no modal) ...
        
        if (cancDashboardFiltroPeriodoEl) cancDashboardFiltroPeriodoEl.dispatchEvent(new Event('change'));
        else await carregarDadosDashboardCancelamentos();
        
        await carregarCancelamentosDaLista(1, obterFiltrosCancelamentosLista());
        console.log("Subaplicação de Gestão de Cancelamentos inicializada.");
    }
    
    // Bloco de Inicialização e Autenticação (IIFE)
    (async () => {
        try {
            if (typeof window.checkAuthStatus !== 'function') { console.error("ERRO CRÍTICO (Cancelamentos): checkAuthStatus não definido."); alert("Erro config Auth (Cancelamentos)."); return; }
            await window.checkAuthStatus(); 
            const { data: { user: supabaseUser }, error: authError } = await supabase.auth.getUser();
            if (authError) { console.error("Cancelamentos: Erro getUser():", authError); window.location.href = "index.html"; return; }
            currentUser = supabaseUser;
            if (currentUser) {
                const userProfileStr = localStorage.getItem('userProfile');
                if (userProfileStr) { try { userProfile = JSON.parse(userProfileStr); } catch (e) { console.error("Erro parse userProfile (Cancelamentos):", e);}}
                initCancelamentosPage();
            } else { console.warn("Cancelamentos: Utilizador não autenticado. Redirecionando."); window.location.href = "index.html"; }
        } catch (e) { console.error("Erro inicialização Cancelamentos:", e); alert("Erro crítico ao iniciar Cancelamentos.");}
    })();
});
