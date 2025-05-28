
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ClientLogosContent {
  title: string;
  description: string;
  clients: Array<{
    name: string;
    logo: string;
  }>;
}

const ClientLogos = () => {
  const [content, setContent] = useState<ClientLogosContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const { data, error } = await supabase
        .from('website_content')
        .select('*')
        .eq('section', 'client_logos')
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data && data.metadata) {
        const metadata = data.metadata as any;
        setContent({
          title: data.title || 'Dipercaya oleh Perusahaan Terkemuka',
          description: data.content || 'Lebih dari 150+ perusahaan besar Indonesia telah mempercayakan transformasi digital mereka kepada kami',
          clients: metadata.clients || []
        });
      }
    } catch (error) {
      console.error('Error fetching client logos content:', error);
    } finally {
      setLoading(false);
    }
  };

  const defaultContent: ClientLogosContent = {
    title: 'Dipercaya oleh Perusahaan Terkemuka',
    description: 'Lebih dari 150+ perusahaan besar Indonesia telah mempercayakan transformasi digital mereka kepada kami',
    clients: [
      { name: 'Telkom Indonesia', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Telkom_Indonesia_2013.svg/200px-Telkom_Indonesia_2013.svg.png' },
      { name: 'Bank Central Asia', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/BCA_logo.svg/200px-BCA_logo.svg.png' },
      { name: 'Gojek', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Gojek_logo_2019.svg/200px-Gojek_logo_2019.svg.png' },
      { name: 'Tokopedia', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Tokopedia.svg/200px-Tokopedia.svg.png' },
      { name: 'Shopee', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Shopee_logo.svg/200px-Shopee_logo.svg.png' },
      { name: 'Grab', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Grab_%28application%29_logo.svg/200px-Grab_%28application%29_logo.svg.png' },
      { name: 'OVO', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Logo_ovo_purple.svg/200px-Logo_ovo_purple.svg.png' },
      { name: 'Bukalapak', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Bukalapak_official_logo.svg/200px-Bukalapak_official_logo.svg.png' }
    ]
  };

  const displayContent = content || defaultContent;

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-r from-gray-50 to-blue-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/2 mx-auto mb-4"></div>
            <div className="h-6 bg-gray-300 rounded w-3/4 mx-auto"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-8">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="h-16 bg-gray-300 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-r from-gray-50 to-blue-50 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-blue-900 bg-clip-text text-transparent mb-4">
            {displayContent.title}
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto">
            {displayContent.description}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-8 items-center">
          {displayContent.clients.map((client, index) => (
            <div 
              key={index} 
              className="group flex items-center justify-center p-6 rounded-2xl hover:bg-white transition-all duration-300 hover:shadow-xl hover:scale-110"
            >
              <img 
                src={client.logo} 
                alt={client.name}
                className="max-h-16 w-auto opacity-60 group-hover:opacity-100 transition-all duration-300 filter grayscale group-hover:grayscale-0"
                onError={(e) => {
                  e.currentTarget.src = `https://via.placeholder.com/120x60/f3f4f6/6b7280?text=${client.name.replace(' ', '+')}`;
                }}
              />
            </div>
          ))}
        </div>

        {/* Trust indicators */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="text-3xl font-bold text-blue-600 mb-2">150+</div>
            <div className="text-gray-600">Klien Terpercaya</div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="text-3xl font-bold text-green-600 mb-2">98%</div>
            <div className="text-gray-600">Tingkat Kepuasan</div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="text-3xl font-bold text-purple-600 mb-2">5 Tahun</div>
            <div className="text-gray-600">Pengalaman</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ClientLogos;
