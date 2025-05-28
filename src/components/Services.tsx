
import { useState, useEffect } from 'react';
import { Brain, Code, Database, MessageSquare, BarChart3, Shield, Smartphone, Globe } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Service {
  id: string;
  service_name: string;
  service_description: string | null;
  service_features: string[];
  service_category: string | null;
  service_image_url: string | null;
  price_starting_from: number | null;
  price_currency: string | null;
  is_active: boolean;
  display_order: number | null;
}

const Services = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const iconMap: { [key: string]: any } = {
    'Web Development': Globe,
    'Mobile App Development': Smartphone,
    'AI Chatbot Development': Brain,
    'Custom AI Application': Code,
    'Data Analytics & Insights': Database,
    'AI Content Generation': MessageSquare,
    'default': Brain
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform data to ensure service_features is always an array of strings
      const transformedData = (data || []).map(service => ({
        ...service,
        service_features: Array.isArray(service.service_features) 
          ? (service.service_features as any[]).map(feature => String(feature))
          : []
      }));

      setServices(transformedData);
    } catch (error) {
      console.error('Error fetching services:', error);
      // Fallback to static data if fetch fails
      setServices([
        {
          id: 'fallback-1',
          service_name: 'Web Development',
          service_description: 'Pembuatan website profesional dengan teknologi terdepan untuk meningkatkan presence online bisnis Anda.',
          service_features: ['Responsive Design', 'SEO Optimized', 'Fast Loading Speed'],
          service_category: 'Development',
          service_image_url: null,
          price_starting_from: null,
          price_currency: 'IDR',
          is_active: true,
          display_order: 1
        },
        {
          id: 'fallback-2',
          service_name: 'Mobile App Development',
          service_description: 'Pengembangan aplikasi mobile iOS dan Android dengan user experience yang optimal dan performa tinggi.',
          service_features: ['Cross-platform', 'Native Performance', 'App Store Ready'],
          service_category: 'Development',
          service_image_url: null,
          price_starting_from: null,
          price_currency: 'IDR',
          is_active: true,
          display_order: 2
        },
        {
          id: 'fallback-3',
          service_name: 'AI Chatbot Development',
          service_description: 'Pembuatan chatbot cerdas dengan NLP untuk customer service otomatis dan engagement yang lebih baik.',
          service_features: ['Natural Language Processing', '24/7 Customer Support', 'Multi-platform Integration'],
          service_category: 'AI',
          service_image_url: null,
          price_starting_from: null,
          price_currency: 'IDR',
          is_active: true,
          display_order: 3
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section id="layanan" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Layanan Web & Apps Development
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Memuat layanan...
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((_, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-lg animate-pulse">
                <div className="w-16 h-16 bg-gray-300 rounded-2xl mb-6"></div>
                <div className="h-6 bg-gray-300 rounded mb-4"></div>
                <div className="space-y-2 mb-6">
                  <div className="h-4 bg-gray-300 rounded"></div>
                  <div className="h-4 bg-gray-300 rounded"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                </div>
                <div className="space-y-2 mb-6">
                  <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                </div>
                <div className="h-12 bg-gray-300 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="layanan" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Layanan Web & Apps Development
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Kami menyediakan solusi digital komprehensif mulai dari website, aplikasi mobile, 
            hingga teknologi AI untuk transformasi digital bisnis Anda.
          </p>
        </div>

        {services.length === 0 ? (
          <div className="text-center py-12">
            <Code className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Belum Ada Layanan</h3>
            <p className="text-gray-500">Layanan akan ditampilkan di sini setelah ditambahkan di CMS</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => {
              const IconComponent = iconMap[service.service_name] || iconMap['default'];
              return (
                <div 
                  key={service.id} 
                  className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-blue-200 group"
                >
                  <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-6 group-hover:bg-blue-600 transition-colors duration-300">
                    <IconComponent className="h-8 w-8 text-blue-600 group-hover:text-white transition-colors duration-300" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{service.service_name}</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {service.service_description || 'Deskripsi layanan akan segera tersedia.'}
                  </p>
                  
                  {service.service_features.length > 0 && (
                    <ul className="space-y-2 mb-6">
                      {service.service_features.map((feature, idx) => (
                        <li key={idx} className="flex items-center text-sm text-gray-600">
                          <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  )}
                  
                  {service.price_starting_from && (
                    <div className="mb-4">
                      <span className="text-sm text-gray-500">Mulai dari</span>
                      <div className="text-lg font-bold text-blue-600">
                        {service.price_currency === 'IDR' ? 'Rp ' : service.price_currency + ' '}
                        {service.price_starting_from.toLocaleString()}
                      </div>
                    </div>
                  )}
                  
                  <button className="w-full bg-gray-50 text-gray-900 py-3 rounded-lg hover:bg-blue-600 hover:text-white transition-all duration-300 font-medium">
                    Pelajari Lebih Lanjut
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default Services;
