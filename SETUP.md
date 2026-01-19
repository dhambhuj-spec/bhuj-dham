# Quick Setup Guide - Bhuj Dham Gallery

## Step-by-Step Supabase Setup

### 1. Create Supabase Project (5 minutes)

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up/Login with GitHub
3. Click "New Project"
4. Fill in:
   - **Name:** bhuj-dham
   - **Database Password:** (choose a strong password)
   - **Region:** Choose closest to your location
5. Wait 2 minutes for project creation

### 2. Get API Credentials (1 minute)

1. Go to **Project Settings** (⚙️ icon in sidebar)
2. Click **API** tab
3. Copy these two values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)

### 3. Configure Environment (1 minute)

1. Create `.env` file in project root:

\`\`\`bash
cd /home/yash/bhujdham
nano .env
\`\`\`

2. Paste and update:

\`\`\`env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...your-long-key
\`\`\`

3. Save (Ctrl+X, Y, Enter)

### 4. Create Database Table (2 minutes)

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy entire content from `supabase-schema.sql`
4. Paste into SQL editor
5. Click **RUN** (or F5)
6. You should see "Success. No rows returned"

### 5. Create Storage Bucket (2 minutes)

1. Go to **Storage** in sidebar
2. Click **New Bucket**
3. Settings:
   - **Name:** `media`
   - **Public bucket:** ✅ ON
   - **File size limit:** 100 MB
   - **Allowed MIME types:** `image/*, video/*`
4. Click **Create Bucket**

### 6. Test the Application

\`\`\`bash
npm run dev
\`\`\`

Visit `http://localhost:3000`

## Testing Upload Functionality

### Test 1: Upload a Photo

1. Go to `http://localhost:3000/admin`
2. Login (any credentials work)
3. Click "Upload Media"
4. Choose "Upload File" → "Photo"
5. Upload any image from your computer
6. Fill in:
   - Title: "Test Photo"
   - Tags: Select "Darshan"
   - Status: "Published"
7. Click "Upload Media"
8. Go to Gallery page - your photo should appear!

### Test 2: Add YouTube Link

1. Go to Upload Media
2. Choose "Use Link" → "Video"
3. Paste YouTube URL: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
4. Fill title and details
5. Mark as "Featured"
6. Upload
7. Check homepage - should appear in featured carousel!

## Troubleshooting

### Issue: "Failed to fetch"
- Check if .env values are correct
- Restart dev server after changing .env
- Verify Supabase project is active

### Issue: "Storage bucket not found"
- Make sure bucket name is exactly `media`
- Check bucket is set to Public
- Run schema SQL again (it creates storage policies)

### Issue: "RLS policy" errors
- Run the schema SQL completely
- Make sure all policies were created
- Check Supabase logs in Dashboard

### Issue: No images showing
- Check browser console for errors
- Verify image URLs in Supabase Storage
- Check file permissions (should be public)

## Database Check Commands

Run in Supabase SQL Editor:

\`\`\`sql
-- Check if table exists
SELECT * FROM media LIMIT 1;

-- Count total media
SELECT COUNT(*) FROM media;

-- Check storage files
SELECT * FROM storage.objects WHERE bucket_id = 'media';
\`\`\`

## Next Steps

Once setup is complete:

1. ✅ Upload 5-10 test images
2. ✅ Mark 2-3 as Featured
3. ✅ Test gallery filters
4. ✅ Test media detail page
5. ✅ Test delete functionality

## Production Deployment

For production (Netlify/Vercel):

1. Add environment variables in hosting dashboard
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Enable automatic deployments from Git

---

Need help? Check Supabase docs: https://supabase.com/docs
