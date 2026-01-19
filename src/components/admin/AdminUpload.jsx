import { useState } from 'react'
import { motion } from 'framer-motion'
import { Upload, Link as LinkIcon, Image, Video, X, Calendar, MapPin, Tag, Save, Loader, AlertCircle, CheckCircle } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase, uploadMediaFile } from '../../lib/supabase'

export default function AdminUpload() {
  const navigate = useNavigate()
  const [uploadMode, setUploadMode] = useState('file')
  const [mediaType, setMediaType] = useState('photo')
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    location: '',
    tags: [],
    status: 'published',
    isFeatured: false,
    externalUrl: '',
    files: [],
    previews: []
  })

  const suggestedTags = ['Darshan', 'Aarti', 'Festival', 'Architecture', 'Abhishek', 'Celebration', 'Seva', 'Procession']

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    const tooBig = files.find((file) => file.size > 100 * 1024 * 1024)
    if (tooBig) {
      setError('Each file must be under 100MB')
      return
    }

    setFormData({
      ...formData,
      files,
      previews: files.map((file) => ({
        name: file.name,
        url: URL.createObjectURL(file),
        type: file.type.startsWith('image') ? 'photo' : 'video'
      }))
    })
    setError('')
  }

  const handleRemoveFile = (name) => {
    const nextFiles = formData.files.filter((file) => file.name !== name)
    const nextPreviews = formData.previews.filter((p) => p.name !== name)
    setFormData({
      ...formData,
      files: nextFiles,
      previews: nextPreviews
    })
  }

  const handleTagAdd = (tag) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData({ ...formData, tags: [...formData.tags, tag] })
    }
  }

  const handleTagRemove = (tag) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) })
  }

  // Auto-detect YouTube links
  const handleUrlChange = (e) => {
    const url = e.target.value
    setFormData({ ...formData, externalUrl: url })
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      setMediaType('video')
    }
  }

  const uploadFileWithProgress = async (file) => {
    return new Promise(async (resolve, reject) => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.access_token) throw new Error('No active session')

        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
        const bucket = 'media'

        const xhr = new XMLHttpRequest()
        const url = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/${bucket}/${fileName}`

        xhr.open('POST', url)
        xhr.setRequestHeader('Authorization', `Bearer ${session.access_token}`)
        xhr.setRequestHeader('apikey', import.meta.env.VITE_SUPABASE_ANON_KEY)
        // xhr.setRequestHeader('Content-Type', file.type) // Let browser set boundary for FormData

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100)
            setProgress(percent)
          }
        }

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const { Key } = JSON.parse(xhr.responseText)
            // The Key returned is usually "bucket/path" or separate. 
            // For standard Supabase storage, creating correct paths manually is safer.
            // But let's verify what Supabase returns. standard upload returns { Key: "media/filename..." }
            const publicUrl = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/${bucket}/${fileName}`
            resolve({ path: fileName, url: publicUrl })
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`))
          }
        }

        xhr.onerror = () => reject(new Error('Network error during upload'))

        // We use FormData to ensure correct handling
        const formData = new FormData()
        formData.append('file', file)
        // Standard Supabase endpoint handles raw body or formData. 
        // Using FormData is safer for browser compatibility with progress.
        // Actually, Supabase docs say for standard upload, simply POST the body if not using multipart.
        // But let's try sending file directly as body and setting Content-Type
        // xhr.send(file) 

        // Wait, best pattern for Supabase storage API via XHR:
        // POST /object/bucket/filename
        // Body: Raw file content
        // Headers: Content-Type: file.type, Authorization, apikey, x-upsert: false

        // Re-opening to set header
        const xhr2 = new XMLHttpRequest()
        xhr2.open('POST', url)
        xhr2.setRequestHeader('Authorization', `Bearer ${session.access_token}`)
        xhr2.setRequestHeader('apikey', import.meta.env.VITE_SUPABASE_ANON_KEY)
        xhr2.setRequestHeader('Content-Type', file.type)
        xhr2.setRequestHeader('x-upsert', 'false')

        xhr2.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setProgress(Math.round((e.loaded / e.total) * 90)) // Go to 90%, then wait for DB
          }
        }

        xhr2.onload = () => {
          if (xhr2.status >= 200 && xhr2.status < 300) {
            const publicUrl = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/${bucket}/${fileName}`
            resolve({ path: fileName, url: publicUrl })
          } else {
            reject(new Error(`Upload failed: ${xhr2.statusText}`))
          }
        }

        xhr2.onerror = () => reject(new Error('Network error'))
        xhr2.send(file)

      } catch (err) {
        reject(err)
      }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setProgress(0)

    if (!formData.title.trim()) {
      setError('Title is required')
      return
    }

    if (uploadMode === 'file' && formData.files.length === 0) {
      setError('Please select one or more files to upload')
      return
    }

    if (uploadMode === 'link' && !formData.externalUrl.trim()) {
      setError('Please enter a URL')
      return
    }

    setLoading(true)
    let timeoutId

    try {
      // Safety timeout in case Supabase hangs
      timeoutId = setTimeout(() => {
        setError('Upload timed out. Please check your connection.')
        setLoading(false)
      }, 15000)

      let storage_url = null
      let storage_path = null
      let external_url = null
      let thumbnail_url = null
      // Use manually selected type for links, or auto-detected for files
      let finalMediaType = mediaType

      if (uploadMode === 'file' && formData.files.length) {
        const common = {
          description: formData.description.trim() || null,
          date: formData.date || null,
          location: formData.location.trim() || null,
          tags: formData.tags,
          status: formData.status,
          is_featured: formData.isFeatured,
          photographer: 'Admin'
        }

        const uploads = []
        // Track progress for each file independenty
        const fileProgress = new Array(formData.files.length).fill(0)

        const updateOverallProgress = () => {
          const totalProgress = fileProgress.reduce((acc, curr) => acc + curr, 0)
          const averageProgress = Math.round(totalProgress / formData.files.length)
          // Scale to 95% max until DB insert is done
          setProgress(Math.round(averageProgress * 0.95))
        }

        // Upload in parallel
        await Promise.all(formData.files.map(async (file, index) => {
          const detectedType = file.type.startsWith('image') ? 'photo' : 'video'

          // Custom wrapper to track individual file progress
          const { path, url } = await new Promise(async (resolve, reject) => {
            try {
              const { data: { session } } = await supabase.auth.getSession()
              if (!session?.access_token) throw new Error('No active session')

              const fileExt = file.name.split('.').pop()
              const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
              const bucket = 'media'

              const xhr = new XMLHttpRequest()
              const url = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/${bucket}/${fileName}`

              xhr.open('POST', url)
              xhr.setRequestHeader('Authorization', `Bearer ${session.access_token}`)
              xhr.setRequestHeader('apikey', import.meta.env.VITE_SUPABASE_ANON_KEY)
              xhr.setRequestHeader('Content-Type', file.type)
              xhr.setRequestHeader('x-upsert', 'false')

              xhr.upload.onprogress = (e) => {
                if (e.lengthComputable) {
                  const percent = Math.round((e.loaded / e.total) * 100)
                  fileProgress[index] = percent
                  updateOverallProgress()
                }
              }

              xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                  const publicUrl = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/${bucket}/${fileName}`
                  resolve({ path: fileName, url: publicUrl })
                } else {
                  reject(new Error(`Upload failed: ${xhr.statusText}`))
                }
              }

              xhr.onerror = () => reject(new Error('Network error'))
              xhr.send(file)
            } catch (err) {
              reject(err)
            }
          })

          uploads.push({
            title: formData.title.trim() || file.name,
            type: detectedType,
            storage_path: path,
            storage_url: url,
            external_url: null,
            thumbnail_url: detectedType === 'video' ? url : null,
            ...common
          })
        }))

        const { error: dbError } = await supabase
          .from('media')
          .insert(uploads)

        if (dbError) throw dbError
      } else {
        external_url = formData.externalUrl

        // Logic for YouTube
        if (external_url.includes('youtube.com') || external_url.includes('youtu.be')) {
          finalMediaType = 'video' // Enforce video type
          const videoId = external_url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)?.[1]
          if (videoId) {
            thumbnail_url = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
          }
        }

        const { error: dbError } = await supabase
          .from('media')
          .insert([
            {
              title: formData.title.trim(),
              description: formData.description.trim() || null,
              type: finalMediaType,
              storage_path,
              storage_url,
              external_url,
              thumbnail_url,
              date: formData.date || null,
              location: formData.location.trim() || null,
              tags: formData.tags,
              status: formData.status,
              is_featured: formData.isFeatured,
              photographer: 'Admin'
            }
          ])

        if (dbError) throw dbError
      }

      setProgress(100)
      setSuccess(true)
      setTimeout(() => {
        navigate('/admin/manage')
      }, 1500)
    } catch (err) {
      console.error('Error uploading media:', err)
      setError(err.message || 'Failed to upload media. Please try again.')
    } finally {
      if (timeoutId) clearTimeout(timeoutId)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-cornsilk/50 to-white">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link to="/admin" className="inline-flex items-center space-x-2 text-dark-brown hover:text-gold transition-colors mb-4 group">
            <span className="group-hover:-translate-x-1 transition-transform">←</span>
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-4xl font-heading font-bold text-dark-brown mb-2">Upload Media</h1>
          <p className="text-dark-brown/70">Add photos, videos, or external links to the gallery</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Status Messages */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start space-x-3 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg"
            >
              <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="font-semibold text-red-800">Upload Error</p>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start space-x-3 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg"
            >
              <CheckCircle className="text-green-500 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="font-semibold text-green-800">Success!</p>
                <p className="text-green-700 text-sm">Media uploaded successfully. Redirecting...</p>
              </div>
            </motion.div>
          )}

          {/* Upload Method */}
          <div className="glass p-6 rounded-2xl">
            <h2 className="text-lg font-semibold text-dark-brown mb-4">Upload Method</h2>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setUploadMode('file')}
                className={`flex items-center justify-center space-x-3 p-4 rounded-xl transition-all transform hover:scale-105 ${uploadMode === 'file'
                  ? 'bg-gradient-to-br from-gold to-dark-gold text-white shadow-lg'
                  : 'bg-white/50 text-dark-brown border-2 border-transparent hover:border-gold/30'
                  }`}
              >
                <Upload size={22} />
                <span className="font-semibold">Upload File</span>
              </button>
              <button
                type="button"
                onClick={() => setUploadMode('link')}
                className={`flex items-center justify-center space-x-3 p-4 rounded-xl transition-all transform hover:scale-105 ${uploadMode === 'link'
                  ? 'bg-gradient-to-br from-gold to-dark-gold text-white shadow-lg'
                  : 'bg-white/50 text-dark-brown border-2 border-transparent hover:border-gold/30'
                  }`}
              >
                <LinkIcon size={22} />
                <span className="font-semibold">Use Link</span>
              </button>
            </div>
          </div>

          {/* Media Type */}
          <div className="glass p-6 rounded-2xl">
            <h2 className="text-lg font-semibold text-dark-brown mb-2">Media Type</h2>
            <p className="text-sm text-dark-brown/70 mb-4">For file uploads the type is auto-detected per file. This setting applies to external links.</p>
            <div className="grid grid-cols-2 gap-4">
              <label className={`flex items-center space-x-3 p-4 rounded-xl cursor-pointer transition-all ${mediaType === 'photo'
                ? 'bg-gold/10 border-2 border-gold'
                : 'bg-white/50 border-2 border-transparent hover:border-gold/30'
                }`}>
                <input
                  type="radio"
                  name="type"
                  value="photo"
                  checked={mediaType === 'photo'}
                  onChange={(e) => setMediaType(e.target.value)}
                  className="w-4 h-4 cursor-pointer"
                />
                <Image size={20} className="text-dark-brown" />
                <span className="font-medium text-dark-brown">Photo</span>
              </label>
              <label className={`flex items-center space-x-3 p-4 rounded-xl cursor-pointer transition-all ${mediaType === 'video'
                ? 'bg-gold/10 border-2 border-gold'
                : 'bg-white/50 border-2 border-transparent hover:border-gold/30'
                }`}>
                <input
                  type="radio"
                  name="type"
                  value="video"
                  checked={mediaType === 'video'}
                  onChange={(e) => setMediaType(e.target.value)}
                  className="w-4 h-4 cursor-pointer"
                />
                <Video size={20} className="text-dark-brown" />
                <span className="font-medium text-dark-brown">Video</span>
              </label>
            </div>
          </div>

          {/* File Upload or URL */}
          {uploadMode === 'file' ? (
            <div className="glass p-8 rounded-2xl">
              <h2 className="text-lg font-semibold text-dark-brown mb-4">Select File</h2>
              <div className="space-y-4">
                {!formData.previews.length ? (
                  <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gold rounded-xl cursor-pointer hover:bg-gold/5 transition-all group">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload size={40} className="text-gold/60 group-hover:text-gold transition-colors mb-2" />
                      <p className="text-sm font-semibold text-dark-brown">Click to upload or drag and drop</p>
                      <p className="text-xs text-dark-brown/60">PNG, JPG, MP4 up to 100MB each</p>
                    </div>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      multiple
                      accept="image/*,video/*"
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {formData.previews.map((item) => (
                      <div key={item.name} className="relative w-full h-48 rounded-xl overflow-hidden bg-dark-brown/5">
                        {item.type === 'photo' ? (
                          <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <video src={item.url} className="w-full h-full object-cover" controls />
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs px-2 py-1 truncate">{item.name}</div>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(item.name)}
                          className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="glass p-6 rounded-2xl">
              <h2 className="text-lg font-semibold text-dark-brown mb-4">URL</h2>
              <input
                type="url"
                value={formData.externalUrl}
                onChange={handleUrlChange}
                placeholder="https://youtube.com/watch?v=... or paste Drive link"
                className="w-full px-4 py-3 bg-white/50 border border-gold/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
              />
            </div>
          )}

          {/* Basic Info */}
          <div className="glass p-6 rounded-2xl space-y-4">
            <h2 className="text-lg font-semibold text-dark-brown mb-4">Basic Information</h2>

            <div>
              <label className="block text-sm font-semibold text-dark-brown mb-2">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Morning Aarti Ceremony"
                className="w-full px-4 py-3 bg-white/50 border border-gold/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-dark-brown mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Add details about this media..."
                rows="4"
                className="w-full px-4 py-3 bg-white/50 border border-gold/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-dark-brown mb-2 flex items-center space-x-2">
                  <Calendar size={16} />
                  <span>Date</span>
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-3 bg-white/50 border border-gold/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-dark-brown mb-2 flex items-center space-x-2">
                  <MapPin size={16} />
                  <span>Location</span>
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Main Temple"
                  className="w-full px-4 py-3 bg-white/50 border border-gold/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="glass p-6 rounded-2xl">
            <h2 className="text-lg font-semibold text-dark-brown mb-4 flex items-center space-x-2">
              <Tag size={20} />
              <span>Tags</span>
            </h2>

            <div className="flex flex-wrap gap-2 mb-4">
              {formData.tags.map((tag) => (
                <motion.div
                  key={tag}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="inline-flex items-center space-x-2 px-3 py-1 bg-gradient-to-r from-gold/20 to-dark-gold/20 border border-gold/50 rounded-full"
                >
                  <span className="text-sm font-medium text-dark-brown">{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleTagRemove(tag)}
                    className="text-gold hover:text-dark-gold transition-colors"
                  >
                    <X size={16} />
                  </button>
                </motion.div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {suggestedTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagAdd(tag)}
                  disabled={formData.tags.includes(tag)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${formData.tags.includes(tag)
                    ? 'bg-gold/30 text-dark-brown opacity-50 cursor-not-allowed'
                    : 'bg-white/50 text-dark-brown hover:bg-white/70 border border-gold/20 hover:border-gold/50'
                    }`}
                >
                  + {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Status & Featured */}
          <div className="glass p-6 rounded-2xl">
            <h2 className="text-lg font-semibold text-dark-brown mb-4">Publishing Options</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-dark-brown mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-3 bg-white/50 border border-gold/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                >
                  <option value="draft">Draft (Not Visible)</option>
                  <option value="published">Published (Visible)</option>
                </select>
              </div>

              <label className="flex items-center space-x-3 p-3 bg-gold/5 rounded-lg cursor-pointer hover:bg-gold/10 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="w-4 h-4 cursor-pointer accent-gold"
                />
                <span className="font-medium text-dark-brown">Feature on Homepage</span>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="space-y-4">
            {loading && progress > 0 && (
              <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-gold h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
                <p className="text-xs text-center mt-1 text-dark-brown/70">{progress}% Uploaded</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || success}
              className="w-full py-4 bg-gradient-to-r from-gold to-dark-gold text-white rounded-xl font-bold text-lg hover:shadow-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader size={20} className="animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : success ? (
                <>
                  <CheckCircle size={20} />
                  <span>Uploaded Successfully!</span>
                </>
              ) : (
                <>
                  <Save size={20} />
                  <span>Upload Media</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
