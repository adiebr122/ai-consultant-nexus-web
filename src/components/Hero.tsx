import { useState, useEffect } from 'react';
import { ArrowRight, Play, Star, Users, Award, TrendingUp, Sparkles, Zap, Rocket, Target } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useWhatsAppSettings } from '@/hooks/useWhatsAppSettings';

interface HeroContent {
  title: string;
  subtitle: string;
  description: string;
  cta_primary: string;
  cta_secondary: string;
  cta_primary_url: string;
  hero_image_url: string | null;
  dynamic_headlines?: string[];
  stats?: Array<{
    icon: string;
    label: string;
    value: string;
  }>;
}

const Hero = () => {
  const [heroContent, setHeroContent] = useState<HeroContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentHeadlineIndex, setCurrentHeadlineIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const { createWhatsAppLink } = useWhatsAppSettings();

  useEffect(() => {
    fetchHeroContent();
  }, []);

  useEffect(() => {
    if (heroContent?.dynamic_headlines && heroContent.dynamic_headlines.length > 1) {
      const timer = setInterval(() => {
        setIsAnimating(true);
        setTimeout(() => {
          setCurrentHeadlineIndex((prev) => 
            (prev + 1) % heroContent.dynamic_headlines!.length
          );
          setIsAnimating(false);
        }, 300);
      }, 3500);

      return () => clearInterval(timer);
    }
  }, [heroContent?.dynamic_headlines]);

  const fetchHeroContent = async () => {
    try {
      const { data, error } = await supabase
        .from('website_content')
        .select('*')
        .eq('section', 'hero')
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        // Parse content as JSON to get metadata
        let parsedContent;
        try {
          parsedContent = data.content ? JSON.parse(data.content) : {};
        } catch {
          parsedContent = {};
        }

        setHeroContent({
          title: data.title || 'AI Consultant Pro',
          subtitle: parsedContent.subtitle || 'Transformasi Digital dengan Teknologi AI',
          description: parsedContent.description || 'Solusi AI terdepan untuk bisnis modern. Kami membantu perusahaan mengoptimalkan operasional, meningkatkan efisiensi, dan mencapai pertumbuhan berkelanjutan melalui implementasi teknologi Artificial Intelligence yang tepat sasaran.',
          cta_primary: parsedContent.cta_primary || 'Konsultasi Gratis',
          cta_secondary: parsedContent.cta_secondary || 'Lihat Portfolio',
          cta_primary_url: parsedContent.cta_primary_url || 'https://wa.me/6281234567890',
          hero_image_url: parsedContent.hero_image_url || null,
          dynamic_headlines: parsedContent.dynamic_headlines || [],
          stats: parsedContent.stats || []
        });
      }
    } catch (error) {
      console.error('Error fetching hero content:', error);
    } finally {
      setLoading(false);
    }
  };

  const defaultContent: HeroContent = {
    title: 'AI Consultant Pro',
    subtitle: 'Transformasi Digital dengan Teknologi AI',
    description: 'Solusi AI terdepan untuk bisnis modern. Kami membantu perusahaan mengoptimalkan operasional, meningkatkan efisiensi, dan mencapai pertumbuhan berkelanjutan melalui implementasi teknologi Artificial Intelligence yang tepat sasaran.',
    cta_primary: 'Konsultasi Gratis',
    cta_secondary: 'Lihat Portfolio',
    cta_primary_url: '',
    hero_image_url: null,
    dynamic_headlines: [
      'Revolusi Bisnis dengan Kekuatan AI 🚀',
      'Otomatisasi Cerdas untuk Masa Depan 💡',
      'Transformasi Digital yang Menguntungkan 📈',
      'Inovasi AI yang Mengubah Industri ⚡',
      'Efisiensi Maksimal dengan Teknologi Terdepan 🎯',
      'Solusi AI yang Meningkatkan Produktivitas 💪',
      'Bisnis Modern dengan Teknologi Pintar 🌟'
    ],
    stats: [
      { icon: 'Users', label: 'Klien Terpercaya', value: '150+' },
      { icon: 'Award', label: 'Proyek Sukses', value: '300+' },
      { icon: 'Star', label: 'Rating Kepuasan', value: '4.9/5' },
      { icon: 'TrendingUp', label: 'ROI Rata-rata', value: '300%' }
    ]
  };

  const content = heroContent || defaultContent;
  const currentHeadlines = content.dynamic_headlines && content.dynamic_headlines.length > 0 
    ? content.dynamic_headlines 
    : defaultContent.dynamic_headlines!;

  const iconMap: { [key: string]: any } = {
    'Users': Users,
    'Award': Award,
    'Star': Star,
    'TrendingUp': TrendingUp,
    'default': Sparkles
  };

  const handlePrimaryClick = () => {
    const whatsappLink = createWhatsAppLink();
    window.open(whatsappLink, '_blank');
  };

  const handleSecondaryClick = () => {
    window.location.href = '#portfolio';
  };

  if (loading) {
    return (
      <section className="min-h-screen bg-gradient-to-br from-violet-100 via-cyan-50 to-blue-100 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center animate-pulse">
            <div className="space-y-6 lg:space-y-8">
              <div className="h-6 lg:h-8 bg-gray-300 rounded w-3/4"></div>
              <div className="h-8 lg:h-12 bg-gray-300 rounded w-full"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-300 rounded"></div>
                <div className="h-4 bg-gray-300 rounded"></div>
                <div className="h-4 bg-gray-300 rounded w-2/3"></div>
              </div>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="h-12 bg-gray-300 rounded w-full sm:w-32"></div>
                <div className="h-12 bg-gray-300 rounded w-full sm:w-32"></div>
              </div>
            </div>
            <div className="h-64 lg:h-96 bg-gray-300 rounded-2xl"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-gradient-to-br from-violet-900 via-purple-800 to-indigo-900 pt-16 relative overflow-hidden">
      {/* Enhanced Background with multiple layers */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 lg:w-96 h-64 lg:h-96 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-64 lg:w-96 h-64 lg:h-96 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-700"></div>
        <div className="absolute bottom-1/4 left-1/3 w-48 lg:w-80 h-48 lg:h-80 bg-gradient-to-r from-blue-500/15 to-cyan-500/15 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
        
        {/* Floating particles */}
        <div className="absolute inset-0 hidden lg:block">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 lg:w-2 lg:h-2 bg-white/20 rounded-full animate-pulse"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            />
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="space-y-6 lg:space-y-8 animate-fade-in order-2 lg:order-1">
            {/* Enhanced Badge */}
            <div className="inline-flex items-center px-4 lg:px-6 py-2 lg:py-3 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 backdrop-blur-sm border border-white/20 text-white rounded-full text-xs lg:text-sm font-medium shadow-lg animate-bounce-in">
              <Sparkles className="h-3 w-3 lg:h-4 lg:w-4 mr-2 text-yellow-400 animate-pulse" />
              {content.subtitle}
              <Zap className="h-3 w-3 lg:h-4 lg:w-4 ml-2 text-blue-400" />
            </div>
            
            {/* Enhanced Title with better mobile sizing */}
            <div className="space-y-4 lg:space-y-6">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black bg-gradient-to-r from-white via-cyan-100 to-blue-100 bg-clip-text text-transparent leading-tight tracking-tight">
                {content.title}
              </h1>
              
              {/* Dynamic Headlines with enhanced mobile animation */}
              <div className="h-16 lg:h-20 flex items-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent blur-sm"></div>
                <h2 className={`text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent transition-all duration-700 ease-in-out transform relative z-10 ${
                  isAnimating ? 'opacity-0 scale-95 translate-y-4' : 'opacity-100 scale-100 translate-y-0'
                }`}>
                  <span className="flex items-center">
                    <Rocket className="h-5 w-5 lg:h-6 lg:w-6 mr-2 lg:mr-3 text-orange-400 animate-bounce flex-shrink-0" />
                    <span className="break-words">{currentHeadlines[currentHeadlineIndex]}</span>
                  </span>
                </h2>
              </div>
            </div>
            
            {/* Enhanced Description with better mobile spacing */}
            <p className="text-base lg:text-lg xl:text-xl text-gray-200 leading-relaxed max-w-2xl backdrop-blur-sm bg-white/5 p-4 lg:p-6 rounded-xl lg:rounded-2xl border border-white/10">
              {content.description}
            </p>
            
            {/* Enhanced CTA Buttons with better mobile layout */}
            <div className="flex flex-col sm:flex-row gap-4 lg:gap-6">
              <button 
                onClick={handlePrimaryClick}
                className="group relative bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 text-white px-6 lg:px-8 py-3 lg:py-4 rounded-xl lg:rounded-2xl font-bold text-base lg:text-lg shadow-2xl hover:shadow-cyan-500/25 transition-all duration-300 transform hover:-translate-y-1 lg:hover:-translate-y-2 hover:scale-105 overflow-hidden w-full sm:w-auto"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative z-10 flex items-center justify-center">
                  <Target className="mr-2 lg:mr-3 h-5 w-5 lg:h-6 lg:w-6 group-hover:rotate-12 transition-transform" />
                  {content.cta_primary}
                  <ArrowRight className="ml-2 lg:ml-3 h-5 w-5 lg:h-6 lg:w-6 group-hover:translate-x-2 transition-transform" />
                </span>
              </button>
              
              <button 
                onClick={handleSecondaryClick}
                className="group relative border-2 border-white/30 text-white px-6 lg:px-8 py-3 lg:py-4 rounded-xl lg:rounded-2xl font-bold text-base lg:text-lg hover:bg-white/10 transition-all duration-300 transform hover:-translate-y-1 backdrop-blur-sm w-full sm:w-auto"
              >
                <span className="flex items-center justify-center">
                  <Play className="mr-2 lg:mr-3 h-5 w-5 lg:h-6 lg:w-6 group-hover:scale-125 transition-transform" />
                  {content.cta_secondary}
                </span>
              </button>
            </div>
            
            {/* Enhanced Stats section with better mobile grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 pt-6 lg:pt-8">
              {(content.stats || defaultContent.stats!).map((stat, index) => {
                const IconComponent = iconMap[stat.icon] || iconMap['default'];
                return (
                  <div key={index} className="text-center group hover:scale-110 transition-all duration-300">
                    <div className="bg-white/10 backdrop-blur-md rounded-xl lg:rounded-2xl p-3 lg:p-6 shadow-xl border border-white/20 group-hover:bg-white/20 group-hover:border-white/40 transition-all duration-300">
                      <IconComponent className="h-6 w-6 lg:h-8 lg:w-8 text-cyan-400 mx-auto mb-2 lg:mb-3 group-hover:text-cyan-300 transition-colors" />
                      <div className="text-lg lg:text-2xl xl:text-3xl font-black text-white mb-1">{stat.value}</div>
                      <div className="text-xs lg:text-sm text-gray-300 font-medium leading-tight">{stat.label}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Enhanced Image Section with better mobile responsiveness */}
          <div className="relative animate-fade-in delay-300 order-1 lg:order-2">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 rounded-2xl lg:rounded-3xl transform rotate-3 lg:rotate-6 scale-105 blur-sm"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl lg:rounded-3xl transform -rotate-2 lg:-rotate-3 scale-110 blur-lg"></div>
            
            <div className="relative bg-white/10 backdrop-blur-lg p-4 lg:p-8 rounded-2xl lg:rounded-3xl shadow-2xl transform hover:scale-105 transition-all duration-500 border border-white/20">
              {content.hero_image_url ? (
                <img 
                  src={content.hero_image_url} 
                  alt="AI Technology"
                  className="w-full h-64 lg:h-96 object-cover rounded-xl lg:rounded-2xl shadow-xl"
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-4.0.3&auto=format&fit=crop&w=2850&q=80";
                  }}
                />
              ) : (
                <img 
                  src="https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-4.0.3&auto=format&fit=crop&w=2850&q=80" 
                  alt="AI Technology"
                  className="w-full h-64 lg:h-96 object-cover rounded-xl lg:rounded-2xl shadow-xl"
                />
              )}
              
              {/* Floating elements with better mobile positioning */}
              <div className="absolute -top-2 lg:-top-4 -right-2 lg:-right-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 lg:px-6 py-2 lg:py-3 rounded-xl lg:rounded-2xl font-bold shadow-xl transform hover:scale-110 transition-transform duration-300 animate-bounce-in delay-500">
                <span className="flex items-center text-xs lg:text-sm">
                  <Zap className="h-3 w-3 lg:h-5 lg:w-5 mr-1 lg:mr-2" />
                  <span className="hidden sm:inline">Teknologi AI Terdepan</span>
                  <span className="sm:hidden">AI Terdepan</span>
                </span>
              </div>
              
              <div className="absolute -bottom-2 lg:-bottom-4 -left-2 lg:-left-4 bg-gradient-to-r from-green-400 to-blue-500 text-white px-3 lg:px-6 py-2 lg:py-3 rounded-xl lg:rounded-2xl font-bold shadow-xl transform hover:scale-110 transition-transform duration-300 animate-bounce-in delay-700">
                <span className="flex items-center text-xs lg:text-sm">
                  <Star className="h-3 w-3 lg:h-5 lg:w-5 mr-1 lg:mr-2" />
                  <span className="hidden sm:inline">Solusi Inovatif</span>
                  <span className="sm:hidden">Inovatif</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
