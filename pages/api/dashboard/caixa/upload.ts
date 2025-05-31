// pages/api/dashboard/caixa/upload.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { DatabaseService } from '../../../../lib/services/database.service';
import { supabaseDashboard } from '../../../../lib/supabase/clients';
import formidable from 'formidable';
import fs from 'fs';
import xlsx from 'xlsx';

// Desativar o parser de body padrão para upload de ficheiros
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // Verificar autenticação
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Token de autorização obrigatório' });
    }

    const { data: { user } } = await supabaseDashboard.auth.getUser(token);
    if (!user) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    // Parser de ficheiros
    const form = formidable({
      multiples: false,
      uploadDir: '/tmp',
      keepExtensions: true,
    });

    const [fields, files] = await form.parse(req);
    
    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    const parqueId = Array.isArray(fields.parqueId) ? fields.parqueId[0] : fields.parqueId;
    const tipo = Array.isArray(fields.tipo) ? fields.tipo[0] : fields.tipo; // 'entregas' ou 'caixa'

    if (!file) {
      return res.status(400).json({ error: 'Ficheiro não encontrado' });
    }

    if (!parqueId) {
      return res.status(400).json({ error: 'Parque ID é obrigatório' });
    }

    // Ler ficheiro Excel
    const workbook = xlsx.readFile(file.filepath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    let processedCount = 0;
    let errors: string[] = [];

    // Processar dados baseado no tipo
    if (tipo === 'caixa') {
      // Processar dados da caixa
      for (const row of data as any[]) {
        try {
          // Mapear campos do Excel para a base de dados
          const transacaoData = {
            parque_id: parqueId,
            reserva_id: row['Reserva ID'] || null,
            matricula_veiculo: row['Matrícula'] || row['License Plate'],
            valor_transacao: parseFloat(row['Valor'] || row['Amount'] || '0'),
            metodo_pagamento: row['Método'] || row['Payment Method'] || 'numerario',
            data_transacao: new Date().toISOString().split('T')[0],
            user_id_operacao: user.id,
            observacoes: row['Observações'] || null,
            created_at_db: new Date().toISOString()
          };

          const result = await DatabaseService.createCaixaTransacao(transacaoData);
          
          if (result.error) {
            errors.push(`Linha ${processedCount + 1}: ${result.error.message}`);
          } else {
            processedCount++;
          }
        } catch (error) {
          errors.push(`Linha ${processedCount + 1}: Erro de processamento`);
        }
      }
    } else if (tipo === 'entregas') {
      // Processar dados de entregas
      for (const row of data as any[]) {
        try {
          // Encontrar reserva pela matrícula
          const { data: reserva } = await supabaseDashboard
            .from('reservas')
            .select('id_pk')
            .eq('license_plate', row['Matrícula'] || row['License Plate'])
            .eq('parque_id', parqueId)
            .single();

          if (reserva) {
            const updateData = {
              check_out_real: row['Data Entrega'] || new Date().toISOString(),
              estado_reserva_atual: 'entregue',
              condutor_entrega_id: user.id,
              observacoes_entrega: row['Observações'] || null,
              updated_at_db: new Date().toISOString()
            };

            const result = await DatabaseService.updateReserva(reserva.id_pk, updateData);
            
            if (result.error) {
              errors.push(`Linha ${processedCount + 1}: ${result.error.message}`);
            } else {
              processedCount++;
            }
          } else {
            errors.push(`Linha ${processedCount + 1}: Reserva não encontrada`);
          }
        } catch (error) {
          errors.push(`Linha ${processedCount + 1}: Erro de processamento`);
        }
      }
    }

    // Limpar ficheiro temporário
    fs.unlinkSync(file.filepath);

    return res.status(200).json({
      success: true,
      message: `Upload processado com sucesso`,
      data: {
        recordsProcessed: processedCount,
        totalRecords: data.length,
        errors: errors.length > 0 ? errors : null,
        tipo,
        parqueId
      }
    });

  } catch (error) {
    console.error('Erro no upload:', error);
    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
}