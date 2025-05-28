
import { ArrowRight, Sparkles, Zap, Target, Code, Smartphone, Brain } from 'lucide-react';
import { useState, useEffect } from 'react';

const Hero = () => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  
  const dynamicTexts = [
    "Teknologi AI",
    "Inovasi Terdepan",
    "Solusi Digital",
    "Performa Tinggi",
    "User Experience Optimal"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTextIndex((prevIndex) => (prevIndex + 1) % dynamicTexts.length);
    }, 3000); // Ganti teks setiap 3 detik

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="pt-20 pb-16 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-left">
            <div className="flex items-center space-x-2 mb-6">
              <Sparkles className="h-6 w-6 text-blue-600" />
              <span className="text-blue-600 font-semibold">Digital Agency Terdepan di Indonesia</span>
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Web & Apps Development dengan
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 block mt-2 transition-all duration-500 ease-in-out">
                {dynamicTexts[currentTextIndex]}
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Kami menghadirkan solusi digital terdepan untuk transformasi bisnis Anda. 
              Dari website profesional, aplikasi mobile, hingga sistem AI yang inovatif - 
              wujudkan visi digital Anda bersama tim expert kami.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <button className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-all duration-300 flex items-center justify-center group shadow-lg hover:shadow-xl">
                Konsultasi Gratis
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg hover:bg-blue-600 hover:text-white transition-all duration-300">
                Lihat Portfolio
              </button>
            </div>

            <div className="grid grid-cols-3 gap-8">
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4 mx-auto">
                  <Code className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">200+</h3>
                <p className="text-gray-600">Website Delivered</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-4 mx-auto">
                  <Smartphone className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">150+</h3>
                <p className="text-gray-600">Mobile Apps</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4 mx-auto">
                  <Brain className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">50+</h3>
                <p className="text-gray-600">AI Solutions</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative z-10">
              <img 
                src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" 
                alt="Web Development Technology" 
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-blue-600 rounded-full opacity-20 animate-pulse"></div>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-purple-600 rounded-full opacity-20 animate-pulse delay-1000"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
