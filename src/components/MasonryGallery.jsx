import { useState } from 'react'
import { motion } from 'framer-motion'
import { Play, Heart, Eye, Calendar, MapPin, Share2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useMedia } from '../hooks/useMedia'

export default function MasonryGallery({ layout, filters }) {
  const [hoveredId, setHoveredId] = useState(null)
  const { media: galleryData, loading } = useMedia(filters)

  const getColumnSpan = (index) => {
    if (layout === 'grid') return 'col-span-1'
    const pattern = index % 8
    if (pattern === 1 || pattern === 4) return 'md:col-span-2'
    if (pattern === 2 || pattern === 5) return 'md:row-span-2'
    return 'col-span-1'
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-64 glass rounded-2xl animate-pulse"></div>
        ))}
      </div>
    )
  }

  if (galleryData.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-20 glass rounded-2xl"
      >
        <div className="max-w-md mx-auto">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gold/20 to-dark-gold/20 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-2xl font-heading font-bold text-dark-brown mb-3">No Media Found</h3>
          <p className="text-dark-brown/70 mb-6">
            {filters.tags?.length > 0 || filters.search
              ? "Try adjusting your filters or search query"
              : "Start by uploading your first divine moment to the gallery"}
          </p>
          {filters.tags?.length > 0 && (
            <button
              onClick={() => filters.tags && setFilters({ ...filters, tags: [] })}
              className="px-6 py-2 bg-gradient-to-r from-gold to-dark-gold text-white rounded-lg hover:shadow-lg transition-all"
            >
              Clear Filters
            </button>
          )}
        </div>
      </motion.div>
    )
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${layout === 'masonry' ? 'auto-rows-[250px]' : ''}`}>
      {galleryData.map((item, index) => {
        // Correctly resolve mediaUrl by ignoring empty strings
        const mediaUrl = [item.storage_url, item.external_url, item.thumbnail_url].find(url => url && url.length > 0) || ''
        const isYouTube = item.type === 'video' && (mediaUrl.includes('youtube.com') || mediaUrl.includes('youtu.be'))

        // Robust regex for YouTube ID extraction (supports Shorts, Embeds, Watch URLs)
        let videoId = null
        if (isYouTube) {
          const match = mediaUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)
          videoId = match ? match[1] : null
        }

        // Determine the best display URL (thumbnail for videos, source for images)
        let displayUrl = mediaUrl
        if (item.type === 'video') {
          if (item.thumbnail_url) {
            displayUrl = item.thumbnail_url
          } else if (isYouTube && videoId) {
            displayUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
          }
        }

        return (
          <motion.div key={item.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index * 0.03, 0.5) }} className={`${getColumnSpan(index)} group relative rounded-2xl overflow-hidden cursor-pointer`} onMouseEnter={() => setHoveredId(item.id)} onMouseLeave={() => setHoveredId(null)}>
            <Link to={`/media/${item.id}`} className="block h-full">
              {item.type === 'video' && isYouTube && videoId ? (
                <div className="w-full h-full pointer-events-none">
                  <iframe
                    src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}&playsinline=1`}
                    title={item.title}
                    className="w-full h-full object-cover"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                </div>
              ) : item.type === 'video' && !isYouTube ? (
                <video
                  src={mediaUrl}
                  poster={item.thumbnail_url}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  muted
                  loop
                  playsInline
                  onMouseEnter={(e) => e.target.play()}
                  onMouseLeave={(e) => {
                    e.target.pause()
                    e.target.currentTime = 0
                  }}
                />
              ) : (
                <img
                  src={displayUrl}
                  alt={item.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  onError={(e) => {
                    if (e.target.src.includes('maxresdefault')) {
                      e.target.src = e.target.src.replace('maxresdefault', 'hqdefault')
                    }
                  }}
                />
              )}
              {item.type === 'video' && <div className="absolute top-4 right-4 p-3 bg-dark-brown/80 backdrop-blur-sm rounded-full pointer-events-none"><Play size={20} className="text-white fill-white" /></div>}
              <div className={`absolute inset-0 bg-gradient-to-t from-dark-brown/90 via-dark-brown/40 to-transparent transition-opacity duration-300 ${hoveredId === item.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
              <div className={`absolute bottom-0 left-0 right-0 p-6 transition-transform duration-300 ${hoveredId === item.id ? 'translate-y-0' : 'translate-y-2 group-hover:translate-y-0'}`}>
                <div className="flex flex-wrap gap-2 mb-3">
                  {item.tags && item.tags.slice(0, 2).map(tag => <span key={tag} className="px-3 py-1 bg-gold/80 backdrop-blur-sm text-white text-xs rounded-full">{tag}</span>)}
                </div>
                <h3 className="text-xl font-heading font-bold text-white mb-2">{item.title}</h3>
                <div className={`flex items-center gap-4 text-white/80 text-sm transition-opacity duration-300 ${hoveredId === item.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                  <div className="flex items-center space-x-1"><Eye size={14} /><span>{(item.views || 0).toLocaleString()}</span></div>
                  <div className="flex items-center space-x-1"><Heart size={14} /><span>{item.likes || 0}</span></div>
                </div>
                <div className={`flex items-center gap-4 text-white/70 text-xs mt-2 transition-opacity duration-300 ${hoveredId === item.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                  {item.location && <div className="flex items-center space-x-1"><MapPin size={12} /><span>{item.location}</span></div>}
                  {item.date && <div className="flex items-center space-x-1"><Calendar size={12} /><span>{new Date(item.date).toLocaleDateString()}</span></div>}
                </div>
              </div>
              <div className={`absolute top-4 left-4 flex gap-2 transition-opacity duration-300 ${hoveredId === item.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                <button onClick={(e) => e.preventDefault()} className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"><Heart size={18} className="text-white" /></button>
                <button onClick={(e) => e.preventDefault()} className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"><Share2 size={18} className="text-white" /></button>
              </div>
            </Link>
          </motion.div>
        )
      })}
    </div>
  )
}
