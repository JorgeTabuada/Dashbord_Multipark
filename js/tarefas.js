// js/tarefas.js - Lógica para a Subaplicação de Gestão de Tarefas

document.addEventListener("DOMContentLoaded", async () => {
    // --- Verificação de Cliente Supabase ---
    if (typeof window.getSupabaseClient !== 'function') {
        console.error("ERRO CRÍTICO (tarefas.js): getSupabaseClient não está definido.");
        alert("Erro crítico na configuração da aplicação (Tarefas). Contacte o suporte.");
        return;
    }
    const supabase = window.getSupabaseClient();
    if (!supabase) {
        console.error("ERRO CRÍTICO (tarefas.js): Cliente Supabase não disponível.");
        alert("Erro crítico ao conectar com o sistema (Tarefas). Contacte o suporte.");
        return;
    }

    let currentUser = null;
    let userProfile = null;

    try {
        // Obter utilizador atual e perfil
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        
        currentUser = user;
        if (!currentUser) {
            console.error("Utilizador não autenticado. Redirecionando para login...");
            window.location.href = 'index.html';
            return;
        }

        // Obter perfil do utilizador
        const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentUser.id)
            .single();
        
        if (profileError) throw profileError;
        userProfile = profileData;
        
        // Verificar permissões baseadas no role
        if (!userProfile) {
            console.error("Perfil de utilizador não encontrado.");
            alert("Erro ao carregar perfil de utilizador. Por favor, faça login novamente.");
            window.location.href = 'index.html';
            return;
        }
    } catch (error) {
        console.error("Erro ao verificar autenticação:", error);
        alert("Erro ao verificar credenciais. Por favor, faça login novamente.");
        window.location.href = 'index.html';
        return;
    }

    // --- Seletores DOM ---
    const voltarDashboardBtnEl = document.getElementById("voltarDashboardBtnTarefas");
    const tarefaFiltroUserEl = document.getElementById("tarefaFiltroUser");
    const tarefaFiltroEstadoEl = document.getElementById("tarefaFiltroEstado");
    const tarefaFiltroPrioridadeEl = document.getElementById("tarefaFiltroPrioridade");
    const tarefaFiltroPrazoDeEl = document.getElementById("tarefaFiltroPrazoDe");
    const tarefaFiltroPrazoAteEl = document.getElementById("tarefaFiltroPrazoAte");
    const tarefaAplicarFiltrosBtnEl = document.getElementById("tarefaAplicarFiltrosBtn");
    const tarefaNovaBtnEl = document.getElementById("tarefaNovaBtn");
    const tarefaViewModeEl = document.getElementById("tarefaViewMode");
    const loadingTarefasSpinnerEl = document.getElementById("loadingTarefasSpinner");

    const tarefasViewListaEl = document.getElementById("tarefasViewLista");
    const tarefasTableBodyEl = document.getElementById("tarefasTableBody");
    const tarefasListaNenhumaMsgEl = document.getElementById("tarefasListaNenhumaMsg");
    const tarefasListaPaginacaoEl = document.getElementById("tarefasListaPaginacao");

    const tarefasViewKanbanEl = document.getElementById("tarefasViewKanban");
    const kanbanBoardEl = document.getElementById("kanbanBoard");

    const tarefasViewCalendarioEl = document.getElementById("tarefasViewCalendario");
    const calendarContainerEl = document.getElementById("calendarContainer");

    // Modal
    const tarefaFormModalEl = document.getElementById("tarefaFormModal");
    const tarefaFormModalTitleEl = document.getElementById("tarefaFormModalTitle");
    const tarefaFormEl = document.getElementById("tarefaForm");
    const tarefaFormIdEl = document.getElementById("tarefaFormId");
    const tarefaFormTituloEl = document.getElementById("tarefaFormTitulo");
    const tarefaFormDescricaoEl = document.getElementById("tarefaFormDescricao");
    const tarefaFormAtribuidoAEl = document.getElementById("tarefaFormAtribuidoA");
    const tarefaFormPrazoEl = document.getElementById("tarefaFormPrazo");
    const tarefaFormPrioridadeEl = document.getElementById("tarefaFormPrioridade");
    const tarefaFormEstadoModalEl = document.getElementById("tarefaFormEstadoModal");
    const tarefaFormParqueEl = document.getElementById("tarefaFormParque");
    const tarefaFormProjetoModalEl = document.getElementById("tarefaFormProjetoModal");
    const tarefaFormRecorrenciaTipoEl = document.getElementById("tarefaFormRecorrenciaTipo");
    const recorrenciaConfigSemanalEl = document.getElementById("recorrenciaConfigSemanal");
    const recorrenciaConfigMensalEl = document.getElementById("recorrenciaConfigMensal");
    const tarefaFormRecorrenciaDiaMesEl = document.getElementById("tarefaFormRecorrenciaDiaMes");
    const tarFecharModalBtns = document.querySelectorAll(".tarFecharModalBtn");

    // Detalhes Modal Selectors
    const tarefaDetalhesModalEl = document.getElementById("tarefaDetalhesModal");
    const tarefaDetalhesModalTitleEl = document.getElementById("tarefaDetalhesModalTitle");
    const tarefaDetalhesModalBodyEl = document.getElementById("tarefaDetalhesModalBody");
    const detalheTarefaTituloEl = document.getElementById("detalheTarefaTitulo");
    const detalheTarefaDescricaoEl = document.getElementById("detalheTarefaDescricao");
    const detalheTarefaAtribuidoAEl = document.getElementById("detalheTarefaAtribuidoA");
    const detalheTarefaPrazoEl = document.getElementById("detalheTarefaPrazo");
    const detalheTarefaPrioridadeEl = document.getElementById("detalheTarefaPrioridade");
    const detalheTarefaEstadoEl = document.getElementById("detalheTarefaEstado");
    const detalheTarefaProjetoEl = document.getElementById("detalheTarefaProjeto");
    const detalheTarefaParqueEl = document.getElementById("detalheTarefaParque");
    const detalheTarefaCriadorEl = document.getElementById("detalheTarefaCriador");
    const detalheTarefaCriadoEmEl = document.getElementById("detalheTarefaCriadoEm");
    const detalheTarefaModificadoEmEl = document.getElementById("detalheTarefaModificadoEm");
    const tarFecharDetalhesModalBtns = document.querySelectorAll(".tarFecharDetalhesModalBtn");


    // --- Estado da Aplicação ---
    let calendarInstance; // Para FullCalendar
    let todasAsTarefas = [];
    let paginaAtualLista = 1;
    const itensPorPaginaLista = 15;
    let usuariosParaAtribuicao = []; 
    let todosOsUsuariosSistema = []; 
    let listaParquesGlob = [];
    let listaProjetosGlob = [];

    const KANBAN_COLUNAS = {
        "Pendente": { id: "col-pendente", title: "📝 Pendente", tasks: [] },
        "Em Progresso": { id: "col-progresso", title: "⏳ Em Progresso", tasks: [] },
        "Concluída": { id: "col-concluida", title: "✅ Concluída", tasks: [] },
        "Bloqueada": { id: "col-bloqueada", title: "🚫 Bloqueada", tasks: [] }
    };


    // --- Funções Auxiliares ---
    function formatarDataHora(dataISO, apenasData = false) {
        if (!dataISO) return "N/A";
        const options = { year: "numeric", month: "2-digit", day: "2-digit" };
        if (!apenasData) {
            options.hour = "2-digit";
            options.minute = "2-digit";
        }
        try { return new Date(dataISO).toLocaleString("pt-PT", options); }
        catch (e) { return dataISO; }
    }
    
    function mostrarSpinner(show = true) { 
        if (loadingTarefasSpinnerEl) {
            loadingTarefasSpinnerEl.style.display = show ? "block" : "none"; 
        }
    }
    
    function esconderSpinner() { 
        mostrarSpinner(false); 
    }

    // --- Carregar Dados Iniciais (Utilizadores, Parques, Projetos) ---
    async function carregarDadosIniciaisParaFiltrosEForm() {
        try {
            // Carregar todos os utilizadores para filtros e atribuição
            const { data: usersData, error: usersError } = await supabase
                .from("profiles")
                .select("id, full_name, username, role, reporta_a_user_id");
                
            if (usersError) throw usersError;
            todosOsUsuariosSistema = usersData || [];

            // Carregar Parques
            const { data: parquesData, error: parquesError } = await supabase
                .from("parques")
                .select("id, nome");
                
            if (parquesError) throw parquesError;
            listaParquesGlob = parquesData || [];

            // Carregar Projetos
            const { data: projetosData, error: projetosError } = await supabase
                .from("projetos")
                .select("id, nome_projeto");
                
            if (projetosError) throw projetosError;
            listaProjetosGlob = projetosData || [];

            popularSelectUtilizadores();
            popularSelectParques();
            popularSelectProjetos();
        } catch (error) {
            console.error("Erro ao carregar dados iniciais para tarefas:", error);
            alert(`Erro ao carregar dados iniciais: ${error.message}`);
        }
    }

    function popularSelectUtilizadores() {
        // Popular filtro de utilizador
        if (tarefaFiltroUserEl) {
            tarefaFiltroUserEl.innerHTML = `
                <option value="minhas">Minhas Tarefas</option>
                <option value="todas_subordinados">Minhas e Subordinados</option>
                ${userProfile.role === 'super_admin' || userProfile.role === 'admin' ? '<option value="todas_geral">Todas as Tarefas</option>' : ''}
            `;
            
            todosOsUsuariosSistema.forEach(u => {
                if (userProfile.role === "super_admin" || u.id === currentUser.id) {
                    const opt = document.createElement("option");
                    opt.value = u.id;
                    opt.textContent = u.full_name || u.username;
                    tarefaFiltroUserEl.appendChild(opt);
                }
            });
        }
        
        // Filtrar usuários para atribuição baseado em permissões
        usuariosParaAtribuicao = todosOsUsuariosSistema.filter(u => {
            if (userProfile.role === "super_admin") return true;
            if (userProfile.role === "admin") return u.role !== "super_admin";
            if (userProfile.role === "supervisão") return u.role !== "super_admin" && u.role !== "admin";
            return u.id === currentUser.id; 
        });

        // Popular select de atribuição
        if (tarefaFormAtribuidoAEl) {
            tarefaFormAtribuidoAEl.innerHTML = "<option value=\"\">Selecione Utilizador</option>";
            usuariosParaAtribuicao.forEach(u => {
                const opt = document.createElement("option");
                opt.value = u.id;
                opt.textContent = u.full_name || u.username;
                tarefaFormAtribuidoAEl.appendChild(opt);
            });
            
            // Selecionar o próprio utilizador por padrão
            const selfOption = tarefaFormAtribuidoAEl.querySelector(`option[value="${currentUser.id}"]`);
            if (selfOption) selfOption.selected = true;
        }
    }
    
    function popularSelectParques() {
        if (tarefaFormParqueEl) {
            tarefaFormParqueEl.innerHTML = "<option value=\"\">Nenhum</option>";
            listaParquesGlob.forEach(p => {
                const opt = document.createElement("option");
                opt.value = p.id;
                opt.textContent = p.nome;
                tarefaFormParqueEl.appendChild(opt);
            });
        }
    }
    
    function popularSelectProjetos() {
        if (tarefaFormProjetoModalEl) {
            tarefaFormProjetoModalEl.innerHTML = "<option value=\"\">Nenhum</option>";
            listaProjetosGlob.forEach(p => {
                const opt = document.createElement("option");
                opt.value = p.id;
                opt.textContent = p.nome_projeto;
                tarefaFormProjetoModalEl.appendChild(opt);
            });
        }
    }


    // --- Lógica de Tarefas (CRUD e Visualização) ---
    async function carregarTarefas() {
        mostrarSpinner(true);
        
        try {
            const filtroUserSelecionado = tarefaFiltroUserEl ? tarefaFiltroUserEl.value : 'minhas';
            const estado = tarefaFiltroEstadoEl ? tarefaFiltroEstadoEl.value : '';
            const prioridade = tarefaFiltroPrioridadeEl ? tarefaFiltroPrioridadeEl.value : '';
            const prazoDe = tarefaFiltroPrazoDeEl ? tarefaFiltroPrazoDeEl.value : '';
            const prazoAte = tarefaFiltroPrazoAteEl ? tarefaFiltroPrazoAteEl.value : '';

            let query = supabase.from("tarefas").select(`
                *,
                user_criador:profiles!tarefas_user_id_criador_fkey(full_name, username),
                user_atribuido:profiles!tarefas_user_id_atribuido_a_fkey(full_name, username),
                projeto:projetos(id, nome_projeto),
                parque:parques(id, nome)
            `, { count: "exact" });

            // Aplicar filtros
            if (filtroUserSelecionado === "minhas") {
                query = query.eq("user_id_atribuido_a", currentUser.id);
            } else if (filtroUserSelecionado === "todas_subordinados") {
                query = query.or(`user_id_atribuido_a.eq.${currentUser.id},user_id_criador.eq.${currentUser.id}`);
            } else if (filtroUserSelecionado && filtroUserSelecionado !== "todas_geral") {
                query = query.eq("user_id_atribuido_a", filtroUserSelecionado);
            } else if (filtroUserSelecionado === "todas_geral" && userProfile.role !== "super_admin" && userProfile.role !== "admin") {
                query = query.or(`user_id_atribuido_a.eq.${currentUser.id},user_id_criador.eq.${currentUser.id}`);
            }

            if (estado) query = query.eq("estado", estado);
            if (prioridade) query = query.eq("prioridade", prioridade);
            if (prazoDe) query = query.gte("data_prazo", prazoDe + "T00:00:00");
            if (prazoAte) query = query.lte("data_prazo", prazoAte + "T23:59:59");

            // Paginação
            const offset = (paginaAtualLista - 1) * itensPorPaginaLista;
            query = query.order("data_prazo", { ascending: true, nullsFirst: false })
                        .order("created_at", { ascending: false })
                        .range(offset, offset + itensPorPaginaLista - 1);
            
            const { data, error, count } = await query;
            
            if (error) throw error;
            
            todasAsTarefas = data || [];
            renderizarVistaAtual();
            renderPaginacao(count);
        } catch (error) {
            console.error("Erro ao carregar tarefas:", error);
            alert(`Erro ao carregar tarefas: ${error.message}`);
        } finally {
            esconderSpinner();
        }
    }

    function renderizarVistaAtual() {
        const modo = tarefaViewModeEl ? tarefaViewModeEl.value : 'lista';
        
        if (tarefasViewListaEl) tarefasViewListaEl.classList.add("hidden");
        if (tarefasViewKanbanEl) tarefasViewKanbanEl.classList.add("hidden");
        if (tarefasViewCalendarioEl) tarefasViewCalendarioEl.classList.add("hidden");
        
        if (modo === "lista") {
            if (tarefasViewListaEl) tarefasViewListaEl.classList.remove("hidden");
            renderTabelaTarefas();
        } else if (modo === "kanban") {
            if (tarefasViewKanbanEl) tarefasViewKanbanEl.classList.remove("hidden");
            renderQuadroKanban();
        } else if (modo === "calendario") {
            if (tarefasViewCalendarioEl) tarefasViewCalendarioEl.classList.remove("hidden");
            renderCalendarioTarefas();
        }
    }

    function renderTabelaTarefas() {
        if (!tarefasTableBodyEl) return;
        
        tarefasTableBodyEl.innerHTML = "";
        
        if (todasAsTarefas.length === 0) {
            if (tarefasListaNenhumaMsgEl) tarefasListaNenhumaMsgEl.classList.remove("hidden");
            return;
        }
        
        if (tarefasListaNenhumaMsgEl) tarefasListaNenhumaMsgEl.classList.add("hidden");
        const agora = new Date();

        todasAsTarefas.forEach(t => {
            const tr = document.createElement("tr");
            const prazo = t.data_prazo ? new Date(t.data_prazo) : null;
            const atrasada = prazo && prazo < agora && t.estado !== "Concluída" && t.estado !== "Cancelada";
            tr.className = atrasada ? "task-row overdue bg-red-50" : "";

            const nomeProjeto = t.projeto?.nome_projeto || "N/A";
            const idProjeto = t.projeto?.id;
            let projetoCellHTML = nomeProjeto;
            if (idProjeto && nomeProjeto !== "N/A") {
                projetoCellHTML = `<a href="#" class="text-blue-600 hover:underline project-link" data-project-id="${idProjeto}">${nomeProjeto}</a>`;
            }

            tr.innerHTML = `
                <td class="font-medium ${atrasada ? "text-red-700" : ""}">${t.titulo}</td>
                <td>${t.user_atribuido?.full_name || t.user_atribuido?.username || "N/A"}</td>
                <td><span class="px-2 py-1 text-xs font-semibold rounded-full ${getPrioridadeClass(t.prioridade)}">${t.prioridade}</span></td>
                <td><span class="px-2 py-1 text-xs font-semibold rounded-full ${getEstadoClass(t.estado)}">${t.estado}</span></td>
                <td class="${atrasada ? "text-red-700 font-bold" : ""}">${formatarDataHora(t.data_prazo)}</td>
                <td>${projetoCellHTML}</td>
                <td class="actions-cell">
                    <button class="action-button text-xs !p-1 tar-editar-btn" data-id="${t.id}">Editar</button>
                    <button class="action-button secondary text-xs !p-1 tar-detalhes-btn" data-id="${t.id}">Detalhes</button>
                </td>
            `;
            tarefasTableBodyEl.appendChild(tr);
        });
    }
    
    function getPrioridadeClass(prioridade) {
        if (prioridade === "Alta") return "bg-red-100 text-red-700";
        if (prioridade === "Média") return "bg-yellow-100 text-yellow-700";
        if (prioridade === "Baixa") return "bg-green-100 text-green-700";
        return "bg-gray-100 text-gray-700";
    }
    
    function getEstadoClass(estado) {
        if (estado === "Concluída") return "bg-green-100 text-green-700";
        if (estado === "Em Progresso") return "bg-blue-100 text-blue-700";
        if (estado === "Bloqueada" || estado === "Cancelada") return "bg-gray-100 text-gray-700 line-through";
        if (estado === "Pendente") return "bg-yellow-100 text-yellow-700";
        return "bg-gray-100 text-gray-700";
    }


    function renderQuadroKanban() {
        if (!kanbanBoardEl) return;
        
        kanbanBoardEl.innerHTML = "";
        
        // Resetar colunas
        for (const colKey in KANBAN_COLUNAS) {
            KANBAN_COLUNAS[colKey].tasks = [];
        }
        
        // Distribuir tarefas nas colunas
        todasAsTarefas.forEach(t => {
            if (KANBAN_COLUNAS[t.estado]) {
                KANBAN_COLUNAS[t.estado].tasks.push(t);
            } else if (KANBAN_COLUNAS["Pendente"]) {
                KANBAN_COLUNAS["Pendente"].tasks.push(t);
            }
        });
        
        // Renderizar colunas
        const agora = new Date();
        for (const colKey in KANBAN_COLUNAS) {
            const colunaData = KANBAN_COLUNAS[colKey];
            const colunaDiv = document.createElement("div");
            colunaDiv.className = "kanban-column";
            colunaDiv.id = colunaData.id;
            
            colunaDiv.innerHTML = `
                <div class="kanban-column-header">${colunaData.title} (${colunaData.tasks.length})</div>
                <div class="kanban-column-body" id="${colunaData.id}-body"></div>
            `;
            
            kanbanBoardEl.appendChild(colunaDiv);
            const colunaBodyEl = document.getElementById(`${colunaData.id}-body`);
            
            // Renderizar cartões de tarefa
            colunaData.tasks.forEach(t => {
                const prazo = t.data_prazo ? new Date(t.data_prazo) : null;
                const atrasada = prazo && prazo < agora && t.estado !== "Concluída" && t.estado !== "Cancelada";
                
                const cardDiv = document.createElement("div");
                cardDiv.className = `kanban-card ${atrasada ? "overdue" : ""}`;
                cardDiv.dataset.id = t.id;
                
                cardDiv.innerHTML = `
                    <div class="kanban-card-header">
                        <h3 class="kanban-card-title">${t.titulo}</h3>
                        <span class="kanban-card-priority ${getPrioridadeClass(t.prioridade)}">${t.prioridade}</span>
                    </div>
                    <div class="kanban-card-body">
                        <p class="kanban-card-resp">👤 ${t.user_atribuido?.full_name || t.user_atribuido?.username || "N/A"}</p>
                        <p class="kanban-card-date ${atrasada ? "text-red-600 font-bold" : ""}">📅 ${formatarDataHora(t.data_prazo, true)}</p>
                        <p class="kanban-card-project">📋 ${t.projeto?.nome_projeto || "Sem projeto"}</p>
                    </div>
                    <div class="kanban-card-footer">
                        <button class="kanban-card-btn tar-editar-btn" data-id="${t.id}">Editar</button>
                        <button class="kanban-card-btn tar-detalhes-btn" data-id="${t.id}">Detalhes</button>
                    </div>
                `;
                
                colunaBodyEl.appendChild(cardDiv);
            });
        }
    }

    function renderCalendarioTarefas() {
        if (!calendarContainerEl) return;
        
        // Destruir instância anterior se existir
        if (calendarInstance) {
            calendarInstance.destroy();
        }
        
        // Preparar eventos para o calendário
        const eventos = todasAsTarefas.map(t => {
            const prazo = t.data_prazo ? new Date(t.data_prazo) : null;
            const agora = new Date();
            const atrasada = prazo && prazo < agora && t.estado !== "Concluída" && t.estado !== "Cancelada";
            
            // Determinar cor baseada no estado e prioridade
            let backgroundColor = "#3788d8"; // Azul padrão
            if (t.estado === "Concluída") backgroundColor = "#10b981"; // Verde
            else if (t.estado === "Bloqueada") backgroundColor = "#6b7280"; // Cinza
            else if (atrasada) backgroundColor = "#ef4444"; // Vermelho para atrasadas
            else if (t.prioridade === "Alta") backgroundColor = "#f97316"; // Laranja
            
            return {
                id: t.id,
                title: t.titulo,
                start: t.data_prazo,
                backgroundColor: backgroundColor,
                borderColor: backgroundColor,
                extendedProps: {
                    responsavel: t.user_atribuido?.full_name || t.user_atribuido?.username || "N/A",
                    estado: t.estado,
                    prioridade: t.prioridade,
                    projeto: t.projeto?.nome_projeto || "Sem projeto"
                }
            };
        });
        
        // Inicializar calendário
        calendarInstance = new FullCalendar.Calendar(calendarContainerEl, {
            initialView: 'dayGridMonth',
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,listWeek'
            },
            locale: 'pt',
            events: eventos,
            eventClick: function(info) {
                const tarefaId = info.event.id;
                abrirDetalhesTarefa(tarefaId);
            },
            eventTimeFormat: {
                hour: '2-digit',
                minute: '2-digit',
                meridiem: false,
                hour12: false
            },
            eventDidMount: function(info) {
                // Adicionar tooltip com informações da tarefa
                const tooltip = new Tooltip(info.el, {
                    title: `
                        <strong>${info.event.title}</strong><br>
                        Responsável: ${info.event.extendedProps.responsavel}<br>
                        Estado: ${info.event.extendedProps.estado}<br>
                        Prioridade: ${info.event.extendedProps.prioridade}<br>
                        Projeto: ${info.event.extendedProps.projeto}
                    `,
                    placement: 'top',
                    trigger: 'hover',
                    container: 'body',
                    html: true
                });
            }
        });
        
        calendarInstance.render();
    }

    function renderPaginacao(totalItems) {
        if (!tarefasListaPaginacaoEl) return;
        
        tarefasListaPaginacaoEl.innerHTML = "";
        
        if (!totalItems || totalItems <= 0) return;
        
        const totalPaginas = Math.ceil(totalItems / itensPorPaginaLista);
        if (totalPaginas <= 1) return;
        
        // Botão Anterior
        const btnAnterior = document.createElement("button");
        btnAnterior.className = `pagination-btn ${paginaAtualLista <= 1 ? "disabled" : ""}`;
        btnAnterior.textContent = "«";
        btnAnterior.disabled = paginaAtualLista <= 1;
        btnAnterior.addEventListener("click", () => {
            if (paginaAtualLista > 1) {
                paginaAtualLista--;
                carregarTarefas();
            }
        });
        tarefasListaPaginacaoEl.appendChild(btnAnterior);
        
        // Páginas
        const maxPagesToShow = 5;
        let startPage = Math.max(1, paginaAtualLista - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(totalPaginas, startPage + maxPagesToShow - 1);
        
        if (endPage - startPage + 1 < maxPagesToShow) {
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }
        
        for (let i = startPage; i <= endPage; i++) {
            const btnPagina = document.createElement("button");
            btnPagina.className = `pagination-btn ${i === paginaAtualLista ? "active" : ""}`;
            btnPagina.textContent = i;
            btnPagina.addEventListener("click", () => {
                if (i !== paginaAtualLista) {
                    paginaAtualLista = i;
                    carregarTarefas();
                }
            });
            tarefasListaPaginacaoEl.appendChild(btnPagina);
        }
        
        // Botão Próximo
        const btnProximo = document.createElement("button");
        btnProximo.className = `pagination-btn ${paginaAtualLista >= totalPaginas ? "disabled" : ""}`;
        btnProximo.textContent = "»";
        btnProximo.disabled = paginaAtualLista >= totalPaginas;
        btnProximo.addEventListener("click", () => {
            if (paginaAtualLista < totalPaginas) {
                paginaAtualLista++;
                carregarTarefas();
            }
        });
        tarefasListaPaginacaoEl.appendChild(btnProximo);
    }

    // --- Lógica de Formulário e CRUD ---
    async function abrirFormularioTarefa(tarefaId = null) {
        if (!tarefaFormModalEl) return;
        
        // Resetar formulário
        tarefaFormEl.reset();
        tarefaFormIdEl.value = "";
        
        // Esconder configurações de recorrência
        if (recorrenciaConfigSemanalEl) recorrenciaConfigSemanalEl.classList.add("hidden");
        if (recorrenciaConfigMensalEl) recorrenciaConfigMensalEl.classList.add("hidden");
        
        if (tarefaId) {
            // Editar tarefa existente
            mostrarSpinner(true);
            
            try {
                const { data: tarefa, error } = await supabase
                    .from("tarefas")
                    .select(`
                        *,
                        user_criador:profiles!tarefas_user_id_criador_fkey(full_name, username),
                        user_atribuido:profiles!tarefas_user_id_atribuido_a_fkey(full_name, username),
                        projeto:projetos(id, nome_projeto),
                        parque:parques(id, nome)
                    `)
                    .eq("id", tarefaId)
                    .single();
                    
                if (error) throw error;
                
                if (!tarefa) {
                    alert("Tarefa não encontrada.");
                    return;
                }
                
                // Preencher formulário
                tarefaFormIdEl.value = tarefa.id;
                tarefaFormTituloEl.value = tarefa.titulo || "";
                tarefaFormDescricaoEl.value = tarefa.descricao || "";
                tarefaFormAtribuidoAEl.value = tarefa.user_id_atribuido_a || "";
                tarefaFormPrazoEl.value = tarefa.data_prazo ? tarefa.data_prazo.split("T")[0] : "";
                tarefaFormPrioridadeEl.value = tarefa.prioridade || "Média";
                tarefaFormEstadoModalEl.value = tarefa.estado || "Pendente";
                tarefaFormParqueEl.value = tarefa.parque_id || "";
                tarefaFormProjetoModalEl.value = tarefa.projeto_id || "";
                
                // Configurar recorrência se existir
                if (tarefaFormRecorrenciaTipoEl) {
                    tarefaFormRecorrenciaTipoEl.value = tarefa.recorrencia_tipo || "nenhuma";
                    if (tarefa.recorrencia_tipo === "semanal" && recorrenciaConfigSemanalEl) {
                        recorrenciaConfigSemanalEl.classList.remove("hidden");
                        // Configurar dias da semana
                        if (tarefa.recorrencia_config && tarefa.recorrencia_config.dias_semana) {
                            const diasSemana = tarefa.recorrencia_config.dias_semana;
                            document.querySelectorAll('input[name="dia_semana"]').forEach(checkbox => {
                                checkbox.checked = diasSemana.includes(parseInt(checkbox.value));
                            });
                        }
                    } else if (tarefa.recorrencia_tipo === "mensal" && recorrenciaConfigMensalEl) {
                        recorrenciaConfigMensalEl.classList.remove("hidden");
                        if (tarefaFormRecorrenciaDiaMesEl && tarefa.recorrencia_config && tarefa.recorrencia_config.dia_mes) {
                            tarefaFormRecorrenciaDiaMesEl.value = tarefa.recorrencia_config.dia_mes;
                        }
                    }
                }
                
                tarefaFormModalTitleEl.textContent = "Editar Tarefa";
            } catch (error) {
                console.error("Erro ao carregar tarefa para edição:", error);
                alert(`Erro ao carregar tarefa: ${error.message}`);
            } finally {
                mostrarSpinner(false);
            }
        } else {
            // Nova tarefa
            tarefaFormModalTitleEl.textContent = "Nova Tarefa";
            tarefaFormAtribuidoAEl.value = currentUser.id;
            tarefaFormPrioridadeEl.value = "Média";
            tarefaFormEstadoModalEl.value = "Pendente";
            
            // Data de prazo padrão = amanhã
            const amanha = new Date();
            amanha.setDate(amanha.getDate() + 1);
            tarefaFormPrazoEl.value = amanha.toISOString().split("T")[0];
        }
        
        // Abrir modal
        tarefaFormModalEl.classList.remove("hidden");
    }

    async function salvarTarefa(event) {
        event.preventDefault();
        
        mostrarSpinner(true);
        
        try {
            const tarefaId = tarefaFormIdEl.value;
            const isNova = !tarefaId;
            
            // Validar campos obrigatórios
            if (!tarefaFormTituloEl.value) {
                alert("O título da tarefa é obrigatório.");
                return;
            }
            
            // Preparar dados da tarefa
            const tarefaData = {
                titulo: tarefaFormTituloEl.value,
                descricao: tarefaFormDescricaoEl.value,
                user_id_atribuido_a: tarefaFormAtribuidoAEl.value,
                data_prazo: tarefaFormPrazoEl.value ? `${tarefaFormPrazoEl.value}T23:59:59` : null,
                prioridade: tarefaFormPrioridadeEl.value,
                estado: tarefaFormEstadoModalEl.value,
                parque_id: tarefaFormParqueEl.value || null,
                projeto_id: tarefaFormProjetoModalEl.value || null
            };
            
            // Adicionar campos específicos para nova tarefa
            if (isNova) {
                tarefaData.user_id_criador = currentUser.id;
                tarefaData.created_at = new Date().toISOString();
            }
            
            // Atualizar campos de modificação
            tarefaData.updated_at = new Date().toISOString();
            tarefaData.user_id_ultima_modificacao = currentUser.id;
            
            // Configurar recorrência se aplicável
            if (tarefaFormRecorrenciaTipoEl && tarefaFormRecorrenciaTipoEl.value !== "nenhuma") {
                tarefaData.recorrencia_tipo = tarefaFormRecorrenciaTipoEl.value;
                tarefaData.recorrencia_config = {};
                
                if (tarefaData.recorrencia_tipo === "semanal") {
                    const diasSemana = [];
                    document.querySelectorAll('input[name="dia_semana"]:checked').forEach(checkbox => {
                        diasSemana.push(parseInt(checkbox.value));
                    });
                    tarefaData.recorrencia_config.dias_semana = diasSemana;
                } else if (tarefaData.recorrencia_tipo === "mensal" && tarefaFormRecorrenciaDiaMesEl) {
                    tarefaData.recorrencia_config.dia_mes = parseInt(tarefaFormRecorrenciaDiaMesEl.value);
                }
            } else {
                tarefaData.recorrencia_tipo = null;
                tarefaData.recorrencia_config = null;
            }
            
            // Salvar tarefa
            let resultado;
            if (isNova) {
                resultado = await supabase.from("tarefas").insert(tarefaData).select();
            } else {
                resultado = await supabase.from("tarefas").update(tarefaData).eq("id", tarefaId).select();
            }
            
            if (resultado.error) throw resultado.error;
            
            // Fechar modal e recarregar tarefas
            tarefaFormModalEl.classList.add("hidden");
            await carregarTarefas();
            
            alert(`Tarefa ${isNova ? "criada" : "atualizada"} com sucesso!`);
        } catch (error) {
            console.error("Erro ao salvar tarefa:", error);
            alert(`Erro ao salvar tarefa: ${error.message}`);
        } finally {
            mostrarSpinner(false);
        }
    }

    async function abrirDetalhesTarefa(tarefaId) {
        if (!tarefaDetalhesModalEl || !tarefaId) return;
        
        mostrarSpinner(true);
        
        try {
            const { data: tarefa, error } = await supabase
                .from("tarefas")
                .select(`
                    *,
                    user_criador:profiles!tarefas_user_id_criador_fkey(full_name, username),
                    user_atribuido:profiles!tarefas_user_id_atribuido_a_fkey(full_name, username),
                    user_ultima_modificacao:profiles!tarefas_user_id_ultima_modificacao_fkey(full_name, username),
                    projeto:projetos(id, nome_projeto),
                    parque:parques(id, nome)
                `)
                .eq("id", tarefaId)
                .single();
                
            if (error) throw error;
            
            if (!tarefa) {
                alert("Tarefa não encontrada.");
                return;
            }
            
            // Preencher detalhes da tarefa
            tarefaDetalhesModalTitleEl.textContent = tarefa.titulo;
            detalheTarefaTituloEl.textContent = tarefa.titulo;
            detalheTarefaDescricaoEl.textContent = tarefa.descricao || "Sem descrição.";
            detalheTarefaAtribuidoAEl.textContent = tarefa.user_atribuido?.full_name || tarefa.user_atribuido?.username || "N/A";
            detalheTarefaPrazoEl.textContent = formatarDataHora(tarefa.data_prazo);
            detalheTarefaPrioridadeEl.innerHTML = `<span class="badge ${getPrioridadeClass(tarefa.prioridade)}">${tarefa.prioridade}</span>`;
            detalheTarefaEstadoEl.innerHTML = `<span class="badge ${getEstadoClass(tarefa.estado)}">${tarefa.estado}</span>`;
            detalheTarefaProjetoEl.textContent = tarefa.projeto?.nome_projeto || "Nenhum";
            detalheTarefaParqueEl.textContent = tarefa.parque?.nome || "Nenhum";
            detalheTarefaCriadorEl.textContent = tarefa.user_criador?.full_name || tarefa.user_criador?.username || "N/A";
            detalheTarefaCriadoEmEl.textContent = formatarDataHora(tarefa.created_at);
            detalheTarefaModificadoEmEl.textContent = formatarDataHora(tarefa.updated_at);
            
            // Abrir modal
            tarefaDetalhesModalEl.classList.remove("hidden");
        } catch (error) {
            console.error("Erro ao carregar detalhes da tarefa:", error);
            alert(`Erro ao carregar detalhes: ${error.message}`);
        } finally {
            mostrarSpinner(false);
        }
    }

    // --- Event Listeners ---
    // Botão voltar ao dashboard
    if (voltarDashboardBtnEl) {
        voltarDashboardBtnEl.addEventListener("click", () => {
            window.location.href = "index.html";
        });
    }
    
    // Filtros e mudança de vista
    if (tarefaAplicarFiltrosBtnEl) {
        tarefaAplicarFiltrosBtnEl.addEventListener("click", () => {
            paginaAtualLista = 1;
            carregarTarefas();
        });
    }
    
    if (tarefaViewModeEl) {
        tarefaViewModeEl.addEventListener("change", renderizarVistaAtual);
    }
    
    // Botão nova tarefa
    if (tarefaNovaBtnEl) {
        tarefaNovaBtnEl.addEventListener("click", () => abrirFormularioTarefa());
    }
    
    // Formulário de tarefa
    if (tarefaFormEl) {
        tarefaFormEl.addEventListener("submit", salvarTarefa);
    }
    
    // Configuração de recorrência
    if (tarefaFormRecorrenciaTipoEl) {
        tarefaFormRecorrenciaTipoEl.addEventListener("change", () => {
            if (recorrenciaConfigSemanalEl) recorrenciaConfigSemanalEl.classList.add("hidden");
            if (recorrenciaConfigMensalEl) recorrenciaConfigMensalEl.classList.add("hidden");
            
            if (tarefaFormRecorrenciaTipoEl.value === "semanal" && recorrenciaConfigSemanalEl) {
                recorrenciaConfigSemanalEl.classList.remove("hidden");
            } else if (tarefaFormRecorrenciaTipoEl.value === "mensal" && recorrenciaConfigMensalEl) {
                recorrenciaConfigMensalEl.classList.remove("hidden");
            }
        });
    }
    
    // Botões fechar modal
    tarFecharModalBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            tarefaFormModalEl.classList.add("hidden");
        });
    });
    
    tarFecharDetalhesModalBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            tarefaDetalhesModalEl.classList.add("hidden");
        });
    });
    
    // Botões de edição e detalhes (delegação de eventos)
    document.addEventListener("click", event => {
        // Botões de detalhes
        if (event.target.classList.contains("tar-detalhes-btn")) {
            const tarefaId = event.target.dataset.id;
            if (tarefaId) {
                abrirDetalhesTarefa(tarefaId);
            }
        }
        
        // Botões de edição
        if (event.target.classList.contains("tar-editar-btn")) {
            const tarefaId = event.target.dataset.id;
            if (tarefaId) {
                abrirFormularioTarefa(tarefaId);
            }
        }
        
        // Links para projetos
        if (event.target.classList.contains("project-link")) {
            event.preventDefault();
            const projetoId = event.target.dataset.projectId;
            if (projetoId && typeof abrirDetalhesProjeto === "function") {
                abrirDetalhesProjeto(projetoId);
            }
        }
    });
    
    // --- Inicialização da Página ---
    async function initTarefasPage() {
        try {
            await carregarDadosIniciaisParaFiltrosEForm();
            await carregarTarefas();
            console.log("Subaplicação Tarefas inicializada com sucesso.");
        } catch (error) {
            console.error("Erro ao inicializar página de tarefas:", error);
            alert(`Erro ao inicializar: ${error.message}`);
        }
    }
    
    // Iniciar a página
    initTarefasPage();
});
