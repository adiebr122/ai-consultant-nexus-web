
import { Code, Mail, Phone, MapPin, Facebook, Instagram, Linkedin, Youtube } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useContactInfo } from '@/hooks/useContactInfo';

const Footer = () => {
  const { contactInfo, loading } = useContactInfo();

  const formatAddress = (address: string) => {
    return address.split('\n').map((line, index) => (
      <span key={index}>
        {line}
        {index < address.split('\n').length - 1 && <br />}
      </span>
    ));
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <Code className="h-8 w-8 text-blue-400" />
              <span className="text-xl font-bold">Visual Media X</span>
            </div>
            <p className="text-gray-300 leading-relaxed">
              Leading digital agency di Indonesia yang menghadirkan solusi web development, 
              mobile apps, dan teknologi AI untuk transformasi digital perusahaan.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Layanan Kami</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-300 hover:text-blue-400 transition-colors">Web Development</a></li>
              <li><a href="#" className="text-gray-300 hover:text-blue-400 transition-colors">Mobile App Development</a></li>
              <li><a href="#" className="text-gray-300 hover:text-blue-400 transition-colors">AI Chatbot Development</a></li>
              <li><a href="#" className="text-gray-300 hover:text-blue-400 transition-colors">Custom AI Application</a></li>
              <li><a href="#" className="text-gray-300 hover:text-blue-400 transition-colors">Data Analytics & Insights</a></li>
              <li><a href="#" className="text-gray-300 hover:text-blue-400 transition-colors">AI Content Generation</a></li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Link Cepat</h3>
            <ul className="space-y-3">
              <li><a href="/" className="text-gray-300 hover:text-blue-400 transition-colors">Beranda</a></li>
              <li><a href="#layanan" className="text-gray-300 hover:text-blue-400 transition-colors">Layanan</a></li>
              <li><a href="#portfolio" className="text-gray-300 hover:text-blue-400 transition-colors">Portfolio</a></li>
              <li><a href="#testimoni" className="text-gray-300 hover:text-blue-400 transition-colors">Testimoni</a></li>
              <li><a href="#kontak" className="text-gray-300 hover:text-blue-400 transition-colors">Kontak</a></li>
              <li><Link to="/admin" className="text-gray-300 hover:text-blue-400 transition-colors">Admin</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Kontak</h3>
            {!loading && (
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-blue-400" />
                  <span className="text-gray-300">{contactInfo.company_phone}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-blue-400" />
                  <span className="text-gray-300">{contactInfo.company_email}</span>
                </div>
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-blue-400 mt-1" />
                  <span className="text-gray-300">
                    {formatAddress(contactInfo.company_address)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center">
          <p className="text-gray-400">
            © 2024 Visual Media X. All rights reserved. | 
            <a href="#" className="hover:text-blue-400 transition-colors ml-1">Privacy Policy</a> | 
            <a href="#" className="hover:text-blue-400 transition-colors ml-1">Terms of Service</a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
