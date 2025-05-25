// js/recolhas.js - Lógica para a Subaplicação de Gestão de Recolhas

document.addEventListener("DOMContentLoaded", async () => {
    // --- Verificação e Inicialização do Cliente Supabase ---
    if (typeof window.getSupabaseClient !== 'function') {
        console.error("ERRO CRÍTICO (recolhas.js): getSupabaseClient não está definido.");
        alert("Erro crítico na configuração da aplicação (Recolhas). Contacte o suporte.");
        return;
    }
    const supabase = window.getSupabaseClient();
    if (!supabase) {
        console.error("ERRO CRÍTICO (recolhas.js): Cliente Supabase não disponível.");
        alert("Erro crítico ao conectar com o sistema (Recolhas). Contacte o suporte.");
        return;
    }
    if (typeof flatpickr !== "undefined") {
        flatpickr.localize(flatpickr.l10ns.pt);
    } else {
        console.warn("Flatpickr não carregado (Recolhas).");
    }

    let currentUser = null;
    let userProfile = null;
    let listaCondutoresCache = [];

    // --- Seletores de Elementos DOM ---
    const importRecolhasFileEl = document.getElementById("importRecolhasFile");
    const processarImportacaoRecolhasBtnEl = document.getElementById("processarImportacaoRecolhasBtn");
    const importacaoRecolhasStatusEl = document.getElementById("importacaoRecolhasStatus");
    const loadingImportRecolhasSpinnerEl = document.getElementById("loadingImportRecolhasSpinner");

    const recFiltroMatriculaEl = document.getElementById("recFiltroMatricula");
    const recFiltroAlocationEl = document.getElementById("recFiltroAlocation");
    const recFiltroDataRecolhaInicioEl = document.getElementById("recFiltroDataRecolhaInicio");
    const recFiltroDataRecolhaFimEl = document.getElementById("recFiltroDataRecolhaFim");
    const recFiltroCondutorRecolhaEl = document.getElementById("recFiltroCondutorRecolha");
    const recFiltroEstadoReservaEl = document.getElementById("recFiltroEstadoReserva");
    const recAplicarFiltrosBtnEl = document.getElementById("recAplicarFiltrosBtn");
    
    const recolhasTableBodyEl = document.getElementById("recolhasTableBody");
    const recolhasNenhumaMsgEl = document.getElementById("recolhasNenhumaMsg");
    const recolhasPaginacaoEl = document.getElementById("recolhasPaginacao");
    const loadingRecolhasTableSpinnerEl = document.getElementById("loadingRecolhasTableSpinner");
    const recolhasTotalCountEl = document.getElementById("recolhasTotalCount");
    
    const voltarDashboardBtnRecolhasEl = document.getElementById("voltarDashboardBtnRecolhas");

    // Dashboard de Recolhas
    const recolhasDashboardFiltroDataInicioEl = document.getElementById("recolhasDashboardFiltroDataInicio");
    const recolhasDashboardFiltroDataFimEl = document.getElementById("recolhasDashboardFiltroDataFim");
    const recolhasDashboardFiltroPeriodoEl = document.getElementById("recolhasDashboardFiltroPeriodo");
    const recolhasAplicarFiltrosDashboardBtnEl = document.getElementById("recolhasAplicarFiltrosDashboardBtn");
    const statTotalRecolhasDashboardEl = document.getElementById("statTotalRecolhasDashboard");
    const statTotalRecolhasPeriodoDashboardEl = document.getElementById("statTotalRecolhasPeriodoDashboard");
    const statMediaRecolhasDiaDashboardEl = document.getElementById("statMediaRecolhasDiaDashboard");
    const statMediaRecolhasDiaPeriodoDashboardEl = document.getElementById("statMediaRecolhasDiaPeriodoDashboard");
    const recolhasDashboardDataHoraInputEl = document.getElementById("recolhasDashboardDataHoraInput");
    const recolhasDashboardDataHoraDisplayEl = document.getElementById("recolhasDashboardDataHoraDisplay");
    const chartRecolhasPorHoraDashboardEl = document.getElementById("chartRecolhasPorHoraDashboard")?.getContext('2d');
    const chartTopCondutoresRecolhasDashboardEl = document.getElementById("chartTopCondutoresRecolhasDashboard")?.getContext('2d');

    // Modal de Detalhes/Registo de Recolha
    const recolhaDetalhesModalEl = document.getElementById('recolhaDetalhesModal');
    const recolhaModalTitleEl = document.getElementById('recolhaModalTitle');
    const recolhaDetalhesFormEl = document.getElementById('recolhaDetalhesForm');
    const recolhaModalReservaIdPkEl = document.getElementById('recolhaModalReservaIdPk');
    const modalInfoBookingIdEl = document.getElementById('modalInfoBookingId');
    const modalInfoMatriculaEl = document.getElementById('modalInfoMatricula');
    const modalInfoAlocationEl = document.getElementById('modalInfoAlocation');
    const modalInfoNomeClienteEl = document.getElementById('modalInfoNomeCliente');
    const modalInfoCheckinPrevistoEl = document.getElementById('modalInfoCheckinPrevisto');
    const modalInfoParquePrevistoEl = document.getElementById('modalInfoParquePrevisto');
    const modalRecolhaDataRealEl = document.getElementById('modalRecolhaDataReal');
    const modalRecolhaCondutorEl = document.getElementById('modalRecolhaCondutor');
    const modalRecolhaKmsEntradaEl = document.getElementById('modalRecolhaKmsEntrada');
    const modalRecolhaDanosObservadosEl = document.getElementById('modalRecolhaDanosObservados');
    const modalRecolhaFotosEl = document.getElementById('modalRecolhaFotos');
    const modalRecolhaFotosPreviewEl = document.getElementById('modalRecolhaFotosPreview');
    const modalRecolhaFotosUrlsExistentesEl = document.getElementById('modalRecolhaFotosUrlsExistentes');
    const modalRecolhaObsInternasEl = document.getElementById('modalRecolhaObsInternas');
    const modalRecolhaNovoEstadoReservaEl = document.getElementById('modalRecolhaNovoEstadoReserva');
    const recolhaModalStatusEl = document.getElementById('recolhaModalStatus');
    const recFecharModalBtns = document.querySelectorAll(".recFecharModalBtn");
    const loadingModalSpinnerRecolhaEl = document.getElementById("loadingModalSpinnerRecolha");

    let paginaAtualRecolhas = 1;
    const itensPorPaginaRecolhas = 15;
    let graficoRecolhasPorHoraDashboard, graficoTopCondutoresRecolhasDashboard;

    // --- Funções Utilitárias ---
    function formatarDataHora(dataISO, includeSeconds = false) {
        if (!dataISO) return "N/A";
        try {
            const date = new Date(dataISO);
            if (isNaN(date.getTime())) return "Data Inválida";
            const options = { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" };
            if (includeSeconds) options.second = "2-digit";
            return date.toLocaleString("pt-PT", options);
        } catch (e) { console.warn("Erro formatar data-hora (Recolhas):", dataISO, e); return String(dataISO).split('T')[0]; }
    }

    function formatarDataParaInputDateTimeLocal(dataISO) {
        if (!dataISO) return "";
        try {
            const d = new Date(dataISO);
            if (isNaN(d.getTime())) return "";
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}T${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
        } catch (e) { console.warn("Erro formatar data input datetime-local (Recolhas):", dataISO, e); return ""; }
    }
    
    function formatarDataParaInputDate(dataISO) {
        if (!dataISO) return "";
        try {
            const d = new Date(dataISO);
            if (isNaN(d.getTime())) return "";
            return d.toISOString().split('T')[0];
        } catch (e) { console.warn("Erro formatar data input date (Recolhas):", dataISO, e); return "";}
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
        console.warn(`Formato de data não reconhecido para ISO (Recolhas): "${dataStr}"`);
        return null;
    }

    function validarCampoNumerico(valor) {
        if (valor === null || valor === undefined || String(valor).trim() === "") return null;
        let numStr = String(valor).replace(',', '.').replace(/[^\d.-]/g, '');
        const numero = parseFloat(numStr);
        return isNaN(numero) ? null : numero;
    }

    function mostrarSpinner(spinnerId, show = true) {
        const el = document.getElementById(spinnerId);
        if(el) el.classList.toggle('hidden', !show);
    }
    
    function normalizarMatricula(matricula) {
        if (!matricula) return null;
        return String(matricula).replace(/[\s\-\.]/g, '').toUpperCase();
    }

    async function obterEntidadeIdPorNomeComRPC(nomeEntidade, rpcName = 'obter_condutor_id_por_nome', paramName = 'p_nome_condutor') {
         if (!nomeEntidade || String(nomeEntidade).trim() === "") {
            console.warn(`RPC ${rpcName}: Nome da entidade vazio.`);
            return null;
        }
        try {
            const nomeNormalizado = String(nomeEntidade).trim();
            const params = {};
            params[paramName] = nomeNormalizado;
            const { data, error } = await supabase.rpc(rpcName, params);
            if (error) { console.error(`Erro RPC ${rpcName} para "${nomeNormalizado}":`, error); return null; }
            return data; 
        } catch (error) {
            console.error(`Exceção RPC ${rpcName} para "${nomeEntidade}":`, error);
            return null;
        }
    }
    
    // --- Carregar Condutores ---
    async function carregarCondutoresParaSelects() {
        if (listaCondutoresCache.length > 0) {
            popularSelectCondutores(recFiltroCondutorRecolhaEl, listaCondutoresCache, "Todos Condutores");
            popularSelectCondutores(modalRecolhaCondutorEl, listaCondutoresCache, "Selecione o Condutor");
            return;
        }
        try {
            const { data, error } = await supabase.from('profiles')
                .select('id, full_name, username')
                .order('full_name');
            if (error) throw error;
            listaCondutoresCache = data || [];
            popularSelectCondutores(recFiltroCondutorRecolhaEl, listaCondutoresCache, "Todos Condutores");
            popularSelectCondutores(modalRecolhaCondutorEl, listaCondutoresCache, "Selecione o Condutor");
        } catch (error) {
            console.error("Erro ao carregar condutores (Recolhas):", error);
        }
    }

    function popularSelectCondutores(selectEl, condutores, textoPrimeiraOpcao = "Todos") {
        if (!selectEl) return;
        const valorGuardado = selectEl.value;
        selectEl.innerHTML = `<option value="">${textoPrimeiraOpcao}</option>`;
        condutores.forEach(cond => {
            const option = document.createElement('option');
            option.value = cond.id;
            option.textContent = cond.full_name || cond.username || `ID: ${cond.id.substring(0,6)}`;
            selectEl.appendChild(option);
        });
        if (Array.from(selectEl.options).some(opt => opt.value === valorGuardado)) {
            selectEl.value = valorGuardado;
        }
    }

    // --- Lógica de Importação de Ficheiro de Recolhas ---
    async function processarFicheiroRecolhasImport() {
        const ficheiro = importRecolhasFileEl.files[0];
        if (!ficheiro) {
            importacaoRecolhasStatusEl.textContent = 'Por favor, selecione um ficheiro.';
            importacaoRecolhasStatusEl.className = 'mt-3 text-sm text-red-600'; return;
        }
        importacaoRecolhasStatusEl.textContent = 'A processar ficheiro...';
        importacaoRecolhasStatusEl.className = 'mt-3 text-sm text-blue-600';
        mostrarSpinner('loadingImportRecolhasSpinner', true);
        if(processarImportacaoRecolhasBtnEl) processarImportacaoRecolhasBtnEl.disabled = true;

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const fileData = new Uint8Array(e.target.result);
                const workbook = XLSX.read(fileData, { type: 'array', cellDates: true });
                const nomePrimeiraFolha = workbook.SheetNames[0];
                const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[nomePrimeiraFolha], { raw: false, defval: null });

                if (jsonData.length === 0) throw new Error('Ficheiro vazio ou dados ilegíveis.');
                importacaoRecolhasStatusEl.textContent = `A processar ${jsonData.length} registos...`;

                let atualizacoesSucesso = 0, erros = 0, ignoradas = 0, naoEncontradas = 0;

                const mapeamentoRecolhas = { // Chaves Excel (lowercase, sem espaços) -> Colunas Supabase
                    "licenseplate": "license_plate", "alocation": "alocation", "bookingid": "booking_id_excel",
                    "actiondate": "action_date", // Usado como action_date na tabela reservas
                    "checkin": "data_entrada_real", // Principal data da recolha
                    "checkindate": "data_entrada_real", // Alternativa
                    "condutorrecolha": "_condutor_nome_excel",
                    "kmsentrada": "kms_entrada",
                    "danoscheckin": "danos_checkin", "danos check-in": "danos_checkin",
                    "observacoesrecolha": "observacoes_recolha",
                    "stats": "estado_reserva_atual_import", // 'recolhido', 'em curso', etc.
                    "checkinvideo": "checkin_video_url", // Se vier URL do vídeo do Excel
                    "parkbrand": "_parque_codigo_excel", // Para lookup do parque_id
                    // Adicionar outros campos do Excel de Recolhas aqui
                };
                
                const loteSize = 50;
                for (let i = 0; i < jsonData.length; i += loteSize) {
                    const loteJson = jsonData.slice(i, i + loteSize);
                    const promessasLote = loteJson.map(async (rowExcelOriginal) => {
                        const rowExcel = {}; Object.keys(rowExcelOriginal).forEach(k => rowExcel[k.toLowerCase().replace(/\s+/g, '')] = rowExcelOriginal[k]);
                        
                        const dadosUpdate = {}; let identReserva = {};

                        for (const excelColNorm in mapeamentoRecolhas) {
                            if (rowExcel.hasOwnProperty(excelColNorm) && rowExcel[excelColNorm] !== null && rowExcel[excelColNorm] !== undefined) {
                                const valorOriginal = rowExcel[excelColNorm];
                                const supabaseCol = mapeamentoRecolhas[excelColNorm];

                                if (supabaseCol === "license_plate") identReserva.license_plate = normalizarMatricula(String(valorOriginal));
                                else if (supabaseCol === "alocation") identReserva.alocation = String(valorOriginal).trim();
                                else if (supabaseCol === "booking_id_excel") identReserva.booking_id = String(valorOriginal).trim();
                                else if (supabaseCol === "data_entrada_real" || supabaseCol === "action_date") dadosUpdate[supabaseCol] = converterDataParaISO(valorOriginal);
                                else if (supabaseCol === "_condutor_nome_excel") dadosUpdate[supabaseCol] = String(valorOriginal).trim();
                                else if (supabaseCol === "_parque_codigo_excel") dadosUpdate[supabaseCol] = String(valorOriginal).trim();
                                else if (supabaseCol === "kms_entrada") dadosUpdate[supabaseCol] = validarCampoNumerico(valorOriginal);
                                else if (supabaseCol === "estado_reserva_atual_import") dadosUpdate.estado_reserva_atual = String(valorOriginal).trim().toLowerCase();
                                else dadosUpdate[supabaseCol] = String(valorOriginal).trim();
                            }
                        }

                        if (!identReserva.booking_id && (!identReserva.license_plate || !identReserva.alocation)) { ignoradas++; return; }
                        if (!dadosUpdate.data_entrada_real) dadosUpdate.data_entrada_real = new Date().toISOString();

                        if (dadosUpdate._condutor_nome_excel) {
                            const condutorId = await obterEntidadeIdPorNomeComRPC(dadosUpdate._condutor_nome_excel, 'obter_condutor_id_por_nome', 'p_nome_condutor');
                            if (condutorId) dadosUpdate.condutor_recolha_id = condutorId;
                            delete dadosUpdate._condutor_nome_excel;
                        }
                        if (dadosUpdate._parque_codigo_excel) {
                            const parqueId = await obterEntidadeIdPorNomeComRPC(dadosUpdate._parque_codigo_excel, 'obter_parque_id_por_codigo', 'p_codigo_ou_nome');
                            if (parqueId) dadosUpdate.parque_id = parqueId;
                            delete dadosUpdate._parque_codigo_excel;
                        }
                        
                        let queryBusca = supabase.from("reservas").select("id_pk");
                        if (identReserva.booking_id) queryBusca = queryBusca.eq("booking_id", identReserva.booking_id);
                        else queryBusca = queryBusca.eq("license_plate", identReserva.license_plate).eq("alocation", identReserva.alocation);
                        
                        const { data: reserva, error: errBusca } = await queryBusca.maybeSingle();
                        if (errBusca) { erros++; return; }

                        if (reserva) {
                            if (!dadosUpdate.estado_reserva_atual) dadosUpdate.estado_reserva_atual = "Recolhido";
                            dadosUpdate.user_id_modificacao_registo = currentUser?.id;
                            if(!dadosUpdate.action_date) dadosUpdate.action_date = new Date().toISOString();

                            const { error: errUpdate } = await supabase.from("reservas").update(dadosUpdate).eq("id_pk", reserva.id_pk);
                            if (errUpdate) {
                                console.error(`Erro ao atualizar recolha para reserva PK ${reserva.id_pk}:`, errUpdate, "Dados:", dadosUpdate);
                                erros++;
                            } else { atualizacoesSucesso++; }
                        } else { naoEncontradas++; }
                    });
                    await Promise.all(promessasLote);
                    if (i + loteSize < jsonData.length) await new Promise(resolve => setTimeout(resolve, 200));
                }
                importacaoRecolhasStatusEl.textContent = `Concluído: ${atualizacoesSucesso} atualizadas. ${erros} erros. ${ignoradas} ignoradas. ${naoEncontradas} não encontradas.`;
                await carregarRecolhasDaLista(); await carregarDadosDashboardRecolhas();
            } catch (error) {
                console.error('Erro ao processar ficheiro Recolhas:', error);
                importacaoRecolhasStatusEl.textContent = `Erro: ${error.message}`;
            } finally {
                mostrarSpinner('loadingImportRecolhasSpinner', false);
                if(processarImportacaoRecolhasBtnEl) processarImportacaoRecolhasBtnEl.disabled = false;
                if(importRecolhasFileEl) importRecolhasFileEl.value = '';
            }
        };
        reader.readAsArrayBuffer(ficheiro);
    }

    // --- Lógica da Lista de Recolhas (READ) ---
    async function carregarRecolhasDaLista(pagina = 1, filtrosParams = null) {
        if (!recolhasTableBodyEl) return;
        paginaAtualRecolhas = pagina;
        const filtros = filtrosParams || obterFiltrosRecolhasLista();

        mostrarSpinner('loadingRecolhasTableSpinner', true);
        recolhasTableBodyEl.innerHTML = '';
        if(recolhasNenhumaMsgEl) recolhasNenhumaMsgEl.classList.add('hidden');

        const rangeFrom = (pagina - 1) * itensPorPaginaRecolhas;
        const rangeTo = rangeFrom + itensPorPaginaRecolhas - 1;

        let query = supabase.from("reservas")
            .select(`
                id_pk, booking_id, license_plate, alocation, name_cliente, lastname_cliente,
                check_in_previsto, data_entrada_real, 
                condutor_recolha:condutor_recolha_id (id, full_name, username), 
                parque_info:parque_id (nome_parque), 
                estado_reserva_atual
            `, { count: "exact" })
            .in('estado_reserva_atual', ['Confirmada', 'Recolhido', 'Em Curso']); // Reservas que estão pendentes de recolha ou já recolhidas

        if (filtros.matricula) query = query.ilike("license_plate", `%${filtros.matricula}%`);
        if (filtros.alocation) query = query.ilike("alocation", `%${filtros.alocation}%`);
        if (filtros.data_recolha_inicio) query = query.gte("data_entrada_real", filtros.data_recolha_inicio + "T00:00:00");
        if (filtros.data_recolha_fim) query = query.lte("data_entrada_real", filtros.data_recolha_fim + "T23:59:59");
        if (filtros.condutor_id) query = query.eq("condutor_recolha_id", filtros.condutor_id);
        if (filtros.estado_reserva && filtros.estado_reserva !== "") query = query.eq("estado_reserva_atual", filtros.estado_reserva);
        
        query = query.order("check_in_previsto", { ascending: true, nullsFirst: false })
                     .order("data_entrada_real", { ascending: false, nullsFirst: true })
                     .range(rangeFrom, rangeTo);

        const { data, error, count } = await query;
        mostrarSpinner('loadingRecolhasTableSpinner', false);

        if (error) { console.error("Erro ao carregar recolhas:", error); if(recolhasNenhumaMsgEl) {recolhasNenhumaMsgEl.textContent = "Erro ao carregar dados."; recolhasNenhumaMsgEl.classList.remove("hidden");} return; }
        if (recolhasTotalCountEl) recolhasTotalCountEl.textContent = count || 0;

        if (data && data.length > 0) {
            data.forEach(recolha => {
                const tr = document.createElement("tr");
                tr.className = "border-b hover:bg-gray-50";
                const nomeCondutor = recolha.condutor_recolha ? (recolha.condutor_recolha.full_name || recolha.condutor_recolha.username) : "N/A";
                tr.innerHTML = `
                    <td class="py-2 px-3 text-xs">${recolha.booking_id || "N/A"}</td>
                    <td class="py-2 px-3 text-xs">${recolha.license_plate || "N/A"}</td>
                    <td class="py-2 px-3 text-xs">${recolha.alocation || "N/A"}</td>
                    <td class="py-2 px-3 text-xs">${(recolha.name_cliente || '')} ${(recolha.lastname_cliente || '') || "N/A"}</td>
                    <td class="py-2 px-3 text-xs">${formatarDataHora(recolha.check_in_previsto)}</td>
                    <td class="py-2 px-3 text-xs font-semibold">${recolha.data_entrada_real ? formatarDataHora(recolha.data_entrada_real) : 'Pendente'}</td>
                    <td class="py-2 px-3 text-xs">${nomeCondutor}</td>
                    <td class="py-2 px-3 text-xs">${recolha.parque_info?.nome_parque || "N/A"}</td>
                    <td class="py-2 px-3 text-xs"><span class="px-2 py-1 text-xs font-semibold rounded-full ${getEstadoClass(recolha.estado_reserva_atual)}">${recolha.estado_reserva_atual || "N/A"}</span></td>
                    <td class="py-2 px-3 text-xs actions-cell">
                        <button class="action-button !p-1 text-xs rec-detalhes-btn" data-id="${recolha.id_pk}">${recolha.data_entrada_real ? 'Ver/Editar Detalhes' : 'Registar Recolha'}</button>
                    </td>
                `;
                recolhasTableBodyEl.appendChild(tr);
            });
            configurarBotoesAcaoRecolhas();
        } else {
            if(recolhasNenhumaMsgEl) {recolhasNenhumaMsgEl.textContent = "Nenhuma recolha encontrada."; recolhasNenhumaMsgEl.classList.remove("hidden");}
        }
        atualizarPaginacaoRecolhasLista(pagina, count);
    }
    
    function atualizarPaginacaoRecolhasLista(paginaCorrente, totalItens) {
        if (!recolhasPaginacaoEl || !totalItens) { if(recolhasPaginacaoEl) recolhasPaginacaoEl.innerHTML = ""; return; }
        const totalPaginas = Math.ceil(totalItens / itensPorPaginaRecolhas);
        recolhasPaginacaoEl.innerHTML = ""; if (totalPaginas <= 1) return;
        const criarBtn = (txt, pg, hab = true, cur = false) => {
            const btn = document.createElement("button");
            btn.className = `px-3 py-1 mx-1 text-sm rounded-md border border-gray-300 hover:bg-gray-100 ${!hab ? 'opacity-50 cursor-not-allowed' : ''} ${cur ? 'bg-blue-500 text-white border-blue-500' : 'bg-white'}`;
            btn.textContent = txt; btn.disabled = !hab || cur;
            if (hab && !cur) btn.addEventListener("click", () => carregarRecolhasDaLista(pg, obterFiltrosRecolhasLista()));
            recolhasPaginacaoEl.appendChild(btn);
        };
        criarBtn("Anterior", paginaCorrente - 1, paginaCorrente > 1);
        let iS = Math.max(1, paginaCorrente - 2), iE = Math.min(totalPaginas, paginaCorrente + 2);
        if(iS > 1) { criarBtn(1,1); if(iS > 2) recolhasPaginacaoEl.insertAdjacentHTML('beforeend', `<span class="px-2 py-1 text-sm">...</span>`);}
        for (let i = iS; i <= iE; i++) criarBtn(i, i, true, i === paginaCorrente);
        if(iE < totalPaginas) { if(iE < totalPaginas - 1) recolhasPaginacaoEl.insertAdjacentHTML('beforeend', `<span class="px-2 py-1 text-sm">...</span>`); criarBtn(totalPaginas,totalPaginas);}
        criarBtn("Próximo", paginaCorrente + 1, paginaCorrente < totalPaginas);
    }

    function obterFiltrosRecolhasLista() {
        return {
            matricula: recFiltroMatriculaEl?.value.trim() || null,
            alocation: recFiltroAlocationEl?.value.trim() || null,
            data_recolha_inicio: recFiltroDataRecolhaInicioEl?.value || null,
            data_recolha_fim: recFiltroDataRecolhaFimEl?.value || null,
            condutor_id: recFiltroCondutorRecolhaEl?.value || null,
            estado_reserva: recFiltroEstadoReservaEl?.value || null
        };
    }
    
    function getEstadoClass(estado) {
        if (!estado) return 'bg-gray-100 text-gray-700';
        const E = String(estado).toLowerCase();
        if (E === 'confirmada') return 'bg-orange-100 text-orange-700';
        if (E === 'recolhido') return 'bg-yellow-100 text-yellow-700';
        if (E === 'em curso') return 'bg-indigo-100 text-indigo-700';
        return 'bg-gray-100 text-gray-700';
    }

    // --- Lógica do Dashboard de Recolhas ---
    async function carregarDadosDashboardRecolhas() {
        // ... (Implementar queries/RPCs para total, média, por hora, top condutores)
        // Exemplo para total de recolhas (requer que `data_entrada_real` seja a data da recolha)
        const dataInicio = recolhasDashboardFiltroDataInicioEl?.value;
        const dataFim = recolhasDashboardFiltroDataFimEl?.value;
        if (!dataInicio || !dataFim) { /* limpar stats */ return; }
        const dataInicioISO = converterDataParaISO(dataInicio) + "T00:00:00.000Z";
        const dataFimISO = converterDataParaISO(dataFim) + "T23:59:59.999Z";

        if(statTotalRecolhasPeriodoDashboardEl) statTotalRecolhasPeriodoDashboardEl.textContent = `${formatarDataHora(dataInicioISO).split(' ')[0]} a ${formatarDataHora(dataFimISO).split(' ')[0]}`;
        if(statMediaRecolhasDiaPeriodoDashboardEl) statMediaRecolhasDiaPeriodoDashboardEl.textContent = `Período: ${formatarDataHora(dataInicioISO).split(' ')[0]} a ${formatarDataHora(dataFimISO).split(' ')[0]}`;

        // Total Recolhas
        const { count: totalRec, error: errTotRec } = await supabase.from('reservas')
            .select('id_pk', { count: 'exact', head: true })
            .not('data_entrada_real', 'is', null)
            .gte('data_entrada_real', dataInicioISO)
            .lte('data_entrada_real', dataFimISO);
        if(statTotalRecolhasDashboardEl) statTotalRecolhasDashboardEl.textContent = totalRec || 0;

        // Média Diária
        if (totalRec > 0) {
            const dias = (new Date(dataFimISO).getTime() - new Date(dataInicioISO).getTime()) / (1000 * 3600 * 24) + 1;
            if(statMediaRecolhasDiaDashboardEl) statMediaRecolhasDiaDashboardEl.textContent = (totalRec / dias).toFixed(1);
        } else {
            if(statMediaRecolhasDiaDashboardEl) statMediaRecolhasDiaDashboardEl.textContent = "0";
        }
        
        // Gráficos - Exemplo (precisarás de RPCs ou queries mais elaboradas)
        const dataDiaGrafico = recolhasDashboardDataHoraInputEl?.value || dataInicio;
        if (dataDiaGrafico && recolhasDashboardDataHoraDisplayEl) recolhasDashboardDataHoraDisplayEl.textContent = formatarDataHora(converterDataParaISO(dataDiaGrafico)).split(' ')[0];
        
        // RPCs hipotéticas: 'contar_recolhas_por_hora_no_dia', 'contar_recolhas_por_condutor_no_periodo'
        // (Lógica de chamada e atualização dos gráficos aqui, similar ao entregas.js)
    }
    
    // --- Modal de Detalhes/Registo de Recolha ---
    function configurarBotoesAcaoRecolhas() {
        document.querySelectorAll('.rec-detalhes-btn').forEach(btn => {
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            newBtn.addEventListener('click', async (event) => {
                const reservaIdPk = event.currentTarget.getAttribute('data-id');
                if (reservaIdPk) await abrirModalDetalhesRecolha(reservaIdPk);
            });
        });
    }

    async function abrirModalDetalhesRecolha(reservaIdPk) {
        // ... (lógica de preenchimento do modal, similar a entregas.js, mas para campos de recolha)
        if (!recolhaDetalhesModalEl || !recolhaDetalhesFormEl) return;
        recolhaDetalhesFormEl.reset();
        if(recolhaModalReservaIdPkEl) recolhaModalReservaIdPkEl.value = reservaIdPk;
        if(modalRecolhaFotosPreviewEl) modalRecolhaFotosPreviewEl.innerHTML = '';
        if(modalRecolhaFotosUrlsExistentesEl) modalRecolhaFotosUrlsExistentesEl.innerHTML = '';
        if(recolhaModalStatusEl) recolhaModalStatusEl.textContent = '';
        
        mostrarSpinner(loadingModalSpinnerRecolhaEl?.id || 'loadingModalSpinnerRecolha', true);
        try {
            const { data: r, error } = await supabase.from('reservas')
                .select('*, parque_info:parque_id(nome_parque), condutor_recolha:condutor_recolha_id(id,full_name,username)')
                .eq('id_pk', reservaIdPk).single();
            if (error || !r) { alert("Reserva não encontrada."); return; }

            if(modalInfoBookingIdEl) modalInfoBookingIdEl.textContent = r.booking_id || 'N/A';
            if(modalInfoMatriculaEl) modalInfoMatriculaEl.textContent = r.license_plate || 'N/A';
            // ... (preencher outros campos de info da reserva) ...
            if(modalInfoCheckinPrevistoEl) modalInfoCheckinPrevistoEl.textContent = formatarDataHora(r.check_in_previsto);
            if(modalInfoParquePrevistoEl) modalInfoParquePrevistoEl.textContent = r.parque_info?.nome_parque || r.parque_id || 'N/A';


            if(modalRecolhaDataRealEl) modalRecolhaDataRealEl.value = formatarDataParaInputDateTimeLocal(r.data_entrada_real || new Date());
            if(modalRecolhaCondutorEl) { popularSelectCondutores(modalRecolhaCondutorEl, listaCondutoresCache, "Selecione"); modalRecolhaCondutorEl.value = r.condutor_recolha_id || ""; }
            if(modalRecolhaKmsEntradaEl) modalRecolhaKmsEntradaEl.value = r.kms_entrada || "";
            if(modalRecolhaDanosObservadosEl) modalRecolhaDanosObservadosEl.value = r.danos_checkin || "";
            if(modalRecolhaObsInternasEl) modalRecolhaObsInternasEl.value = r.observacoes_recolha || "";
            if(modalRecolhaNovoEstadoReservaEl) modalRecolhaNovoEstadoReservaEl.value = r.estado_reserva_atual === 'Confirmada' ? 'Recolhido' : (r.estado_reserva_atual || 'Em Curso');
            
            if (modalRecolhaFotosUrlsExistentesEl && r.fotos_checkin_urls && Array.isArray(r.fotos_checkin_urls)) {
                r.fotos_checkin_urls.forEach(url => { /* ... mostrar fotos ... */ });
            }
            recolhaDetalhesModalEl.classList.remove('hidden'); void recolhaDetalhesModalEl.offsetWidth; recolhaDetalhesModalEl.classList.add('active');
        } catch(e) { alert("Erro ao abrir modal."); }
        finally { mostrarSpinner(loadingModalSpinnerRecolhaEl?.id || 'loadingModalSpinnerRecolha', false); }
    }
    
    async function handleRecolhaFormSubmit(event) {
        event.preventDefault();
        const reservaIdPk = recolhaModalReservaIdPkEl.value;
        if (!reservaIdPk) { /* ... erro ... */ return; }

        mostrarSpinner(loadingModalSpinnerRecolhaEl?.id || 'loadingModalSpinnerRecolha', true);
        if(recolhaModalStatusEl) {recolhaModalStatusEl.textContent = "A guardar..."; recolhaModalStatusEl.className = "text-blue-600";}

        const dadosRecolha = {
            data_entrada_real: modalRecolhaDataRealEl.value ? converterDataParaISO(modalRecolhaDataRealEl.value) : null,
            condutor_recolha_id: modalRecolhaCondutorEl.value || null,
            kms_entrada: validarCampoNumerico(modalRecolhaKmsEntradaEl.value),
            danos_checkin: modalRecolhaDanosObservadosEl.value.trim() || null,
            observacoes_recolha: modalRecolhaObsInternasEl.value.trim() || null,
            estado_reserva_atual: modalRecolhaNovoEstadoReservaEl.value,
            user_id_modificacao_registo: currentUser?.id,
            action_date: new Date().toISOString()
        };

        const ficheirosFotos = modalRecolhaFotosEl.files;
        let urlsFotosNovas = [];
        if (ficheirosFotos && ficheirosFotos.length > 0) {
            for (const ficheiro of ficheirosFotos) {
                const nomeFich = `recolhas/${reservaIdPk}/${Date.now()}_${ficheiro.name.replace(/\s+/g, '_')}`;
                try {
                    const { data: upData, error: upErr } = await supabase.storage.from('imagens-viaturas').upload(nomeFich, ficheiro);
                    if (upErr) throw upErr;
                    const { data: urlData } = supabase.storage.from('imagens-viaturas').getPublicUrl(upData.path);
                    urlsFotosNovas.push(urlData.publicUrl);
                } catch (upErr) { /* ... tratar erro upload ... */ mostrarSpinner(loadingModalSpinnerRecolhaEl?.id || 'loadingModalSpinnerRecolha', false); return; }
            }
            const { data: resAtual } = await supabase.from('reservas').select('fotos_checkin_urls').eq('id_pk', reservaIdPk).single();
            dadosRecolha.fotos_checkin_urls = [...new Set([...(resAtual?.fotos_checkin_urls || []), ...urlsFotosNovas])];
        }

        const { error } = await supabase.from('reservas').update(dadosRecolha).eq('id_pk', reservaIdPk);
        mostrarSpinner(loadingModalSpinnerRecolhaEl?.id || 'loadingModalSpinnerRecolha', false);
        if (error) { /* ... tratar erro ... */ if(recolhaModalStatusEl){recolhaModalStatusEl.textContent = `Erro: ${error.message}`; recolhaModalStatusEl.className="text-red-600";}}
        else { /* ... sucesso ... */ 
            if(recolhaModalStatusEl){recolhaModalStatusEl.textContent = "Guardado!"; recolhaModalStatusEl.className="text-green-600";}
            setTimeout(() => { recolhaDetalhesModalEl.classList.remove('active'); setTimeout(() => { recolhaDetalhesModalEl.classList.add('hidden'); }, 300);}, 1500);
            await carregarRecolhasDaLista(paginaAtualRecolhas, obterFiltrosRecolhasLista()); await carregarDadosDashboardRecolhas();
        }
    }
    
    // --- Configuração de Event Listeners ---
    function configurarEventosRecolhas() { /* ... (similar a entregas, adaptar IDs e funções) ... */ 
        if (voltarDashboardBtnRecolhasEl) voltarDashboardBtnRecolhasEl.addEventListener('click', () => { window.location.href = 'index.html'; });
        if (processarImportacaoRecolhasBtnEl) processarImportacaoRecolhasBtnEl.addEventListener('click', processarFicheiroRecolhasImport);
        if (recAplicarFiltrosBtnEl) recAplicarFiltrosBtnEl.addEventListener('click', () => carregarRecolhasDaLista(1, obterFiltrosRecolhasLista()));
        if (recolhasAplicarFiltrosDashboardBtnEl) recolhasAplicarFiltrosDashboardBtnEl.addEventListener("click", carregarDadosDashboardRecolhas);
        // ... (outros listeners)
        recFecharModalBtns.forEach(btn => btn.addEventListener('click', () => { /* ... fechar modal ... */}));
        if (recolhaDetalhesFormEl) recolhaDetalhesFormEl.addEventListener('submit', handleRecolhaFormSubmit);
        if (modalRecolhaFotosEl) modalRecolhaFotosEl.addEventListener('change', (event) => { /* ... preview ... */});
    }

    // --- Inicialização da Página de Recolhas ---
    async function initRecolhasPage() {
        console.log("Recolhas.js: Iniciando initRecolhasPage...");
        if (!currentUser) { console.warn("Recolhas.js: currentUser não definido."); return; }
        
        configurarEventosRecolhas();
        await carregarCondutoresParaSelects();
        
        const dateInputs = [recFiltroDataRecolhaInicioEl, recFiltroDataRecolhaFimEl, recolhasDashboardFiltroDataInicioEl, recolhasDashboardFiltroDataFimEl, recolhasDashboardDataHoraInputEl];
        dateInputs.forEach(el => { if (el) flatpickr(el, { dateFormat: "Y-m-d", locale: "pt", allowInput: true }); });
        if (modalRecolhaDataRealEl) flatpickr(modalRecolhaDataRealEl, { enableTime: true, dateFormat: "Y-m-d H:i", locale: "pt", time_24hr: true, defaultDate: new Date() });

        if (recolhasDashboardFiltroPeriodoEl) recolhasDashboardFiltroPeriodoEl.dispatchEvent(new Event('change'));
        else await carregarDadosDashboardRecolhas();
        
        await carregarRecolhasDaLista(1, obterFiltrosRecolhasLista());
        console.log("Subaplicação de Gestão de Recolhas inicializada.");
    }
    
    // Bloco de Inicialização e Autenticação (IIFE)
    (async () => {
        try {
            if (typeof window.checkAuthStatus !== 'function') { console.error("ERRO CRÍTICO (Recolhas): checkAuthStatus não definido."); return; }
            await window.checkAuthStatus(); 
            const { data: { user: supabaseUser }, error: authError } = await supabase.auth.getUser();
            if (authError) { console.error("Recolhas: Erro getUser():", authError); window.location.href = "index.html"; return; }
            currentUser = supabaseUser;
            if (currentUser) {
                const userProfileStr = localStorage.getItem('userProfile');
                if (userProfileStr) { try { userProfile = JSON.parse(userProfileStr); } catch (e) { console.error("Erro parse userProfile (Recolhas):", e);}}
                initRecolhasPage();
            } else { console.warn("Recolhas: Utilizador não autenticado. Redirecionando."); window.location.href = "index.html"; }
        } catch (e) { console.error("Erro inicialização Recolhas:", e); }
    })();
});
