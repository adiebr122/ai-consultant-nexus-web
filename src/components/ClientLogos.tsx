
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ClientLogo {
  id: string;
  name: string;
  logo_url: string;
  company_url?: string;
  display_order: number;
  is_active: boolean;
}

const ClientLogos = () => {
  const [logos, setLogos] = useState<ClientLogo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogos();
  }, []);

  const fetchLogos = async () => {
    try {
      const { data, error } = await supabase
        .from('client_logos')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setLogos(data || []);
    } catch (error) {
      console.error('Error fetching logos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Default logos jika belum ada data
  const defaultLogos = [
    { id: '1', name: 'Telkom Indonesia', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Telkom_Indonesia_2013.svg/200px-Telkom_Indonesia_2013.svg.png', display_order: 1, is_active: true },
    { id: '2', name: 'Bank Central Asia', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/BCA_logo.svg/200px-BCA_logo.svg.png', display_order: 2, is_active: true },
    { id: '3', name: 'Gojek', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Gojek_logo_2019.svg/200px-Gojek_logo_2019.svg.png', display_order: 3, is_active: true },
    { id: '4', name: 'Tokopedia', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Tokopedia.svg/200px-Tokopedia.svg.png', display_order: 4, is_active: true },
    { id: '5', name: 'Shopee', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Shopee_logo.svg/200px-Shopee_logo.svg.png', display_order: 5, is_active: true },
    { id: '6', name: 'Grab', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Grab_%28application%29_logo.svg/200px-Grab_%28application%29_logo.svg.png', display_order: 6, is_active: true },
    { id: '7', name: 'OVO', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Logo_ovo_purple.svg/200px-Logo_ovo_purple.svg.png', display_order: 7, is_active: true },
    { id: '8', name: 'Bukalapak', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Bukalapak_official_logo.svg/200px-Bukalapak_official_logo.svg.png', display_order: 8, is_active: true }
  ];

  const displayLogos = logos.length > 0 ? logos : defaultLogos;

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-r from-gray-50 to-blue-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/2 mx-auto mb-4"></div>
            <div className="h-6 bg-gray-300 rounded w-3/4 mx-auto"></div>
          </div>
          <div className="h-16 bg-gray-300 rounded animate-pulse"></div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-r from-gray-50 to-blue-50 border-t border-gray-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-blue-900 bg-clip-text text-transparent mb-4">
            Dipercaya oleh Perusahaan Terkemuka
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto">
            Lebih dari {displayLogos.length}+ perusahaan besar Indonesia telah mempercayakan transformasi digital mereka kepada kami
          </p>
        </div>

        {/* Running Text Logo Slider */}
        <div className="relative mb-16 marquee-container">
          <div className="flex overflow-hidden">
            <div className="flex animate-marquee whitespace-nowrap">
              {/* First set of logos */}
              {displayLogos.map((logo, index) => (
                <div 
                  key={`${logo.id}-1`}
                  className="mx-8 flex items-center justify-center min-w-[160px] h-20 group"
                >
                  {logo.company_url ? (
                    <a
                      href={logo.company_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-full h-full p-4 rounded-2xl bg-white/50 hover:bg-white transition-all duration-300 hover:shadow-xl hover:scale-110"
                    >
                      <img 
                        src={logo.logo_url} 
                        alt={logo.name}
                        className="max-h-12 w-auto opacity-60 group-hover:opacity-100 transition-all duration-300 filter grayscale group-hover:grayscale-0"
                        onError={(e) => {
                          e.currentTarget.src = `https://via.placeholder.com/120x60/f3f4f6/6b7280?text=${logo.name.replace(' ', '+')}`;
                        }}
                      />
                    </a>
                  ) : (
                    <div className="flex items-center justify-center w-full h-full p-4 rounded-2xl bg-white/50 hover:bg-white transition-all duration-300 hover:shadow-xl hover:scale-110">
                      <img 
                        src={logo.logo_url} 
                        alt={logo.name}
                        className="max-h-12 w-auto opacity-60 group-hover:opacity-100 transition-all duration-300 filter grayscale group-hover:grayscale-0"
                        onError={(e) => {
                          e.currentTarget.src = `https://via.placeholder.com/120x60/f3f4f6/6b7280?text=${logo.name.replace(' ', '+')}`;
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex animate-marquee2 whitespace-nowrap" aria-hidden="true">
              {/* Second set of logos for seamless loop */}
              {displayLogos.map((logo, index) => (
                <div 
                  key={`${logo.id}-2`}
                  className="mx-8 flex items-center justify-center min-w-[160px] h-20 group"
                >
                  {logo.company_url ? (
                    <a
                      href={logo.company_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-full h-full p-4 rounded-2xl bg-white/50 hover:bg-white transition-all duration-300 hover:shadow-xl hover:scale-110"
                    >
                      <img 
                        src={logo.logo_url} 
                        alt={logo.name}
                        className="max-h-12 w-auto opacity-60 group-hover:opacity-100 transition-all duration-300 filter grayscale group-hover:grayscale-0"
                        onError={(e) => {
                          e.currentTarget.src = `https://via.placeholder.com/120x60/f3f4f6/6b7280?text=${logo.name.replace(' ', '+')}`;
                        }}
                      />
                    </a>
                  ) : (
                    <div className="flex items-center justify-center w-full h-full p-4 rounded-2xl bg-white/50 hover:bg-white transition-all duration-300 hover:shadow-xl hover:scale-110">
                      <img 
                        src={logo.logo_url} 
                        alt={logo.name}
                        className="max-h-12 w-auto opacity-60 group-hover:opacity-100 transition-all duration-300 filter grayscale group-hover:grayscale-0"
                        onError={(e) => {
                          e.currentTarget.src = `https://via.placeholder.com/120x60/f3f4f6/6b7280?text=${logo.name.replace(' ', '+')}`;
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Trust indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="text-3xl font-bold text-blue-600 mb-2">{displayLogos.length}+</div>
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
