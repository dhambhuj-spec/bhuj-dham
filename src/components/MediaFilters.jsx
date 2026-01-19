import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'

export default function MediaFilters({ filters, setFilters }) {
  const [tags, setTags] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTags()
    
    // Subscribe to realtime changes on tags table
    const subscription = supabase
      .channel('tags')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tags'
        },
        (payload) => {
          // Refetch tags when any changes occur
          fetchTags()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const fetchTags = async () => {
    try {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('name')
      
      if (!error && data) {
        setTags(data)
      }
    } catch (err) {
      console.error('Error fetching tags:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleTagClick = (tagName) => {
    if (tagName === 'All') {
      setFilters({ ...filters, tags: [] })
    } else {
      const newTags = filters.tags.includes(tagName)
        ? filters.tags.filter(t => t !== tagName)
        : [...filters.tags, tagName]
      setFilters({ ...filters, tags: newTags })
    }
  }

  const filterTags = ['All', ...tags.map(t => t.name)]

  if (loading) {
    return (
      <div className="mb-8">
        <div className="flex flex-wrap gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="px-5 py-2 rounded-full bg-gray-200 animate-pulse w-24 h-10" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="mb-8">
      <div className="flex flex-wrap gap-3">
        {filterTags.map((tag, index) => {
          const isActive = tag === 'All' 
            ? filters.tags.length === 0 
            : filters.tags.includes(tag)
          
          return (
            <motion.button
              key={tag}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: Math.min(index * 0.02, 0.3) }}
              onClick={() => handleTagClick(tag)}
              className={`px-5 py-2 rounded-full font-medium transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-gold to-dark-gold text-white shadow-lg scale-105'
                  : 'glass text-dark-brown hover:shadow-md hover:scale-105'
              }`}
            >
              {tag}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
