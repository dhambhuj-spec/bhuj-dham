import { useParams, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { X, Heart, Share2, Download, Calendar, MapPin, Eye, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState, useEffect, useContext } from 'react'
import { useMediaById, useMedia } from '../hooks/useMedia'
import { AuthContext } from '../context/AuthContext'
import CommentsSection from '../components/CommentsSection'
import AuthModal from '../components/AuthModal'
import { supabase } from '../lib/supabase'

export default function MediaDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useContext(AuthContext)
  const { media, loading } = useMediaById(id)
  const { media: relatedMedia } = useMedia({ tags: media?.tags || [] })
  const [isLiked, setIsLiked] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [likeCount, setLikeCount] = useState(media?.likes || 0)

  useEffect(() => {
    if (media) {
      setLikeCount(media.likes || 0)
    }
  }, [media])

  const handleClose = () => {
    navigate(-1)
  }

  const handleLike = async () => {
    if (!user) {
      setAuthModalOpen(true)
      return
    }

    try {
      setIsLiked(!isLiked)

      if (!isLiked) {
        setLikeCount(prev => prev + 1)
      } else {
        setLikeCount(prev => Math.max(0, prev - 1))
      }

      // Update in database
      const { error } = await supabase
        .from('media')
        .update({ likes: !isLiked ? likeCount + 1 : Math.max(0, likeCount - 1) })
        .eq('id', id)

      if (error) {
        console.error('Error updating likes:', error)
        setIsLiked(!isLiked)
        setLikeCount(media?.likes || 0)
      }
    } catch (err) {
      console.error('Error liking media:', err)
    }
  }

  const handleDownload = async () => {
    if (!user) {
      setAuthModalOpen(true)
      return
    }

    try {
      const mediaUrl = media.type === 'video' ? media.external_url : (media.storage_url || media.external_url)

      if (!mediaUrl) {
        alert('Media URL not available')
        return
      }

      const response = await fetch(mediaUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${media.title}.${media.type === 'video' ? 'mp4' : 'jpg'}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Error downloading media:', err)
      alert('Failed to download media')
    }
  }

  const handleShare = async () => {
    if (!user) {
      setAuthModalOpen(true)
      return
    }

    try {
      const shareData = {
        title: media.title,
        text: media.description || 'Check out this divine moment from Bhuj Dham',
        url: window.location.href
      }

      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        // Fallback: Copy to clipboard
        const text = `${shareData.title}\n${shareData.text}\n${shareData.url}`
        await navigator.clipboard.writeText(text)
        alert('Link copied to clipboard!')
      }
    } catch (err) {
      console.error('Error sharing:', err)
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-dark-brown/95 backdrop-blur-md flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    )
  }

  if (!media) {
    return (
      <div className="fixed inset-0 z-50 bg-dark-brown/95 backdrop-blur-md flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-lg mb-4">Media not found</p>
          <button onClick={handleClose} className="px-6 py-3 bg-gold text-white rounded-lg">Go Back</button>
        </div>
      </div>
    )
  }

  const mediaSource = media.storage_url || media.external_url
  const posterUrl = media.thumbnail_url

  return (
    <>
      <Helmet>
        <title>{media.title} | Bhuj Dham</title>
        <meta name="description" content={media.description || `Divine Darshan: ${media.title} at Bhuj Swaminarayan Temple.`} />

        <meta property="og:title" content={`${media.title} | Bhuj Dham`} />
        <meta property="og:description" content={media.description || `View ${media.title} at Bhuj Swaminarayan Temple. Live & Daily Darshan gallery.`} />
        <meta property="og:image" content={posterUrl || (media.type === 'photo' ? mediaSource : 'https://bhujdham.com/logo.png')} />
        <meta property="og:type" content={media.type === 'video' ? 'video.other' : 'website'} />
        <meta property="og:url" content={window.location.href} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${media.title} | Bhuj Dham`} />
        <meta name="twitter:description" content={media.description || `View ${media.title} at Bhuj Swaminarayan Temple.`} />
        <meta name="twitter:image" content={posterUrl || (media.type === 'photo' ? mediaSource : 'https://bhujdham.com/logo.png')} />
      </Helmet>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-dark-brown/95 backdrop-blur-md overflow-y-auto"
      >
        <div className="min-h-screen">
          {/* Header */}
          <div className="sticky top-0 z-10 glass border-b border-white/10 shadow-xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={handleClose}
                  className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all"
                >
                  <X size={24} />
                  <span className="hidden sm:inline font-medium">Close</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleLike}
                    className={`p-2.5 rounded-lg transition-all shadow-lg ${isLiked ? 'bg-gold text-white' : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                    title={user ? 'Like' : 'Login to like'}
                  >
                    <Heart size={20} className={isLiked ? 'fill-white' : ''} />
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-2.5 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all shadow-lg"
                    title={user ? 'Share' : 'Login to share'}
                  >
                    <Share2 size={20} />
                  </button>
                  <button
                    onClick={handleDownload}
                    className="p-2.5 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all shadow-lg"
                    title={user ? 'Download' : 'Login to download'}
                  >
                    <Download size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Media Display */}
              <div className="lg:col-span-2 flex justify-center items-start">
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="relative rounded-2xl overflow-hidden gold-glow w-full max-w-6xl mx-auto"
                >
                  {media.type === 'video' ? (
                    (() => {
                      const youtubeMatch = mediaSource?.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)
                      const videoId = youtubeMatch ? youtubeMatch[1] : null

                      if (videoId) {
                        return (
                          <div className="relative aspect-video w-full max-w-6xl bg-black rounded-2xl overflow-hidden">
                            <iframe
                              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&rel=0&playsinline=1`}
                              title={media.title}
                              className="w-full h-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                              allowFullScreen
                            />
                          </div>
                        )
                      }

                      return (
                        <div className="relative bg-black flex items-center justify-center rounded-2xl overflow-hidden">
                          <video
                            src={mediaSource}
                            poster={posterUrl}
                            controls
                            autoPlay
                            muted
                            loop
                            playsInline
                            className="max-w-full max-h-[80vh] w-auto h-auto object-contain"
                          >
                            Your browser does not support the video tag.
                          </video>
                        </div>
                      )
                    })()
                  ) : (
                    <img src={mediaSource} alt={media.title} className="w-full h-auto" />
                  )}
                </motion.div>
              </div>

              {/* Info Panel */}
              <div className="lg:col-span-1">
                <motion.div
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white/95 backdrop-blur-sm p-8 rounded-2xl sticky top-24 shadow-2xl border border-gold/20"
                >
                  {/* Title */}
                  <h1 className="text-3xl font-heading font-bold mb-2 text-dark-brown leading-tight">{media.title}</h1>

                  {/* Stats */}
                  <div className="flex items-center gap-6 mb-6 pb-6 border-b border-gray-200">
                    <div className="flex items-center space-x-2">
                      <Eye size={18} className="text-gold" />
                      <span className="text-sm font-semibold text-gray-700">{(media.views || 0).toLocaleString()} views</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Heart size={18} className="text-gold" />
                      <span className="text-sm font-semibold text-gray-700">{likeCount} likes</span>
                    </div>
                  </div>

                  {/* Tags */}
                  {media.tags && media.tags.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Categories</h3>
                      <div className="flex flex-wrap gap-2">
                        {media.tags.map(tag => (
                          <span key={tag} className="px-4 py-2 bg-gold/10 border border-gold/30 rounded-lg text-sm font-semibold text-dark-brown hover:bg-gold/20 transition-colors">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  {media.description && (
                    <div className="mb-6 pb-6 border-b border-gray-200">
                      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Description</h3>
                      <p className="text-base text-gray-800 leading-relaxed">{media.description}</p>
                    </div>
                  )}

                  {/* Details */}
                  <div className="space-y-4 mb-6">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Details</h3>

                    {media.date && (
                      <div className="flex items-start space-x-3 bg-gray-50 p-3 rounded-lg">
                        <Calendar size={20} className="text-gold mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Date</div>
                          <div className="text-sm font-semibold text-gray-900">
                            {new Date(media.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </div>
                        </div>
                      </div>
                    )}

                    {media.location && (
                      <div className="flex items-start space-x-3 bg-gray-50 p-3 rounded-lg">
                        <MapPin size={20} className="text-gold mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Location</div>
                          <div className="text-sm font-semibold text-gray-900">{media.location}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Photographer */}
                  {media.photographer && (
                    <div className="pt-6 border-t border-gray-200">
                      <div className="text-sm text-gray-600">
                        Captured by <span className="font-bold text-gold">{media.photographer}</span>
                      </div>
                    </div>
                  )}
                </motion.div>
              </div>
            </div>

            {/* Comments Section */}
            <CommentsSection mediaId={id} onAuthRequired={() => setAuthModalOpen(true)} />

            {/* Related Media */}
            {relatedMedia && relatedMedia.length > 1 && (
              <div className="mt-12">
                <h2 className="text-2xl font-heading font-bold text-white mb-6">Related Media</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {relatedMedia.filter(item => item.id !== media.id).slice(0, 4).map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      onClick={() => navigate(`/media/${item.id}`)}
                      className="relative rounded-xl overflow-hidden cursor-pointer group"
                    >
                      <img src={item.storage_url || item.thumbnail_url || item.external_url} alt={item.title} className="w-full aspect-square object-cover transition-transform duration-300 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-dark-brown/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <p className="text-white text-sm font-medium">{item.title}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Auth Modal */}
          <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
        </div>
      </motion.div>
    </>
  )
}
