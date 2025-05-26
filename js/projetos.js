// js/projetos.js - Lógica para a Subaplicação de Gestão de Projetos

document.addEventListener('DOMContentLoaded', async () => {
    // --- Verificação de Cliente Supabase ---
    if (typeof window.getSupabaseClient !== 'function') {
        console.error("ERRO CRÍTICO (projetos.js): getSupabaseClient não está definido.");
        alert("Erro crítico na configuração da aplicação (Projetos). Contacte o suporte.");
        return;
    }
    const supabase = window.getSupabaseClient();
    if (!supabase) {
        console.error("ERRO CRÍTICO (projetos.js): Cliente Supabase não disponível.");
        alert("Erro crítico ao conectar com o sistema (Projetos). Contacte o suporte.");
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
    const voltarDashboardBtnEl = document.getElementById('voltarDashboardBtnProjetos');
    const projetoFiltroUserEl = document.getElementById('projetoFiltroUser');
    const projetoFiltroEstadoEl = document.getElementById('projetoFiltroEstado');
    const projetoFiltroTipoEl = document.getElementById('projetoFiltroTipo');
    const projetoFiltroPrazoDeEl = document.getElementById('projetoFiltroPrazoDe');
    const projetoFiltroPrazoAteEl = document.getElementById('projetoFiltroPrazoAte');
    const projetoAplicarFiltrosBtnEl = document.getElementById('projetoAplicarFiltrosBtn');
    const projetoNovoBtnEl = document.getElementById('projetoNovoBtn');
    const projetoViewModeEl = document.getElementById('projetoViewMode');
    const loadingProjetosSpinnerEl = document.getElementById('loadingProjetosSpinner');

    const projetosViewListaEl = document.getElementById('projetosViewLista');
    const projetosTableBodyEl = document.getElementById('projetosTableBody');
    const projetosListaNenhumaMsgEl = document.getElementById('projetosListaNenhumaMsg');
    const projetosListaPaginacaoEl = document.getElementById('projetosListaPaginacao');

    const projetosViewKanbanEl = document.getElementById('projetosViewKanban');
    const kanbanProjetosBoardEl = document.getElementById('kanbanProjetosBoard');

    const projetosViewCalendarioEl = document.getElementById('projetosViewCalendario');
    const timelineProjetosContainerEl = document.getElementById('timelineProjetosContainer');

    // Modal Novo/Editar Projeto
    const projetoFormModalEl = document.getElementById('projetoFormModal');
    const projetoFormModalTitleEl = document.getElementById('projetoFormModalTitle');
    const projetoFormEl = document.getElementById('projetoForm');
    const projetoFormIdEl = document.getElementById('projetoFormId');
    const projetoFormNomeEl = document.getElementById('projetoFormNome');
    const projetoFormTipoEl = document.getElementById('projetoFormTipo');
    const projetoFormResponsavelPrincipalEl = document.getElementById('projetoFormResponsavelPrincipal');
    const projetoFormDataInicioEl = document.getElementById('projetoFormDataInicio');
    const projetoFormDataPrazoEl = document.getElementById('projetoFormDataPrazo');
    const projetoFormOrcamentoEl = document.getElementById('projetoFormOrcamento');
    const projetoFormEstadoModalEl = document.getElementById('projetoFormEstadoModal');
    const projetoFormDescricaoEl = document.getElementById('projetoFormDescricao');
    const projetoFormMembrosEl = document.getElementById('projetoFormMembros');
    const projetoFormParqueEl = document.getElementById('projetoFormParque');
    const projFecharFormModalBtns = document.querySelectorAll('.projFecharFormModalBtn');

    // Modal Detalhes do Projeto
    const projetoDetalhesModalEl = document.getElementById('projetoDetalhesModal');
    const projetoDetalhesModalTitleEl = document.getElementById('projetoDetalhesModalTitle');
    const projetoDetalhesIdEl = document.getElementById('projetoDetalhesId');
    const detalheNomeProjetoEl = document.getElementById('detalheNomeProjeto');
    const detalheTipoProjetoEl = document.getElementById('detalheTipoProjeto');
    const detalheResponsavelProjetoEl = document.getElementById('detalheResponsavelProjeto');
    const detalheEstadoProjetoEl = document.getElementById('detalheEstadoProjeto');
    const detalheDataInicioEl = document.getElementById('detalheDataInicio');
    const detalheDataPrazoEl = document.getElementById('detalheDataPrazo');
    const detalheOrcamentoEl = document.getElementById('detalheOrcamento');
    const detalheDespesasTotalEl = document.getElementById('detalheDespesasTotal');
    const detalheSaldoOrcamentoEl = document.getElementById('detalheSaldoOrcamento');
    const detalheDescricaoProjetoEl = document.getElementById('detalheDescricaoProjeto');
    const detalheListaMembrosEl = document.getElementById('detalheListaMembros');
    const detalheTarefasPendentesEl = document.getElementById('detalheTarefasPendentes');
    const detalheTarefasProgressoEl = document.getElementById('detalheTarefasProgresso');
    const detalheTarefasConcluidasEl = document.getElementById('detalheTarefasConcluidas');
    const detalheListaTarefasContainerEl = document.getElementById('detalheListaTarefasContainer');
    const detalheListaDespesasContainerEl = document.getElementById('detalheListaDespesasContainer');
    const projFecharDetalhesModalBtns = document.querySelectorAll('.projFecharDetalhesModalBtn');
    const projEditarDesdeDetalhesBtnEl = document.querySelector('.projEditarDesdeDetalhesBtn');


    // --- Estado da Aplicação ---
    let todosOsProjetos = [];
    let paginaAtualProjetosLista = 1;
    const itensPorPaginaProjetosLista = 10;
    let todosOsUsuariosSistemaProj = [];
    let listaParquesGlobProj = [];
    let tiposDeProjetoDistintos = []; // Para popular filtro

    const KANBAN_COLUNAS_PROJETOS = {
        'Planeado': { id: 'col-proj-planeado', title: '🎯 Planeado', projects: [] },
        'Em Curso': { id: 'col-proj-emcurso', title: '🚧 Em Curso', projects: [] },
        'Concluído': { id: 'col-proj-concluido', title: '🏁 Concluído', projects: [] },
        'Suspenso': { id: 'col-proj-suspenso', title: '⏸️ Suspenso', projects: [] },
        'Cancelado': { id: 'col-proj-cancelado', title: '❌ Cancelado', projects: [] }
    };

    // --- Funções Auxiliares ---
    function formatarData(dataISO) { return dataISO ? new Date(dataISO).toLocaleDateString('pt-PT') : 'N/A'; }
    function formatarMoeda(valor) { return parseFloat(valor || 0).toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' }); }
    function mostrarSpinnerProj(show = true) { 
        if (loadingProjetosSpinnerEl) {
            loadingProjetosSpinnerEl.style.display = show ? 'block' : 'none'; 
        }
    }
    function calcularProgresso(tarefas) { // tarefas = [{estado: 'Concluída'}, ...]
        if (!tarefas || tarefas.length === 0) return 0;
        const concluidas = tarefas.filter(t => t.estado === 'Concluída').length;
        return Math.round((concluidas / tarefas.length) * 100);
    }

    function getEstadoTarefaClassProj(estado) { // Renamed to avoid conflict if ever merged
        if (estado === "Concluída") return "bg-green-100 text-green-700";
        if (estado === "Em Progresso") return "bg-blue-100 text-blue-700";
        if (estado === "Bloqueada" || estado === "Cancelada") return "bg-gray-100 text-gray-700 line-through";
        if (estado === "Pendente") return "bg-yellow-100 text-yellow-700";
        return "bg-gray-100 text-gray-700";
    }

    // --- Carregar Dados Iniciais (Utilizadores, Parques, Tipos de Projeto) ---
    async function carregarDadosIniciaisProjetos() {
        try {
            // Carregar utilizadores
            const { data: usersData, error: usersError } = await supabase
                .from('profiles')
                .select('id, full_name, username, role');
                
            if (usersError) throw usersError;
            todosOsUsuariosSistemaProj = usersData || [];

            // Carregar parques
            const { data: parquesData, error: parquesError } = await supabase
                .from('parques')
                .select('id, nome');
                
            if (parquesError) throw parquesError;
            listaParquesGlobProj = parquesData || [];
            
            // Carregar tipos de projeto distintos
            // Nota: Adaptado para usar consulta direta em vez de RPC
            const { data: tiposData, error: tiposError } = await supabase
                .from('projetos')
                .select('tipo_projeto')
                .not('tipo_projeto', 'is', null);
                
            if (tiposError) throw tiposError;
            
            // Extrair tipos distintos
            const tiposSet = new Set();
            tiposData?.forEach(item => {
                if (item.tipo_projeto) {
                    tiposSet.add(item.tipo_projeto);
                }
            });
            tiposDeProjetoDistintos = Array.from(tiposSet);

            popularSelectsProjetos();
        } catch (error) {
            console.error("Erro ao carregar dados iniciais para projetos:", error);
            alert(`Erro ao carregar dados iniciais: ${error.message}`);
        }
    }

    function popularSelectsProjetos() {
        // Popular filtro de utilizador
        if (projetoFiltroUserEl) {
            projetoFiltroUserEl.innerHTML = `
                <option value="meus_associados">Meus Projetos</option>
                <option value="todos_subordinados">Minha Equipa/Subordinados</option>
                ${userProfile.role === 'super_admin' || userProfile.role === 'admin' ? '<option value="todos_geral">Todos os Projetos</option>' : ''}
            `;
        }
        
        // Popular select de responsável principal
        if (projetoFormResponsavelPrincipalEl) {
            projetoFormResponsavelPrincipalEl.innerHTML = '<option value="">Selecione Responsável</option>';
            todosOsUsuariosSistemaProj.forEach(u => {
                const opt = document.createElement('option');
                opt.value = u.id;
                opt.textContent = u.full_name || u.username;
                projetoFormResponsavelPrincipalEl.appendChild(opt);
            });
        }
        
        // Popular select de membros
        if (projetoFormMembrosEl) {
            projetoFormMembrosEl.innerHTML = ''; 
            todosOsUsuariosSistemaProj.forEach(u => {
                const opt = document.createElement('option');
                opt.value = u.id;
                opt.textContent = u.full_name || u.username;
                projetoFormMembrosEl.appendChild(opt);
            });
        }
        
        // Popular select de parque
        if (projetoFormParqueEl) {
            projetoFormParqueEl.innerHTML = '<option value="">Nenhum</option>';
            listaParquesGlobProj.forEach(p => {
                const opt = document.createElement('option');
                opt.value = p.id;
                opt.textContent = p.nome;
                projetoFormParqueEl.appendChild(opt);
            });
        }
        
        // Popular filtro de tipo
        if (projetoFiltroTipoEl) {
            projetoFiltroTipoEl.innerHTML = '<option value="">Todos</option>';
            tiposDeProjetoDistintos.forEach(tipo => {
                if(tipo) { 
                    const opt = document.createElement('option');
                    opt.value = tipo;
                    opt.textContent = tipo;
                    projetoFiltroTipoEl.appendChild(opt);
                }
            });
        }
    }

    async function carregarProjetos() {
        mostrarSpinnerProj(true);
        
        try {
            const filtroUser = projetoFiltroUserEl ? projetoFiltroUserEl.value : 'meus_associados';
            const estado = projetoFiltroEstadoEl ? projetoFiltroEstadoEl.value : '';
            const tipo = projetoFiltroTipoEl ? projetoFiltroTipoEl.value : '';
            const prazoDe = projetoFiltroPrazoDeEl ? projetoFiltroPrazoDeEl.value : '';
            const prazoAte = projetoFiltroPrazoAteEl ? projetoFiltroPrazoAteEl.value : '';

            let query = supabase.from('projetos').select(`
                id, nome_projeto, tipo_projeto, orcamento_previsto, data_inicio, data_prazo, estado_projeto, descricao, parque_id,
                responsavel:profiles!projetos_user_id_responsavel_principal_fkey (id, full_name, username),
                membros:projeto_membros ( profiles (id, full_name) ),
                tarefas (id, titulo, estado, data_prazo, user_id_atribuido_a, user_atribuido:profiles!tarefas_user_id_atribuido_a_fkey(full_name, username)),
                despesas (valor)
            `, { count: 'exact' });

            if (estado) query = query.eq('estado_projeto', estado);
            if (tipo) query = query.eq('tipo_projeto', tipo);
            if (prazoDe) query = query.gte('data_prazo', prazoDe);
            if (prazoAte) query = query.lte('data_prazo', prazoAte);
            
            // Filtrar por utilizador conforme permissões
            if (filtroUser === 'meus_associados') {
                query = query.or(`user_id_responsavel_principal.eq.${currentUser.id},membros.user_id_membro.eq.${currentUser.id}`);
            } else if (filtroUser === 'todos_subordinados') {
                query = query.or(`user_id_responsavel_principal.eq.${currentUser.id},membros.user_id_membro.eq.${currentUser.id}`); 
            } else if (filtroUser && filtroUser !== 'todos_geral') { 
                if (userProfile.role === 'super_admin' || userProfile.role === 'admin') { 
                    query = query.or(`user_id_responsavel_principal.eq.${filtroUser},membros.user_id_membro.eq.${filtroUser}`);
                } else { 
                    query = query.or(`user_id_responsavel_principal.eq.${currentUser.id},membros.user_id_membro.eq.${currentUser.id}`);
                }
            } else if (filtroUser === 'todos_geral' && userProfile.role !== 'super_admin' && userProfile.role !== 'admin') {
                query = query.or(`user_id_responsavel_principal.eq.${currentUser.id},membros.user_id_membro.eq.${currentUser.id}`);
            }

            const offset = (paginaAtualProjetosLista - 1) * itensPorPaginaProjetosLista;
            query = query.order('data_prazo', { ascending: true, nullsFirst: false })
                        .order('created_at', { ascending: false })
                        .range(offset, offset + itensPorPaginaProjetosLista - 1);
            
            const { data, error, count } = await query;
            
            if (error) throw error;
            
            todosOsProjetos = (data || []).map(p => ({
                ...p,
                total_despesas: (p.despesas || []).reduce((sum, d) => sum + (parseFloat(d.valor) || 0), 0),
                progresso_tarefas: calcularProgresso(p.tarefas || [])
            }));
            
            renderizarVistaAtualProjetos();
            renderPaginacaoProjetos(count);
        } catch (error) {
            console.error("Erro ao carregar projetos:", error);
            alert(`Erro ao carregar projetos: ${error.message}`);
        } finally {
            mostrarSpinnerProj(false);
        }
    }

    function renderizarVistaAtualProjetos() {
        const modo = projetoViewModeEl ? projetoViewModeEl.value : 'lista';
        
        if (projetosViewListaEl) projetosViewListaEl.classList.add('hidden');
        if (projetosViewKanbanEl) projetosViewKanbanEl.classList.add('hidden');
        if (projetosViewCalendarioEl) projetosViewCalendarioEl.classList.add('hidden');
        
        if (modo === 'lista') {
            if (projetosViewListaEl) projetosViewListaEl.classList.remove('hidden');
            renderTabelaProjetos();
        } else if (modo === 'kanban') {
            if (projetosViewKanbanEl) projetosViewKanbanEl.classList.remove('hidden');
            renderQuadroKanbanProjetos();
        } else if (modo === 'calendario') {
            if (projetosViewCalendarioEl) projetosViewCalendarioEl.classList.remove('hidden');
            renderTimelineProjetos();
        }
    }

    function renderTabelaProjetos() {
        if (!projetosTableBodyEl) return;
        
        projetosTableBodyEl.innerHTML = '';
        
        if (todosOsProjetos.length === 0) {
            if (projetosListaNenhumaMsgEl) projetosListaNenhumaMsgEl.classList.remove('hidden');
            return;
        }
        
        if (projetosListaNenhumaMsgEl) projetosListaNenhumaMsgEl.classList.add('hidden');
        const agora = new Date();

        todosOsProjetos.forEach(p => {
            const tr = document.createElement('tr');
            const prazo = p.data_prazo ? new Date(p.data_prazo) : null;
            const atrasado = prazo && prazo < agora && p.estado_projeto !== 'Concluído' && p.estado_projeto !== 'Cancelado';
            tr.className = atrasado ? 'bg-red-50' : '';

            tr.innerHTML = `
                <td class="font-medium ${atrasado ? 'text-red-700' : ''}">${p.nome_projeto}</td>
                <td>${p.responsavel?.full_name || p.responsavel?.username || 'N/A'}</td>
                <td><span class="px-2 py-1 text-xs font-semibold rounded-full ${getEstadoProjetoClass(p.estado_projeto)}">${p.estado_projeto}</span></td>
                <td class="${atrasado ? 'text-red-700 font-bold' : ''}">${formatarData(p.data_prazo)}</td>
                <td>${formatarMoeda(p.orcamento_previsto)}</td>
                <td>${formatarMoeda(p.total_despesas)}</td>
                <td>
                    <div class="progress-bar-container">
                        <div class="progress-bar" style="width: ${p.progresso_tarefas}%;">${p.progresso_tarefas}%</div>
                    </div>
                </td>
                <td class="actions-cell">
                    <button class="action-button text-xs !p-1 proj-detalhes-btn" data-id="${p.id}">Detalhes</button>
                    <button class="action-button secondary text-xs !p-1 proj-editar-btn" data-id="${p.id}">Editar</button>
                </td>
            `;
            projetosTableBodyEl.appendChild(tr);
        });
    }

    function getEstadoProjetoClass(estado) {
        if (estado === 'Concluído') return 'bg-green-100 text-green-700';
        if (estado === 'Em Curso') return 'bg-blue-100 text-blue-700';
        if (estado === 'Suspenso' || estado === 'Cancelado') return 'bg-gray-100 text-gray-700';
        if (estado === 'Planeado') return 'bg-yellow-100 text-yellow-700';
        return 'bg-gray-100 text-gray-700';
    }

    function renderQuadroKanbanProjetos() {
        if (!kanbanProjetosBoardEl) return;
        
        kanbanProjetosBoardEl.innerHTML = '';
        
        // Resetar colunas
        for (const colKey in KANBAN_COLUNAS_PROJETOS) {
            KANBAN_COLUNAS_PROJETOS[colKey].projects = [];
        }
        
        // Distribuir projetos nas colunas
        todosOsProjetos.forEach(p => {
            if (KANBAN_COLUNAS_PROJETOS[p.estado_projeto]) {
                KANBAN_COLUNAS_PROJETOS[p.estado_projeto].projects.push(p);
            } else if (KANBAN_COLUNAS_PROJETOS['Planeado']) {
                KANBAN_COLUNAS_PROJETOS['Planeado'].projects.push(p);
            }
        });
        
        // Renderizar colunas
        for (const colKey in KANBAN_COLUNAS_PROJETOS) {
            const colunaData = KANBAN_COLUNAS_PROJETOS[colKey];
            const colunaDiv = document.createElement('div');
            colunaDiv.className = 'kanban-column';
            colunaDiv.id = colunaData.id;
            
            colunaDiv.innerHTML = `
                <div class="kanban-column-header">${colunaData.title} (${colunaData.projects.length})</div>
                <div class="kanban-column-body" id="${colunaData.id}-body"></div>
            `;
            
            kanbanProjetosBoardEl.appendChild(colunaDiv);
            const colunaBodyEl = document.getElementById(`${colunaData.id}-body`);
            
            // Renderizar cartões de projeto
            colunaData.projects.forEach(p => {
                const agora = new Date();
                const prazo = p.data_prazo ? new Date(p.data_prazo) : null;
                const atrasado = prazo && prazo < agora && p.estado_projeto !== 'Concluído' && p.estado_projeto !== 'Cancelado';
                
                const cardDiv = document.createElement('div');
                cardDiv.className = `kanban-card ${atrasado ? 'overdue' : ''}`;
                cardDiv.dataset.id = p.id;
                
                cardDiv.innerHTML = `
                    <div class="kanban-card-header">
                        <h3 class="kanban-card-title">${p.nome_projeto}</h3>
                        <span class="kanban-card-type">${p.tipo_projeto || 'Sem tipo'}</span>
                    </div>
                    <div class="kanban-card-body">
                        <p class="kanban-card-resp">👤 ${p.responsavel?.full_name || p.responsavel?.username || 'N/A'}</p>
                        <p class="kanban-card-date ${atrasado ? 'text-red-600 font-bold' : ''}">📅 ${formatarData(p.data_prazo)}</p>
                        <div class="kanban-card-progress">
                            <div class="progress-bar-container">
                                <div class="progress-bar" style="width: ${p.progresso_tarefas}%;">${p.progresso_tarefas}%</div>
                            </div>
                        </div>
                    </div>
                    <div class="kanban-card-footer">
                        <button class="kanban-card-btn proj-detalhes-btn" data-id="${p.id}">Detalhes</button>
                        <button class="kanban-card-btn proj-editar-btn" data-id="${p.id}">Editar</button>
                    </div>
                `;
                
                colunaBodyEl.appendChild(cardDiv);
            });
        }
    }

    function renderTimelineProjetos() {
        if (!timelineProjetosContainerEl) return;
        
        timelineProjetosContainerEl.innerHTML = '';
        
        if (todosOsProjetos.length === 0) {
            timelineProjetosContainerEl.innerHTML = '<div class="timeline-empty">Nenhum projeto encontrado.</div>';
            return;
        }
        
        // Ordenar projetos por data de início
        const projetosOrdenados = [...todosOsProjetos].sort((a, b) => {
            const dataA = a.data_inicio ? new Date(a.data_inicio) : new Date(0);
            const dataB = b.data_inicio ? new Date(b.data_inicio) : new Date(0);
            return dataA - dataB;
        });
        
        // Criar timeline
        const timelineEl = document.createElement('div');
        timelineEl.className = 'timeline-container';
        
        projetosOrdenados.forEach(p => {
            const dataInicio = p.data_inicio ? new Date(p.data_inicio) : null;
            const dataPrazo = p.data_prazo ? new Date(p.data_prazo) : null;
            const agora = new Date();
            const atrasado = dataPrazo && dataPrazo < agora && p.estado_projeto !== 'Concluído' && p.estado_projeto !== 'Cancelado';
            
            const itemEl = document.createElement('div');
            itemEl.className = `timeline-item ${atrasado ? 'timeline-item-overdue' : ''}`;
            
            itemEl.innerHTML = `
                <div class="timeline-marker ${getEstadoTimelineClass(p.estado_projeto)}"></div>
                <div class="timeline-content">
                    <h3 class="timeline-title">${p.nome_projeto}</h3>
                    <div class="timeline-dates">
                        <span>Início: ${formatarData(p.data_inicio)}</span>
                        <span class="${atrasado ? 'text-red-600 font-bold' : ''}">Prazo: ${formatarData(p.data_prazo)}</span>
                    </div>
                    <div class="timeline-info">
                        <span class="timeline-type">${p.tipo_projeto || 'Sem tipo'}</span>
                        <span class="timeline-resp">Resp: ${p.responsavel?.full_name || p.responsavel?.username || 'N/A'}</span>
                    </div>
                    <div class="timeline-progress">
                        <div class="progress-bar-container">
                            <div class="progress-bar" style="width: ${p.progresso_tarefas}%;">${p.progresso_tarefas}%</div>
                        </div>
                    </div>
                    <div class="timeline-actions">
                        <button class="timeline-btn proj-detalhes-btn" data-id="${p.id}">Detalhes</button>
                        <button class="timeline-btn proj-editar-btn" data-id="${p.id}">Editar</button>
                    </div>
                </div>
            `;
            
            timelineEl.appendChild(itemEl);
        });
        
        timelineProjetosContainerEl.appendChild(timelineEl);
    }

    function getEstadoTimelineClass(estado) {
        if (estado === 'Concluído') return 'timeline-marker-completed';
        if (estado === 'Em Curso') return 'timeline-marker-progress';
        if (estado === 'Suspenso') return 'timeline-marker-suspended';
        if (estado === 'Cancelado') return 'timeline-marker-canceled';
        return 'timeline-marker-planned';
    }

    function renderPaginacaoProjetos(totalItems) {
        if (!projetosListaPaginacaoEl) return;
        
        projetosListaPaginacaoEl.innerHTML = '';
        
        if (!totalItems || totalItems <= 0) return;
        
        const totalPaginas = Math.ceil(totalItems / itensPorPaginaProjetosLista);
        if (totalPaginas <= 1) return;
        
        // Botão Anterior
        const btnAnterior = document.createElement('button');
        btnAnterior.className = `pagination-btn ${paginaAtualProjetosLista <= 1 ? 'disabled' : ''}`;
        btnAnterior.textContent = '«';
        btnAnterior.disabled = paginaAtualProjetosLista <= 1;
        btnAnterior.addEventListener('click', () => {
            if (paginaAtualProjetosLista > 1) {
                paginaAtualProjetosLista--;
                carregarProjetos();
            }
        });
        projetosListaPaginacaoEl.appendChild(btnAnterior);
        
        // Páginas
        const maxPagesToShow = 5;
        let startPage = Math.max(1, paginaAtualProjetosLista - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(totalPaginas, startPage + maxPagesToShow - 1);
        
        if (endPage - startPage + 1 < maxPagesToShow) {
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }
        
        for (let i = startPage; i <= endPage; i++) {
            const btnPagina = document.createElement('button');
            btnPagina.className = `pagination-btn ${i === paginaAtualProjetosLista ? 'active' : ''}`;
            btnPagina.textContent = i;
            btnPagina.addEventListener('click', () => {
                if (i !== paginaAtualProjetosLista) {
                    paginaAtualProjetosLista = i;
                    carregarProjetos();
                }
            });
            projetosListaPaginacaoEl.appendChild(btnPagina);
        }
        
        // Botão Próximo
        const btnProximo = document.createElement('button');
        btnProximo.className = `pagination-btn ${paginaAtualProjetosLista >= totalPaginas ? 'disabled' : ''}`;
        btnProximo.textContent = '»';
        btnProximo.disabled = paginaAtualProjetosLista >= totalPaginas;
        btnProximo.addEventListener('click', () => {
            if (paginaAtualProjetosLista < totalPaginas) {
                paginaAtualProjetosLista++;
                carregarProjetos();
            }
        });
        projetosListaPaginacaoEl.appendChild(btnProximo);
    }

    // --- Lógica de Formulário e CRUD ---
    async function abrirFormularioProjeto(projetoId = null) {
        if (!projetoFormModalEl) return;
        
        // Resetar formulário
        projetoFormEl.reset();
        projetoFormIdEl.value = '';
        
        if (projetoId) {
            // Editar projeto existente
            mostrarSpinnerProj(true);
            
            try {
                const { data: projeto, error } = await supabase
                    .from('projetos')
                    .select(`
                        *,
                        responsavel:profiles!projetos_user_id_responsavel_principal_fkey (id, full_name, username),
                        membros:projeto_membros (user_id_membro)
                    `)
                    .eq('id', projetoId)
                    .single();
                    
                if (error) throw error;
                
                if (!projeto) {
                    alert('Projeto não encontrado.');
                    return;
                }
                
                // Preencher formulário
                projetoFormIdEl.value = projeto.id;
                projetoFormNomeEl.value = projeto.nome_projeto || '';
                projetoFormTipoEl.value = projeto.tipo_projeto || '';
                projetoFormResponsavelPrincipalEl.value = projeto.user_id_responsavel_principal || '';
                projetoFormDataInicioEl.value = projeto.data_inicio ? projeto.data_inicio.split('T')[0] : '';
                projetoFormDataPrazoEl.value = projeto.data_prazo ? projeto.data_prazo.split('T')[0] : '';
                projetoFormOrcamentoEl.value = projeto.orcamento_previsto || '';
                projetoFormEstadoModalEl.value = projeto.estado_projeto || 'Planeado';
                projetoFormDescricaoEl.value = projeto.descricao || '';
                projetoFormParqueEl.value = projeto.parque_id || '';
                
                // Selecionar membros
                if (projetoFormMembrosEl && projeto.membros) {
                    const membroIds = projeto.membros.map(m => m.user_id_membro);
                    Array.from(projetoFormMembrosEl.options).forEach(opt => {
                        opt.selected = membroIds.includes(opt.value);
                    });
                }
                
                projetoFormModalTitleEl.textContent = 'Editar Projeto';
            } catch (error) {
                console.error("Erro ao carregar projeto para edição:", error);
                alert(`Erro ao carregar projeto: ${error.message}`);
            } finally {
                mostrarSpinnerProj(false);
            }
        } else {
            // Novo projeto
            projetoFormModalTitleEl.textContent = 'Novo Projeto';
            projetoFormResponsavelPrincipalEl.value = currentUser.id;
            projetoFormEstadoModalEl.value = 'Planeado';
            
            // Data de início padrão = hoje
            const hoje = new Date().toISOString().split('T')[0];
            projetoFormDataInicioEl.value = hoje;
        }
        
        // Abrir modal
        projetoFormModalEl.classList.remove('hidden');
    }

    async function salvarProjeto(event) {
        event.preventDefault();
        
        mostrarSpinnerProj(true);
        
        try {
            const projetoId = projetoFormIdEl.value;
            const isNovo = !projetoId;
            
            // Validar campos obrigatórios
            if (!projetoFormNomeEl.value) {
                alert('O nome do projeto é obrigatório.');
                return;
            }
            
            // Preparar dados do projeto
            const projetoData = {
                nome_projeto: projetoFormNomeEl.value,
                tipo_projeto: projetoFormTipoEl.value,
                user_id_responsavel_principal: projetoFormResponsavelPrincipalEl.value,
                data_inicio: projetoFormDataInicioEl.value,
                data_prazo: projetoFormDataPrazoEl.value,
                orcamento_previsto: projetoFormOrcamentoEl.value ? parseFloat(projetoFormOrcamentoEl.value) : null,
                estado_projeto: projetoFormEstadoModalEl.value,
                descricao: projetoFormDescricaoEl.value,
                parque_id: projetoFormParqueEl.value || null
            };
            
            // Adicionar campos específicos para novo projeto
            if (isNovo) {
                projetoData.user_id_criador = currentUser.id;
                projetoData.created_at = new Date().toISOString();
            }
            
            // Atualizar campos de modificação
            projetoData.updated_at = new Date().toISOString();
            projetoData.user_id_ultima_modificacao = currentUser.id;
            
            // Salvar projeto
            let resultado;
            if (isNovo) {
                resultado = await supabase.from('projetos').insert(projetoData).select();
            } else {
                resultado = await supabase.from('projetos').update(projetoData).eq('id', projetoId).select();
            }
            
            if (resultado.error) throw resultado.error;
            
            const projetoSalvo = resultado.data[0];
            
            // Atualizar membros do projeto
            if (projetoFormMembrosEl && projetoSalvo) {
                // Obter membros selecionados
                const membrosSelecionados = Array.from(projetoFormMembrosEl.selectedOptions).map(opt => opt.value);
                
                // Remover membros existentes
                const { error: deleteError } = await supabase
                    .from('projeto_membros')
                    .delete()
                    .eq('projeto_id', projetoSalvo.id);
                    
                if (deleteError) throw deleteError;
                
                // Adicionar novos membros
                if (membrosSelecionados.length > 0) {
                    const membrosDados = membrosSelecionados.map(userId => ({
                        projeto_id: projetoSalvo.id,
                        user_id_membro: userId,
                        adicionado_por: currentUser.id,
                        data_adicao: new Date().toISOString()
                    }));
                    
                    const { error: insertError } = await supabase
                        .from('projeto_membros')
                        .insert(membrosDados);
                        
                    if (insertError) throw insertError;
                }
            }
            
            // Fechar modal e recarregar projetos
            projetoFormModalEl.classList.add('hidden');
            await carregarProjetos();
            
            alert(`Projeto ${isNovo ? 'criado' : 'atualizado'} com sucesso!`);
        } catch (error) {
            console.error("Erro ao salvar projeto:", error);
            alert(`Erro ao salvar projeto: ${error.message}`);
        } finally {
            mostrarSpinnerProj(false);
        }
    }

    async function abrirDetalhesProjeto(projetoId) {
        if (!projetoDetalhesModalEl || !projetoId) return;
        
        mostrarSpinnerProj(true);
        
        try {
            const { data: projeto, error } = await supabase
                .from('projetos')
                .select(`
                    *,
                    responsavel:profiles!projetos_user_id_responsavel_principal_fkey (id, full_name, username),
                    criador:profiles!projetos_user_id_criador_fkey (id, full_name, username),
                    membros:projeto_membros (
                        profiles (id, full_name, username)
                    ),
                    tarefas (
                        id, titulo, descricao, estado, prioridade, data_prazo,
                        user_atribuido:profiles!tarefas_user_id_atribuido_a_fkey (id, full_name, username)
                    ),
                    despesas (
                        id, descricao, valor, data_despesa, tipo_despesa,
                        user:profiles!despesas_user_id_fkey (id, full_name, username)
                    ),
                    parque:parques (id, nome)
                `)
                .eq('id', projetoId)
                .single();
                
            if (error) throw error;
            
            if (!projeto) {
                alert('Projeto não encontrado.');
                return;
            }
            
            // Preencher detalhes do projeto
            projetoDetalhesIdEl.value = projeto.id;
            projetoDetalhesModalTitleEl.textContent = projeto.nome_projeto;
            detalheNomeProjetoEl.textContent = projeto.nome_projeto;
            detalheTipoProjetoEl.textContent = projeto.tipo_projeto || 'Não especificado';
            detalheResponsavelProjetoEl.textContent = projeto.responsavel?.full_name || projeto.responsavel?.username || 'N/A';
            detalheEstadoProjetoEl.innerHTML = `<span class="badge ${getEstadoProjetoClass(projeto.estado_projeto)}">${projeto.estado_projeto}</span>`;
            detalheDataInicioEl.textContent = formatarData(projeto.data_inicio);
            detalheDataPrazoEl.textContent = formatarData(projeto.data_prazo);
            detalheOrcamentoEl.textContent = formatarMoeda(projeto.orcamento_previsto);
            
            // Calcular total de despesas
            const totalDespesas = (projeto.despesas || []).reduce((sum, d) => sum + (parseFloat(d.valor) || 0), 0);
            detalheDespesasTotalEl.textContent = formatarMoeda(totalDespesas);
            
            // Calcular saldo do orçamento
            const saldoOrcamento = (parseFloat(projeto.orcamento_previsto) || 0) - totalDespesas;
            detalheSaldoOrcamentoEl.textContent = formatarMoeda(saldoOrcamento);
            detalheSaldoOrcamentoEl.className = saldoOrcamento < 0 ? 'text-red-600 font-bold' : 'text-green-600';
            
            detalheDescricaoProjetoEl.textContent = projeto.descricao || 'Sem descrição.';
            
            // Listar membros
            detalheListaMembrosEl.innerHTML = '';
            if (projeto.membros && projeto.membros.length > 0) {
                projeto.membros.forEach(m => {
                    const membroLi = document.createElement('li');
                    membroLi.className = 'membro-item';
                    membroLi.textContent = m.profiles?.full_name || m.profiles?.username || 'Membro desconhecido';
                    detalheListaMembrosEl.appendChild(membroLi);
                });
            } else {
                detalheListaMembrosEl.innerHTML = '<li>Nenhum membro adicional.</li>';
            }
            
            // Contar tarefas por estado
            const tarefasPendentes = (projeto.tarefas || []).filter(t => t.estado === 'Pendente').length;
            const tarefasProgresso = (projeto.tarefas || []).filter(t => t.estado === 'Em Progresso').length;
            const tarefasConcluidas = (projeto.tarefas || []).filter(t => t.estado === 'Concluída').length;
            
            detalheTarefasPendentesEl.textContent = tarefasPendentes;
            detalheTarefasProgressoEl.textContent = tarefasProgresso;
            detalheTarefasConcluidasEl.textContent = tarefasConcluidas;
            
            // Listar tarefas
            detalheListaTarefasContainerEl.innerHTML = '';
            if (projeto.tarefas && projeto.tarefas.length > 0) {
                const tarefasTable = document.createElement('table');
                tarefasTable.className = 'detalhe-tabela';
                tarefasTable.innerHTML = `
                    <thead>
                        <tr>
                            <th>Título</th>
                            <th>Responsável</th>
                            <th>Estado</th>
                            <th>Prazo</th>
                        </tr>
                    </thead>
                    <tbody id="detalheTarefasTableBody"></tbody>
                `;
                detalheListaTarefasContainerEl.appendChild(tarefasTable);
                
                const tbody = document.getElementById('detalheTarefasTableBody');
                projeto.tarefas.forEach(t => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${t.titulo}</td>
                        <td>${t.user_atribuido?.full_name || t.user_atribuido?.username || 'N/A'}</td>
                        <td><span class="badge ${getEstadoTarefaClassProj(t.estado)}">${t.estado}</span></td>
                        <td>${formatarData(t.data_prazo)}</td>
                    `;
                    tbody.appendChild(tr);
                });
            } else {
                detalheListaTarefasContainerEl.innerHTML = '<p>Nenhuma tarefa associada a este projeto.</p>';
            }
            
            // Listar despesas
            detalheListaDespesasContainerEl.innerHTML = '';
            if (projeto.despesas && projeto.despesas.length > 0) {
                const despesasTable = document.createElement('table');
                despesasTable.className = 'detalhe-tabela';
                despesasTable.innerHTML = `
                    <thead>
                        <tr>
                            <th>Descrição</th>
                            <th>Tipo</th>
                            <th>Data</th>
                            <th>Valor</th>
                            <th>Registado por</th>
                        </tr>
                    </thead>
                    <tbody id="detalheDespesasTableBody"></tbody>
                `;
                detalheListaDespesasContainerEl.appendChild(despesasTable);
                
                const tbody = document.getElementById('detalheDespesasTableBody');
                projeto.despesas.forEach(d => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${d.descricao || 'Sem descrição'}</td>
                        <td>${d.tipo_despesa || 'Não categorizada'}</td>
                        <td>${formatarData(d.data_despesa)}</td>
                        <td>${formatarMoeda(d.valor)}</td>
                        <td>${d.user?.full_name || d.user?.username || 'N/A'}</td>
                    `;
                    tbody.appendChild(tr);
                });
            } else {
                detalheListaDespesasContainerEl.innerHTML = '<p>Nenhuma despesa registada para este projeto.</p>';
            }
            
            // Configurar botão de edição
            if (projEditarDesdeDetalhesBtnEl) {
                projEditarDesdeDetalhesBtnEl.dataset.id = projeto.id;
            }
            
            // Abrir modal
            projetoDetalhesModalEl.classList.remove('hidden');
        } catch (error) {
            console.error("Erro ao carregar detalhes do projeto:", error);
            alert(`Erro ao carregar detalhes: ${error.message}`);
        } finally {
            mostrarSpinnerProj(false);
        }
    }

    // --- Event Listeners ---
    // Botão voltar ao dashboard
    if (voltarDashboardBtnEl) {
        voltarDashboardBtnEl.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }
    
    // Filtros e mudança de vista
    if (projetoAplicarFiltrosBtnEl) {
        projetoAplicarFiltrosBtnEl.addEventListener('click', () => {
            paginaAtualProjetosLista = 1;
            carregarProjetos();
        });
    }
    
    if (projetoViewModeEl) {
        projetoViewModeEl.addEventListener('change', renderizarVistaAtualProjetos);
    }
    
    // Botão novo projeto
    if (projetoNovoBtnEl) {
        projetoNovoBtnEl.addEventListener('click', () => abrirFormularioProjeto());
    }
    
    // Formulário de projeto
    if (projetoFormEl) {
        projetoFormEl.addEventListener('submit', salvarProjeto);
    }
    
    // Botões fechar modal
    projFecharFormModalBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            projetoFormModalEl.classList.add('hidden');
        });
    });
    
    projFecharDetalhesModalBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            projetoDetalhesModalEl.classList.add('hidden');
        });
    });
    
    // Botões de edição e detalhes (delegação de eventos)
    document.addEventListener('click', event => {
        // Botões de detalhes
        if (event.target.classList.contains('proj-detalhes-btn')) {
            const projetoId = event.target.dataset.id;
            if (projetoId) {
                abrirDetalhesProjeto(projetoId);
            }
        }
        
        // Botões de edição
        if (event.target.classList.contains('proj-editar-btn')) {
            const projetoId = event.target.dataset.id;
            if (projetoId) {
                abrirFormularioProjeto(projetoId);
            }
        }
    });
    
    // --- Inicialização da Página ---
    async function initProjetosPage() {
        try {
            await carregarDadosIniciaisProjetos();
            await carregarProjetos();
            console.log("Subaplicação Projetos inicializada com sucesso.");
        } catch (error) {
            console.error("Erro ao inicializar página de projetos:", error);
            alert(`Erro ao inicializar: ${error.message}`);
        }
    }
    
    // Iniciar a página
    initProjetosPage();
});
