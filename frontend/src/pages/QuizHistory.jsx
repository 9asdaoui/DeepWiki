import { useQuery } from '@tanstack/react-query'
import Sidebar from '../components/Sidebar'
import { aiAPI } from '../lib/api'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import { Loader2, Trophy } from 'lucide-react'

export default function QuizHistory() {
  const { data: quizzes, isLoading } = useQuery({
    queryKey: ['quiz-history'],
    queryFn: () => aiAPI.getQuizHistory().then(res => res.data),
  })

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="mx-auto max-w-6xl">
          <h1 className="mb-8 text-3xl font-bold text-slate-900">Quiz Performance</h1>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid gap-4">
              {quizzes?.map((quiz) => (
                <Card key={quiz.id}>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Article #{quiz.article_id}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {new Date(quiz.submitted_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Trophy className={`h-6 w-6 ${
                        quiz.score >= 80 ? 'text-yellow-500' :
                        quiz.score >= 60 ? 'text-blue-500' :
                        'text-slate-400'
                      }`} />
                      <span className="text-3xl font-bold">{quiz.score.toFixed(0)}%</span>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
