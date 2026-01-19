import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Upload, Settings, Image, Video, BarChart3, TrendingUp, Clock, Eye, Heart } from 'lucide-react'
import { useStats, useAdminMedia } from '../../hooks/useMedia'

export default function AdminDashboard() {
  const { stats } = useStats()
  const { media } = useAdminMedia()

  const statCards = [
    { label: 'Total Photos', value: stats?.photoCount || 0, icon: Image, color: 'from-gold to-dark-gold' },
    { label: 'Total Videos', value: stats?.videoCount || 0, icon: Video, color: 'from-coral to-light-maroon' },
    { label: 'Total Views', value: stats?.totalViews || 0, icon: Eye, color: 'from-maroon to-dark-brown' },
    { label: 'Total Media', value: stats?.totalCount || 0, icon: TrendingUp, color: 'from-dark-gold to-gold' },
  ]

  const recentMedia = media?.slice(0, 5) || []
  const featuredCount = media?.filter(m => m.is_featured)?.length || 0
  const draftCount = media?.filter(m => m.status === 'draft')?.length || 0

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-5xl font-heading font-bold text-dark-brown mb-2">
            Dashboard
          </h1>
          <p className="text-lg text-dark-brown/70">Manage your sacred gallery collection</p>
        </motion.div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`glass p-6 rounded-2xl border-l-4 border-gold`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} text-white`}>
                  <stat.icon size={24} />
                </div>
              </div>
              <div className="text-4xl font-heading font-bold text-dark-brown mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-dark-brown/70">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-heading font-bold text-dark-brown mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/admin/upload"
              className="glass p-6 rounded-xl hover:shadow-lg transition-all group border-2 border-transparent hover:border-gold flex items-center space-x-4"
            >
              <div className="p-4 bg-gradient-to-br from-gold to-dark-gold rounded-xl text-white group-hover:scale-110 transition-transform">
                <Upload size={28} />
              </div>
              <div>
                <h3 className="font-bold text-dark-brown text-lg">Upload Media</h3>
                <p className="text-sm text-dark-brown/70">Add new content</p>
              </div>
            </Link>

            <Link
              to="/admin/manage"
              className="glass p-6 rounded-xl hover:shadow-lg transition-all group border-2 border-transparent hover:border-coral flex items-center space-x-4"
            >
              <div className="p-4 bg-gradient-to-br from-coral to-light-maroon rounded-xl text-white group-hover:scale-110 transition-transform">
                <Settings size={28} />
              </div>
              <div>
                <h3 className="font-bold text-dark-brown text-lg">Manage Gallery</h3>
                <p className="text-sm text-dark-brown/70">Edit & organize</p>
              </div>
            </Link>

            <Link
              to="/admin/manage"
              className="glass p-6 rounded-xl hover:shadow-lg transition-all group border-2 border-transparent hover:border-maroon flex items-center space-x-4"
            >
              <div className="p-4 bg-gradient-to-br from-maroon to-dark-brown rounded-xl text-white group-hover:scale-110 transition-transform">
                <BarChart3 size={28} />
              </div>
              <div>
                <h3 className="font-bold text-dark-brown text-lg">Analytics</h3>
                <p className="text-sm text-dark-brown/70">View statistics</p>
              </div>
            </Link>
          </div>
        </motion.div>

        {/* Status Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <div className="glass p-6 rounded-xl border-l-4 border-gold">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-dark-brown">Featured Items</h3>
              <TrendingUp size={20} className="text-gold" />
            </div>
            <div className="text-3xl font-heading font-bold text-dark-brown">{featuredCount}</div>
            <p className="text-sm text-dark-brown/70">Highlighted on homepage</p>
          </div>

          <div className="glass p-6 rounded-xl border-l-4 border-coral">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-dark-brown">Draft Items</h3>
              <Clock size={20} className="text-coral" />
            </div>
            <div className="text-3xl font-heading font-bold text-dark-brown">{draftCount}</div>
            <p className="text-sm text-dark-brown/70">Not yet published</p>
          </div>

          <div className="glass p-6 rounded-xl border-l-4 border-maroon">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-dark-brown">Total Likes</h3>
              <Heart size={20} className="text-maroon" />
            </div>
            <div className="text-3xl font-heading font-bold text-dark-brown">{stats?.totalLikes || 0}</div>
            <p className="text-sm text-dark-brown/70">Community engagement</p>
          </div>
        </motion.div>

        {/* Recent Media */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-heading font-bold text-dark-brown">Recent Uploads</h2>
            <Link to="/admin/manage" className="text-gold hover:text-dark-gold font-semibold transition-colors">
              View All →
            </Link>
          </div>

          <div className="glass rounded-xl overflow-hidden">
            {recentMedia.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gold/20 bg-gold/5">
                      <th className="px-6 py-4 text-left font-semibold text-dark-brown">Title</th>
                      <th className="px-6 py-4 text-left font-semibold text-dark-brown">Type</th>
                      <th className="px-6 py-4 text-left font-semibold text-dark-brown">Status</th>
                      <th className="px-6 py-4 text-left font-semibold text-dark-brown">Views</th>
                      <th className="px-6 py-4 text-left font-semibold text-dark-brown">Featured</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentMedia.map((item, index) => (
                      <tr key={item.id} className={index !== recentMedia.length - 1 ? 'border-b border-gold/10' : ''}>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            {item.thumbnail_url && (
                              <img src={item.thumbnail_url} alt={item.title} className="w-10 h-10 rounded-lg object-cover" />
                            )}
                            <span className="font-medium text-dark-brown truncate">{item.title}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                            {item.type === 'photo' ? <Image size={14} /> : <Video size={14} />}
                            <span className="capitalize">{item.type}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                            item.status === 'published'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {item.status === 'published' ? '✓ Published' : '○ Draft'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-1 text-dark-brown">
                            <Eye size={16} />
                            <span>{item.views || 0}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {item.is_featured ? (
                            <span className="text-gold font-bold">★ Featured</span>
                          ) : (
                            <span className="text-dark-brown/40">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center">
                <p className="text-dark-brown/70">No media uploaded yet. Start by uploading your first image!</p>
                <Link to="/admin/upload" className="inline-block mt-4 px-6 py-2 bg-gradient-to-r from-gold to-dark-gold text-white rounded-lg font-semibold hover:shadow-lg transition-all">
                  Upload Now
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
