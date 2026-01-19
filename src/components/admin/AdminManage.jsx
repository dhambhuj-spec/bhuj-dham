import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, Edit, Trash2, Eye, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAdminMedia } from '../../hooks/useMedia'

export default function AdminManage() {
  const { media, loading, deleteMedia, updateMedia } = useAdminMedia()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const filteredMedia = media.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const handleDelete = async (id, storagePath) => {
    if (confirm('Are you sure you want to delete this media?')) {
      try {
        await deleteMedia(id, storagePath)
        alert('Media deleted successfully')
      } catch (error) {
        alert('Error deleting media: ' + error.message)
      }
    }
  }

  const toggleFeatured = async (item) => {
    try {
      await updateMedia(item.id, { is_featured: !item.is_featured })
    } catch (error) {
      alert('Error updating media: ' + error.message)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-dark-brown/70">Loading media...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link to="/admin" className="inline-flex items-center space-x-2 text-dark-brown hover:text-gold transition-colors mb-4">
            <span>← Back to Dashboard</span>
          </Link>
          <h1 className="text-4xl font-heading font-bold text-dark-brown mb-2">Manage Gallery</h1>
          <p className="text-dark-brown/70">Edit, delete, or reorder your media collection</p>
        </div>

        {/* Search & Filter */}
        <div className="glass p-6 rounded-2xl mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-brown/50" />
              <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search media..." className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gold/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent" />
            </div>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-4 py-3 bg-white/50 border border-gold/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent">
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>

        {/* Media Table */}
        <div className="glass rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-brown/10">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-dark-brown">Media</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-dark-brown">Type</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-dark-brown">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-dark-brown">Views</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-dark-brown">Date</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-dark-brown">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMedia.map((item, index) => {
                  const thumbnailUrl = item.type === 'video' ? (item.thumbnail_url || item.external_url) : (item.storage_url || item.external_url)
                  
                  return (
                    <motion.tr key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="border-b border-dark-brown/10 last:border-0 hover:bg-white/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <img src={thumbnailUrl} alt={item.title} className="w-16 h-16 object-cover rounded-lg" />
                          <div>
                            <div className="font-medium text-dark-brown">{item.title}</div>
                            {item.is_featured && (
                              <div className="flex items-center space-x-1 text-xs text-gold mt-1">
                                <Star size={12} className="fill-gold" />
                                <span>Featured</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-cornsilk text-dark-brown text-xs rounded-full capitalize">{item.type}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-xs rounded-full ${item.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-dark-brown/70">
                        <div className="flex items-center space-x-1">
                          <Eye size={14} />
                          <span>{(item.views || 0).toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-dark-brown/70 text-sm">
                        {item.date ? new Date(item.date).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end space-x-2">
                          <button onClick={() => toggleFeatured(item)} className={`p-2 rounded-lg transition-colors ${item.is_featured ? 'bg-gold text-white' : 'bg-white/50 text-dark-brown hover:bg-gold/20'}`} title="Toggle Featured">
                            <Star size={16} className={item.is_featured ? 'fill-white' : ''} />
                          </button>
                          <button onClick={() => handleDelete(item.id, item.storage_path)} className="p-2 bg-white/50 text-dark-brown rounded-lg hover:bg-red-100 hover:text-red-600 transition-colors" title="Delete">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {filteredMedia.length === 0 && (
          <div className="text-center py-12">
            <p className="text-dark-brown/70">No media found matching your filters.</p>
          </div>
        )}
      </div>
    </div>
  )
}
