import { NextResponse } from 'next/server'
import { firebaseRTDB } from '@/lib/firebase-rtdb'

export async function GET() {
  try {
    console.log('🔍 Testando conexão ao Firebase...')
    
    // Testar se consegue conectar
    const cities = await firebaseRTDB.getCities()
    
    if (!cities || cities.length === 0) {
      return NextResponse.json({
        connected: false,
        error: 'Nenhuma cidade encontrada no Firebase',
        cities: []
      })
    }
    
    // Pegar uma amostra
    let sample = null
    if (cities.length > 0) {
      const brands = await firebaseRTDB.getBrands(cities[0])
      if (brands.length > 0) {
        const reservations = await firebaseRTDB.getReservations(cities[0], brands[0])
        if (reservations.length > 0) {
          sample = reservations[0]
        }
      }
    }
    
    return NextResponse.json({
      connected: true,
      cities,
      totalCities: cities.length,
      sample
    })
  } catch (error) {
    console.error('❌ Erro ao testar Firebase:', error)
    return NextResponse.json({
      connected: false,
      error: String(error)
    })
  }
}
