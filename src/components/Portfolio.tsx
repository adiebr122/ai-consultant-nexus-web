
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, ExternalLink, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Portfolio {
  id: string;
  project_name: string;
  project_description: string;
  project_category: string;
  project_image_url: string;
  project_url: string;
  client_name: string;
  completion_date: string;
  technologies_used: string[];
  is_featured: boolean;
  is_active: boolean;
  display_order: number;
}

const Portfolio = () => {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPortfolios();
  }, []);

  const fetchPortfolios = async () => {
    try {
      const { data, error } = await supabase
        .from('portfolios')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .limit(6);

      if (error) throw error;
      
      const transformedPortfolios: Portfolio[] = (data || []).map(portfolio => ({
        ...portfolio,
        technologies_used: Array.isArray(portfolio.technologies_used) 
          ? portfolio.technologies_used as string[]
          : []
      }));
      
      setPortfolios(transformedPortfolios);
    } catch (error) {
      console.error('Error fetching portfolios:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Memuat portfolio...</p>
          </div>
        </div>
      </section>
    );
  }

  if (portfolios.length === 0) {
    return (
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Portfolio Kami</h2>
          <p className="text-gray-600">Belum ada portfolio yang tersedia</p>
        </div>
      </section>
    );
  }

  return (
    <section id="portfolio" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Portfolio Kami</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Lihat hasil karya terbaik kami dalam mengembangkan solusi digital yang inovatif
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {portfolios.map((portfolio) => (
            <Card key={portfolio.id} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-white border-0 overflow-hidden">
              <div className="relative overflow-hidden">
                <img 
                  src={portfolio.project_image_url} 
                  alt={portfolio.project_name}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
                  }}
                />
                <div className="absolute top-4 left-4">
                  <Badge variant="secondary" className="bg-white/90 text-gray-900">
                    {portfolio.project_category}
                  </Badge>
                </div>
                {portfolio.is_featured && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-yellow-500 text-white">
                      Featured
                    </Badge>
                  </div>
                )}
              </div>
              
              <CardContent className="p-6 space-y-4">
                <div>
                  <h3 className="text-xl font-bold group-hover:text-blue-600 transition-colors mb-2">
                    {portfolio.project_name}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {portfolio.project_description}
                  </p>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(portfolio.completion_date).toLocaleDateString('id-ID')}
                  </div>
                  {portfolio.client_name && (
                    <span className="font-medium">{portfolio.client_name}</span>
                  )}
                </div>

                {portfolio.technologies_used && portfolio.technologies_used.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {portfolio.technologies_used.slice(0, 3).map((tech, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                    {portfolio.technologies_used.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{portfolio.technologies_used.length - 3} lainnya
                      </Badge>
                    )}
                  </div>
                )}

                <div className="flex space-x-2">
                  <Link to={`/portfolio/${portfolio.id}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      Detail
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  {portfolio.project_url && (
                    <Button size="sm" asChild>
                      <a href={portfolio.project_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button size="lg" asChild>
            <Link to="/portfolio">
              Lihat Semua Portfolio
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Portfolio;
