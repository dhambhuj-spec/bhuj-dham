import { useState } from 'react'
import { motion } from 'framer-motion'
import { Lock, User, Loader } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export default function AdminLogin({ onLogin }) {
  const [credentials, setCredentials] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      })

      if (authError) {
        setError(authError.message)
        setLoading(false)
        return
      }

      if (data.user) {
        onLogin()
      }
    } catch (err) {
      setError('Login failed. Try admin@bhujdham2010.com / Admin123')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-gold to-dark-gold mb-4 gold-glow">
            <span className="text-4xl text-white font-heading">ॐ</span>
          </div>
          <h1 className="text-3xl font-heading font-bold text-dark-brown mb-2">
            Admin Portal
          </h1>
          <p className="text-dark-brown/70">Bhuj Dham Gallery Management</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="glass p-8 rounded-2xl">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-dark-brown mb-2">
                Email Address
              </label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-brown/50" />
                <input
                  type="email"
                  value={credentials.email}
                  onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gold/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                  placeholder="admin@bhujdham2010.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-brown mb-2">
                Password
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-brown/50" />
                <input
                  type="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gold/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                  placeholder="password123"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-gold to-dark-gold text-white rounded-lg font-semibold hover:shadow-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </div>

          <div className="mt-4 p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded-lg text-xs">
            <strong>Demo credentials:</strong> admin@bhujdham2010.com / Admin123
          </div>
        </form>

        <p className="text-center text-sm text-dark-brown/60 mt-6">
          Protected by divine grace 🙏
        </p>
      </motion.div>
    </div>
  )
}
