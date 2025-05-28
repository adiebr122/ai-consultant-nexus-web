
import { useState, useEffect } from 'react';
import { ArrowRight, Play, Star, Users, Award, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface HeroContent {
  title: string;
  subtitle: string;
  description: string;
  cta_primary: string;
  cta_secondary: string;
  hero_image_url: string | null;
}

const Hero = () => {
  const [heroContent, setHeroContent] = useState<HeroContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHeroContent();
  }, []);

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
          hero_image_url: data.image_url
        });
      }
    } catch (error) {
      console.error('Error fetching hero content:', error);
    } finally {
      setLoading(false);
    }
  };

  // Default content if no CMS data
  const defaultContent: HeroContent = {
    title: 'AI Consultant Pro',
    subtitle: 'Transformasi Digital dengan Teknologi AI',
    description: 'Solusi AI terdepan untuk bisnis modern. Kami membantu perusahaan mengoptimalkan operasional, meningkatkan efisiensi, dan mencapai pertumbuhan berkelanjutan melalui implementasi teknologi Artificial Intelligence yang tepat sasaran.',
    cta_primary: 'Konsultasi Gratis',
    cta_secondary: 'Lihat Portfolio',
    hero_image_url: null
  };

  const content = heroContent || defaultContent;

  const stats = [
    { icon: Users, label: 'Klien Terpercaya', value: '150+' },
    { icon: Award, label: 'Proyek Sukses', value: '300+' },
    { icon: Star, label: 'Rating Kepuasan', value: '4.9/5' },
    { icon: TrendingUp, label: 'ROI Rata-rata', value: '300%' }
  ];

  if (loading) {
    return (
      <section className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-16">
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
    <section className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              <Star className="h-4 w-4 mr-2" />
              {content.subtitle}
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              {content.title}
            </h1>
            
            <p className="text-xl text-gray-600 leading-relaxed">
              {content.description}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="bg-blue-600 text-white px-8 py-4 rounded-xl hover:bg-blue-700 transition-colors duration-300 flex items-center justify-center font-semibold">
                {content.cta_primary}
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
              <button className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl hover:border-blue-600 hover:text-blue-600 transition-colors duration-300 flex items-center justify-center font-semibold">
                <Play className="mr-2 h-5 w-5" />
                {content.cta_secondary}
              </button>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-8">
              {stats.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <div key={index} className="text-center">
                    <IconComponent className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl transform rotate-6"></div>
            <div className="relative bg-white p-8 rounded-2xl shadow-2xl">
              {content.hero_image_url ? (
                <img 
                  src={content.hero_image_url} 
                  alt="AI Technology"
                  className="w-full h-96 object-cover rounded-xl"
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=2850&q=80";
                  }}
                />
              ) : (
                <img 
                  src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=2850&q=80" 
                  alt="AI Technology"
                  className="w-full h-96 object-cover rounded-xl"
                />
              )}
              <div className="absolute -bottom-6 -right-6 bg-yellow-400 text-yellow-900 px-6 py-3 rounded-xl font-bold shadow-lg">
                Teknologi AI Terdepan
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
