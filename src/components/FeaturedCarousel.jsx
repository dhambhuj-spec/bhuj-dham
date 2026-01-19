import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Calendar, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useMedia } from '../hooks/useMedia'
import { getPublicUrl } from '../lib/supabase'

export default function FeaturedCarousel() {
  const { media: featuredMedia, loading: featuredLoading, error: featuredError } = useMedia({ featured: true })
  const { media: recentMedia, loading: recentLoading, error: recentError } = useMedia()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)

  // Use featured media if available, otherwise use recent media (limit to 10)
  const displayMedia = (featuredMedia && featuredMedia.length > 0 ? featuredMedia : recentMedia || []).slice(0, 10)

  // Optimize loading: Only wait for recent media if we don't have featured media
  const loading = featuredLoading || (!featuredMedia?.length && recentLoading)

  // Debug logging
  useEffect(() => {
    console.log('Featured Media:', featuredMedia)
    console.log('Recent Media:', recentMedia)
    console.log('Featured Loading:', featuredLoading)
    console.log('Recent Loading:', recentLoading)
    console.log('Display Media:', displayMedia)
  }, [featuredMedia, recentMedia, featuredLoading, recentLoading])

  // Auto-advance carousel only if there are items
  useEffect(() => {
    if (displayMedia.length === 0) return
    const timer = setInterval(() => {
      handleNext()
    }, 5000)
    return () => clearInterval(timer)
  }, [currentIndex, displayMedia.length])

  const handleNext = () => {
    setDirection(1)
    setCurrentIndex((prev) => (prev + 1) % displayMedia.length)
  }

  const handlePrev = () => {
    setDirection(-1)
    setCurrentIndex((prev) => (prev - 1 + displayMedia.length) % displayMedia.length)
  }

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[600px] glass rounded-3xl">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-dark-brown/70">Loading featured media...</p>
        </div>
      </div>
    )
  }

  if (!displayMedia || displayMedia.length === 0) {
    return (
      <div className="flex items-center justify-center h-[600px] glass rounded-3xl">
        <div className="text-center">
          <p className="text-dark-brown/70 text-lg mb-2">No media available yet</p>
          <p className="text-dark-brown/50 text-sm">Media will appear here once added to the gallery</p>
        </div>
      </div>
    )
  }

  const currentMedia = displayMedia[currentIndex]
  // Correctly resolve mediaUrl by ignoring empty strings
  const mediaUrl = [currentMedia.storage_url, currentMedia.external_url, currentMedia.thumbnail_url].find(url => url && url.length > 0) || ''

  const isYouTube = currentMedia.type === 'video' && (mediaUrl.includes('youtube.com') || mediaUrl.includes('youtu.be'))
  const youtubeMatch = isYouTube ? mediaUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/) : null
  const videoId = youtubeMatch ? youtubeMatch[1] : null

  return (
    <div className="relative">
      {/* Main Carousel */}
      <div className="relative h-[600px] rounded-3xl overflow-hidden">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            className="absolute inset-0"
          >
            {/* Media Content */}
            {currentMedia.type === 'video' ? (
              isYouTube && videoId ? (
                <div className="w-full h-full pointer-events-none">
                  <iframe
                    src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}&playsinline=1`}
                    title={currentMedia.title}
                    className="w-full h-full object-cover"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                </div>
              ) : (
                <video
                  src={mediaUrl}
                  poster={currentMedia.thumbnail_url}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                />
              )
            ) : (
              <img
                src={mediaUrl}
                alt={currentMedia.title}
                loading="eager"
                className="w-full h-full object-cover"
              />
            )}

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-dark-brown/90 via-dark-brown/50 to-transparent" />

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h3 className="text-3xl md:text-5xl font-heading font-bold text-white mb-4">
                  {currentMedia.title}
                </h3>
                <p className="text-lg text-white/90 mb-6 max-w-2xl">
                  {currentMedia.description}
                </p>
                <div className="flex flex-wrap items-center gap-6 mb-6">
                  {currentMedia.date && (
                    <div className="flex items-center space-x-2 text-white/80">
                      <Calendar size={18} />
                      <span className="text-sm">
                        {new Date(currentMedia.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  )}
                  {currentMedia.location && (
                    <div className="flex items-center space-x-2 text-white/80">
                      <MapPin size={18} />
                      <span className="text-sm">{currentMedia.location}</span>
                    </div>
                  )}
                </div>
                <Link
                  to={`/media/${currentMedia.id}`}
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all border border-white/30"
                >
                  <span>View Details</span>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        <button
          onClick={handlePrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 glass text-dark-brown rounded-full hover:bg-gold hover:text-white transition-all z-10"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 glass text-dark-brown rounded-full hover:bg-gold hover:text-white transition-all z-10"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Thumbnail Navigation */}
      <div className="flex justify-center gap-3 mt-6">
        {displayMedia.map((media, index) => {
          const mUrl = [media.storage_url, media.external_url, media.thumbnail_url].find(u => u && u.length > 0) || ''
          const mIsYouTube = media.type === 'video' && (mUrl.includes('youtube.com') || mUrl.includes('youtu.be'))
          let mVideoId = null
          if (mIsYouTube) {
            const match = mUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)
            mVideoId = match ? match[1] : null
          }

          let displayThumb = mUrl
          if (media.type === 'video') {
            if (mIsYouTube && mVideoId) {
              displayThumb = `https://img.youtube.com/vi/${mVideoId}/hqdefault.jpg`
            } else if (media.thumbnail_url) {
              displayThumb = media.thumbnail_url
            }
          }

          return (
            <button
              key={media.id}
              onClick={() => {
                setDirection(index > currentIndex ? 1 : -1)
                setCurrentIndex(index)
              }}
              className={`relative w-20 h-20 rounded-xl overflow-hidden transition-all ${index === currentIndex
                ? 'ring-4 ring-gold scale-110'
                : 'opacity-60 hover:opacity-100'
                }`}
            >
              {media.type === 'video' && !mIsYouTube ? (
                <video
                  src={mUrl}
                  className="w-full h-full object-cover pointer-events-none"
                  muted
                />
              ) : (
                <img
                  src={displayThumb}
                  alt={media.title}
                  className="w-full h-full object-cover"
                />
              )}
            </button>
          )
        })}
      </div>

      {/* Progress Indicators */}
      <div className="flex justify-center gap-2 mt-4">
        {displayMedia.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setDirection(index > currentIndex ? 1 : -1)
              setCurrentIndex(index)
            }}
            className={`h-1 rounded-full transition-all ${index === currentIndex
              ? 'w-8 bg-gold'
              : 'w-4 bg-gold/30 hover:bg-gold/50'
              }`}
          />
        ))}
      </div>
    </div>
  )
}
