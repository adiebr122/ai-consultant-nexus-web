
import { Star, Quote } from 'lucide-react';

const Testimonials = () => {
  const testimonials = [
    {
      name: 'Budi Santoso',
      position: 'CEO',
      company: 'PT Telkom Indonesia',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
      rating: 5,
      text: 'AI Consultant Pro telah mentransformasi operasional kami dengan chatbot AI yang luar biasa. Customer satisfaction meningkat 40% dan response time berkurang drastis. Tim mereka sangat profesional dan hasil kerjanya melebihi ekspektasi.'
    },
    {
      name: 'Sari Dewi',
      position: 'Director of Digital Innovation',
      company: 'Bank Central Asia',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b5e5?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
      rating: 5,
      text: 'Implementasi AI untuk fraud detection yang mereka kembangkan berhasil mengurangi kerugian hingga 60%. Sistem prediktif yang akurat dan real-time monitoring sangat membantu keamanan transaksi nasabah kami.'
    },
    {
      name: 'Ahmad Rahman',
      position: 'Head of Technology',
      company: 'Gojek Indonesia',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
      rating: 5,
      text: 'Kerjasama dengan AI Consultant Pro dalam pengembangan algoritma machine learning untuk route optimization sangat memuaskan. Efisiensi delivery meningkat 35% dan driver experience menjadi lebih optimal.'
    },
    {
      name: 'Linda Kusuma',
      position: 'Marketing Director',
      company: 'Tokopedia',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
      rating: 5,
      text: 'AI content generation yang dikembangkan tim mereka revolusioner untuk marketing campaigns kami. Produktivitas tim content meningkat 300% dengan kualitas yang konsisten dan engagement rate yang lebih tinggi.'
    },
    {
      name: 'Rizki Pratama',
      position: 'Operations Manager',
      company: 'Shopee Indonesia',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
      rating: 5,
      text: 'Automasi warehouse management dengan AI vision yang mereka implementasikan menghasilkan peningkatan akurasi inventory 98%. Proses picking dan packing menjadi 50% lebih cepat dengan error rate mendekati nol.'
    },
    {
      name: 'Maya Sari',
      position: 'Head of Customer Experience',
      company: 'Grab Indonesia',
      image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
      rating: 5,
      text: 'Predictive analytics untuk demand forecasting yang mereka kembangkan sangat akurat. Kami berhasil mengoptimalkan supply-demand balance dengan tingkat akurasi prediksi 94%, yang berdampak signifikan pada profitabilitas.'
    }
  ];

  return (
    <section id="testimoni" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Testimoni Klien Terpercaya
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Dengarkan pengalaman klien-klien kami yang telah merasakan transformasi 
            bisnis melalui implementasi solusi AI yang kami kembangkan.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 relative"
            >
              <Quote className="absolute top-4 right-4 h-8 w-8 text-blue-200" />
              
              <div className="flex items-center mb-6">
                <img 
                  src={testimonial.image} 
                  alt={testimonial.name}
                  className="w-16 h-16 rounded-full object-cover mr-4"
                />
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{testimonial.name}</h3>
                  <p className="text-sm text-gray-600">{testimonial.position}</p>
                  <p className="text-sm text-blue-600 font-medium">{testimonial.company}</p>
                </div>
              </div>

              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>

              <p className="text-gray-700 leading-relaxed italic">
                "{testimonial.text}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
