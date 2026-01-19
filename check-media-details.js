import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zbrnhvxodhkyzlghsyvq.supabase.co'
const supabaseKey = 'sb_publishable_FEa0EKeRsrrLe1iLCdoOvw_YSJbIWdR'
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkMediaDetails() {
  console.log('Fetching media details...\n')
  
  const { data: media, error } = await supabase
    .from('media')
    .select('*')
    .eq('status', 'published')

  if (error) {
    console.error('Error:', error.message)
    return
  }

  console.log(`Total published media: ${media?.length || 0}\n`)
  
  media?.forEach((item, idx) => {
    console.log(`${idx + 1}. ${item.title}`)
    console.log(`   ID: ${item.id}`)
    console.log(`   Type: ${item.type}`)
    console.log(`   Featured: ${item.is_featured}`)
    console.log(`   Storage URL: ${item.storage_url || 'Not set'}`)
    console.log(`   External URL: ${item.external_url || 'Not set'}`)
    console.log(`   Thumbnail: ${item.thumbnail_url || 'Not set'}`)
    console.log(`   Tags: ${item.tags?.join(', ') || 'None'}`)
    console.log(`   Location: ${item.location || 'Not set'}`)
    console.log(`   Description: ${item.description || 'Not set'}\n`)
  })
}

checkMediaDetails().catch(console.error)
