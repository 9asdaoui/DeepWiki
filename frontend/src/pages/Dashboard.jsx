import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Sidebar from '../components/Sidebar'
import { aiAPI, uploadAPI } from '../lib/api'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Upload, Link as LinkIcon, Loader2, Download, Copy } from 'lucide-react'

export default function Dashboard() {
  const [url, setUrl] = useState('')
  const [activeTab, setActiveTab] = useState('summary')
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const handleWikiSubmit = async (action) => {
    if (!url) return
    setLoading(true)
    setResult(null)
    try {
      let response
      if (action === 'summary') {
        response = await aiAPI.summarizeWiki(url)
      } else if (action === 'translate') {
        response = await aiAPI.translateWiki(url, 'French')
      } else if (action === 'quiz') {
        response = await aiAPI.generateQuiz(url)
      }
      setResult(response.data)
      setActiveTab(action)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (action) => {
    if (!file) return
    setLoading(true)
    setResult(null)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('lang_code', 'en')
    
    try {
      let response
      if (action === 'summary') {
        response = await uploadAPI.summarizePDF(formData)
      } else if (action === 'translate') {
        formData.set('target_lang', 'French')
        response = await uploadAPI.translatePDF(formData)
      } else if (action === 'quiz') {
        response = await uploadAPI.generatePDFQuiz(formData)
      }
      setResult(response.data)
      setActiveTab(action)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (format) => {
    if (!result?.article_id) return
    try {
      const response = await aiAPI.exportArticle(result.article_id, format)
      const blob = new Blob([response.data])
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `export.${format}`
      a.click()
    } catch (error) {
      console.error('Download error:', error)
    }
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="mx-auto max-w-6xl">
          <h1 className="mb-8 text-3xl font-bold text-slate-900">AI Workspace</h1>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Process Content</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Input
                    placeholder="Enter Wikipedia URL..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={() => handleWikiSubmit('summary')} disabled={loading || !url}>
                    <LinkIcon className="mr-2 h-4 w-4" />
                    Summarize
                  </Button>
                  <Button onClick={() => handleWikiSubmit('translate')} disabled={loading || !url} variant="secondary">
                    Translate
                  </Button>
                  <Button onClick={() => handleWikiSubmit('quiz')} disabled={loading || !url} variant="outline">
                    Quiz
                  </Button>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or upload PDF</span>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="flex-1"
                  />
                  <Button onClick={() => handleFileUpload('summary')} disabled={loading || !file}>
                    <Upload className="mr-2 h-4 w-4" />
                    Summarize
                  </Button>
                  <Button onClick={() => handleFileUpload('translate')} disabled={loading || !file} variant="secondary">
                    Translate
                  </Button>
                  <Button onClick={() => handleFileUpload('quiz')} disabled={loading || !file} variant="outline">
                    Quiz
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3 text-lg">Processing with AI...</span>
            </div>
          )}

          {result && !loading && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{result.title || result.filename}</CardTitle>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleDownload('txt')}>
                    <Download className="mr-2 h-4 w-4" />
                    TXT
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDownload('pdf')}>
                    <Download className="mr-2 h-4 w-4" />
                    PDF
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {activeTab === 'summary' && result.summary && (
                  <div className="prose max-w-none">
                    <p className="whitespace-pre-wrap">{result.summary}</p>
                  </div>
                )}
                {activeTab === 'translate' && result.translation && (
                  <div className="prose max-w-none">
                    <p className="whitespace-pre-wrap">{result.translation}</p>
                  </div>
                )}
                {activeTab === 'quiz' && result.quiz && (
                  <div className="space-y-4">
                    {result.quiz.quiz?.map((q, idx) => (
                      <div key={idx} className="rounded-lg border p-4">
                        <p className="mb-3 font-semibold">{idx + 1}. {q.question}</p>
                        <div className="space-y-2">
                          {q.options?.map((opt, i) => (
                            <div key={i} className="rounded border p-2 hover:bg-slate-50">
                              {opt}
                            </div>
                          ))}
                        </div>
                        <p className="mt-3 text-sm text-green-600">Answer: {q.answer}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
