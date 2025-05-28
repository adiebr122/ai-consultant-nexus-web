
import { useState, useEffect } from 'react';
import { Brain, Code, Database, MessageSquare, BarChart3, Shield, Smartphone, Globe, ArrowRight } from 'lucide-react';
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

interface ServicesContent {
  title: string;
  description: string;
}

const Services = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [content, setContent] = useState<ServicesContent | null>(null);
  const [loading, setLoading] = useState(true);

  const iconMap: { [key: string]: any } = {
    'Web Development': Globe,
    'Mobile App Development': Smartphone,
    'AI Chatbot Development': Brain,
    'Custom AI Application': Code,
    'Data Analytics & Insights': Database,
    'AI Content Generation': MessageSquare,
    'Cyber Security': Shield,
    'Business Intelligence': BarChart3,
    'default': Brain
  };

  useEffect(() => {
    fetchContent();
    fetchServices();
  }, []);

  const fetchContent = async () => {
    try {
      const { data, error } = await supabase
        .from('website_content')
        .select('*')
        .eq('section', 'services')
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setContent({
          title: data.title || 'Layanan Web & Apps Development',
          description: data.content || 'Kami menyediakan solusi digital komprehensif mulai dari website, aplikasi mobile, hingga teknologi AI untuk transformasi digital bisnis Anda.'
        });
      }
    } catch (error) {
      console.error('Error fetching services content:', error);
    }
  };

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;

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
          price_starting_from: 15000000,
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
          price_starting_from: 25000000,
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
          price_starting_from: 20000000,
          price_currency: 'IDR',
          is_active: true,
          display_order: 3
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const defaultContent: ServicesContent = {
    title: 'Layanan Web & Apps Development',
    description: 'Kami menyediakan solusi digital komprehensif mulai dari website, aplikasi mobile, hingga teknologi AI untuk transformasi digital bisnis Anda.'
  };

  const displayContent = content || defaultContent;

  if (loading) {
    return (
      <section id="layanan" className="py-20 bg-gradient-to-br from-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-pulse">
            <div className="h-10 bg-gray-300 rounded w-1/2 mx-auto mb-4"></div>
            <div className="h-6 bg-gray-300 rounded w-3/4 mx-auto"></div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((_, index) => (
              <div key={index} className="bg-white p-8 rounded-3xl shadow-lg animate-pulse">
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
    <section id="layanan" className="py-20 bg-gradient-to-br from-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-5xl font-bold bg-gradient-to-r from-gray-900 to-blue-900 bg-clip-text text-transparent mb-6">
            {displayContent.title}
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            {displayContent.description}
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
            {services.map((service, index) => {
              const IconComponent = iconMap[service.service_name] || iconMap['default'];
              return (
                <div 
                  key={service.id} 
                  className="group bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-blue-200 transform hover:-translate-y-2 animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl mb-6 group-hover:from-blue-600 group-hover:to-indigo-600 transition-all duration-300">
                    <IconComponent className="h-8 w-8 text-blue-600 group-hover:text-white transition-colors duration-300" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-blue-900 transition-colors">
                    {service.service_name}
                  </h3>
                  
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {service.service_description || 'Deskripsi layanan akan segera tersedia.'}
                  </p>
                  
                  {service.service_features.length > 0 && (
                    <ul className="space-y-2 mb-6">
                      {service.service_features.map((feature, idx) => (
                        <li key={idx} className="flex items-center text-sm text-gray-600">
                          <div className="w-2 h-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mr-3"></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  )}
                  
                  {service.price_starting_from && (
                    <div className="mb-6 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl">
                      <span className="text-sm text-gray-500 block">Mulai dari</span>
                      <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        {service.price_currency === 'IDR' ? 'Rp ' : service.price_currency + ' '}
                        {service.price_starting_from.toLocaleString()}
                      </div>
                    </div>
                  )}
                  
                  <button className="w-full bg-gradient-to-r from-gray-50 to-blue-50 text-gray-900 py-3 rounded-xl hover:from-blue-600 hover:to-indigo-600 hover:text-white transition-all duration-300 font-medium group flex items-center justify-center">
                    <span>Pelajari Lebih Lanjut</span>
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Call to action */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Siap untuk Memulai Proyek Anda?</h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Konsultasikan kebutuhan digital Anda dengan tim ahli kami dan dapatkan solusi terbaik untuk bisnis Anda.
            </p>
            <button className="bg-white text-blue-600 px-8 py-3 rounded-xl hover:bg-gray-100 transition-colors duration-300 font-semibold">
              Konsultasi Gratis Sekarang
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;
