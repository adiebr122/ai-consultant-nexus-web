
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Star, Clock, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Service {
  id: string;
  service_name: string;
  service_description: string;
  service_category: string;
  price_starting_from: number;
  price_currency: string;
  estimated_duration: string;
  service_image_url: string;
  service_features: string[];
  is_active: boolean;
  display_order: number;
}

const Services = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      console.log('Fetching services from database...');
      
      // Check if services table exists by trying to fetch from it
      const { data, error } = await supabase
        .from('website_content')
        .select('*')
        .eq('section', 'services')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      console.log('Services query result:', { data, error });

      if (error) {
        console.error('Error fetching services:', error);
        // If no services data found, show default services
        setServices([]);
      } else if (data && data.length > 0) {
        // Transform website_content data to Service format
        const transformedServices: Service[] = data.map((item, index) => {
          let serviceData;
          try {
            serviceData = item.content ? JSON.parse(item.content) : {};
          } catch (e) {
            console.error('Error parsing service content:', e);
            serviceData = {};
          }

          return {
            id: item.id,
            service_name: item.title || `Layanan ${index + 1}`,
            service_description: serviceData.description || 'Deskripsi layanan',
            service_category: serviceData.category || 'Umum',
            price_starting_from: serviceData.price || 1000000,
            price_currency: serviceData.currency || 'IDR',
            estimated_duration: serviceData.duration || '1-2 minggu',
            service_image_url: serviceData.image_url || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            service_features: serviceData.features || ['Konsultasi', 'Implementasi', 'Support'],
            is_active: item.is_active || true,
            display_order: index
          };
        });
        
        console.log('Transformed services:', transformedServices);
        setServices(transformedServices);
      } else {
        console.log('No services found, using default services');
        // Default services if none exist
        setServices([
          {
            id: 'default-1',
            service_name: 'AI Consultation',
            service_description: 'Konsultasi mendalam tentang implementasi AI dalam bisnis Anda',
            service_category: 'Konsultasi',
            price_starting_from: 2500000,
            price_currency: 'IDR',
            estimated_duration: '1-2 minggu',
            service_image_url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            service_features: ['Analisis Kebutuhan', 'Roadmap AI', 'ROI Analysis'],
            is_active: true,
            display_order: 1
          },
          {
            id: 'default-2',
            service_name: 'Custom AI Development',
            service_description: 'Pengembangan solusi AI custom sesuai kebutuhan bisnis spesifik',
            service_category: 'Development',
            price_starting_from: 15000000,
            price_currency: 'IDR',
            estimated_duration: '2-3 bulan',
            service_image_url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            service_features: ['Machine Learning', 'Data Processing', 'API Integration'],
            is_active: true,
            display_order: 2
          },
          {
            id: 'default-3',
            service_name: 'AI Training & Workshop',
            service_description: 'Pelatihan tim internal untuk memahami dan menggunakan teknologi AI',
            service_category: 'Training',
            price_starting_from: 5000000,
            price_currency: 'IDR',
            estimated_duration: '3-5 hari',
            service_image_url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            service_features: ['Hands-on Training', 'Case Studies', 'Certification'],
            is_active: true,
            display_order: 3
          }
        ]);
      }
    } catch (error) {
      console.error('Error in fetchServices:', error);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Memuat layanan...</p>
          </div>
        </div>
      </section>
    );
  }

  if (services.length === 0) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Layanan Kami</h2>
          <p className="text-gray-600">Layanan sedang dalam pengembangan. Silakan hubungi kami untuk informasi lebih lanjut.</p>
        </div>
      </section>
    );
  }

  return (
    <section id="services" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Layanan Kami</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Solusi digital terdepan untuk mengembangkan bisnis Anda dengan teknologi AI dan transformasi digital
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <Card key={service.id} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-white border-0">
              <div className="relative overflow-hidden rounded-t-lg">
                <img 
                  src={service.service_image_url} 
                  alt={service.service_name}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
                  }}
                />
                <div className="absolute top-4 left-4">
                  <Badge variant="secondary" className="bg-white/90 text-gray-900">
                    {service.service_category}
                  </Badge>
                </div>
              </div>
              
              <CardHeader>
                <CardTitle className="text-xl font-bold group-hover:text-blue-600 transition-colors">
                  {service.service_name}
                </CardTitle>
                <CardDescription className="text-gray-600 line-clamp-2">
                  {service.service_description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {service.estimated_duration}
                  </div>
                  <div className="flex items-center font-semibold text-green-600">
                    <DollarSign className="h-4 w-4 mr-1" />
                    {service.price_currency} {service.price_starting_from?.toLocaleString('id-ID')}
                  </div>
                </div>

                {service.service_features && service.service_features.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Fitur Utama:</p>
                    <div className="flex flex-wrap gap-1">
                      {service.service_features.slice(0, 3).map((feature, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                      {service.service_features.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{service.service_features.length - 3} lainnya
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                <Button className="w-full group-hover:bg-blue-700 transition-colors">
                  Pelajari Lebih Lanjut
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
