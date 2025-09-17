const fs = require('fs');
const path = require('path');

const appDir = path.join(__dirname, '..', 'app');
const results = [];

// Função para analisar cada página
function analyzePage(filePath, relativePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  const analysis = {
    path: relativePath,
    name: path.basename(path.dirname(filePath)),
    hasAuth: content.includes('useAuth'),
    hasSupabase: content.includes('supabase'),
    hasFirebase: content.includes('firebase'),
    hasHooks: content.includes('use'),
    hasComponents: content.includes('@/components'),
    hasTODO: content.includes('TODO') || content.includes('FIXME'),
    hasError: content.includes('error') || content.includes('Error'),
    isComplete: !content.includes('// TODO') && !content.includes('Coming soon'),
    lines: content.split('\n').length
  };
  
  // Verificar se tem funcionalidade implementada
  analysis.hasContent = content.length > 500 && !content.includes('Coming soon');
  
  return analysis;
}

// Percorrer todas as páginas
function walkDir(dir, relativeDir = '') {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const relativePath = path.join(relativeDir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && file !== 'api' && file !== 'components' && file !== 'hooks') {
      walkDir(fullPath, relativePath);
    } else if (file === 'page.tsx') {
      const analysis = analyzePage(fullPath, relativePath);
      results.push(analysis);
    }
  });
}

// Executar análise
walkDir(appDir);

// Ordenar por completude
results.sort((a, b) => {
  if (a.hasContent && !b.hasContent) return -1;
  if (!a.hasContent && b.hasContent) return 1;
  return b.lines - a.lines;
});

// Gerar relatório
console.log('='.repeat(80));
console.log('ANÁLISE DAS PÁGINAS DO MULTI PARK');
console.log('='.repeat(80));
console.log('');

console.log('📊 ESTATÍSTICAS GERAIS:');
console.log(`Total de páginas: ${results.length}`);
console.log(`Páginas completas: ${results.filter(r => r.hasContent).length}`);
console.log(`Páginas incompletas: ${results.filter(r => !r.hasContent).length}`);
console.log(`Com Supabase: ${results.filter(r => r.hasSupabase).length}`);
console.log(`Com Firebase: ${results.filter(r => r.hasFirebase).length}`);
console.log('');

console.log('✅ PÁGINAS COMPLETAS:');
results.filter(r => r.hasContent).forEach(page => {
  console.log(`  • ${page.name.padEnd(25)} - ${page.lines} linhas`);
});
console.log('');

console.log('❌ PÁGINAS INCOMPLETAS OU VAZIAS:');
results.filter(r => !r.hasContent).forEach(page => {
  console.log(`  • ${page.name.padEnd(25)} - ${page.lines} linhas`);
});
console.log('');

console.log('🔧 NECESSITAM ATENÇÃO (têm TODOs ou erros):');
results.filter(r => r.hasTODO || r.hasError).forEach(page => {
  console.log(`  • ${page.name}`);
});

// Guardar JSON detalhado
fs.writeFileSync(
  path.join(__dirname, 'pages-analysis.json'),
  JSON.stringify(results, null, 2)
);

console.log('\n📁 Relatório detalhado guardado em: analysis/pages-analysis.json');
