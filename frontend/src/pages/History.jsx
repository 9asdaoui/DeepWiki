import { useQuery } from '@tanstack/react-query'
import Sidebar from '../components/Sidebar'
import { aiAPI } from '../lib/api'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import { Loader2 } from 'lucide-react'

export default function History() {
  const { data: history, isLoading } = useQuery({
    queryKey: ['history'],
    queryFn: () => aiAPI.getHistory().then(res => res.data),
  })

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="mx-auto max-w-6xl">
          <h1 className="mb-8 text-3xl font-bold text-slate-900">Processing History</h1>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b bg-slate-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                          Title
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                          Action
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {history?.map((item) => (
                        <tr key={item.id}>
                          <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900">
                            {item.title}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                            <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                              item.action === 'summary' ? 'bg-blue-100 text-blue-800' :
                              item.action === 'translation' ? 'bg-green-100 text-green-800' :
                              'bg-purple-100 text-purple-800'
                            }`}>
                              {item.action}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                            {new Date(item.created_at).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
