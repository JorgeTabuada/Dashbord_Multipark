"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle } from "lucide-react"
import * as XLSX from "xlsx"
import { supabase } from "@/lib/supabase"

interface ExpenseData {
  date: string
  type: string
  amount: number
  method: string
  description: string
}

export default function ExcelUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [processedData, setProcessedData] = useState<ExpenseData[]>([])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setUploadStatus('idle')
    }
  }

  const processExcelFile = async (file: File): Promise<ExpenseData[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer)
          const workbook = XLSX.read(data, { type: 'array' })
          const sheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[sheetName]
          
          // Converte para JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
          
          // Assumindo que a primeira linha são headers
          const headers = jsonData[0] as string[]
          const rows = jsonData.slice(1) as any[][]
          
          const expenses: ExpenseData[] = rows
            .filter(row => row.length > 0 && row[0]) // Remove linhas vazias
            .map(row => ({
              date: row[0] ? new Date(row[0]).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
              type: row[1] || 'Outros',
              amount: parseFloat(row[2]) || 0,
              method: row[3] || 'Numerário',
              description: row[4] || 'Importado do Excel'
            }))
          
          resolve(expenses)
        } catch (error) {
          reject(error)
        }
      }
      
      reader.onerror = reject
      reader.readAsArrayBuffer(file)
    })
  }

  const saveToSupabase = async (expenses: ExpenseData[]) => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .insert(expenses.map(expense => ({
          ...expense,
          status: 'Pendente',
          created_at: new Date().toISOString()
        })))
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Erro ao guardar no Supabase:', error)
      throw error
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setIsProcessing(true)
    setUploadStatus('idle')

    try {
      // Processa o ficheiro Excel
      const expenses = await processExcelFile(file)
      setProcessedData(expenses)

      // Guarda no Supabase
      await saveToSupabase(expenses)
      
      setUploadStatus('success')
    } catch (error) {
      console.error('Erro no upload:', error)
      setUploadStatus('error')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5" />
          Upload de Ficheiro Excel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <div>
            <label htmlFor="excel-upload" className="cursor-pointer">
              <span className="text-sm text-gray-600">
                Clica para selecionar um ficheiro Excel (.xlsx, .xls)
              </span>
              <input
                id="excel-upload"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
          {file && (
            <p className="text-sm text-blue-600 mt-2">
              Ficheiro selecionado: {file.name}
            </p>
          )}
        </div>

        {file && (
          <Button 
            onClick={handleUpload} 
            disabled={isProcessing}
            className="w-full"
          >
            {isProcessing ? 'A processar...' : 'Carregar Dados'}
          </Button>
        )}

        {/* Status do upload */}
        {uploadStatus === 'success' && (
          <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
            <CheckCircle className="w-5 h-5" />
            <span>Ficheiro processado com sucesso! {processedData.length} despesas importadas.</span>
          </div>
        )}

        {uploadStatus === 'error' && (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
            <AlertCircle className="w-5 h-5" />
            <span>Erro ao processar o ficheiro. Verifica o formato dos dados.</span>
          </div>
        )}

        {/* Preview dos dados */}
        {processedData.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Preview dos dados importados:</h4>
            <div className="max-h-40 overflow-y-auto border rounded p-2 text-xs">
              {processedData.slice(0, 5).map((expense, index) => (
                <div key={index} className="mb-1">
                  {expense.date} - {expense.type} - €{expense.amount}
                </div>
              ))}
              {processedData.length > 5 && (
                <div className="text-gray-500">... e mais {processedData.length - 5} registos</div>
              )}
            </div>
          </div>
        )}

        <div className="text-xs text-gray-500">
          <strong>Formato esperado do Excel:</strong><br />
          Coluna A: Data (DD/MM/AAAA)<br />
          Coluna B: Tipo de Despesa<br />
          Coluna C: Valor (número)<br />
          Coluna D: Método de Pagamento<br />
          Coluna E: Descrição
        </div>
      </CardContent>
    </Card>
  )
}
