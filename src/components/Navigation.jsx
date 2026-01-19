import { useState, useContext } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Search, User, LogOut } from 'lucide-react'
import { AuthContext } from '../context/AuthContext'

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()
  const { user, logout } = useContext(AuthContext)

  const isActive = (path) => location.pathname === path

  const handleLogout = async () => {
    await logout()
    setIsOpen(false)
  }

  return (
    <nav className="glass sticky top-0 z-50 border-b border-gold/30 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-14 h-14 rounded-full overflow-hidden gold-glow shadow-lg group-hover:shadow-xl transition-all flex-shrink-0">
              <img 
                src="/src/img/logo.png" 
                alt="Bhuj Dham Logo" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-2xl font-heading font-bold text-dark-brown group-hover:text-gold transition-colors">
                Bhuj Dham
              </h1>
              <p className="text-xs text-dark-brown/60 font-medium">Divine Gallery</p>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`font-semibold text-base transition-all relative group ${
                isActive('/') ? 'text-gold' : 'text-dark-brown hover:text-gold'
              }`}
            >
              Home
              {isActive('/') && (
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gold"></span>
              )}
            </Link>
            <Link
              to="/gallery"
              className={`font-semibold text-base transition-all relative group ${
                isActive('/gallery') ? 'text-gold' : 'text-dark-brown hover:text-gold'
              }`}
            >
              Gallery
              {isActive('/gallery') && (
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gold"></span>
              )}
            </Link>
            <button className="p-2.5 text-dark-brown hover:text-gold hover:bg-gold/10 rounded-lg transition-all">
              <Search size={20} />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-dark-brown hover:text-gold transition-colors"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-3 border-t border-gold/20">
            <Link
              to="/"
              onClick={() => setIsOpen(false)}
              className={`block px-4 py-2 rounded-lg transition-colors ${
                isActive('/') ? 'bg-gold text-white' : 'text-dark-brown hover:bg-wheat'
              }`}
            >
              Home
            </Link>
            <Link
              to="/gallery"
              onClick={() => setIsOpen(false)}
              className={`block px-4 py-2 rounded-lg transition-colors ${
                isActive('/gallery') ? 'bg-gold text-white' : 'text-dark-brown hover:bg-wheat'
              }`}
            >
              Gallery
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
