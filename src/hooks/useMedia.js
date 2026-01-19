import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export const useMedia = (filters = {}) => {
  const [media, setMedia] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchMedia()
  }, [JSON.stringify(filters)])

  const fetchMedia = async () => {
    try {
      setLoading(true)
      console.log('useMedia: Fetching with filters:', JSON.stringify(filters))
      
      let query = supabase
        .from('media')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(filters.featured ? 10 : 50) // Limit initial results

      // Apply filters
      if (filters.type && filters.type !== 'all') {
        query = query.eq('type', filters.type)
      }

      if (filters.tags && filters.tags.length > 0) {
        query = query.contains('tags', filters.tags)
      }

      if (filters.featured) {
        console.log('useMedia: Applying featured filter')
        query = query.eq('is_featured', true)
      }
      
      // Search filter
      if (filters.search && filters.search.trim()) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,location.ilike.%${filters.search}%,photographer.ilike.%${filters.search}%`)
      }

      console.log('useMedia: Executing query...')
      const { data, error } = await query
      
      console.log('useMedia: Query completed!', { 
        dataCount: data?.length, 
        hasError: !!error,
        errorMessage: error?.message,
        firstItem: data?.[0]?.title
      })

      if (error) {
        console.error('useMedia: Query error:', error)
        throw error
      }
      
      setMedia(data || [])
      console.log('useMedia: State updated with', data?.length, 'items')
    } catch (err) {
      setError(err.message)
      console.error('useMedia: Fetch error:', err)
      setMedia([]) // Set empty array on error
    } finally {
      console.log('useMedia: Setting loading to false')
      setLoading(false)
    }
  }

  const incrementViews = async (id) => {
    try {
      const { error } = await supabase.rpc('increment_views', { media_id: id })
      if (error) throw error
    } catch (err) {
      console.error('Error incrementing views:', err)
    }
  }

  const toggleLike = async (id) => {
    try {
      const { error } = await supabase.rpc('increment_likes', { media_id: id })
      if (error) throw error
      // Refetch to update local state
      fetchMedia()
    } catch (err) {
      console.error('Error toggling like:', err)
    }
  }

  return { media, loading, error, refetch: fetchMedia, incrementViews, toggleLike }
}

export const useMediaById = (id) => {
  const [media, setMedia] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) return

    const fetchMedia = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('media')
          .select('*')
          .eq('id', id)
          .single()

        if (error) throw error
        setMedia(data)

        // Increment views
        await supabase.rpc('increment_views', { media_id: id })
      } catch (err) {
        setError(err.message)
        console.error('Error fetching media:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchMedia()
  }, [id])

  return { media, loading, error }
}

export const useAdminMedia = () => {
  const [media, setMedia] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchMedia = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('media')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setMedia(data || [])
    } catch (err) {
      setError(err.message)
      console.error('Error fetching media:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMedia()
  }, [])

  const deleteMedia = async (id, storagePath) => {
    try {
      // Delete from storage if exists
      if (storagePath) {
        await supabase.storage.from('media').remove([storagePath])
      }

      // Delete from database
      const { error } = await supabase
        .from('media')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      // Update local state
      setMedia(media.filter(item => item.id !== id))
      return true
    } catch (err) {
      console.error('Error deleting media:', err)
      throw err
    }
  }

  const updateMedia = async (id, updates) => {
    try {
      const { data, error } = await supabase
        .from('media')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      
      // Update local state
      setMedia(media.map(item => item.id === id ? data : item))
      return data
    } catch (err) {
      console.error('Error updating media:', err)
      throw err
    }
  }

  return { media, loading, error, refetch: fetchMedia, deleteMedia, updateMedia }
}

export const useStats = () => {
  const [stats, setStats] = useState({
    totalPhotos: 0,
    totalVideos: 0,
    totalViews: 0,
    totalMedia: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        
        // Get counts
        const { count: photoCount } = await supabase
          .from('media')
          .select('*', { count: 'exact', head: true })
          .eq('type', 'photo')

        const { count: videoCount } = await supabase
          .from('media')
          .select('*', { count: 'exact', head: true })
          .eq('type', 'video')

        // Get total views
        const { data: viewsData } = await supabase
          .from('media')
          .select('views')
        
        const totalViews = viewsData?.reduce((sum, item) => sum + (item.views || 0), 0) || 0

        setStats({
          totalPhotos: photoCount || 0,
          totalVideos: videoCount || 0,
          totalViews,
          totalMedia: (photoCount || 0) + (videoCount || 0)
        })
      } catch (err) {
        console.error('Error fetching stats:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return { stats, loading }
}
