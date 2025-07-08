import React from 'react';
import { motion } from 'framer-motion';
import { Facebook, Twitter, Instagram, ArrowRight, Film, Download } from 'lucide-react';

const Footer: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <motion.footer 
      className="bg-gray-900 text-white py-12 px-4 mt-auto"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={containerVariants}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <motion.div variants={itemVariants}>
            <h3 className="text-xl font-bold mb-4 text-yellow-400">CENIFY</h3>
            <p className="text-sm text-gray-300">
              Your one-stop destination for movies, events, and entertainment tickets.
              Experience the best of cinema and live events with premium comfort.
            </p>
            <div className="mt-4 flex space-x-3">
              <SocialButton icon={<Facebook size={18} />} />
              <SocialButton icon={<Twitter size={18} />} />
              <SocialButton icon={<Instagram size={18} />} />
            </div>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              {['About Us', 'Contact Us', 'Terms & Conditions', 'Privacy Policy'].map((item) => (
                <FooterLink key={item} text={item} />
              ))}
            </ul>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <h3 className="text-lg font-bold mb-4">Help</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              {['FAQ', 'Cancellation Policy', 'Payment Options', 'Support'].map((item) => (
                <FooterLink key={item} text={item} />
              ))}
            </ul>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <h3 className="text-lg font-bold mb-4">Download Our App</h3>
            <p className="text-sm text-gray-300 mb-3">Get exclusive offers and seamless booking experience on our mobile app</p>
            <div className="flex flex-col space-y-2">
              <AppStoreButton 
                store="App Store"
                icon={<Film size={18} className="mr-2" />}
              />
              <AppStoreButton 
                store="Play Store"
                icon={<Download size={18} className="mr-2" />}
              />
            </div>
          </motion.div>
        </div>
        
        <motion.div 
          className="mt-10 pt-6 border-t border-gray-800 text-center text-sm text-gray-400"
          variants={itemVariants}
        >
          <p>© 2025 CENIFY. All rights reserved.</p>
        </motion.div>
      </div>
    </motion.footer>
  );
};

interface SocialButtonProps {
  icon: React.ReactNode;
}

const SocialButton: React.FC<SocialButtonProps> = ({ icon }) => (
  <motion.a 
    href="#" 
    className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center hover:bg-yellow-500 hover:text-gray-900 transition-colors"
    whileHover={{ scale: 1.1, backgroundColor: "#FACC15" }}
    whileTap={{ scale: 0.9 }}
  >
    {icon}
  </motion.a>
);

interface FooterLinkProps {
  text: string;
}

const FooterLink: React.FC<FooterLinkProps> = ({ text }) => (
  <li>
    <motion.a 
      href="#" 
      className="hover:text-yellow-400 transition-colors flex items-center"
      whileHover={{ x: 5, color: "#FACC15" }}
    >
      <span>{text}</span>
      <motion.span
        initial={{ opacity: 0, x: -5 }}
        whileHover={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
      >
        <ArrowRight size={14} className="ml-1" />
      </motion.span>
    </motion.a>
  </li>
);

interface AppStoreButtonProps {
  store: string;
  icon: React.ReactNode;
}

const AppStoreButton: React.FC<AppStoreButtonProps> = ({ store, icon }) => (
  <motion.button 
    className="border border-gray-700 rounded-lg px-4 py-2 text-sm flex items-center justify-center hover:border-yellow-400 transition-colors"
    whileHover={{ scale: 1.03, borderColor: "#FACC15" }}
    whileTap={{ scale: 0.97 }}
  >
    {icon}
    <span>{store}</span>
  </motion.button>
);

export default Footer;