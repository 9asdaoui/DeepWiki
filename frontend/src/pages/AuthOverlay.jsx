import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { Input } from '../components/ui/Input'
import { Sparkles } from 'lucide-react'

export default function AuthOverlay() {
  const [isLogin, setIsLogin] = useState(true)
  const { register: formRegister, handleSubmit, watch, formState: { errors }, reset } = useForm()
  const { login, register: registerUser } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const password = watch('password')

  const onSubmit = async (data) => {
    try {
      setLoading(true)
      setError('')
      if (isLogin) {
        await login(data)
        navigate('/dashboard')
      } else {
        await registerUser({
          username: data.username,
          email: data.email,
          password: data.password,
        })
        setIsLogin(true)
        reset()
        setError('Account created! Please login.')
      }
    } catch (err) {
      setError(err.response?.data?.detail || (isLogin ? 'Invalid credentials' : 'Registration failed'))
    } finally {
      setLoading(false)
    }
  }

  const toggleMode = () => {
    setIsLogin(!isLogin)
    setError('')
    reset()
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-[2.5rem] bg-slate-900/40 backdrop-blur-xl border border-cyan-500/20 shadow-2xl shadow-cyan-500/10 p-8"
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 mb-4">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">DeepWiki</h1>
            <p className="text-cyan-400 text-sm">AI-Powered Learning Platform</p>
          </div>

          <AnimatePresence mode="wait">
            <motion.form
              key={isLogin ? 'login' : 'register'}
              initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4"
            >
              {error && (
                <div className={`rounded-xl p-3 text-sm ${
                  error.includes('created') 
                    ? 'bg-green-500/20 border border-green-500 text-green-400'
                    : 'bg-red-500/20 border border-red-500 text-red-400'
                }`}>
                  {error}
                </div>
              )}

              {!isLogin && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-cyan-400">Username</label>
                  <Input
                    placeholder="johndoe"
                    className="bg-slate-800/50 border-cyan-500/20 text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-cyan-500/20 rounded-xl"
                    {...formRegister('username', { required: !isLogin && 'Username is required' })}
                  />
                  {errors.username && (
                    <p className="text-sm text-red-400">{errors.username.message}</p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-cyan-400">Email</label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  className="bg-slate-800/50 border-cyan-500/20 text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-cyan-500/20 rounded-xl"
                  {...formRegister('email', { required: 'Email is required' })}
                />
                {errors.email && (
                  <p className="text-sm text-red-400">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-cyan-400">Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="bg-slate-800/50 border-cyan-500/20 text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-cyan-500/20 rounded-xl"
                  {...formRegister('password', { 
                    required: 'Password is required',
                    minLength: { value: 8, message: 'Password must be at least 8 characters' }
                  })}
                />
                {errors.password && (
                  <p className="text-sm text-red-400">{errors.password.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? 'Processing...' : (isLogin ? 'Sign in' : 'Create account')}
              </button>

              <button
                type="button"
                onClick={toggleMode}
                className="w-full text-center text-sm text-slate-400 hover:text-cyan-400 transition-colors"
              >
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </motion.form>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}
