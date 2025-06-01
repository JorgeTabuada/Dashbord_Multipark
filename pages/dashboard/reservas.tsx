// pages/dashboard/reservas.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { supabaseDashboard } from '../../lib/supabase/clients';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

interface Reserva {
  id_pk: string;
  license_plate: string;
  allocation: string;
  booking_date: string;
  check_in_previsto: string;
  check_out_previsto: string;
  check_in_real?: string;
  check_out_real?: string;
  name_cliente: string;
  lastname_cliente?: string;
  phone_number_cliente?: string;
  email_cliente?: string;
  booking_price?: number;
  parking_price?: number;
  delivery_price?: number;
  total_price?: number;
  estado_reserva_atual: string;
  parque_id: string;
  spot_code?: string;
  parking_type?: string;
  return_flight?: string;
  condutor_recolha_id?: string;
  condutor_entrega_id?: string;
}

const estadosCor = {
  'Reservado': 'bg-blue-100 text-blue-800',
  'Recolhido': 'bg-yellow-100 text-yellow-800',
  'Entregue': 'bg-green-100 text-green-800',
  'Cancelado': 'bg-red-100 text-red-800',
  'No-Show': 'bg-gray-100 text-gray-800'
};

export default function Reservas() {
  const router = useRouter();
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');
  const [dateFilter, setDateFilter] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedPark, setSelectedPark] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedReserva, setSelectedReserva] = useState<Reserva | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (selectedPark) {
      loadReservas();
    }
  }, [selectedPark, estadoFilter, dateFilter]);

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabaseDashboard.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      // Obter parque selecionado do localStorage
      const parkId = localStorage.getItem('multiparkSelectedPark') || 'lisboa';
      setSelectedPark(parkId);
    } catch (error) {
      console.error('Erro na autenticação:', error);
      router.push('/login');
    }
  };

  const loadReservas = async () => {
    setLoading(true);
    try {
      let query = supabaseDashboard
        .from('reservas')
        .select(`
          *,
          parque:parques!parque_id(nome_parque, cidade),
          condutor_recolha:profiles!condutor_recolha_id(full_name),
          condutor_entrega:profiles!condutor_entrega_id(full_name)
        `)
        .order('check_in_previsto', { ascending: false });

      // Filtros
      if (selectedPark !== 'todos') {
        query = query.eq('parque_id', selectedPark);
      }

      if (estadoFilter) {
        query = query.eq('estado_reserva_atual', estadoFilter);
      }

      if (dateFilter) {
        const startDate = `${dateFilter}T00:00:00`;
        const endDate = `${dateFilter}T23:59:59`;
        query = query.gte('check_in_previsto', startDate).lte('check_in_previsto', endDate);
      }

      const { data, error } = await query;

      if (error) throw error;

      setReservas(data || []);
    } catch (error) {
      console.error('Erro ao carregar reservas:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredReservas = reservas.filter(reserva => {
    if (!searchTerm) return true;
    
    const search = searchTerm.toLowerCase();
    return (
      reserva.license_plate?.toLowerCase().includes(search) ||
      reserva.name_cliente?.toLowerCase().includes(search) ||
      reserva.lastname_cliente?.toLowerCase().includes(search) ||
      reserva.allocation?.toLowerCase().includes(search)
    );
  });

  const handleViewReserva = (reserva: Reserva) => {
    setSelectedReserva(reserva);
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                ← Voltar
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Reservas</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Parque: <span className="font-medium">{selectedPark.toUpperCase()}</span>
              </span>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                Importar Excel
              </button>
            </div>
          </div>

          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pesquisar
              </label>
              <input
                type="text"
                placeholder="Matrícula, nome, allocation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                value={estadoFilter}
                onChange={(e) => setEstadoFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos os estados</option>
                <option value="Reservado">Reservado</option>
                <option value="Recolhido">Recolhido</option>
                <option value="Entregue">Entregue</option>
                <option value="Cancelado">Cancelado</option>
                <option value="No-Show">No-Show</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data
              </label>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex items-end">
              <button
                onClick={loadReservas}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Actualizar
              </button>
            </div>
          </div>
        </div>

        {/* Tabela */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">A carregar reservas...</p>
            </div>
          ) : filteredReservas.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Nenhuma reserva encontrada
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Matrícula
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Allocation
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Check-in
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Check-out
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Preço Total
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredReservas.map((reserva) => (
                    <tr key={reserva.id_pk} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {reserva.license_plate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {reserva.allocation}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {reserva.name_cliente} {reserva.lastname_cliente}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {reserva.check_in_previsto ? 
                          format(new Date(reserva.check_in_previsto), 'dd/MM HH:mm', { locale: pt }) : 
                          '-'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {reserva.check_out_previsto ? 
                          format(new Date(reserva.check_out_previsto), 'dd/MM HH:mm', { locale: pt }) : 
                          '-'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${estadosCor[reserva.estado_reserva_atual] || 'bg-gray-100 text-gray-800'}`}>
                          {reserva.estado_reserva_atual}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        €{reserva.total_price?.toFixed(2) || '0.00'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleViewReserva(reserva)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Ver
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Detalhes */}
      {showModal && selectedReserva && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Detalhes da Reserva
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Matrícula</p>
                <p className="font-medium">{selectedReserva.license_plate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Allocation</p>
                <p className="font-medium">{selectedReserva.allocation}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Cliente</p>
                <p className="font-medium">
                  {selectedReserva.name_cliente} {selectedReserva.lastname_cliente}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{selectedReserva.email_cliente || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Telefone</p>
                <p className="font-medium">{selectedReserva.phone_number_cliente || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Estado</p>
                <p className="font-medium">{selectedReserva.estado_reserva_atual}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Check-in Previsto</p>
                <p className="font-medium">
                  {selectedReserva.check_in_previsto ? 
                    format(new Date(selectedReserva.check_in_previsto), 'dd/MM/yyyy HH:mm', { locale: pt }) : 
                    '-'
                  }
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Check-out Previsto</p>
                <p className="font-medium">
                  {selectedReserva.check_out_previsto ? 
                    format(new Date(selectedReserva.check_out_previsto), 'dd/MM/yyyy HH:mm', { locale: pt }) : 
                    '-'
                  }
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Preço Reserva</p>
                <p className="font-medium">€{selectedReserva.booking_price?.toFixed(2) || '0.00'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Preço Parking</p>
                <p className="font-medium">€{selectedReserva.parking_price?.toFixed(2) || '0.00'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Preço Entrega</p>
                <p className="font-medium">€{selectedReserva.delivery_price?.toFixed(2) || '0.00'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Preço Total</p>
                <p className="font-medium text-lg">€{selectedReserva.total_price?.toFixed(2) || '0.00'}</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
