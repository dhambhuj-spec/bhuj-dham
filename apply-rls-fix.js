import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const supabaseUrl = 'https://zbrnhvxodhkyzlghsyvq.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'YOUR_SERVICE_ROLE_KEY'

// Note: You need the service role key (not anon key) to run SQL
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function applyRLSFixes() {
  console.log('Attempting to fix RLS policies...\n')
  
  try {
    // Read the SQL file
    const sql = readFileSync('./fix-media-rls.sql', 'utf-8')
    
    console.log('Executing SQL...')
    const { data, error } = await supabase.rpc('exec_sql', { sql })
    
    if (error) {
      console.error('Error:', error.message)
      console.log('\n⚠️  You need to run this SQL manually in Supabase Dashboard:')
      console.log('1. Go to https://zbrnhvxodhkyzlghsyvq.supabase.co')
      console.log('2. Click SQL Editor')
      console.log('3. Paste the contents of fix-media-rls.sql')
      console.log('4. Click Run')
    } else {
      console.log('✓ RLS policies updated successfully!')
    }
  } catch (err) {
    console.error('Error:', err.message)
    console.log('\n⚠️  Please run fix-media-rls.sql manually in Supabase Dashboard:')
    console.log('1. Go to https://zbrnhvxodhkyzlghsyvq.supabase.co')
    console.log('2. Click SQL Editor in the left sidebar')
    console.log('3. Copy and paste the entire contents of fix-media-rls.sql')
    console.log('4. Click Run')
  }
}

applyRLSFixes()
