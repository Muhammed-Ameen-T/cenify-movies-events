import React from 'react';
import { Film, ArrowRight, Facebook, Twitter, Instagram } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-br from-gray-100 to-gray-300 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-r from-yellow-300 to-yellow-500 rounded-full blur-3xl transform translate-x-1/2 translate-y-1/2"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16 relative">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand Section */}
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center gap-3 mb-4 justify-center md:justify-start">
              <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <Film className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">CENIFY</h3>
            </div>
            <p className="text-gray-600 mb-6 text-center md:text-left">
              Your premier destination for movies and entertainment. Experience cinema like never before.
            </p>
            <div className="flex gap-4 justify-center md:justify-start">
              {[Facebook, Twitter, Instagram].map((Icon, index) => (
                <a
                  key={index}
                  href="#"
                  className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white hover:from-yellow-500 hover:to-orange-600 transition-all duration-300 transform hover:scale-110"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col items-center md:items-start">
            <h4 className="text-lg font-bold text-gray-900 mb-6 text-center md:text-left">Quick Links</h4>
            <ul className="space-y-3 flex flex-col items-center md:items-start">
              {['Movies', 'Theaters', 'Events', 'Gift Cards'].map((item) => (
                <FooterLink key={item} text={item} />
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className="flex flex-col items-center md:items-start">
            <h4 className="text-lg font-bold text-gray-900 mb-6 text-center md:text-left">Support</h4>
            <ul className="space-y-3 flex flex-col items-center md:items-start">
              {['Help Center', 'Contact Us', 'Privacy Policy', 'Terms of Service'].map((item) => (
                <FooterLink key={item} text={item} />
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="flex flex-col items-center md:items-start">
            <h4 className="text-lg font-bold text-gray-900 mb-6 text-center md:text-left">Stay Updated</h4>
            <p className="text-gray-600 mb-4 text-center md:text-left">Subscribe to our newsletter for exclusive offers and updates.</p>
            <div className="relative w-full max-w-xs mx-auto md:mx-0">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-yellow-400 focus:ring focus:ring-yellow-200 focus:ring-opacity-50 transition-all duration-300"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white p-2 rounded-lg transition-all duration-300 transform hover:scale-105">
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-400">
          <div className="flex flex-col md:flex-row justify-center md:justify-between items-center gap-4 text-center">
            <p className="text-gray-600 text-sm">
              © 2025 CENIFY. All rights reserved.
            </p>
            <div className="flex gap-6 justify-center">
              {['Privacy', 'Terms', 'Cookies'].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="text-sm text-gray-600 hover:text-yellow-600 transition-colors"
                >
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

const FooterLink: React.FC<{ text: string }> = ({ text }) => (
  <li>
    <a
      href="#"
      className="text-gray-600 hover:text-yellow-600 transition-colors flex items-center justify-center md:justify-start group"
    >
      <span>{text}</span>
      <ArrowRight className="w-4 h-4 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
    </a>
  </li>
);

export default Footer;