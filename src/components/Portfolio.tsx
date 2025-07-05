
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ExternalLink, Calendar, Code, ArrowRight } from 'lucide-react';

interface Portfolio {
  id: string;
  project_name: string;
  project_description: string;
  project_category: string;
  project_image_url: string;
  project_url?: string;
  technologies_used: string[];
  client_name: string;
  completion_date: string;
  is_featured: boolean;
  created_at: string;
}

const Portfolio = () => {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const fetchPortfolios = async () => {
    try {
      setLoading(true);
      
      // Try to fetch from website_content table first
      const { data: contentData } = await supabase
        .from('website_content')
        .select('*')
        .eq('section', 'portfolio')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (contentData && contentData.length > 0) {
        // Transform website_content data to portfolio format
        const transformedData: Portfolio[] = contentData.map((item, index) => ({
          id: item.id,
          project_name: item.title || `Project ${index + 1}`,
          project_description: item.content || 'Deskripsi project akan segera tersedia',
          project_category: 'Website Development',
          project_image_url: '/placeholder.svg',
          project_url: '#',
          technologies_used: ['React', 'TypeScript', 'Tailwind CSS'],
          client_name: 'Client',
          completion_date: new Date(item.created_at).toISOString().split('T')[0],
          is_featured: index < 3,
          created_at: item.created_at
        }));
        setPortfolios(transformedData);
      } else {
        // Fallback to default portfolio items
        const defaultPortfolios: Portfolio[] = [
          {
            id: '1',
            project_name: 'E-Commerce Platform',
            project_description: 'Platform e-commerce modern dengan fitur lengkap untuk bisnis online',
            project_category: 'Web Development',
            project_image_url: '/placeholder.svg',
            project_url: '#',
            technologies_used: ['React', 'Node.js', 'MongoDB', 'Stripe'],
            client_name: 'PT. Digital Commerce',
            completion_date: '2024-01-15',
            is_featured: true,
            created_at: '2024-01-15'
          },
          {
            id: '2',
            project_name: 'Corporate Website',
            project_description: 'Website corporate dengan desain profesional dan responsif',
            project_category: 'Web Design',
            project_image_url: '/placeholder.svg',
            project_url: '#',
            technologies_used: ['HTML', 'CSS', 'JavaScript', 'WordPress'],
            client_name: 'CV. Maju Bersama',
            completion_date: '2024-02-20',
            is_featured: true,
            created_at: '2024-02-20'
          },
          {
            id: '3',
            project_name: 'Mobile App UI/UX',
            project_description: 'Desain antarmuka dan pengalaman pengguna untuk aplikasi mobile',
            project_category: 'UI/UX Design',
            project_image_url: '/placeholder.svg',
            project_url: '#',
            technologies_used: ['Figma', 'Adobe XD', 'Sketch'],
            client_name: 'Startup Teknologi',
            completion_date: '2024-03-10',
            is_featured: true,
            created_at: '2024-03-10'
          }
        ];
        setPortfolios(defaultPortfolios);
      }
    } catch (error) {
      console.error('Error fetching portfolios:', error);
      // Set default portfolios on error
      setPortfolios([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolios();
  }, []);

  const categories = ['all', ...Array.from(new Set(portfolios.map(p => p.project_category)))];
  
  const filteredPortfolios = selectedCategory === 'all' 
    ? portfolios 
    : portfolios.filter(p => p.project_category === selectedCategory);

  if (loading) {
    return (
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Memuat portfolio...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section id="portfolio" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
            Portfolio Kami
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Lihat hasil karya terbaik kami dalam berbagai proyek yang telah kami kerjakan
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 rounded-full transition-all duration-200 ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-600'
              }`}
            >
              {category === 'all' ? 'Semua' : category}
            </button>
          ))}
        </div>

        {/* Portfolio Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPortfolios.map((portfolio) => (
            <div
              key={portfolio.id}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
            >
              <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 relative overflow-hidden">
                <img
                  src={portfolio.project_image_url}
                  alt={portfolio.project_name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                {portfolio.is_featured && (
                  <div className="absolute top-4 left-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Featured
                  </div>
                )}
              </div>
              
              <div className="p-6">
                <div className="flex items-center gap-2 text-sm text-blue-600 mb-2">
                  <Code className="h-4 w-4" />
                  <span>{portfolio.project_category}</span>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {portfolio.project_name}
                </h3>
                
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {portfolio.project_description}
                </p>
                
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(portfolio.completion_date).toLocaleDateString('id-ID')}</span>
                  <span>•</span>
                  <span>{portfolio.client_name}</span>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {portfolio.technologies_used.slice(0, 3).map((tech) => (
                    <span
                      key={tech}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                    >
                      {tech}
                    </span>
                  ))}
                  {portfolio.technologies_used.length > 3 && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                      +{portfolio.technologies_used.length - 3} lainnya
                    </span>
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <button className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2 group">
                    Lihat Detail
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                  
                  {portfolio.project_url && portfolio.project_url !== '#' && (
                    <a
                      href={portfolio.project_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-500 hover:text-blue-600 transition-colors"
                    >
                      <ExternalLink className="h-5 w-5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredPortfolios.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Code className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Belum Ada Portfolio</h3>
            <p className="text-gray-600">
              Portfolio untuk kategori "{selectedCategory}" belum tersedia.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Portfolio;
