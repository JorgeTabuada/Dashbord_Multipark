// js/auth_global.js (REVISTO v14)

let currentUserGlobalAuth = null;
let userProfileGlobalAuth = null;
// Promise para controlar a resolução da verificação de estado inicial
let authInitialStatePromise = null;
let authInitialStatePromiseResolve = null;

function getSupabaseFromAuth() {
    if (typeof window.getSupabaseClient !== 'function') {
        console.error("ERRO CRÍTICO (auth_global.js): getSupabaseClient não definido.");
        return null;
    }
    const client = window.getSupabaseClient();
    if (!client) {
        console.error("ERRO CRÍTICO (auth_global.js): Instância Supabase client é nula.");
    }
    return client;
}

async function fetchUserProfileAndStoreAuth(supabaseInstance, userId) {
    if (!userId || !supabaseInstance) {
        localStorage.removeItem('userProfile');
        userProfileGlobalAuth = null;
        return null;
    }
    try {
        const { data: profile, error: profileError } = await supabaseInstance
            .from('profiles')
            .select('id, full_name, role, email, parque_id_principal, cidades_associadas, parques_associados_ids')
            .eq('id', userId)
            .single();

        if (profileError && profileError.code !== 'PGRST116') { // PGRST116 = "single row not found"
            console.error("auth_global.js: Erro ao buscar perfil:", profileError.message);
            userProfileGlobalAuth = null;
        } else if (profile) {
            userProfileGlobalAuth = {
                id: profile.id,
                full_name: profile.full_name || currentUserGlobalAuth?.email?.split('@')[0] || 'Utilizador',
                role: profile.role || 'default',
                email: profile.email || currentUserGlobalAuth?.email,
                parque_associado_id: profile.parque_id_principal || null,
                cidades_associadas: profile.cidades_associadas || [],
                parques_associados_ids: profile.parques_associados_ids || []
            };
        } else {
            console.warn("auth_global.js: Perfil não encontrado para ID:", userId, ". Usando dados da sessão.");
            userProfileGlobalAuth = {
                id: currentUserGlobalAuth.id,
                full_name: currentUserGlobalAuth.email?.split('@')[0] || 'Utilizador',
                role: currentUserGlobalAuth.app_metadata?.userrole || 'default',
                email: currentUserGlobalAuth.email
            };
        }
        localStorage.setItem('userProfile', JSON.stringify(userProfileGlobalAuth));
        return userProfileGlobalAuth;
    } catch (e) {
        console.error("auth_global.js: Exceção ao buscar perfil:", e);
        userProfileGlobalAuth = null;
        localStorage.removeItem('userProfile');
        return null;
    }
}

function initializeAuthStatePromise() {
    if (!authInitialStatePromise) {
        authInitialStatePromise = new Promise(resolve => {
            authInitialStatePromiseResolve = resolve;
        });
         // Timeout para garantir que a promise resolve mesmo que onAuthStateChange não dispare rapidamente
        setTimeout(() => {
            if (authInitialStatePromiseResolve) {
                console.warn("auth_global.js: Timeout na resolução da promise de estado inicial. Resolvendo com estado atual.");
                authInitialStatePromiseResolve(currentUserGlobalAuth); // Resolve com o que tivermos
                authInitialStatePromiseResolve = null; // Limpa o resolver
            }
        }, 3000); // Timeout de 3 segundos
    }
}
initializeAuthStatePromise(); // Inicia a promise na carga do script

function setupAuthStateListenerInternal() {
    const supabase = getSupabaseFromAuth();
    if (!supabase) {
        console.error("auth_global.js: Falha grave ao configurar onAuthStateChange - Supabase client nulo.");
        if (authInitialStatePromiseResolve) {
            authInitialStatePromiseResolve(null); // Indica falha de autenticação
            authInitialStatePromiseResolve = null;
        }
        return;
    }

    supabase.auth.onAuthStateChange(async (event, session) => {
        console.log("auth_global.js: Evento onAuthStateChange:", event, session ? `User: ${session.user.email}` : "Sem sessão");

        let previousUser = currentUserGlobalAuth;
        if (event === 'SIGNED_IN' && session) {
            currentUserGlobalAuth = session.user;
            await fetchUserProfileAndStoreAuth(supabase, session.user.id);
        } else if (event === 'SIGNED_OUT') {
            currentUserGlobalAuth = null;
            userProfileGlobalAuth = null;
            localStorage.removeItem('userProfile');
            localStorage.removeItem('parqueSelecionadoMultiparkId');
        } else if (event === 'INITIAL_SESSION') {
            if (session) {
                currentUserGlobalAuth = session.user;
                await fetchUserProfileAndStoreAuth(supabase, session.user.id);
            } else {
                currentUserGlobalAuth = null;
                userProfileGlobalAuth = null;
                localStorage.removeItem('userProfile');
            }
        } else if (event === 'TOKEN_REFRESHED' && session) {
            currentUserGlobalAuth = session.user; // Atualiza o user global
            // O perfil geralmente não muda com refresh de token, mas pode revalidar se necessário
            if (!userProfileGlobalAuth || userProfileGlobalAuth.id !== session.user.id) {
                 await fetchUserProfileAndStoreAuth(supabase, session.user.id);
            }
        }
        
        // Resolve a promise de estado inicial, se ainda estiver pendente
        if (authInitialStatePromiseResolve) {
            authInitialStatePromiseResolve(currentUserGlobalAuth);
            authInitialStatePromiseResolve = null;
        }

        // Lógica de UI/Redirecionamento APENAS para index.html
        if (typeof window.showPagePrincipal === 'function' && (window.location.pathname.endsWith('index.html') || window.location.pathname === '/')) {
            if (currentUserGlobalAuth) {
                window.showPagePrincipal('dashboard');
            } else {
                window.showPagePrincipal('login');
            }
        } else if (event === 'SIGNED_OUT' && !currentUserGlobalAuth) {
            // Se ocorreu SIGNED_OUT e não estamos no index.html, redireciona para lá.
             if (!window.location.pathname.endsWith('index.html') && window.location.pathname !== '/') {
                console.log("auth_global.js: SIGNED_OUT, redirecionando para index.html desde sub-página.");
                window.location.href = 'index.html';
            }
        }
    });
}

window.checkAuthStatus = async function() {
    console.log("auth_global.js: window.checkAuthStatus() chamada.");
    const supabase = getSupabaseFromAuth();
    if (!supabase) return null;

    // Se a promise de estado inicial já foi criada, espera por ela.
    if (authInitialStatePromise) {
        console.log("auth_global.js: Aguardando promise de estado de autenticação inicial...");
        await authInitialStatePromise; // Espera que onAuthStateChange (INITIAL_SESSION) resolva
    } else { // Se a promise não foi criada (o que seria estranho), tenta obter a sessão.
        console.warn("auth_global.js: authInitialStatePromise não definida, tentando getSession diretamente em checkAuthStatus.");
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            currentUserGlobalAuth = session.user;
            await fetchUserProfileAndStoreAuth(supabase, session.user.id);
        } else {
            currentUserGlobalAuth = null;
            userProfileGlobalAuth = null;
        }
    }
    
    console.log("auth_global.js: checkAuthStatus - currentUserGlobalAuth:", currentUserGlobalAuth);
    return currentUserGlobalAuth; // Retorna o utilizador (ou null)
};

window.getCurrentUser = function() { return currentUserGlobalAuth; };
window.getCurrentUserProfile = function() {
    if (!userProfileGlobalAuth && localStorage.getItem('userProfile')) {
        try { userProfileGlobalAuth = JSON.parse(localStorage.getItem('userProfile')); } catch(e) {}
    }
    return userProfileGlobalAuth;
};

window.signInUser = async function(email, password) { /* ... (a tua função signInUser, mas garante que usa getSupabaseFromAuth()) ... */ };
window.handleLogoutGlobal = async function() { /* ... (a tua função handleLogoutGlobal, mas garante que usa getSupabaseFromAuth()) ... */ };

// Inicializa o listener
setupAuthStateListenerInternal();
console.log("auth_global.js carregado e listener configurado.");
