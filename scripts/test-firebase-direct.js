// Script de teste direto do Firebase
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, limit } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB6KyYEmpfCs-riq9Iz2Es2IkESXs41kpI",
  authDomain: "admin-multipark.firebaseapp.com",
  projectId: "admin-multipark",
  storageBucket: "admin-multipark.appspot.com",
  messagingSenderId: "944909921923",
  appId: "1:944909921923:web:ae99e3f3ec10fe709ab5b6"
};

async function testFirebase() {
  try {
    console.log('🔥 Iniciando teste direto do Firebase...');
    
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    // Testar diferentes coleções possíveis
    const collections = [
      'reservas',
      'reservations',
      'bookings',
      'Lisboa',
      'Porto',
      'Faro'
    ];
    
    for (const collName of collections) {
      try {
        console.log(`\n📂 Testando coleção: ${collName}`);
        const q = query(collection(db, collName), limit(5));
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          console.log(`✅ Encontrados ${snapshot.size} documentos em ${collName}`);
          
          // Mostrar primeiro documento como exemplo
          const firstDoc = snapshot.docs[0];
          console.log('📋 Exemplo de documento:');
          console.log('ID:', firstDoc.id);
          console.log('Dados:', JSON.stringify(firstDoc.data(), null, 2));
        } else {
          console.log(`❌ Coleção ${collName} vazia ou não existe`);
        }
      } catch (error) {
        console.log(`❌ Erro ao acessar ${collName}:`, error.message);
      }
    }
    
    // Tentar estrutura aninhada
    console.log('\n🔍 Testando estrutura aninhada...');
    const cities = ['Lisboa', 'Porto', 'Faro'];
    const brands = ['AirPark', 'RedPark', 'SkyPark', 'TopParking', 'LisPark'];
    
    for (const city of cities) {
      for (const brand of brands) {
        try {
          const path = `${city}/${brand}`;
          const q = query(collection(db, city, brand), limit(1));
          const snapshot = await getDocs(q);
          
          if (!snapshot.empty) {
            console.log(`✅ Encontrados documentos em ${path}`);
          }
        } catch (error) {
          // Silencioso - muitas combinações não existirão
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testFirebase();
