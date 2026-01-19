import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import FeaturedCarousel from '../components/FeaturedCarousel'
import StatsSection from '../components/StatsSection'

export default function Home() {
  return (
    <>
      <Helmet>
        <title>Bhuj Dham - Swaminarayan Temple | Live & Daily Darshan</title>
        <meta name="description" content="Welcome to Bhuj Dham - The official gallery of Shree Swaminarayan Temple Bhuj. Experience Live Darshan, Daily Aarti, and divine festivals of Kutch." />
        <link rel="canonical" href="https://bhujdham.com/" />
      </Helmet>
      <div className="relative">
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute inset-0">
            <div className="absolute top-20 left-10 w-32 h-32 bg-gold/10 rounded-full blur-3xl animate-float"></div>
            <div className="absolute bottom-20 right-10 w-40 h-40 bg-coral/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
            <div className="absolute top-1/2 left-1/2 w-60 h-60 bg-maroon/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
          </div>

          {/* Hero Content */}
          <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {/* Jay Shree Swaminarayan Greeting */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="mb-8"
            >
              <h2 className="text-3xl md:text-5xl font-heading font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold via-maroon to-dark-gold mb-2">
                जय श्री स्वामिनारायण
              </h2>
              <p className="text-xl md:text-2xl font-semibold text-dark-brown/90 tracking-wide">
                Jay Shree Swaminarayan
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mb-6"
            >
              <span className="inline-flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-gold/20 to-coral/20 border border-gold/30 rounded-full text-dark-brown font-medium shadow-lg">
                <Sparkles size={16} className="text-gold" />
                <span>Divine Moments Captured</span>
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold text-dark-brown mb-6 leading-tight"
            >
              Experience the Divine
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold via-dark-gold to-coral">
                Presence of Lord Swaminarayan
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-lg md:text-xl text-dark-brown/70 mb-10 max-w-2xl mx-auto"
            >
              Journey through sacred moments, divine celebrations, and architectural marvels.
              Every photograph is a window to spiritual enlightenment.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-5"
            >
              <Link
                to="/gallery"
                className="group flex items-center space-x-2 px-10 py-4 bg-gradient-to-r from-gold via-dark-gold to-gold text-white rounded-full font-semibold shadow-2xl hover:shadow-gold/50 transition-all transform hover:scale-105 hover:-translate-y-1"
              >
                <span className="text-base">Enter Gallery</span>
                <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
              </Link>
              <a
                href="#today"
                className="flex items-center space-x-2 px-10 py-4 glass border-2 border-gold/30 text-dark-brown rounded-full font-semibold hover:border-gold hover:shadow-lg transition-all transform hover:scale-105"
              >
                <span className="text-base">Today's Darshan</span>
              </a>
            </motion.div>

            {/* Floating OM Symbol */}
            <motion.div
              animate={{
                y: [0, -20, 0],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="mt-20"
            >
              <div className="inline-block text-8xl md:text-9xl font-heading text-gold/20">
                ॐ
              </div>
            </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        <StatsSection />

        {/* Featured Gallery Section */}
        <section id="today" className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-4xl md:text-5xl font-heading font-bold text-dark-brown mb-4"
              >
                Featured Moments
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-lg text-dark-brown/70 max-w-2xl mx-auto"
              >
                Handpicked divine captures that radiate devotion and spirituality
              </motion.p>
            </div>

            <FeaturedCarousel />
          </div>
        </section>
      </div>
    </>
  )
}
