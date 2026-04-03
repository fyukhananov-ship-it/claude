import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password)
      // Determine redirect based on role
      const token = localStorage.getItem('access_token')
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]))
        if (payload.role === 'operator') {
          navigate('/admin')
        } else {
          navigate('/partner')
        }
      }
    } catch {
      setError('Неверный email или пароль')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-beeline-light flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-beeline-yellow rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-beeline-black">CLO</span>
            </div>
            <h1 className="text-2xl font-bold text-beeline-black">
              Билайн×НСПК
            </h1>
            <p className="text-beeline-gray mt-1">Card-Linked Offers Platform</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-beeline-dark mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-beeline-yellow focus:border-transparent transition-colors"
                placeholder="admin@partner.ru"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-beeline-dark mb-1.5">
                Пароль
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-beeline-yellow focus:border-transparent transition-colors"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-beeline-yellow text-beeline-black font-semibold py-3 rounded-xl hover:bg-brand-600 transition-colors disabled:opacity-50"
            >
              {loading ? 'Вход...' : 'Войти'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
