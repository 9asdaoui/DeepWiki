import { useState, useRef } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Search, Sparkles, Languages, Brain, Clock, LogOut, RotateCcw, Download, Upload, History, BarChart3 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { aiAPI, uploadAPI } from '../lib/api'

export default function DashboardNew() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('summary')
  const [showQuizHistory, setShowQuizHistory] = useState(false)
  const [showAdminPanel, setShowAdminPanel] = useState(false)
  
  // Separate state for each tab
  const [summaryUrl, setSummaryUrl] = useState('')
  const [translateUrl, setTranslateUrl] = useState('')
  const [quizUrl, setQuizUrl] = useState('')
  const [targetLang, setTargetLang] = useState('French')
  
  // Separate article state for each tab
  const [summaryArticle, setSummaryArticle] = useState(null)
  const [translationArticle, setTranslationArticle] = useState(null)
  const [quizArticle, setQuizArticle] = useState(null)

  // PDF Upload mode for each tab
  const [summaryPdfMode, setSummaryPdfMode] = useState(false)
  const [translatePdfMode, setTranslatePdfMode] = useState(false)
  const [quizPdfMode, setQuizPdfMode] = useState(false)

  const { data: history, refetch: refetchHistory } = useQuery({
    queryKey: ['history'],
    queryFn: () => aiAPI.getHistory().then(res => res.data),
  })

  const { data: quizHistory } = useQuery({
    queryKey: ['quizHistory'],
    queryFn: () => aiAPI.getQuizHistory().then(res => res.data),
    enabled: showQuizHistory,
  })

  const { data: adminStats } = useQuery({
    queryKey: ['adminStats'],
    queryFn: () => aiAPI.getAdminStats().then(res => res.data),
    enabled: showAdminPanel && user?.is_admin,
  })

  const summarizeMutation = useMutation({
    mutationFn: (url) => aiAPI.summarizeWiki(url),
    onSuccess: (response) => {
      setSummaryArticle(response.data)
      refetchHistory()
    },
  })

  const summarizePdfMutation = useMutation({
    mutationFn: (formData) => uploadAPI.summarizePDF(formData),
    onSuccess: (response) => {
      setSummaryArticle(response.data)
      refetchHistory()
    },
  })

  const translateMutation = useMutation({
    mutationFn: ({ url, lang }) => aiAPI.translateWiki(url, lang),
    onSuccess: (response) => {
      setTranslationArticle(response.data)
      refetchHistory()
    },
  })

  const translatePdfMutation = useMutation({
    mutationFn: (formData) => uploadAPI.translatePDF(formData),
    onSuccess: (response) => {
      setTranslationArticle(response.data)
      refetchHistory()
    },
  })

  const quizMutation = useMutation({
    mutationFn: (url) => aiAPI.generateQuiz(url),
    onSuccess: (response) => {
      setQuizArticle(response.data)
      refetchHistory()
    },
  })

  const quizPdfMutation = useMutation({
    mutationFn: (formData) => uploadAPI.generatePDFQuiz(formData),
    onSuccess: (response) => {
      setQuizArticle(response.data)
      refetchHistory()
    },
  })

  const handleSummarize = () => {
    if (!summaryUrl) return
    summarizeMutation.mutate(summaryUrl)
  }

  const handleSummarizePdf = (file) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('lang_code', 'en')
    summarizePdfMutation.mutate(formData)
  }

  const handleTranslate = () => {
    if (!translateUrl) return
    translateMutation.mutate({ url: translateUrl, lang: targetLang })
  }

  const handleTranslatePdf = (file) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('target_lang', targetLang)
    translatePdfMutation.mutate(formData)
  }

  const handleQuiz = () => {
    if (!quizUrl) return
    quizMutation.mutate(quizUrl)
  }

  const handleQuizPdf = (file) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('lang_code', 'en')
    quizPdfMutation.mutate(formData)
  }

  const handleExport = async (articleId, format) => {
    try {
      const response = await aiAPI.exportArticle(articleId, format)
      const blob = new Blob([response.data], { type: format === 'pdf' ? 'application/pdf' : 'text/plain' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `article.${format}`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  const handleHistoryClick = (item) => {
    if (item.action === 'summary') {
      setSummaryUrl(item.url)
      setActiveTab('summary')
      summarizeMutation.mutate(item.url)
    } else if (item.action === 'translation') {
      setTranslateUrl(item.url)
      setActiveTab('translation')
      translateMutation.mutate({ url: item.url, lang: targetLang })
    } else if (item.action === 'quiz') {
      setQuizUrl(item.url)
      setActiveTab('quiz')
      quizMutation.mutate(item.url)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const tabs = [
    { id: 'summary', label: 'Summary', icon: Sparkles },
    { id: 'translation', label: 'Translation', icon: Languages },
    { id: 'quiz', label: 'Interactive Quiz', icon: Brain },
  ]

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-7xl h-[90vh] rounded-[2.5rem] bg-slate-900/40 backdrop-blur-xl border border-cyan-500/20 shadow-2xl shadow-cyan-500/10 overflow-hidden flex">
        
        {/* Sidebar */}
        <div className="w-80 bg-slate-900/60 backdrop-blur-lg border-r border-cyan-500/10 flex flex-col">
          {/* User Profile */}
          <div className="p-6 border-b border-cyan-500/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                  {user?.username?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="text-white font-semibold">{user?.username}</p>
                  <p className="text-cyan-400 text-xs">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="text-slate-400 hover:text-cyan-400 transition-colors"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* History */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="flex items-center gap-2 mb-4 px-2">
              <Clock className="h-4 w-4 text-cyan-400" />
              <h3 className="text-cyan-400 font-semibold text-sm">Recent Articles</h3>
            </div>
            <div className="space-y-2">
              {history?.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleHistoryClick(item)}
                  className="w-full text-left p-3 rounded-xl bg-slate-800/30 hover:bg-slate-800/60 border border-transparent hover:border-cyan-500/30 transition-all group"
                >
                  <p className="text-white text-sm font-medium truncate group-hover:text-cyan-400 transition-colors">
                    {item.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400">
                      {item.action}
                    </span>
                    <span className="text-xs text-slate-500">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-cyan-500/10 space-y-2">
            <button
              onClick={() => setShowQuizHistory(!showQuizHistory)}
              className="w-full flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/30 hover:bg-slate-800/60 text-slate-400 hover:text-cyan-400 transition-all"
            >
              <History className="h-4 w-4" />
              <span className="text-sm font-semibold">Quiz History</span>
            </button>
            {user?.is_admin && (
              <button
                onClick={() => setShowAdminPanel(!showAdminPanel)}
                className="w-full flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/30 hover:bg-slate-800/60 text-slate-400 hover:text-cyan-400 transition-all"
              >
                <BarChart3 className="h-4 w-4" />
                <span className="text-sm font-semibold">Admin Stats</span>
              </button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Top Navigation Tabs */}
          <div className="flex items-center gap-2 p-6 border-b border-cyan-500/10">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/50'
                      : 'bg-slate-800/30 text-slate-400 hover:text-cyan-400 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {tab.label}
                </button>
              )
            })}
          </div>

          {/* Workspace */}
          <div className="flex-1 p-8 overflow-y-auto">
            <AnimatePresence mode="wait">
              {showQuizHistory ? (
                <QuizHistoryView quizHistory={quizHistory} onClose={() => setShowQuizHistory(false)} />
              ) : showAdminPanel ? (
                <AdminStatsView stats={adminStats} onClose={() => setShowAdminPanel(false)} />
              ) : (
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="h-full"
                >
                  {activeTab === 'summary' && (
                    <SummaryTab
                      url={summaryUrl}
                      setUrl={setSummaryUrl}
                      onProcess={handleSummarize}
                      onProcessPdf={handleSummarizePdf}
                      article={summaryArticle}
                      isLoading={summarizeMutation.isPending || summarizePdfMutation.isPending}
                      pdfMode={summaryPdfMode}
                      setPdfMode={setSummaryPdfMode}
                      onExport={handleExport}
                    />
                  )}
                  {activeTab === 'translation' && (
                    <TranslationTab
                      url={translateUrl}
                      setUrl={setTranslateUrl}
                      onProcess={handleTranslate}
                      onProcessPdf={handleTranslatePdf}
                      article={translationArticle}
                      isLoading={translateMutation.isPending || translatePdfMutation.isPending}
                      targetLang={targetLang}
                      setTargetLang={setTargetLang}
                      pdfMode={translatePdfMode}
                      setPdfMode={setTranslatePdfMode}
                      onExport={handleExport}
                    />
                  )}
                  {activeTab === 'quiz' && (
                    <QuizTab
                      url={quizUrl}
                      setUrl={setQuizUrl}
                      onProcess={handleQuiz}
                      onProcessPdf={handleQuizPdf}
                      article={quizArticle}
                      isLoading={quizMutation.isPending || quizPdfMutation.isPending}
                      onRestart={() => setQuizArticle(null)}
                      pdfMode={quizPdfMode}
                      setPdfMode={setQuizPdfMode}
                      onExport={handleExport}
                    />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}

function SummaryTab({ url, setUrl, onProcess, onProcessPdf, article, isLoading, pdfMode, setPdfMode, onExport }) {
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      onProcessPdf(file)
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={() => setPdfMode(false)}
            className={`px-4 py-2 rounded-xl font-semibold transition-all ${
              !pdfMode
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                : 'bg-slate-800/50 text-slate-400 hover:text-cyan-400'
            }`}
          >
            Wikipedia URL
          </button>
          <button
            onClick={() => setPdfMode(true)}
            className={`px-4 py-2 rounded-xl font-semibold transition-all flex items-center gap-2 ${
              pdfMode
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                : 'bg-slate-800/50 text-slate-400 hover:text-cyan-400'
            }`}
          >
            <Upload className="h-4 w-4" />
            Upload PDF
          </button>
        </div>

        {pdfMode ? (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-2xl font-semibold hover:shadow-lg hover:shadow-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              <Upload className="h-5 w-5" />
              {isLoading ? 'Uploading...' : 'Choose PDF File'}
            </button>
          </>
        ) : (
          <>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-cyan-400" />
              <input
                type="text"
                placeholder="Paste Wikipedia URL..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && onProcess()}
                className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-cyan-500/20 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
              />
            </div>
            <button
              onClick={onProcess}
              disabled={!url || isLoading}
              className="mt-3 w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-2xl font-semibold hover:shadow-lg hover:shadow-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? 'Processing...' : 'Generate Summary'}
            </button>
          </>
        )}
      </div>

      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center">
          <Loader2 className="h-16 w-16 text-cyan-400 animate-spin mb-4" />
          <p className="text-cyan-400 text-lg font-semibold">Processing with AI...</p>
        </div>
      ) : article ? (
        <div className="glass-card p-8 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">{article.title || article.filename}</h2>
            <div className="flex gap-2">
              <button
                onClick={() => onExport(article.article_id, 'pdf')}
                className="px-4 py-2 bg-slate-800/50 hover:bg-slate-800 text-cyan-400 rounded-xl font-semibold transition-all flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                PDF
              </button>
              <button
                onClick={() => onExport(article.article_id, 'txt')}
                className="px-4 py-2 bg-slate-800/50 hover:bg-slate-800 text-cyan-400 rounded-xl font-semibold transition-all flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                TXT
              </button>
            </div>
          </div>
          <div className="prose prose-invert max-w-none">
            <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{article.summary}</p>
          </div>
        </div>
      ) : (
        <EmptyState tab="summary" />
      )}
    </div>
  )
}

function TranslationTab({ url, setUrl, onProcess, onProcessPdf, article, isLoading, targetLang, setTargetLang, pdfMode, setPdfMode, onExport }) {
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      onProcessPdf(file)
    }
  }

  const languages = [
    { code: 'French', label: 'French' },
    { code: 'English', label: 'English' },
    { code: 'Arabic', label: 'Arabic' },
    { code: 'Spanish', label: 'Spanish' },
  ]

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <div className="mb-4">
          <label className="text-cyan-400 font-semibold text-sm mb-2 block">Target Language</label>
          <div className="flex gap-2">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setTargetLang(lang.code)}
                className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                  targetLang === lang.code
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                    : 'bg-slate-800/50 text-slate-400 hover:text-cyan-400'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={() => setPdfMode(false)}
            className={`px-4 py-2 rounded-xl font-semibold transition-all ${
              !pdfMode
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                : 'bg-slate-800/50 text-slate-400 hover:text-cyan-400'
            }`}
          >
            Wikipedia URL
          </button>
          <button
            onClick={() => setPdfMode(true)}
            className={`px-4 py-2 rounded-xl font-semibold transition-all flex items-center gap-2 ${
              pdfMode
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                : 'bg-slate-800/50 text-slate-400 hover:text-cyan-400'
            }`}
          >
            <Upload className="h-4 w-4" />
            Upload PDF
          </button>
        </div>

        {pdfMode ? (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-2xl font-semibold hover:shadow-lg hover:shadow-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              <Upload className="h-5 w-5" />
              {isLoading ? 'Uploading...' : 'Choose PDF File'}
            </button>
          </>
        ) : (
          <>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-cyan-400" />
              <input
                type="text"
                placeholder="Paste Wikipedia URL..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && onProcess()}
                className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-cyan-500/20 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
              />
            </div>
            <button
              onClick={onProcess}
              disabled={!url || isLoading}
              className="mt-3 w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-2xl font-semibold hover:shadow-lg hover:shadow-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? 'Processing...' : 'Translate Article'}
            </button>
          </>
        )}
      </div>

      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center">
          <Loader2 className="h-16 w-16 text-cyan-400 animate-spin mb-4" />
          <p className="text-cyan-400 text-lg font-semibold">Translating with AI...</p>
        </div>
      ) : article ? (
        <div className="glass-card p-8 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">{article.title || article.filename}</h2>
            <div className="flex gap-2">
              <button
                onClick={() => onExport(article.article_id, 'pdf')}
                className="px-4 py-2 bg-slate-800/50 hover:bg-slate-800 text-cyan-400 rounded-xl font-semibold transition-all flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                PDF
              </button>
              <button
                onClick={() => onExport(article.article_id, 'txt')}
                className="px-4 py-2 bg-slate-800/50 hover:bg-slate-800 text-cyan-400 rounded-xl font-semibold transition-all flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                TXT
              </button>
            </div>
          </div>
          <div className="prose prose-invert max-w-none">
            <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{article.translation}</p>
          </div>
        </div>
      ) : (
        <EmptyState tab="translation" />
      )}
    </div>
  )
}

function QuizTab({ url, setUrl, onProcess, onProcessPdf, article, isLoading, onRestart, pdfMode, setPdfMode, onExport }) {
  const fileInputRef = useRef(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState([])
  const [showResult, setShowResult] = useState(false)
  const [quizFinished, setQuizFinished] = useState(false)

  const quiz = article?.quiz?.quiz || []
  const question = quiz[currentQuestion]

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      onProcessPdf(file)
    }
  }

  const handleAnswer = (option) => {
    const newAnswers = [...selectedAnswers]
    newAnswers[currentQuestion] = option
    setSelectedAnswers(newAnswers)
    setShowResult(true)
  }

  const nextQuestion = () => {
    if (currentQuestion < quiz.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setShowResult(false)
    } else {
      setQuizFinished(true)
    }
  }

  const handleRestart = () => {
    setCurrentQuestion(0)
    setSelectedAnswers([])
    setShowResult(false)
    setQuizFinished(false)
    onRestart()
  }

  const calculateScore = () => {
    let correct = 0
    quiz.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.answer) correct++
    })
    return ((correct / quiz.length) * 100).toFixed(0)
  }

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <Loader2 className="h-16 w-16 text-cyan-400 animate-spin mb-4" />
        <p className="text-cyan-400 text-lg font-semibold">Generating Quiz with Gemini AI...</p>
      </div>
    )
  }

  if (quizFinished) {
    const score = calculateScore()
    return (
      <div className="h-full flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-12 text-center max-w-lg"
        >
          <div className="h-24 w-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <Brain className="h-12 w-12 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">Quiz Complete!</h2>
          <p className="text-6xl font-bold text-cyan-400 mb-6">{score}%</p>
          <p className="text-slate-300 mb-8">
            You answered {selectedAnswers.filter((ans, idx) => ans === quiz[idx].answer).length} out of {quiz.length} questions correctly
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleRestart}
              className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all inline-flex items-center gap-2"
            >
              <RotateCcw className="h-5 w-5" />
              Start Over
            </button>
            <button
              onClick={() => onExport(article.article_id, 'pdf')}
              className="px-6 py-3 bg-slate-800/50 hover:bg-slate-800 text-cyan-400 rounded-xl font-semibold transition-all flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="h-full flex flex-col">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={() => setPdfMode(false)}
              className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                !pdfMode
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                  : 'bg-slate-800/50 text-slate-400 hover:text-cyan-400'
              }`}
            >
              Wikipedia URL
            </button>
            <button
              onClick={() => setPdfMode(true)}
              className={`px-4 py-2 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                pdfMode
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                  : 'bg-slate-800/50 text-slate-400 hover:text-cyan-400'
              }`}
            >
              <Upload className="h-4 w-4" />
              Upload PDF
            </button>
          </div>

          {pdfMode ? (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-2xl font-semibold hover:shadow-lg hover:shadow-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                <Upload className="h-5 w-5" />
                {isLoading ? 'Uploading...' : 'Choose PDF File'}
              </button>
            </>
          ) : (
            <>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-cyan-400" />
                <input
                  type="text"
                  placeholder="Paste Wikipedia URL..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && onProcess()}
                  className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-cyan-500/20 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                />
              </div>
              <button
                onClick={onProcess}
                disabled={!url}
                className="mt-3 w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-2xl font-semibold hover:shadow-lg hover:shadow-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Generate Quiz
              </button>
            </>
          )}
        </div>
        <EmptyState tab="quiz" />
      </div>
    )
  }

  const isCorrect = selectedAnswers[currentQuestion] === question.answer

  return (
    <div className="glass-card p-8 h-full flex flex-col">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-cyan-400 font-semibold">Question {currentQuestion + 1} of {quiz.length}</h3>
          <div className="flex gap-1">
            {quiz.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 w-8 rounded-full ${
                  idx === currentQuestion ? 'bg-cyan-500' : idx < currentQuestion ? 'bg-cyan-700' : 'bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>
        <h2 className="text-2xl font-bold text-white">{question.question}</h2>
      </div>

      <div className="space-y-3 flex-1">
        {question.options?.map((option, idx) => (
          <button
            key={idx}
            onClick={() => !showResult && handleAnswer(option)}
            disabled={showResult}
            className={`w-full text-left p-4 rounded-xl font-medium transition-all ${
              showResult
                ? option === question.answer
                  ? 'bg-green-500/20 border-2 border-green-500 text-green-400'
                  : option === selectedAnswers[currentQuestion]
                  ? 'bg-red-500/20 border-2 border-red-500 text-red-400'
                  : 'bg-slate-800/30 text-slate-500'
                : 'bg-slate-800/50 text-white hover:bg-slate-800 hover:border-cyan-500/50 border border-transparent'
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      {showResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-6 p-4 rounded-xl ${
            isCorrect ? 'bg-green-500/20 border border-green-500' : 'bg-red-500/20 border border-red-500'
          }`}
        >
          <p className={`font-semibold ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
            {isCorrect ? '✓ Correct!' : '✗ Incorrect'}
          </p>
          <p className="text-slate-300 text-sm mt-1">
            The correct answer is: <span className="font-semibold">{question.answer}</span>
          </p>
          <button
            onClick={nextQuestion}
            className="mt-4 px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
          >
            {currentQuestion < quiz.length - 1 ? 'Next Question' : 'Finish Quiz'}
          </button>
        </motion.div>
      )}
    </div>
  )
}

function EmptyState({ tab }) {
  const messages = {
    summary: 'Paste a Wikipedia URL and click Generate Summary',
    translation: 'Select a language, paste a Wikipedia URL, and click Translate',
    quiz: 'Paste a Wikipedia URL to generate an interactive quiz',
  }

  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <div className="h-24 w-24 mx-auto mb-6 rounded-full bg-slate-800/50 flex items-center justify-center">
          <Sparkles className="h-12 w-12 text-cyan-400" />
        </div>
        <p className="text-slate-400 text-lg">{messages[tab]}</p>
      </div>
    </div>
  )
}

function QuizHistoryView({ quizHistory, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="h-full"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-white flex items-center gap-3">
          <History className="h-8 w-8 text-cyan-400" />
          Quiz History
        </h2>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-slate-800/50 hover:bg-slate-800 text-cyan-400 rounded-xl font-semibold transition-all"
        >
          Close
        </button>
      </div>

      <div className="grid gap-4">
        {quizHistory?.map((attempt) => (
          <div key={attempt.id} className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-semibold text-lg mb-2">Quiz #{attempt.id}</h3>
                <p className="text-slate-400 text-sm">
                  {new Date(attempt.submitted_at).toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold text-cyan-400">{attempt.score}%</p>
                <p className="text-slate-500 text-sm mt-1">Score</p>
              </div>
            </div>
          </div>
        ))}
        {(!quizHistory || quizHistory.length === 0) && (
          <div className="glass-card p-12 text-center">
            <Brain className="h-16 w-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No quiz attempts yet</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}

function AdminStatsView({ stats, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="h-full"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-white flex items-center gap-3">
          <BarChart3 className="h-8 w-8 text-cyan-400" />
          Admin Statistics
        </h2>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-slate-800/50 hover:bg-slate-800 text-cyan-400 rounded-xl font-semibold transition-all"
        >
          Close
        </button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <p className="text-slate-400 text-sm mb-2">Total Users</p>
          <p className="text-4xl font-bold text-white">{stats?.total_users || 0}</p>
        </div>
        <div className="glass-card p-6">
          <p className="text-slate-400 text-sm mb-2">Total Articles</p>
          <p className="text-4xl font-bold text-white">{stats?.total_articles || 0}</p>
        </div>
        <div className="glass-card p-6">
          <p className="text-slate-400 text-sm mb-2">Summaries</p>
          <p className="text-4xl font-bold text-cyan-400">{stats?.total_summaries || 0}</p>
        </div>
        <div className="glass-card p-6">
          <p className="text-slate-400 text-sm mb-2">Translations</p>
          <p className="text-4xl font-bold text-cyan-400">{stats?.total_translations || 0}</p>
        </div>
        <div className="glass-card p-6 col-span-2">
          <p className="text-slate-400 text-sm mb-2">Average Quiz Score</p>
          <p className="text-5xl font-bold text-green-400">
            {stats?.average_quiz_score ? `${stats.average_quiz_score}%` : 'N/A'}
          </p>
        </div>
      </div>
    </motion.div>
  )
}
