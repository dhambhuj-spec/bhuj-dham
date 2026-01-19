import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Filter, Grid3x3, Rows, Search, X } from 'lucide-react'
import MasonryGallery from '../components/MasonryGallery'
import MediaFilters from '../components/MediaFilters'
import { useMedia } from '../hooks/useMedia'

export default function Gallery() {
  const [layout, setLayout] = useState('masonry') // masonry or grid
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(true)
  const [filters, setFilters] = useState({
    type: 'all', // all, photo, video
    tags: [],
    dateRange: null
  })
  const { media: allMedia } = useMedia({})

  const totalItems = allMedia?.length || 0
  const photoCount = allMedia?.filter(m => m.type === 'photo')?.length || 0
  const videoCount = allMedia?.filter(m => m.type === 'video')?.length || 0

  return (
    <>
      <Helmet>
        <title>Sacred Gallery - Bhuj Dham | Daily Darshan Photos & Videos</title>
        <meta name="description" content="Explore the divine photo and video gallery of Shree Swaminarayan Temple Bhuj. Daily Darshan, festival celebrations, and sacred moments." />
        <meta name="keywords" content="Bhuj Mandir Gallery, Swaminarayan Photos, Daily Darshan Bhuj, Crypto Photos, Festival Videos, Divine Moments" />
      </Helmet>
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-heading font-bold text-dark-brown mb-4"
            >
              Sacred Gallery
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-dark-brown/70 max-w-2xl mx-auto mb-6"
            >
              Explore divine moments, sacred celebrations, and architectural wonders
            </motion.p>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap justify-center gap-6 mb-8"
            >
              <div className="glass px-6 py-3 rounded-xl">
                <p className="text-2xl font-bold text-gold">{totalItems}</p>
                <p className="text-sm text-dark-brown/70">Total Items</p>
              </div>
              <div className="glass px-6 py-3 rounded-xl">
                <p className="text-2xl font-bold text-gold">{photoCount}</p>
                <p className="text-sm text-dark-brown/70">Photos</p>
              </div>
              <div className="glass px-6 py-3 rounded-xl">
                <p className="text-2xl font-bold text-gold">{videoCount}</p>
                <p className="text-sm text-dark-brown/70">Videos</p>
              </div>
            </motion.div>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="max-w-2xl mx-auto"
            >
              <div className="relative">
                <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-brown/50" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by title, location, or photographer..."
                  className="w-full pl-12 pr-12 py-4 glass rounded-xl focus:outline-none focus:ring-2 focus:ring-gold border border-gold/20 text-dark-brown placeholder:text-dark-brown/50"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-brown/50 hover:text-dark-brown"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            </motion.div>
          </div>

          {/* Controls */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            {/* Layout Toggle */}
            <div className="flex items-center space-x-2 glass px-4 py-2 rounded-xl">
              <span className="text-sm text-dark-brown/70 mr-2">Layout:</span>
              <button
                onClick={() => setLayout('masonry')}
                className={`p-2 rounded-lg transition-all ${layout === 'masonry'
                  ? 'bg-gradient-to-r from-gold to-dark-gold text-white shadow-md'
                  : 'text-dark-brown hover:bg-wheat'
                  }`}
                title="Masonry Layout"
              >
                <Rows size={18} />
              </button>
              <button
                onClick={() => setLayout('grid')}
                className={`p-2 rounded-lg transition-all ${layout === 'grid'
                  ? 'bg-gradient-to-r from-gold to-dark-gold text-white shadow-md'
                  : 'text-dark-brown hover:bg-wheat'
                  }`}
                title="Grid Layout"
              >
                <Grid3x3 size={18} />
              </button>
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-6 py-3 glass rounded-xl hover:shadow-lg transition-all border border-gold/20"
            >
              <Filter size={18} />
              <span className="font-medium">{showFilters ? 'Hide' : 'Show'} Filters</span>
            </button>
          </div>

          {/* Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <MediaFilters filters={filters} setFilters={setFilters} />
            </motion.div>
          )}

          {/* Gallery */}
          <MasonryGallery layout={layout} filters={{ ...filters, search: searchQuery }} />
        </div>
      </div>
    </>
  )
}
