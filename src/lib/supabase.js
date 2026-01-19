import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const isPlaceholder = (v) => !v || v.includes('YOUR_SUPABASE_URL') || v.includes('YOUR_SUPABASE_ANON_KEY')
export const isSupabaseConfigured = !!supabaseUrl && !!supabaseAnonKey && !isPlaceholder(supabaseUrl) && !isPlaceholder(supabaseAnonKey)

// Helpful runtime log to catch misconfiguration early
console.log('Supabase Config:', {
  url: supabaseUrl,
  hasKey: !!supabaseAnonKey,
  keyLength: supabaseAnonKey?.length,
  configured: isSupabaseConfigured
})

if (!isSupabaseConfigured) {
  console.error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env and restart the dev server.')
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')

// Storage bucket name
export const MEDIA_BUCKET = 'media'

// Helper functions
export const uploadMediaFile = async (file, folder = 'photos') => {
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    
    const { data, error } = await supabase.storage
      .from(MEDIA_BUCKET)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) throw error

    const { data: { publicUrl } } = supabase.storage
      .from(MEDIA_BUCKET)
      .getPublicUrl(fileName)

    return { path: fileName, url: publicUrl }
  } catch (error) {
    console.error('Storage upload error:', error)
    throw error
  }
}

export const deleteMediaFile = async (path) => {
  const { error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .remove([path])

  if (error) throw error
  return true
}

// Get public URL for a file
export const getPublicUrl = (path) => {
  if (!path) return null
  const { data } = supabase.storage
    .from(MEDIA_BUCKET)
    .getPublicUrl(path)
  return data.publicUrl
}
