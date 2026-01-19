import { Routes, Route, useLocation } from 'react-router-dom'
import Navigation from './components/Navigation'
import Home from './pages/Home'
import Gallery from './pages/Gallery'
import MediaDetail from './pages/MediaDetail'
import Admin from './pages/Admin'
import { AuthProvider } from './context/AuthContext'

function App() {
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')

  return (
    <AuthProvider>
      <div className="min-h-screen">
        {!isAdminRoute && <Navigation />}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/media/:id" element={<MediaDetail />} />
          <Route path="/admin/*" element={<Admin />} />
        </Routes>
      </div>
    </AuthProvider>)
}

export default App