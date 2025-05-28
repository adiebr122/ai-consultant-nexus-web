
import { useState, useEffect } from 'react';
import { ExternalLink, Github, ArrowRight, Briefcase, Calendar, Award } from 'lucide-react';
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
      <section id="portfolio" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/2 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-3/4 mx-auto"></div>
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
    <section id="portfolio" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {content.title}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {content.description}
          </p>
        </div>

        {content.projects.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Belum Ada Portfolio</h3>
            <p className="text-gray-500">Portfolio proyek akan ditampilkan di sini setelah ditambahkan di CMS</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {content.projects.map((project, index) => (
              <div 
                key={index} 
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 group"
              >
                <div className="relative overflow-hidden">
                  <img 
                    src={project.image_url} 
                    alt={project.title}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
                    }}
                  />
                  <div className="absolute top-4 right-4">
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                      {project.category}
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center mb-2">
                    <Award className="h-4 w-4 text-blue-600 mr-2" />
                    <span className="text-sm text-blue-600 font-medium">{project.client}</span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{project.title}</h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">{project.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.technologies.map((tech, techIndex) => (
                      <span 
                        key={techIndex}
                        className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    {project.demo_url && (
                      <a 
                        href={project.demo_url}
                        className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        <span className="text-sm font-medium">Demo</span>
                      </a>
                    )}
                    {project.github_url && (
                      <a 
                        href={project.github_url}
                        className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
                      >
                        <Github className="h-4 w-4 mr-1" />
                        <span className="text-sm font-medium">Code</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="text-center mt-12">
          <button className="bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 transition-colors duration-300 flex items-center mx-auto font-semibold">
            Lihat Semua Portfolio
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Portfolio;
