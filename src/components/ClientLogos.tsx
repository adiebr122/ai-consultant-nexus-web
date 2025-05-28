
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
  const [currentIndex, setCurrentIndex] = useState(0);

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
      { name: 'Bukalapak', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Bukalapak_official_logo.svg/200px-Bukalapak_official_logo.svg.png' },
      { name: 'Bank Mandiri', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Bank_Mandiri_logo_2016.svg/200px-Bank_Mandiri_logo_2016.svg.png' },
      { name: 'Pertamina', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Pertamina_Logo.svg/200px-Pertamina_Logo.svg.png' },
      { name: 'Indosat', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Indosat_Ooredoo_logo.svg/200px-Indosat_Ooredoo_logo.svg.png' },
      { name: 'XL Axiata', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/XL_Axiata_logo.svg/200px-XL_Axiata_logo.svg.png' }
    ]
  };

  const displayContent = content || defaultContent;
  const itemsPerSlide = 4;
  const maxIndex = Math.max(0, Math.ceil(displayContent.clients.length / itemsPerSlide) - 1);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % (maxIndex + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + maxIndex + 1) % (maxIndex + 1));
  };

  // Auto-slide functionality
  useEffect(() => {
    if (displayContent.clients.length > itemsPerSlide) {
      const timer = setInterval(nextSlide, 4000);
      return () => clearInterval(timer);
    }
  }, [displayContent.clients.length, maxIndex]);

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-r from-gray-50 to-blue-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/2 mx-auto mb-4"></div>
            <div className="h-6 bg-gray-300 rounded w-3/4 mx-auto"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
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

        {/* Logo Slider */}
        <div className="relative mb-16">
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {Array.from({ length: Math.ceil(displayContent.clients.length / itemsPerSlide) }).map((_, slideIndex) => (
                <div key={slideIndex} className="w-full flex-shrink-0">
                  <div className="grid grid-cols-4 gap-8 items-center">
                    {displayContent.clients
                      .slice(slideIndex * itemsPerSlide, (slideIndex + 1) * itemsPerSlide)
                      .map((client, index) => (
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
                </div>
              ))}
            </div>
          </div>

          {/* Navigation arrows */}
          {displayContent.clients.length > itemsPerSlide && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
              >
                <ChevronLeft className="h-6 w-6 text-gray-600" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
              >
                <ChevronRight className="h-6 w-6 text-gray-600" />
              </button>
            </>
          )}

          {/* Dots indicator */}
          {displayContent.clients.length > itemsPerSlide && (
            <div className="flex justify-center mt-6 space-x-2">
              {Array.from({ length: maxIndex + 1 }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentIndex 
                      ? 'bg-blue-600 scale-125' 
                      : 'bg-gray-300 hover:bg-blue-400'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Trust indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
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
