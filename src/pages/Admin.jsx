import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import AdminLogin from '../components/admin/AdminLogin'
import AdminLayout from '../components/admin/AdminLayout'
import AdminDashboard from '../components/admin/AdminDashboard'
import AdminUpload from '../components/admin/AdminUpload'
import AdminManage from '../components/admin/AdminManage'
import AdminTags from '../components/admin/AdminTags'

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let subscription
    const loadingTimeout = setTimeout(() => {
      // Stop spinner even if auth request hangs
      setLoading(false)
    }, 6000)

    const checkSession = async () => {
      try {
        if (!isSupabaseConfigured) {
          setError('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then restart the dev server.')
          setLoading(false)
          return
        }

        // Check current session
        const { data } = await supabase.auth.getSession()
        setIsAuthenticated(!!data?.session)
      } catch (err) {
        if (err?.name !== 'AbortError') {
          console.error('Admin auth check failed:', err)
          setError('Unable to reach auth service. Check your Supabase keys and network connection.')
        }
      } finally {
        setLoading(false)
      }
    }

    checkSession()

    // Listen for auth changes
    if (isSupabaseConfigured) {
      const { data: subData } = supabase.auth.onAuthStateChange((_event, session) => {
        setIsAuthenticated(!!session)
      })
      subscription = subData?.subscription
    }

    return () => {
      subscription?.unsubscribe()
      clearTimeout(loadingTimeout)
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cornsilk to-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-dark-brown/70">Loading...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cornsilk to-white px-4">
        <div className="max-w-md text-center space-y-4">
          <p className="text-lg font-semibold text-dark-brown">{error}</p>
          <p className="text-sm text-dark-brown/70">If you just added environment variables, restart the Vite dev server and reload.</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <AdminLogin onLogin={() => setIsAuthenticated(true)} />
  }

  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="/upload" element={<AdminUpload />} />
        <Route path="/manage" element={<AdminManage />} />
        <Route path="/tags" element={<AdminTags />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AdminLayout>
  )
}
