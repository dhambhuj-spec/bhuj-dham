import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zbrnhvxodhkyzlghsyvq.supabase.co'
const supabaseKey = 'sb_publishable_FEa0EKeRsrrLe1iLCdoOvw_YSJbIWdR'
const supabase = createClient(supabaseUrl, supabaseKey)

async function fixFeaturedMedia() {
  console.log('Marking existing media as featured...')
  
  // Get all published media
  const { data: allMedia, error: fetchError } = await supabase
    .from('media')
    .select('*')
    .eq('status', 'published')

  if (fetchError) {
    console.error('Error fetching media:', fetchError.message)
    return
  }

  console.log(`Found ${allMedia?.length || 0} published media items`)

  if (allMedia && allMedia.length > 0) {
    // Update all to be featured
    const { error: updateError } = await supabase
      .from('media')
      .update({ is_featured: true })
      .eq('status', 'published')

    if (updateError) {
      console.error('Error updating media:', updateError.message)
    } else {
      console.log('✓ Successfully marked all media as featured')
      console.log('Your carousel should now show content!')
    }
  }
}

fixFeaturedMedia().catch(console.error)
