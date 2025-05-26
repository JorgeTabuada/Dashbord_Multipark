// js/app_principal.js - Lógica para index.html (Login, Dashboard e Navegação)

document.addEventListener('DOMContentLoaded', () => {
    const scriptName = "AppPrincipal.js";
    console.log(`${scriptName}: DOMContentLoaded acionado.`);

    // Seletores de Elementos DOM para index.html
    const loginPageEl = document.getElementById('loginPagePrincipal');
    const dashboardPageEl = document.getElementById('dashboardPagePrincipal');
    const loginFormEl = document.getElementById('loginFormPrincipal');
    const loginErrorMessageEl = document.getElementById('loginErrorMessagePrincipal');
    const userNamePrincipalEl = document.getElementById('userNamePrincipal');
    const parkSelectorPrincipalEl = document.getElementById('parkSelectorPrincipal');
    const logoutButtonEl = document.getElementById('logoutButtonPrincipal');
    const dashboardGridPrincipalEl = document.getElementById('dashboardGridPrincipal'); // Grelha para os botões das sub-apps
    
    const messageModalEl = document.getElementById('messageModal');
    const modalTitleEl = document.getElementById('modalTitle');
    const modalMessageTextEl = document.getElementById('modalMessageText');
    const modalCloseButtonEl = document.getElementById('modalCloseButton');

    // Validação inicial de elementos cruciais
    if (!loginPageEl || !dashboardPageEl || !loginFormEl || !logoutButtonEl || !userNamePrincipalEl || !parkSelectorPrincipalEl || !dashboardGridPrincipalEl) {
        console.error(`ERRO CRÍTICO (${scriptName}): Um ou mais elementos DOM principais do index.html não foram encontrados!`);
        // Considerar mostrar uma mensagem de erro mais visível para o utilizador aqui
        // document.body.innerHTML = "<p style='color:red; text-align:center; padding-top: 50px;'>Erro crítico na configuração da página principal. Contacte o suporte.</p>";
        return; 
    }
    if (typeof window.getSupabaseClient !== 'function') {
        console.error(`ERRO CRÍTICO (${scriptName}): Função getSupabaseClient não definida! Verifique se supabaseClient.js foi carregado antes deste script.`);
        return;
    }
    if (typeof window.checkAuthStatus !== 'function' || typeof window.signInUser !== 'function' || typeof window.handleLogoutGlobal !== 'function') {
        console.error(`ERRO CRÍTICO (${scriptName}): Uma ou mais funções globais de auth_global.js não estão definidas!`);
        return;
    }

    // Mapeamento de IDs de subaplicações para nomes de ficheiros HTML
    const fileNameMapping = {
        'reservas': 'reservas.html',
        'recolhas': 'recolhas.html', // Ajustado de recolhas_v2.html para consistência, confirma o nome real
        'entregas': 'entregas.html', // Ajustado de entregas_v2.html
        'cancelamentos': 'cancelamentos.html', // Ajustado de cancelamentos_v2.html
        'caixa_multipark': 'Caixa Multipark.html', // Mantém se for este o nome
        'fecho_caixa': 'fecho_caixa_v2.html',
        'confirmacao_caixa': 'confirmacao_caixa_v2.html',
        'perdidos_achados': 'perdidos_achados.html',
        'formacao_apoio': 'formacao_apoio.html',
        'gestao_utilizadores': 'gestao_utilizadores.html',
        'gestao_parques': 'gestao_parques.html',
        'relatorios': 'relatorios.html',
        'estatisticas': 'estatisticas.html', // Adicionado, se for uma app
        'configuracoes': 'configuracoes.html',
        'manutencao': 'manutencao.html',
        'gestao_veiculos': 'gestao_veiculos.html',
        'gestao_clientes': 'gestao_clientes.html',
        'gestao_contratos': 'gestao_contratos.html',
        'gestao_faturas': 'gestao_faturas.html',
        'gestao_pagamentos': 'gestao_pagamentos.html',
        'gestao_reclamacoes': 'gestao_reclamacoes.html',
        'gestao_eventos': 'gestao_eventos.html',
        'gestao_promocoes': 'gestao_promocoes.html',
        'gestao_tarifas': 'gestao_tarifas.html',
        // Adiciona outros mapeamentos se necessário
        'produtividade_condutores': 'produtividade_condutores.html',
        'comportamentos': 'comportamentos.html',
        'mapa_ocupacao': 'mapa_ocupacao.html',
        'bi_interno': 'bi_interno.html',
        'horarios_ordenados': 'horarios_ordenados.html',
        'acessos_alteracoes': 'gestao_utilizadores.html' // Já tinhas gestao_utilizadores
    };

    // Definição das Subaplicações e suas categorias
    const subApplications = [
        { id: 'reservas', name: 'Reservas', category: 'Operacional', icon: '📅' },
        { id: 'recolhas', name: 'Recolhas', category: 'Operacional', icon: '🚚' },
        { id: 'entregas', name: 'Entregas', category: 'Operacional', icon: '📤' },
        { id: 'cancelamentos', name: 'Cancelamentos', category: 'Operacional', icon: '❌' },
        { id: 'caixa_multipark', name: 'Caixa Multipark', category: 'Operacional', icon: '💰' },
        { id: 'confirmacao_caixa', name: 'Confirmação de Caixa', category: 'Operacional', icon: '✔️' },
        { id: 'gestao_veiculos', name: 'Gestão de Veículos', category: 'Operacional', icon: '🚗' },
        { id: 'gestao_clientes', name: 'Gestão de Clientes', category: 'Operacional', icon: '👥' },
        { id: 'gestao_contratos', name: 'Gestão de Contratos', category: 'Operacional', icon: '📜' },
        { id: 'gestao_eventos', name: 'Gestão de Eventos', category: 'Operacional', icon: '🎉' },
        
        { id: 'despesas', name: 'Despesas', category: 'Gestão', icon: '💸' },
        { id: 'faturacao', name: 'Faturação', category: 'Financeiro', icon: '🧾' }, // Movido para Financeiro
        { id: 'gestao_pagamentos', name: 'Gestão de Pagamentos', category: 'Financeiro', icon: '💳' },
        { id: 'gestao_tarifas', name: 'Gestão de Tarifas', category: 'Financeiro', icon: '🏷️' },
        { id: 'horarios_ordenados', name: 'Horários & Ordenados', category: 'Gestão', icon: '🕒' },
        { id: 'projetos', name: 'Projetos', category: 'Gestão', icon: '🏗️' },
        { id: 'tarefas', name: 'Tarefas', category: 'Gestão', icon: '📋' },

        { id: 'relatorios', name: 'Relatórios', category: 'Análise', icon: '📊' },
        { id: 'estatisticas', name: 'Estatísticas Gerais', category: 'Análise', icon: '📈' },
        { id: 'produtividade_condutores', name: 'Produtividade Condutores', category: 'Análise', icon: '🧑‍✈️' },
        { id: 'comportamentos', name: 'Comportamentos', category: 'Análise', icon: '🚦' },
        { id: 'mapa_ocupacao', name: 'Mapa de Ocupação', category: 'Análise', icon: '🗺️' },
        { id: 'bi_interno', name: 'BI Interno', category: 'Análise', icon: '💡' },
        
        { id: 'marketing', name: 'Marketing', category: 'Marketing', icon: '📢' },
        { id: 'gestao_promocoes', name: 'Gestão de Promoções', category: 'Marketing', icon: '🎁' },

        { id: 'perdidos_achados', name: 'Perdidos e Achados', category: 'Suporte', icon: '🔑' },
        { id: 'formacao_apoio', name: 'Formação e Apoio', category: 'Suporte', icon: '🎓' },
        { id: 'gestao_reclamacoes', name: 'Comentários & Reclamações', category: 'Suporte', icon: '🗣️' },
        
        { id: 'gestao_utilizadores', name: 'Gestão de Utilizadores', category: 'Administração', icon: '⚙️' },
        { id: 'gestao_parques', name: 'Gestão de Parques', category: 'Administração', icon: '🅿️' },
        { id: 'auditorias_internas', name: 'Auditorias Internas', category: 'Administração', icon: '🔍' },
        // { id: 'acessos_alteracoes', name: 'Acessos e Alterações', category: 'Administração', icon: '🛡️' }, // Pode ser coberto por gestao_utilizadores ou logs
        { id: 'configuracoes', name: 'Configurações Sistema', category: 'Sistema', icon: '🔧'},
        { id: 'manutencao', name: 'Manutenção Sistema', category: 'Sistema', icon: '🛠️' }
    ];
    const orderedCategoryNames = ['Operacional', 'Gestão', 'Financeiro', 'Análise', 'Marketing', 'Suporte', 'Administração', 'Sistema'];


    // Função para mostrar/esconder as secções principais de Login e Dashboard no index.html
    // Esta função é chamada pelo auth_global.js ou localmente por este script.
    window.showPagePrincipal = function(pageToShow) {
        console.log(`${scriptName}: window.showPagePrincipal chamada com: ${pageToShow}`);
        if (!loginPageEl || !dashboardPageEl) {
            console.error(`${scriptName}: Elementos loginPagePrincipal ou dashboardPagePrincipal não encontrados.`);
            return;
        }
        loginPageEl.classList.add('hidden');
        dashboardPageEl.classList.add('hidden');
        
        if (pageToShow === 'login') {
            loginPageEl.classList.remove('hidden');
            console.log(`${scriptName}: Mostrando página de LOGIN.`);
        } else if (pageToShow === 'dashboard') {
            dashboardPageEl.classList.remove('hidden');
            console.log(`${scriptName}: Mostrando página de DASHBOARD.`);
            // Assegura que o cabeçalho e os botões são atualizados ao mostrar o dashboard
            window.updateDashboardHeader(); 
            renderDashboardButtons();
        } else {
            console.warn(`${scriptName} (showPagePrincipal): Página desconhecida: ${pageToShow}. Mostrando login por defeito.`);
            loginPageEl.classList.remove('hidden');
        }
    };

    function renderDashboardButtons() {
        if (!dashboardGridPrincipalEl) {
            console.error(`${scriptName}: Elemento dashboardGridPrincipalEl não encontrado.`);
            return;
        }
        dashboardGridPrincipalEl.innerHTML = ''; // Limpa botões existentes
        const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
        const userRole = userProfile?.role || 'default';

        // TODO: Implementar lógica de permissões baseada em permissoesPorRole se necessário,
        // ou mostrar todas as apps como está agora.
        const appsVisiveis = subApplications; // Por agora, mostra todas

        if (appsVisiveis.length === 0) {
            dashboardGridPrincipalEl.innerHTML = '<p class="text-center text-gray-500 col-span-full">Nenhuma subaplicação disponível para o seu perfil.</p>';
            return;
        }

        appsVisiveis.sort((a, b) => a.name.localeCompare(b.name)).forEach(app => {
            const button = document.createElement('button');
            button.className = 'subapp-button-principal'; // Usar a classe definida no teu style_principal.css
            button.dataset.appId = app.id;
            // Adiciona ícone e nome
            button.innerHTML = `
                <span class="text-2xl mb-2">${app.icon || '📁'}</span>
                <span>${app.name.toUpperCase()}</span>
            `;
            
            button.addEventListener('click', () => {
                const fileName = fileNameMapping[app.id] || `${app.id}.html`;
                console.log(`${scriptName}: Navegando para ${fileName} (App ID: ${app.id})`);
                window.location.href = fileName;
            });
            dashboardGridPrincipalEl.appendChild(button);
        });
    }

    window.updateDashboardHeader = async function() {
        const supabase = window.getSupabaseClient();
        if (!supabase) {
            console.error("updateDashboardHeader: Supabase client não disponível.");
            if (userNamePrincipalEl) userNamePrincipalEl.textContent = 'UTILIZADOR';
            return;
        }

        const userProfileData = JSON.parse(localStorage.getItem('userProfile') || '{}');
        let userName = userProfileData.full_name || userProfileData.email?.split('@')[0] || 'Utilizador';
        if (userNamePrincipalEl) userNamePrincipalEl.textContent = userName.toUpperCase();

        // Popular seletor de parques
        if (parkSelectorPrincipalEl) {
            try {
                const { data: parques, error } = await supabase
                    .from('parques') // Nome da tua tabela de parques
                    .select('id_pk, nome_parque, cidade') // Colunas que precisas
                    .eq('ativo', true)
                    .order('nome_parque');

                parkSelectorPrincipalEl.innerHTML = ''; // Limpar opções existentes
                if (error) {
                    console.error("Erro ao carregar parques:", error);
                    const defaultOption = document.createElement('option');
                    defaultOption.value = ""; defaultOption.textContent = "Erro ao carregar parques";
                    parkSelectorPrincipalEl.appendChild(defaultOption);
                } else if (parques && parques.length > 0) {
                    parques.forEach(parque => {
                        const option = document.createElement('option');
                        option.value = parque.id_pk; 
                        option.textContent = `${parque.nome_parque.toUpperCase()} (${parque.cidade || 'N/A'})`;
                        parkSelectorPrincipalEl.appendChild(option);
                    });

                    // Lógica para definir o parque selecionado
                    const storedParkId = localStorage.getItem('parqueSelecionadoMultiparkId');
                    const userAssociatedParkId = userProfileData?.parque_id_principal; // Supondo que tens 'parque_id_principal' no perfil

                    if (storedParkId && parkSelectorPrincipalEl.querySelector(`option[value="${storedParkId}"]`)) {
                        parkSelectorPrincipalEl.value = storedParkId;
                    } else if (userAssociatedParkId && parkSelectorPrincipalEl.querySelector(`option[value="${userAssociatedParkId}"]`)) {
                        parkSelectorPrincipalEl.value = userAssociatedParkId;
                        localStorage.setItem('parqueSelecionadoMultiparkId', userAssociatedParkId);
                    } else { // Fallback para o primeiro da lista se nenhum estiver guardado/associado
                        parkSelectorPrincipalEl.value = parques[0].id_pk;
                        localStorage.setItem('parqueSelecionadoMultiparkId', parques[0].id_pk);
                    }
                } else {
                    const defaultOption = document.createElement('option');
                    defaultOption.value = ""; defaultOption.textContent = "Nenhum parque disponível";
                    parkSelectorPrincipalEl.appendChild(defaultOption);
                }
            } catch (e) {
                console.error("Exceção ao atualizar seletor de parques:", e);
                 const defaultOption = document.createElement('option');
                 defaultOption.value = ""; defaultOption.textContent = "Erro - parques indisponíveis";
                 parkSelectorPrincipalEl.appendChild(defaultOption);
            }
        }
    };
    
    if (loginFormEl) {
        loginFormEl.addEventListener('submit', async (event) => {
            event.preventDefault();
            const emailInput = document.getElementById('emailPrincipal');
            const passwordInput = document.getElementById('passwordPrincipal');
            const email = emailInput ? emailInput.value : "";
            const password = passwordInput ? passwordInput.value : "";

            if (loginErrorMessageEl) loginErrorMessageEl.classList.add('hidden');
            if (!email || !password) {
                if (loginErrorMessageEl) { loginErrorMessageEl.textContent = "Email e Palavra-passe são obrigatórios."; loginErrorMessageEl.classList.remove('hidden'); }
                return;
            }
            
            const success = await window.signInUser(email, password); // Chama signInUser de auth_global.js
            if (!success && loginErrorMessageEl) {
                loginErrorMessageEl.textContent = "Email ou palavra-passe inválidos.";
                loginErrorMessageEl.classList.remove('hidden');
            }
            // A transição para o dashboard é agora gerida pelo onAuthStateChange em auth_global.js
            // que chamará showPagePrincipal('dashboard') se o login for bem-sucedido.
        });
    }

    if (logoutButtonEl) {
        logoutButtonEl.addEventListener('click', async () => {
            console.log(`${scriptName}: Botão de logout clicado.`);
            await window.handleLogoutGlobal(); // handleLogoutGlobal de auth_global.js
        });
    }

    if (parkSelectorPrincipalEl) {
        parkSelectorPrincipalEl.addEventListener('change', (event) => {
            const selectedParkId = event.target.value;
            const selectedParkName = event.target.options[event.target.selectedIndex].text;
            localStorage.setItem('parqueSelecionadoMultiparkId', selectedParkId);
            localStorage.setItem('parqueSelecionadoMultiparkNome', selectedParkName);
            console.log(`${scriptName}: Parque selecionado (ID): ${selectedParkId}, Nome: ${selectedParkName}`);
            window.dispatchEvent(new CustomEvent('parkChanged', { detail: { parqueId: selectedParkId, nomeParque: selectedParkName } }));
        });
    }

    function showModalMessage(title, message) {
        if(modalTitleEl) modalTitleEl.textContent = title;
        if(modalMessageTextEl) modalMessageTextEl.textContent = message;
        if(messageModalEl) messageModalEl.classList.remove('hidden');
    }
    if(modalCloseButtonEl) modalCloseButtonEl.addEventListener('click', () => {
        if(messageModalEl) messageModalEl.classList.add('hidden');
    });
    if(messageModalEl) messageModalEl.addEventListener('click', (event) => { 
        if (event.target === messageModalEl) {
            if(messageModalEl) messageModalEl.classList.add('hidden');
        } 
    });
    
    // --- Inicialização da Aplicação Principal (index.html) ---
    async function initAppPrincipal() {
        console.log(`${scriptName}: initAppPrincipal - A chamar window.checkAuthStatus().`);
        // A função checkAuthStatus (em auth_global.js) deve agora determinar o estado
        // e, se estivermos no index.html (o que é o caso aqui), ela mesma (ou o onAuthStateChange)
        // deve chamar window.showPagePrincipal com 'login' ou 'dashboard'.
        await window.checkAuthStatus();
        console.log(`${scriptName}: initAppPrincipal - Chamada a checkAuthStatus concluída.`);
    }
    
    initAppPrincipal(); // Chama na carga do DOM
});
