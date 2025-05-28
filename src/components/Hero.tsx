
import { useState, useEffect } from 'react';
import { ArrowRight, Play, Star, Users, Award, TrendingUp, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface HeroContent {
  title: string;
  subtitle: string;
  description: string;
  cta_primary: string;
  cta_secondary: string;
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

  useEffect(() => {
    fetchHeroContent();
  }, []);

  // Auto-rotate dynamic headlines every 4 seconds
  useEffect(() => {
    if (heroContent?.dynamic_headlines && heroContent.dynamic_headlines.length > 1) {
      const timer = setInterval(() => {
        setCurrentHeadlineIndex((prev) => 
          (prev + 1) % heroContent.dynamic_headlines!.length
        );
      }, 4000); // Change every 4 seconds for better readability

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

      if (data && data.metadata) {
        const metadata = data.metadata as any;
        setHeroContent({
          title: data.title || 'AI Consultant Pro',
          subtitle: metadata.subtitle || 'Transformasi Digital dengan Teknologi AI',
          description: data.content || 'Solusi AI terdepan untuk bisnis modern. Kami membantu perusahaan mengoptimalkan operasional, meningkatkan efisiensi, dan mencapai pertumbuhan berkelanjutan melalui implementasi teknologi Artificial Intelligence yang tepat sasaran.',
          cta_primary: metadata.cta_primary || 'Konsultasi Gratis',
          cta_secondary: metadata.cta_secondary || 'Lihat Portfolio',
          hero_image_url: data.image_url,
          dynamic_headlines: metadata.dynamic_headlines || [],
          stats: metadata.stats || []
        });
      }
    } catch (error) {
      console.error('Error fetching hero content:', error);
    } finally {
      setLoading(false);
    }
  };

  // Default content with more attractive and dynamic headlines
  const defaultContent: HeroContent = {
    title: 'AI Consultant Pro',
    subtitle: 'Transformasi Digital dengan Teknologi AI',
    description: 'Solusi AI terdepan untuk bisnis modern. Kami membantu perusahaan mengoptimalkan operasional, meningkatkan efisiensi, dan mencapai pertumbuhan berkelanjutan melalui implementasi teknologi Artificial Intelligence yang tepat sasaran.',
    cta_primary: 'Konsultasi Gratis',
    cta_secondary: 'Lihat Portfolio',
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

  if (loading) {
    return (
      <section className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center animate-pulse">
            <div className="space-y-8">
              <div className="h-8 bg-gray-300 rounded w-3/4"></div>
              <div className="h-12 bg-gray-300 rounded w-full"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-300 rounded"></div>
                <div className="h-4 bg-gray-300 rounded"></div>
                <div className="h-4 bg-gray-300 rounded w-2/3"></div>
              </div>
              <div className="flex space-x-4">
                <div className="h-12 bg-gray-300 rounded w-32"></div>
                <div className="h-12 bg-gray-300 rounded w-32"></div>
              </div>
            </div>
            <div className="h-96 bg-gray-300 rounded-2xl"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 pt-16 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-gradient-to-r from-blue-400 to-indigo-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-700"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fade-in">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 rounded-full text-sm font-medium shadow-lg">
              <Star className="h-4 w-4 mr-2 text-yellow-500" />
              {content.subtitle}
            </div>
            
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-7xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent leading-tight">
                {content.title}
              </h1>
              
              {/* Enhanced Dynamic Headlines with better animation */}
              <div className="h-20 flex items-center">
                <h2 className="text-2xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent transition-all duration-1000 ease-in-out transform">
                  <span 
                    key={currentHeadlineIndex}
                    className="inline-block animate-fade-in"
                    style={{
                      animation: 'fadeInUp 1s ease-out',
                    }}
                  >
                    {currentHeadlines[currentHeadlineIndex]}
                  </span>
                </h2>
              </div>
            </div>
            
            <p className="text-xl text-gray-600 leading-relaxed max-w-2xl">
              {content.description}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="group bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 flex items-center justify-center font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-1">
                {content.cta_primary}
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="group border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-2xl hover:border-indigo-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-300 flex items-center justify-center font-semibold">
                <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                {content.cta_secondary}
              </button>
            </div>
            
            {/* Stats section */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-8">
              {(content.stats || defaultContent.stats!).map((stat, index) => {
                const IconComponent = iconMap[stat.icon] || iconMap['default'];
                return (
                  <div key={index} className="text-center group hover:scale-105 transition-transform duration-300">
                    <div className="bg-white rounded-2xl p-4 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                      <IconComponent className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                      <div className="text-sm text-gray-600">{stat.label}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="relative animate-fade-in delay-300">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-3xl transform rotate-6 scale-105"></div>
            <div className="relative bg-white p-8 rounded-3xl shadow-2xl transform hover:scale-105 transition-transform duration-500">
              {content.hero_image_url ? (
                <img 
                  src={content.hero_image_url} 
                  alt="AI Technology"
                  className="w-full h-96 object-cover rounded-2xl"
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=2850&q=80";
                  }}
                />
              ) : (
                <img 
                  src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=2850&q=80" 
                  alt="AI Technology"
                  className="w-full h-96 object-cover rounded-2xl"
                />
              )}
              <div className="absolute -bottom-6 -right-6 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-2xl font-bold shadow-xl transform hover:scale-110 transition-transform duration-300">
                Teknologi AI Terdepan
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add custom CSS for fade animation */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
};

export default Hero;
