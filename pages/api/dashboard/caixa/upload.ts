// pages/api/dashboard/caixa/upload.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { DatabaseService } from '../../../../lib/services/database.service';
import { supabaseDashboard } from '../../../../lib/supabase/clients';
import formidable from 'formidable';
import fs from 'fs';
import * as ExcelJS from 'exceljs';

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

    // Ler ficheiro Excel com ExcelJS (mais seguro que xlsx)
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(file.filepath);
    
    const worksheet = workbook.getWorksheet(1); // primeira folha
    if (!worksheet) {
      return res.status(400).json({ error: 'Ficheiro Excel inválido ou vazio' });
    }

    // Converter worksheet para array de objetos
    const data: any[] = [];
    const headers: string[] = [];
    
    // Obter headers da primeira linha
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell, colNumber) => {
      headers[colNumber] = cell.value?.toString() || `Column${colNumber}`;
    });

    // Processar dados das restantes linhas
    for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
      const row = worksheet.getRow(rowNumber);
      const rowData: any = {};
      
      row.eachCell((cell, colNumber) => {
        const header = headers[colNumber];
        if (header) {
          rowData[header] = cell.value;
        }
      });
      
      // Só adicionar se a linha não está vazia
      if (Object.values(rowData).some(value => value !== null && value !== undefined && value !== '')) {
        data.push(rowData);
      }
    }

    let processedCount = 0;
    let errors: string[] = [];

    // Processar dados baseado no tipo
    if (tipo === 'caixa') {
      // Processar dados da caixa
      for (const [index, row] of data.entries()) {
        try {
          // Mapear campos do Excel para a base de dados
          const transacaoData = {
            parque_id: parqueId,
            reserva_id: row['Reserva ID'] || null,
            matricula_veiculo: row['Matrícula'] || row['License Plate'] || row['Matricula'],
            valor_transacao: parseFloat(String(row['Valor'] || row['Amount'] || '0').replace(',', '.')),
            metodo_pagamento: row['Método'] || row['Payment Method'] || row['Metodo'] || 'numerario',
            data_transacao: new Date().toISOString().split('T')[0],
            user_id_operacao: user.id,
            observacoes: row['Observações'] || row['Observacoes'] || null,
            created_at_db: new Date().toISOString()
          };

          const result = await DatabaseService.createCaixaTransacao(transacaoData);
          
          if (result.error) {
            errors.push(`Linha ${index + 2}: ${result.error.message}`);
          } else {
            processedCount++;
          }
        } catch (error) {
          errors.push(`Linha ${index + 2}: Erro de processamento - ${error}`);
        }
      }
    } else if (tipo === 'entregas') {
      // Processar dados de entregas
      for (const [index, row] of data.entries()) {
        try {
          // Encontrar reserva pela matrícula
          const { data: reserva } = await supabaseDashboard
            .from('reservas')
            .select('id_pk')
            .eq('license_plate', row['Matrícula'] || row['License Plate'] || row['Matricula'])
            .eq('parque_id', parqueId)
            .single();

          if (reserva) {
            const updateData = {
              check_out_real: row['Data Entrega'] || row['Delivery Date'] || new Date().toISOString(),
              estado_reserva_atual: 'entregue',
              condutor_entrega_id: user.id,
              observacoes_entrega: row['Observações'] || row['Observacoes'] || null,
              updated_at_db: new Date().toISOString()
            };

            const result = await DatabaseService.updateReserva(reserva.id_pk, updateData);
            
            if (result.error) {
              errors.push(`Linha ${index + 2}: ${result.error.message}`);
            } else {
              processedCount++;
            }
          } else {
            errors.push(`Linha ${index + 2}: Reserva não encontrada para matrícula ${row['Matrícula'] || row['License Plate']}`);
          }
        } catch (error) {
          errors.push(`Linha ${index + 2}: Erro de processamento - ${error}`);
        }
      }
    } else {
      return res.status(400).json({ error: 'Tipo deve ser "caixa" ou "entregas"' });
    }

    // Limpar ficheiro temporário
    if (fs.existsSync(file.filepath)) {
      fs.unlinkSync(file.filepath);
    }

    return res.status(200).json({
      success: true,
      message: `Upload processado com sucesso`,
      data: {
        recordsProcessed: processedCount,
        totalRecords: data.length,
        successRate: data.length > 0 ? ((processedCount / data.length) * 100).toFixed(1) + '%' : '0%',
        errors: errors.length > 0 ? errors.slice(0, 10) : null, // Máximo 10 erros para não sobrecarregar
        tipo,
        parqueId,
        headers: headers.filter(h => h && !h.startsWith('Column'))
      }
    });

  } catch (error) {
    console.error('Erro no upload:', error);
    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    });
  }
}