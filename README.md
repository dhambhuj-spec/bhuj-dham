# Bhuj Dham - Divine Gallery 🕉️

A modern, premium spiritual gallery application for Lord Swaminarayan, featuring dynamic media management with Supabase backend.

## Features

✅ **User Side:**
- Premium spiritual hero section with animations
- Featured carousel with auto-advance
- Creative masonry gallery layout (no boring grids!)
- Immersive media detail lightbox
- Tag-based filtering
- View counts and engagement metrics

✅ **Admin Panel:**
- Upload photos/videos OR add external links (YouTube, Drive, URLs)
- Rich metadata (title, description, date, location, tags)
- Draft/Published status management
- Mark items as "Featured"
- Full CRUD operations (create, read, update, delete)
- Real-time stats dashboard

## Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Framer Motion
- **Backend:** Supabase (PostgreSQL + Storage)
- **Routing:** React Router v6
- **Icons:** Lucide React

## Setup Instructions

### 1. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 2. Set Up Supabase

1. Create a Supabase account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to **Project Settings** → **API** and copy:
   - Project URL
   - Anon public key

4. Create a `.env` file in the root directory:

\`\`\`env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
\`\`\`

### 3. Set Up Database

1. Go to **SQL Editor** in your Supabase dashboard
2. Copy and run the SQL from `supabase-schema.sql`
3. This will create the `media` table with all necessary columns and indexes

### 4. Set Up Storage

1. Go to **Storage** in Supabase
2. Create a new bucket named `media`
3. Set it to **Public**
4. Set file size limit to 100MB
5. Add allowed MIME types: `image/*` and `video/*`

### 5. Run the Application

\`\`\`bash
npm run dev
\`\`\`

Visit `http://localhost:3000`

## Database Schema

The `media` table includes:

- **Basic Info:** id, title, description, type (photo/video)
- **Storage:** storage_path, storage_url, external_url, thumbnail_url
- **Metadata:** date, location, tags, photographer
- **Status:** status (draft/published), is_featured, order_weight
- **Engagement:** views, likes
- **Timestamps:** created_at, updated_at

## Usage

### Adding Media

1. Go to `/admin` and login (any credentials work in demo mode)
2. Click "Upload Media"
3. Choose upload method:
   - **Upload File:** Select from computer
   - **Use Link:** Paste YouTube, Drive, or direct URL
4. Fill in details (title, description, tags, location, date)
5. Set status (Draft or Published)
6. Optionally mark as "Featured"
7. Click "Upload Media"

### Managing Media

1. Go to "Manage Gallery" from admin dashboard
2. Search and filter media
3. Toggle featured status with star icon
4. Delete unwanted media

### Viewing Gallery

- Visit `/` for homepage with hero and featured carousel
- Visit `/gallery` for full masonry gallery with filters
- Click any media to view in immersive lightbox detail page

## Color Palette (Spiritual Theme)

- **Background:** Cornsilk (#FFF8DC)
- **Foreground:** Dark Brown (#3B2A1A)
- **Primary:** Gold (#DAA520)
- **Secondary:** Maroon (#5E0A0A)
- **Accent:** Coral (#FF7F50)
- **Muted:** Wheat (#F5DEB3)

## Project Structure

\`\`\`
src/
├── components/
│   ├── admin/          # Admin panel components
│   ├── FeaturedCarousel.jsx
│   ├── MasonryGallery.jsx
│   ├── MediaFilters.jsx
│   ├── Navigation.jsx
│   ├── Footer.jsx
│   └── StatsSection.jsx
├── pages/
│   ├── Home.jsx        # Landing page
│   ├── Gallery.jsx     # Main gallery
│   ├── MediaDetail.jsx # Lightbox detail view
│   └── Admin.jsx       # Admin routes
├── hooks/
│   └── useMedia.js     # Supabase data hooks
├── lib/
│   └── supabase.js     # Supabase client & helpers
└── index.css           # Global styles with mandala pattern
\`\`\`

## Notes

- All images are now dynamic from Supabase
- Demo/mock images have been removed
- YouTube links automatically extract thumbnails
- Storage files are uploaded to Supabase Storage
- RLS policies ensure proper access control

## Future Enhancements

- [ ] Advanced search with Algolia
- [ ] User authentication for contributors
- [ ] Comments and reactions
- [ ] Image compression before upload
- [ ] Video transcoding
- [ ] Analytics dashboard
- [ ] Mobile app (React Native)

---

Made with devotion 🙏 for Lord Swaminarayan
