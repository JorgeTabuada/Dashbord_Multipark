// js/supabaseClient.js

// ATENÇÃO: Estas são as tuas credenciais REAIS.
const SUPABASE_URL = "https://ioftqsvjqwjeprsckeym.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvZnRxc3ZqcXdqZXByc2NrZXltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxNTYwNzQsImV4cCI6MjA2MjczMjA3NH0.TXDfhioMFVNxLhjKgpXAxnKCPOl5n8QWpOkX2eafbYw";

let supabaseClientInstance = null;
let initializationAttempted = false;

function initSupabase() {
    initializationAttempted = true;
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        const errorMessage = "ERRO CRÍTICO (supabaseClient.js): Credenciais do Supabase (URL ou Chave Anon) não estão definidas! A aplicação não funcionará.";
        console.error(errorMessage);
        // Considerar mostrar um alerta mais visível na UI se isto acontecer em produção
        // document.body.innerHTML = `<div style="color: red; padding: 20px; font-size: 1.2em; text-align: center;">${errorMessage}</div>`;
        return null;
    }

    try {
        // Verifica se a biblioteca global 'supabase' (do CDN) foi carregada
        if (typeof supabase !== 'undefined' && supabase?.createClient) {
            supabaseClientInstance = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            console.log("supabaseClient.js: Cliente Supabase inicializado com sucesso.");
            return supabaseClientInstance;
        } else {
            console.error("ERRO CRÍTICO (supabaseClient.js): Biblioteca Supabase (do CDN @supabase/supabase-js@2) não carregada ou 'supabase.createClient' não é uma função. Verifique a inclusão e a ordem dos scripts no HTML.");
            return null;
        }
    } catch (error) {
        console.error("ERRO CRÍTICO (supabaseClient.js): Falha ao inicializar o cliente Supabase.", error);
        return null;
    }
}

// Tenta inicializar assim que o script é carregado
initSupabase();

window.getSupabaseClient = function() {
    if (!supabaseClientInstance && !initializationAttempted) {
        // Se ainda não se tentou inicializar (pouco provável se o script carregou), tenta agora.
        console.warn("getSupabaseClient: Primeira tentativa de inicialização do Supabase Client.");
        initSupabase();
    }
    if (!supabaseClientInstance) {
        console.error("getSupabaseClient: Cliente Supabase não está inicializado. Verifique erros anteriores e a ordem de carregamento dos scripts.");
    }
    return supabaseClientInstance;
};

console.log("supabaseClient.js carregado e tentou inicializar o cliente Supabase.");
