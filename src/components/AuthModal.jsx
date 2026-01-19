import { useState, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Lock, User, Phone, AlertCircle, CheckCircle } from 'lucide-react'
import { AuthContext } from '../context/AuthContext'

export default function AuthModal({ isOpen, onClose }) {
  const { login, register, error, setError } = useContext(AuthContext)
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    phone: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      if (isLogin) {
        const result = await login(formData.email, formData.password)
        if (result.success) {
          setSuccess('Login successful!')
          setTimeout(() => {
            onClose()
            setFormData({ email: '', password: '', username: '', phone: '' })
          }, 1500)
        }
      } else {
        if (!formData.username || !formData.phone) {
          setError('All fields are required')
          setLoading(false)
          return
        }
        const result = await register(formData.email, formData.password, formData.username, formData.phone)
        if (result.success) {
          setSuccess(result.message)
          setTimeout(() => {
            setFormData({ email: '', password: '', username: '', phone: '' })
            setIsLogin(true)
          }, 2000)
        }
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-heading font-bold text-dark-brown">
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </h2>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} className="text-dark-brown" />
              </button>
            </div>

            {/* Messages */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg mb-4"
              >
                <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg mb-4"
              >
                <CheckCircle size={18} className="text-green-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-700">{success}</p>
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 mb-6">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-dark-brown mb-2">Email Address</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-3 text-gold" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    required
                    className="w-full pl-10 pr-4 py-2 border border-gold/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                  />
                </div>
              </div>

              {/* Username (Register only) */}
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-dark-brown mb-2">Username</label>
                  <div className="relative">
                    <User size={18} className="absolute left-3 top-3 text-gold" />
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="Your display name"
                      required={!isLogin}
                      className="w-full pl-10 pr-4 py-2 border border-gold/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              {/* Phone (Register only) */}
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-dark-brown mb-2">Phone Number</label>
                  <div className="relative">
                    <Phone size={18} className="absolute left-3 top-3 text-gold" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 1234567890"
                      required={!isLogin}
                      className="w-full pl-10 pr-4 py-2 border border-gold/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-dark-brown mb-2">Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-3 text-gold" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full pl-10 pr-4 py-2 border border-gold/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                  />
                </div>
                {!isLogin && (
                  <p className="text-xs text-dark-brown/60 mt-1">Minimum 6 characters</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 py-3 bg-gradient-to-r from-gold to-dark-gold text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{isLogin ? 'Logging in...' : 'Creating account...'}</span>
                  </span>
                ) : (
                  isLogin ? 'Login' : 'Create Account'
                )}
              </button>
            </form>

            {/* Toggle */}
            <div className="text-center">
              <p className="text-dark-brown/70 text-sm">
                {isLogin ? "Don't have an account? " : 'Already have an account? '}
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin)
                    setError('')
                    setSuccess('')
                    setFormData({ email: '', password: '', username: '', phone: '' })
                  }}
                  className="text-gold font-semibold hover:text-dark-gold transition-colors"
                >
                  {isLogin ? 'Sign up' : 'Login'}
                </button>
              </p>
            </div>

            {/* Note */}
            <p className="text-xs text-dark-brown/50 text-center mt-4">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
