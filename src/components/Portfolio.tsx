
import { useState, useEffect } from 'react';
import { ExternalLink, Github, ArrowRight, Briefcase, Calendar, Award, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface PortfolioContent {
  title: string;
  description: string;
  projects: Array<{
    title: string;
    description: string;
    image_url: string;
    client: string;
    category: string;
    technologies: string[];
    demo_url?: string;
    github_url?: string;
  }>;
}

const Portfolio = () => {
  const [portfolioContent, setPortfolioContent] = useState<PortfolioContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPortfolioContent();
  }, []);

  const fetchPortfolioContent = async () => {
    try {
      const { data, error } = await supabase
        .from('website_content')
        .select('*')
        .eq('section', 'portfolio')
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data && data.metadata) {
        const metadata = data.metadata as any;
        setPortfolioContent({
          title: data.title || 'Portfolio Proyek Terbaik',
          description: data.content || 'Lihat hasil karya terbaik kami dalam mengembangkan solusi AI dan aplikasi untuk berbagai industri.',
          projects: metadata.projects || []
        });
      }
    } catch (error) {
      console.error('Error fetching portfolio content:', error);
    } finally {
      setLoading(false);
    }
  };

  // Default content if no CMS data
  const defaultContent: PortfolioContent = {
    title: 'Portfolio Proyek Terbaik',
    description: 'Lihat hasil karya terbaik kami dalam mengembangkan solusi AI dan aplikasi untuk berbagai industri.',
    projects: [
      {
        title: 'AI Banking Assistant',
        description: 'Chatbot AI untuk customer service perbankan dengan Natural Language Processing yang mampu menangani 95% pertanyaan nasabah secara otomatis.',
        image_url: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2850&q=80',
        client: 'Bank Central Asia',
        category: 'AI Chatbot',
        technologies: ['Python', 'TensorFlow', 'NLP', 'React'],
        demo_url: '#',
        github_url: '#'
      },
      {
        title: 'Smart Logistics Platform',
        description: 'Platform AI untuk optimasi rute pengiriman yang berhasil mengurangi biaya operasional hingga 30% dan meningkatkan efisiensi delivery.',
        image_url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2850&q=80',
        client: 'Gojek Indonesia',
        category: 'Machine Learning',
        technologies: ['Python', 'scikit-learn', 'Django', 'PostgreSQL'],
        demo_url: '#'
      },
      {
        title: 'E-commerce Analytics Dashboard',
        description: 'Dashboard real-time analytics dengan AI untuk prediksi trend penjualan dan rekomendasi produk yang meningkatkan conversion rate 45%.',
        image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2850&q=80',
        client: 'Tokopedia',
        category: 'Data Analytics',
        technologies: ['React', 'D3.js', 'Node.js', 'MongoDB'],
        demo_url: '#'
      }
    ]
  };

  const content = portfolioContent || defaultContent;

  if (loading) {
    return (
      <section id="portfolio" className="py-20 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-pulse">
            <div className="h-12 bg-gray-300 rounded w-1/2 mx-auto mb-6"></div>
            <div className="h-6 bg-gray-300 rounded w-3/4 mx-auto"></div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((_, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-300"></div>
                <div className="p-6 space-y-4">
                  <div className="h-6 bg-gray-300 rounded"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-300 rounded"></div>
                    <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="portfolio" className="py-20 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 text-sm font-medium mb-4">
            <Briefcase className="w-4 h-4 mr-2" />
            Portofolio Kami
          </div>
          <h2 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-6">
            {content.title}
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            {content.description}
          </p>
        </div>

        {content.projects.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 max-w-md mx-auto shadow-xl">
              <Briefcase className="h-16 w-16 mx-auto text-gray-400 mb-6" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Belum Ada Portfolio</h3>
              <p className="text-gray-500">Portfolio proyek akan ditampilkan di sini setelah ditambahkan di CMS</p>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {content.projects.map((project, index) => (
              <div 
                key={index} 
                className="group bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 hover:scale-105 animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative overflow-hidden">
                  <img 
                    src={project.image_url} 
                    alt={project.title}
                    className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute top-4 right-4">
                    <span className="bg-white/90 backdrop-blur-sm text-blue-700 px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                      {project.category}
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="flex space-x-2">
                      {project.demo_url && (
                        <a 
                          href={project.demo_url}
                          className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition-colors"
                        >
                          <ExternalLink className="h-4 w-4 text-blue-600" />
                        </a>
                      )}
                      {project.github_url && (
                        <a 
                          href={project.github_url}
                          className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition-colors"
                        >
                          <Github className="h-4 w-4 text-gray-700" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center mb-3">
                    <Award className="h-4 w-4 text-amber-500 mr-2" />
                    <span className="text-sm text-amber-600 font-semibold">{project.client}</span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-gray-600 mb-4 leading-relaxed line-clamp-3">{project.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.technologies.slice(0, 4).map((tech, techIndex) => (
                      <span 
                        key={techIndex}
                        className="bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium border border-blue-100"
                      >
                        {tech}
                      </span>
                    ))}
                    {project.technologies.length > 4 && (
                      <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs">
                        +{project.technologies.length - 4} more
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-3 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      <span>2024</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="h-4 w-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="text-center mt-16">
          <button className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center mx-auto font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105">
            Lihat Semua Portfolio
            <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Portfolio;
