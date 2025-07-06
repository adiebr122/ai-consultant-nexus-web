
import { Code, Calendar, ArrowRight, ExternalLink } from 'lucide-react';

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

interface PortfolioGridProps {
  portfolios: Portfolio[];
}

export const PortfolioGrid = ({ portfolios }: PortfolioGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {portfolios.map((portfolio) => (
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
  );
};
