export default function Footer() {
  return (
    <footer className="glass border-t border-gold/30 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          {/* Logo and Greeting */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gold via-dark-gold to-maroon flex items-center justify-center gold-glow shadow-xl">
              <span className="text-4xl text-white font-heading">ॐ</span>
            </div>
          </div>
          
          <div className="mb-6">
            <p className="text-2xl font-heading font-bold text-gold mb-2">
              जय श्री स्वामिनारायण
            </p>
            <h3 className="text-3xl font-heading font-bold text-dark-brown">
              Bhuj Dham
            </h3>
          </div>
          
          <p className="text-base text-dark-brown/70 mb-8 max-w-2xl mx-auto leading-relaxed">
            Experience the divine presence of Lord Swaminarayan through our sacred gallery. 
            Every image tells a story of devotion, faith, and eternal bliss.
          </p>
          
          {/* Sacred Mantra */}
          <div className="py-8 border-y-2 border-gold/30 my-8 bg-gradient-to-r from-transparent via-gold/5 to-transparent">
            <p className="text-xl md:text-2xl font-heading text-transparent bg-clip-text bg-gradient-to-r from-gold via-maroon to-dark-gold font-semibold">
              हरि ॐ तत्सत् श्री स्वामिनारायण परब्रह्म
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-8 mb-8">
            <a href="#" className="text-dark-brown/70 hover:text-gold transition-colors font-medium text-sm">
              About Us
            </a>
            <a href="#" className="text-dark-brown/70 hover:text-gold transition-colors font-medium text-sm">
              Contact
            </a>
            <a href="#" className="text-dark-brown/70 hover:text-gold transition-colors font-medium text-sm">
              Contribute
            </a>
            <a href="#" className="text-dark-brown/70 hover:text-gold transition-colors font-medium text-sm">
              Privacy Policy
            </a>
          </div>

          <div className="border-t border-gold/20 pt-6">
            <p className="text-sm text-dark-brown/60 mb-2">
              © {new Date().getFullYear()} Bhuj Dham - Divine Gallery. All rights reserved.
            </p>
            <p className="text-xs text-dark-brown/50">
              Made with devotion and dedication 🙏
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
