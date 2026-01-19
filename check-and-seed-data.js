import { createClient } from '@supabase/supabase-js'

// Read config from environment variables for safety
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase env vars. Export VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY before running this script.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkAndSeedData() {
  console.log('Checking database connection...')
  
  // Check if media table has any data
  const { data: mediaData, error: mediaError } = await supabase
    .from('media')
    .select('*')
    .limit(10)

  if (mediaError) {
    console.error('Error fetching media:', mediaError.message)
    console.log('\nTip: Make sure you have run the SQL schema files in Supabase')
    return
  }

  console.log(`Found ${mediaData?.length || 0} media items in database`)

  if (!mediaData || mediaData.length === 0) {
    console.log('\nNo media found. Adding sample data...')
    
    const sampleMedia = [
      {
        title: 'Divine Darshan',
        description: 'Sacred moments from the temple',
        type: 'photo',
        external_url: 'https://images.unsplash.com/photo-1604608672516-f1b9b1b7b6d2?w=1200',
        tags: ['Temple', 'Darshan'],
        location: 'Bhuj Dham',
        date: new Date().toISOString(),
        status: 'published',
        is_featured: true,
        views: 0,
        likes: 0
      },
      {
        title: 'Morning Aarti',
        description: 'Beautiful morning prayer ceremony',
        type: 'photo',
        external_url: 'https://images.unsplash.com/photo-1548625361-9c9b0a43b0a5?w=1200',
        tags: ['Aarti', 'Ceremony'],
        location: 'Bhuj Dham',
        date: new Date().toISOString(),
        status: 'published',
        is_featured: true,
        views: 0,
        likes: 0
      },
      {
        title: 'Temple Architecture',
        description: 'Magnificent temple structure',
        type: 'photo',
        external_url: 'https://images.unsplash.com/photo-1585164941959-d53b0fd5fbc6?w=1200',
        tags: ['Architecture', 'Temple'],
        location: 'Bhuj Dham',
        date: new Date().toISOString(),
        status: 'published',
        is_featured: true,
        views: 0,
        likes: 0
      }
    ]

    const { data: insertedData, error: insertError } = await supabase
      .from('media')
      .insert(sampleMedia)
      .select()

    if (insertError) {
      console.error('Error inserting sample data:', insertError.message)
    } else {
      console.log(`✓ Successfully added ${insertedData?.length || 0} sample media items`)
    }
  } else {
    console.log('Media data exists:')
    mediaData.forEach((item, idx) => {
      console.log(`  ${idx + 1}. ${item.title} (${item.status}) - Featured: ${item.is_featured}`)
    })
  }
}

checkAndSeedData().catch(console.error)
