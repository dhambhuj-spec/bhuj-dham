import { useState, useEffect, useContext } from 'react'
import { motion } from 'framer-motion'
import { Send, MessageCircle, Trash2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { AuthContext } from '../context/AuthContext'

export default function CommentsSection({ mediaId, onAuthRequired }) {
  const { user } = useContext(AuthContext)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetchingComments, setFetchingComments] = useState(true)

  useEffect(() => {
    fetchComments()
  }, [mediaId])

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          text,
          created_at,
          users:user_id (
            username,
            email
          )
        `)
        .eq('media_id', mediaId)
        .order('created_at', { ascending: false })

      if (!error && data) {
        setComments(data)
      }
    } catch (err) {
      console.error('Error fetching comments:', err)
    } finally {
      setFetchingComments(false)
    }
  }

  const handleAddComment = async (e) => {
    e.preventDefault()

    if (!user) {
      onAuthRequired()
      return
    }

    if (!newComment.trim()) {
      return
    }

    setLoading(true)

    try {
      const { data, error } = await supabase
        .from('comments')
        .insert([
          {
            media_id: mediaId,
            user_id: user.id,
            text: newComment.trim()
          }
        ])
        .select()

      if (error) throw error

      setNewComment('')
      fetchComments()
    } catch (err) {
      console.error('Error adding comment:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteComment = async (commentId) => {
    if (!confirm('Delete this comment?')) return

    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)

      if (error) throw error
      fetchComments()
    } catch (err) {
      console.error('Error deleting comment:', err)
    }
  }

  return (
    <div className="mt-12 pt-12 border-t border-white/10">
      <h3 className="text-2xl font-heading font-bold text-white mb-6 flex items-center gap-2">
        <MessageCircle size={28} className="text-gold" />
        Comments
      </h3>

      {/* Comment Form */}
      <form onSubmit={handleAddComment} className="mb-8 glass p-4 rounded-xl">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={user ? "Share your thoughts about this divine moment..." : "Login to add a comment"}
          disabled={!user || loading}
          rows={3}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-gold resize-none disabled:opacity-50"
        />
        <div className="flex items-center justify-between mt-3">
          {!user && (
            <button
              type="button"
              onClick={onAuthRequired}
              className="text-sm text-gold hover:text-dark-gold transition-colors"
            >
              Login to comment
            </button>
          )}
          <div className="flex-1" />
          <button
            type="submit"
            disabled={!user || !newComment.trim() || loading}
            className="flex items-center gap-2 px-4 py-2 bg-gold text-white rounded-lg hover:bg-dark-gold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={16} />
            <span>{loading ? 'Posting...' : 'Post'}</span>
          </button>
        </div>
      </form>

      {/* Comments List */}
      {fetchingComments ? (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-white/60 mt-2">Loading comments...</p>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-12 glass rounded-xl">
          <MessageCircle size={48} className="mx-auto text-white/30 mb-3" />
          <p className="text-white/60">No comments yet. Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment, index) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass p-4 rounded-xl group"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-white font-medium">{comment.users?.username || 'Anonymous'}</p>
                  <p className="text-xs text-white/50">
                    {new Date(comment.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                {user?.id === comment.users?.id && (
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="p-1 text-white/40 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                    title="Delete comment"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              <p className="text-white/80 text-sm leading-relaxed">{comment.text}</p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
