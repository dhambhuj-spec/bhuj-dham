import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Home, Upload, Settings, BarChart3, LogOut, Image, Menu, X, Tag } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useState } from 'react'

export default function AdminLayout({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/admin')
  }

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: Home },
    { name: 'Upload Media', href: '/admin/upload', icon: Upload },
    { name: 'Manage Gallery', href: '/admin/manage', icon: Settings },
    { name: 'Manage Tags', href: '/admin/tags', icon: Tag },
  ]

  const isActive = (href) => {
    if (href === '/admin') {
      return location.pathname === '/admin'
    }
    return location.pathname.startsWith(href)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cornsilk/50 to-white">
      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-gradient-to-br from-gold to-dark-gold text-white rounded-xl shadow-lg"
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-72 bg-gradient-to-b from-dark-brown to-maroon text-white z-40 transform transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="p-6">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 mb-10">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold to-dark-gold flex items-center justify-center gold-glow">
              <span className="text-2xl font-heading">ॐ</span>
            </div>
            <div>
              <h1 className="text-xl font-heading font-bold">Bhuj Dham</h1>
              <p className="text-xs text-white/70">Admin Panel</p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                  isActive(item.href)
                    ? 'bg-gold text-white shadow-lg'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* Divider */}
          <div className="my-8 border-t border-white/20"></div>

          {/* Quick Stats */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase text-white/50 font-semibold mb-3">Quick Info</h3>
            <div className="flex items-center space-x-3 px-4 py-2">
              <Image size={16} className="text-gold" />
              <span className="text-sm text-white/70">Gallery Management</span>
            </div>
            <div className="flex items-center space-x-3 px-4 py-2">
              <BarChart3 size={16} className="text-coral" />
              <span className="text-sm text-white/70">Live Analytics</span>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-white/20">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-500 hover:bg-red-600 rounded-xl font-semibold transition-all transform hover:scale-105"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
        ></div>
      )}

      {/* Main Content */}
      <main className="lg:ml-72 min-h-screen">
        {children}
      </main>
    </div>
  )
}
