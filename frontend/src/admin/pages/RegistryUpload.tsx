import { useState, useRef } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/Card'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { api } from '@/api/client'

interface UploadResult {
  total_records: number
  matched: number
  errors: number
  antifraud_blocked: number
  uploaded_at: string
}

export default function RegistryUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<UploadResult | null>(null)
  const [generatingPayouts, setGeneratingPayouts] = useState(false)
  const [payoutMessage, setPayoutMessage] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (selectedFile: File) => {
    const ext = selectedFile.name.split('.').pop()?.toLowerCase()
    if (ext !== 'csv' && ext !== 'json') {
      setError('Поддерживаются только файлы CSV и JSON')
      return
    }
    setFile(selectedFile)
    setError('')
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      handleFileSelect(droppedFile)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => {
    setDragOver(false)
  }

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const uploadResult = await api.uploadFile<UploadResult>(
        '/admin/registry/upload',
        file
      )
      setResult(uploadResult)
      setFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Ошибка загрузки'
      setError(message)
    } finally {
      setUploading(false)
    }
  }

  const handleGeneratePayouts = async () => {
    setGeneratingPayouts(true)
    setPayoutMessage('')
    try {
      const res = await api.post<{ message: string }>('/payouts/generate')
      setPayoutMessage(res.message || 'Реестр выплат сформирован')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Ошибка формирования'
      setError(message)
    } finally {
      setGeneratingPayouts(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-beeline-black mb-6">
        Реестры НСПК
      </h1>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
          {error}
        </div>
      )}

      {payoutMessage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
          {payoutMessage}
        </div>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Загрузка реестра</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              dragOver
                ? 'border-beeline-yellow bg-beeline-yellow/5'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.json"
              className="hidden"
              onChange={(e) => {
                const selected = e.target.files?.[0]
                if (selected) handleFileSelect(selected)
              }}
            />
            <div className="text-4xl mb-3">📁</div>
            {file ? (
              <div>
                <p className="text-sm font-medium text-beeline-black">
                  {file.name}
                </p>
                <p className="text-xs text-beeline-gray mt-1">
                  {(file.size / 1024).toFixed(1)} КБ
                </p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-medium text-beeline-black">
                  Перетащите файл сюда или нажмите для выбора
                </p>
                <p className="text-xs text-beeline-gray mt-1">
                  Поддерживаемые форматы: CSV, JSON
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-4">
            <Button
              onClick={handleUpload}
              disabled={!file || uploading}
            >
              {uploading ? 'Загрузка...' : 'Загрузить реестр'}
            </Button>
            <Button
              variant="secondary"
              onClick={handleGeneratePayouts}
              disabled={generatingPayouts}
            >
              {generatingPayouts
                ? 'Формирование...'
                : 'Сформировать реестр выплат'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Результат обработки</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Параметр</TableHead>
                  <TableHead>Значение</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Всего записей</TableCell>
                  <TableCell>
                    <Badge variant="default">{result.total_records}</Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Сопоставлено</TableCell>
                  <TableCell>
                    <Badge variant="success">{result.matched}</Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Ошибки</TableCell>
                  <TableCell>
                    <Badge variant={result.errors > 0 ? 'error' : 'default'}>
                      {result.errors}
                    </Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">
                    Заблокировано антифродом
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        result.antifraud_blocked > 0 ? 'warning' : 'default'
                      }
                    >
                      {result.antifraud_blocked}
                    </Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Дата загрузки</TableCell>
                  <TableCell>
                    {new Date(result.uploaded_at).toLocaleString('ru-RU')}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
