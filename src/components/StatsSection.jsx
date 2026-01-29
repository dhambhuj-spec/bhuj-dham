import { motion } from 'framer-motion'
import { Image, Video, Calendar, Eye } from 'lucide-react'
import { useStats } from '../hooks/useMedia'

export default function StatsSection() {
  const { stats, loading } = useStats()

  const statsData = [
    { icon: Image, label: 'Swaminarayan Divine Darshan & Events', value: stats.totalPhotos, color: 'text-gold' },
    { icon: Video, label: 'Divine Videos', value: stats.totalVideos, color: 'text-coral' },
    { icon: Calendar, label: 'Total Media', value: stats.totalMedia, color: 'text-maroon' },
    { icon: Eye, label: 'Total Views', value: stats.totalViews.toLocaleString(), color: 'text-dark-gold' },
  ]

  if (loading) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="glass p-6 rounded-2xl animate-pulse h-32"></div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {statsData.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="glass p-6 rounded-2xl text-center hover:shadow-xl transition-all transform hover:scale-105"
            >
              <stat.icon className={`w-8 h-8 ${stat.color} mx-auto mb-3`} />
              <div className="text-3xl font-heading font-bold text-dark-brown mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-dark-brown/70">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
