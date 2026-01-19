import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Trash2, Tag, X, Loader, AlertCircle, CheckCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export default function AdminTags() {
  const [tags, setTags] = useState([])
  const [newTag, setNewTag] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchTags()
  }, [])

  const fetchTags = async () => {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .order('name')
    
    if (!error && data) {
      setTags(data)
    }
  }

  const handleCreateTag = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!newTag.trim()) {
      setError('Tag name cannot be empty')
      return
    }

    setLoading(true)

    try {
      const { data, error: insertError } = await supabase
        .from('tags')
        .insert([{ name: newTag.trim() }])
        .select()

      if (insertError) {
        if (insertError.code === '23505') {
          setError('Tag already exists')
        } else {
          setError(insertError.message)
        }
      } else {
        setSuccess(`Tag "${newTag}" created successfully!`)
        setNewTag('')
        fetchTags()
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTag = async (tagId, tagName) => {
    if (!confirm(`Are you sure you want to delete the tag "${tagName}"? This will remove it from all media items.`)) {
      return
    }

    try {
      const { error: deleteError } = await supabase
        .from('tags')
        .delete()
        .eq('id', tagId)

      if (deleteError) {
        setError(deleteError.message)
      } else {
        setSuccess(`Tag "${tagName}" deleted successfully!`)
        fetchTags()
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-heading font-bold text-dark-brown mb-2">Manage Tags</h1>
          <p className="text-dark-brown/70">Create and organize tags for categorizing your gallery</p>
        </motion.div>

        {/* Status Messages */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start space-x-3 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg mb-6"
          >
            <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="font-semibold text-red-800">Error</p>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
            <button onClick={() => setError('')} className="ml-auto text-red-500 hover:text-red-700">
              <X size={18} />
            </button>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start space-x-3 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg mb-6"
          >
            <CheckCircle className="text-green-500 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="font-semibold text-green-800">Success!</p>
              <p className="text-green-700 text-sm">{success}</p>
            </div>
          </motion.div>
        )}

        {/* Create Tag Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass p-6 rounded-2xl mb-8"
        >
          <h2 className="text-xl font-heading font-bold text-dark-brown mb-4 flex items-center space-x-2">
            <Plus size={24} className="text-gold" />
            <span>Create New Tag</span>
          </h2>
          
          <form onSubmit={handleCreateTag} className="flex gap-4">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Enter tag name (e.g., Divine Ceremony)"
              className="flex-1 px-4 py-3 bg-white/50 border border-gold/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !newTag.trim()}
              className="px-6 py-3 bg-gradient-to-r from-gold to-dark-gold text-white rounded-lg font-semibold hover:shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader size={20} className="animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Plus size={20} />
                  <span>Create Tag</span>
                </>
              )}
            </button>
          </form>
        </motion.div>

        {/* Tags List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass p-6 rounded-2xl"
        >
          <h2 className="text-xl font-heading font-bold text-dark-brown mb-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Tag size={24} className="text-gold" />
              <span>All Tags</span>
            </div>
            <span className="text-sm text-dark-brown/70 font-normal">
              {tags.length} {tags.length === 1 ? 'tag' : 'tags'}
            </span>
          </h2>

          {tags.length === 0 ? (
            <div className="text-center py-12">
              <Tag size={48} className="mx-auto text-dark-brown/30 mb-4" />
              <p className="text-dark-brown/70 mb-2">No tags yet</p>
              <p className="text-sm text-dark-brown/50">Create your first tag above to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {tags.map((tag, index) => (
                <motion.div
                  key={tag.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-gold/10 to-dark-gold/10 border border-gold/30 rounded-xl hover:shadow-md transition-all group"
                >
                  <div className="flex items-center space-x-2">
                    <Tag size={16} className="text-gold" />
                    <span className="font-medium text-dark-brown">{tag.name}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteTag(tag.id, tag.name)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    title="Delete tag"
                  >
                    <Trash2 size={16} />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl"
        >
          <h3 className="font-semibold text-blue-900 mb-2">💡 Tag Management Tips</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Tags help organize and categorize your gallery media</li>
            <li>• Use descriptive names that users can easily understand</li>
            <li>• Deleting a tag will remove it from all associated media</li>
            <li>• Tags are case-sensitive (e.g., "Festival" ≠ "festival")</li>
          </ul>
        </motion.div>
      </div>
    </div>
  )
}
