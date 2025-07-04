
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Quote } from 'lucide-react';

interface Testimonial {
  id: string;
  client_name: string;
  client_company: string;
  client_position: string;
  testimonial_text: string;
  rating: number;
  client_photo_url: string;
  project_name: string;
  is_featured: boolean;
  is_active: boolean;
  display_order: number;
}

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setTestimonials(data || []);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Memuat testimonial...</p>
          </div>
        </div>
      </section>
    );
  }

  if (testimonials.length === 0) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Testimoni Klien</h2>
          <p className="text-gray-600">Belum ada testimonial yang tersedia</p>
        </div>
      </section>
    );
  }

  return (
    <section id="testimonials" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Testimoni Klien</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Kepuasan klien adalah prioritas utama kami. Lihat apa yang mereka katakan tentang layanan kami
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="group hover:shadow-xl transition-all duration-300 bg-white border-0 relative overflow-hidden">
              <div className="absolute top-4 right-4 text-blue-600 opacity-10">
                <Quote className="h-12 w-12" />
              </div>
              
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center space-x-1">
                  {renderStars(testimonial.rating)}
                </div>

                <blockquote className="text-gray-700 italic leading-relaxed">
                  "{testimonial.testimonial_text}"
                </blockquote>

                <div className="flex items-center space-x-4 pt-4 border-t border-gray-100">
                  <div className="flex-shrink-0">
                    <img
                      src={testimonial.client_photo_url}
                      alt={testimonial.client_name}
                      className="h-12 w-12 rounded-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.client_name)}&background=3b82f6&color=fff`;
                      }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-900 truncate">
                      {testimonial.client_name}
                    </p>
                    <p className="text-sm text-gray-600 truncate">
                      {testimonial.client_position}
                    </p>
                    <p className="text-sm text-blue-600 truncate">
                      {testimonial.client_company}
                    </p>
                  </div>
                </div>

                {testimonial.project_name && (
                  <div className="pt-2">
                    <p className="text-xs text-gray-500">
                      Proyek: {testimonial.project_name}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
