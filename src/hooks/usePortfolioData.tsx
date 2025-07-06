
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

export const usePortfolioData = () => {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);

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

  return { portfolios, loading, refetch: fetchPortfolios };
};
