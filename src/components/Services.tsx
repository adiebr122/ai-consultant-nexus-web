
import { Brain, Code, Database, MessageSquare, BarChart3, Shield, Smartphone, Globe } from 'lucide-react';

const Services = () => {
  const services = [
    {
      icon: Globe,
      title: 'Web Development',
      description: 'Pembuatan website profesional dengan teknologi terdepan untuk meningkatkan presence online bisnis Anda.',
      features: ['Responsive Design', 'SEO Optimized', 'Fast Loading Speed']
    },
    {
      icon: Smartphone,
      title: 'Mobile App Development',
      description: 'Pengembangan aplikasi mobile iOS dan Android dengan user experience yang optimal dan performa tinggi.',
      features: ['Cross-platform', 'Native Performance', 'App Store Ready']
    },
    {
      icon: Brain,
      title: 'AI Chatbot Development',
      description: 'Pembuatan chatbot cerdas dengan NLP untuk customer service otomatis dan engagement yang lebih baik.',
      features: ['Natural Language Processing', '24/7 Customer Support', 'Multi-platform Integration']
    },
    {
      icon: Code,
      title: 'Custom AI Application',
      description: 'Pengembangan aplikasi AI custom sesuai kebutuhan bisnis dengan teknologi machine learning terdepan.',
      features: ['Machine Learning Models', 'Computer Vision', 'Predictive Analytics']
    },
    {
      icon: Database,
      title: 'Data Analytics & Insights',
      description: 'Analisis data mendalam dengan AI untuk menghasilkan insights bisnis yang actionable dan profitable.',
      features: ['Big Data Processing', 'Real-time Analytics', 'Business Intelligence']
    },
    {
      icon: MessageSquare,
      title: 'AI Content Generation',
      description: 'Automasi pembuatan konten marketing dengan AI untuk meningkatkan produktivitas dan engagement.',
      features: ['Content Writing', 'Social Media Posts', 'SEO Optimization']
    }
  ];

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

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <div 
                key={index} 
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-blue-200 group"
              >
                <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-6 group-hover:bg-blue-600 transition-colors duration-300">
                  <IconComponent className="h-8 w-8 text-blue-600 group-hover:text-white transition-colors duration-300" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-4">{service.title}</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">{service.description}</p>
                
                <ul className="space-y-2">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-sm text-gray-600">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <button className="mt-6 w-full bg-gray-50 text-gray-900 py-3 rounded-lg hover:bg-blue-600 hover:text-white transition-all duration-300 font-medium">
                  Pelajari Lebih Lanjut
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Services;
