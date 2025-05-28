
import { ExternalLink, Github, ArrowRight } from 'lucide-react';

const Portfolio = () => {
  const projects = [
    {
      title: 'E-Commerce Platform',
      category: 'Web Development',
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80',
      description: 'Platform e-commerce modern dengan AI recommendation system dan payment gateway terintegrasi.',
      technologies: ['React', 'Node.js', 'PostgreSQL', 'Stripe'],
      demoUrl: '#',
      githubUrl: '#'
    },
    {
      title: 'Banking Mobile App',
      category: 'Mobile App',
      image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80',
      description: 'Aplikasi mobile banking dengan fitur AI fraud detection dan biometric authentication.',
      technologies: ['React Native', 'Firebase', 'TensorFlow', 'Biometric API'],
      demoUrl: '#',
      githubUrl: '#'
    },
    {
      title: 'AI Customer Service Bot',
      category: 'AI Development',
      image: 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80',
      description: 'Chatbot AI yang dapat menangani 80% customer inquiries dengan natural language processing.',
      technologies: ['Python', 'OpenAI', 'Dialogflow', 'WebSocket'],
      demoUrl: '#',
      githubUrl: '#'
    },
    {
      title: 'Healthcare Management System',
      category: 'Web Development',
      image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80',
      description: 'Sistem manajemen rumah sakit dengan AI diagnostic assistance dan telemedicine features.',
      technologies: ['Vue.js', 'Laravel', 'MySQL', 'WebRTC'],
      demoUrl: '#',
      githubUrl: '#'
    },
    {
      title: 'Food Delivery App',
      category: 'Mobile App',
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80',
      description: 'Aplikasi food delivery dengan real-time tracking dan AI-powered restaurant recommendations.',
      technologies: ['Flutter', 'Firebase', 'Google Maps', 'Machine Learning'],
      demoUrl: '#',
      githubUrl: '#'
    },
    {
      title: 'Smart Analytics Dashboard',
      category: 'AI Development',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80',
      description: 'Dashboard analytics dengan AI insights untuk business intelligence dan predictive analytics.',
      technologies: ['React', 'D3.js', 'Python', 'TensorFlow'],
      demoUrl: '#',
      githubUrl: '#'
    }
  ];

  const categories = ['All', 'Web Development', 'Mobile App', 'AI Development'];

  return (
    <section id="portfolio" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Portfolio Proyek Kami
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Lihat berbagai proyek sukses yang telah kami kerjakan untuk klien dari berbagai industri. 
            Setiap proyek dirancang dengan teknologi terdepan dan standar kualitas tinggi.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category, index) => (
            <button
              key={index}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                index === 0 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'bg-white text-gray-600 hover:bg-blue-600 hover:text-white shadow-md'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Portfolio Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 group">
              <div className="relative overflow-hidden">
                <img 
                  src={project.image} 
                  alt={project.title}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-blue-600 bg-opacity-0 group-hover:bg-opacity-80 transition-all duration-300 flex items-center justify-center">
                  <div className="flex space-x-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <a 
                      href={project.demoUrl}
                      className="bg-white text-blue-600 p-3 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <ExternalLink className="h-5 w-5" />
                    </a>
                    <a 
                      href={project.githubUrl}
                      className="bg-white text-blue-600 p-3 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <Github className="h-5 w-5" />
                    </a>
                  </div>
                </div>
                <div className="absolute top-4 left-4">
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {project.category}
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{project.title}</h3>
                <p className="text-gray-600 mb-4 leading-relaxed">{project.description}</p>
                
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech, idx) => (
                      <span key={idx} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <button className="text-blue-600 font-medium flex items-center hover:text-blue-700 transition-colors">
                    View Details
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <button className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl">
            Lihat Semua Proyek
          </button>
        </div>
      </div>
    </section>
  );
};

export default Portfolio;
