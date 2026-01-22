import { Routes, Route, Navigate } from 'react-router-dom'
import { useContext, useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { AuthContext } from '../context/AuthContext'
import AdminLayout from '../components/admin/AdminLayout'
import AdminDashboard from '../components/admin/AdminDashboard'
import AdminUpload from '../components/admin/AdminUpload'
import AdminManage from '../components/admin/AdminManage'
import AdminTags from '../components/admin/AdminTags'

export default function Admin() {
  const { user, loading } = useContext(AuthContext)
  const isAuthenticated = user?.role === 'admin' || user?.email === 'admin@bhujdham2010.com'

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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cornsilk to-white px-4">
        <div className="max-w-md text-center space-y-4">
          <p className="text-lg font-semibold text-dark-brown">Please log in to access the admin panel</p>
          <p className="text-sm text-dark-brown/70">Use the Login button in the navigation bar</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cornsilk to-white px-4">
        <div className="max-w-md text-center space-y-4">
          <p className="text-lg font-semibold text-dark-brown">Access Denied</p>
          <p className="text-sm text-dark-brown/70">You don't have admin privileges</p>
        </div>
      </div>
    )
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
