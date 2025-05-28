
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Github, Calendar, User, Building, Tag, Clock, Users, Check, Lightbulb, Award } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';

interface Project {
  id: string;
  title: string;
  description: string;
  detailed_description?: string;
  image_url: string;
  gallery_images?: string[];
  client: string;
  category: string;
  technologies: string[];
  demo_url?: string;
  github_url?: string;
  project_duration?: string;
  team_size?: string;
  challenges?: string;
  solutions?: string;
  results?: string;
}

const PortfolioDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeGalleryImage, setActiveGalleryImage] = useState<string | null>(null);

  useEffect(() => {
    fetchPortfolioData();
  }, [id]);

  const fetchPortfolioData = async () => {
    try {
      // Fetch all portfolio content
      const { data, error } = await supabase
        .from('website_content')
        .select('*')
        .eq('section', 'portfolio')
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data && data.metadata) {
        const metadata = data.metadata as any;
        const projects = metadata.projects || [];
        setAllProjects(projects);
        
        // Find the specific project by index (using id as index)
        const projectIndex = parseInt(id || '0');
        if (projects[projectIndex]) {
          const projectData = { ...projects[projectIndex], id: projectIndex.toString() };
          setProject(projectData);
          if (projectData.gallery_images && projectData.gallery_images.length > 0) {
            setActiveGalleryImage(projectData.gallery_images[0]);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching portfolio data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-16 flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-16 text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Proyek Tidak Ditemukan</h1>
          <Link to="/" className="text-blue-600 hover:text-blue-800">
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="pt-16 pb-16">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-blue-900 to-indigo-800 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
            <Link 
              to="/" 
              className="inline-flex items-center text-blue-200 hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali ke Portfolio
            </Link>
            
            <div className="max-w-4xl">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {project.title}
              </h1>
              <p className="text-xl mb-6 text-blue-100">
                {project.description}
              </p>
              
              <div className="flex flex-wrap gap-4 mb-8">
                <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg flex items-center">
                  <Building className="h-5 w-5 mr-2 text-blue-200" />
                  <span>{project.client}</span>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg flex items-center">
                  <Tag className="h-5 w-5 mr-2 text-blue-200" />
                  <span>{project.category}</span>
                </div>
                
                {project.project_duration && (
                  <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-blue-200" />
                    <span>{project.project_duration}</span>
                  </div>
                )}
                
                {project.team_size && (
                  <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg flex items-center">
                    <Users className="h-5 w-5 mr-2 text-blue-200" />
                    <span>{project.team_size}</span>
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap gap-3 mb-8">
                {project.technologies?.map((tech, index) => (
                  <span 
                    key={index} 
                    className="bg-blue-600/30 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm"
                  >
                    {tech}
                  </span>
                ))}
              </div>
              
              <div className="flex flex-wrap gap-4">
                {project.demo_url && (
                  <a
                    href={project.demo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white text-blue-700 hover:bg-blue-50 transition px-6 py-3 rounded-lg font-medium flex items-center"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Lihat Demo
                  </a>
                )}
                
                {project.github_url && (
                  <a
                    href={project.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gray-800 text-white hover:bg-gray-700 transition px-6 py-3 rounded-lg font-medium flex items-center"
                  >
                    <Github className="h-4 w-4 mr-2" />
                    Source Code
                  </a>
                )}
              </div>
            </div>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 to-transparent"></div>
          <div className="absolute top-0 right-0 w-1/3 h-full opacity-10 pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" className="w-full h-full">
              <g fill="none" stroke="currentColor" strokeWidth="1">
                <circle cx="200" cy="200" r="80" />
                <circle cx="200" cy="200" r="120" />
                <circle cx="200" cy="200" r="160" />
              </g>
            </svg>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Main Content - 2 columns */}
            <div className="md:col-span-2 space-y-10">
              {/* Main Image & Gallery */}
              {project.gallery_images && project.gallery_images.length > 0 ? (
                <div className="space-y-4">
                  {/* Main selected image */}
                  <div className="bg-white p-4 rounded-xl shadow-md">
                    <img 
                      src={activeGalleryImage || project.image_url} 
                      alt={project.title}
                      className="w-full h-auto max-h-[600px] object-contain rounded-lg"
                    />
                  </div>
                  
                  {/* Thumbnails */}
                  <div className="grid grid-cols-5 gap-2">
                    <div 
                      className={`cursor-pointer rounded-lg overflow-hidden border-2 ${
                        !activeGalleryImage ? 'border-blue-500' : 'border-transparent hover:border-gray-300'
                      }`}
                      onClick={() => setActiveGalleryImage(null)}
                    >
                      <img 
                        src={project.image_url} 
                        alt={project.title} 
                        className="w-full h-16 object-cover"
                      />
                    </div>
                    
                    {project.gallery_images.map((img, idx) => (
                      <div 
                        key={idx}
                        className={`cursor-pointer rounded-lg overflow-hidden border-2 ${
                          activeGalleryImage === img ? 'border-blue-500' : 'border-transparent hover:border-gray-300'
                        }`}
                        onClick={() => setActiveGalleryImage(img)}
                      >
                        <img 
                          src={img} 
                          alt={`Gallery ${idx + 1}`} 
                          className="w-full h-16 object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-white p-4 rounded-xl shadow-md">
                  <img 
                    src={project.image_url} 
                    alt={project.title}
                    className="w-full h-auto rounded-lg"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                </div>
              )}
              
              {/* Project Description */}
              {project.detailed_description && (
                <div className="bg-white p-8 rounded-xl shadow-md">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Tentang Proyek</h2>
                  <div className="prose prose-lg max-w-none text-gray-700">
                    {project.detailed_description.split('\n').map((paragraph, idx) => (
                      <p key={idx} className="mb-4">{paragraph}</p>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Project Process */}
              {(project.challenges || project.solutions || project.results) && (
                <div className="space-y-8">
                  {project.challenges && (
                    <div className="bg-white p-8 rounded-xl shadow-md">
                      <div className="flex items-center mb-6">
                        <div className="bg-red-100 p-3 rounded-full mr-4">
                          <Lightbulb className="h-6 w-6 text-red-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Tantangan</h2>
                      </div>
                      <div className="prose prose-lg max-w-none text-gray-700">
                        {project.challenges.split('\n').map((paragraph, idx) => (
                          <p key={idx} className="mb-4">{paragraph}</p>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {project.solutions && (
                    <div className="bg-white p-8 rounded-xl shadow-md">
                      <div className="flex items-center mb-6">
                        <div className="bg-blue-100 p-3 rounded-full mr-4">
                          <Check className="h-6 w-6 text-blue-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Solusi</h2>
                      </div>
                      <div className="prose prose-lg max-w-none text-gray-700">
                        {project.solutions.split('\n').map((paragraph, idx) => (
                          <p key={idx} className="mb-4">{paragraph}</p>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {project.results && (
                    <div className="bg-white p-8 rounded-xl shadow-md">
                      <div className="flex items-center mb-6">
                        <div className="bg-green-100 p-3 rounded-full mr-4">
                          <Award className="h-6 w-6 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Hasil</h2>
                      </div>
                      <div className="prose prose-lg max-w-none text-gray-700">
                        {project.results.split('\n').map((paragraph, idx) => (
                          <p key={idx} className="mb-4">{paragraph}</p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Sidebar - 1 column */}
            <div className="space-y-6">
              {/* Project Info Card */}
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Proyek</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm text-gray-500">Klien</h4>
                    <p className="font-medium text-gray-900">{project.client}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm text-gray-500">Kategori</h4>
                    <p className="font-medium text-gray-900">{project.category}</p>
                  </div>
                  
                  {project.project_duration && (
                    <div>
                      <h4 className="text-sm text-gray-500">Durasi Proyek</h4>
                      <p className="font-medium text-gray-900">{project.project_duration}</p>
                    </div>
                  )}
                  
                  {project.team_size && (
                    <div>
                      <h4 className="text-sm text-gray-500">Tim</h4>
                      <p className="font-medium text-gray-900">{project.team_size}</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Technologies Card */}
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Teknologi</h3>
                <div className="flex flex-wrap gap-2">
                  {project.technologies?.map((tech, index) => (
                    <span 
                      key={index}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* CTA Card */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-xl text-white">
                <h3 className="text-lg font-semibold mb-2">Tertarik dengan proyek serupa?</h3>
                <p className="mb-4 text-blue-100 text-sm">
                  Diskusikan kebutuhan proyek Anda dengan tim ahli kami
                </p>
                <button className="w-full bg-white text-blue-600 px-4 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
                  Konsultasi Proyek
                </button>
              </div>
            </div>
          </div>
          
          {/* Related Projects */}
          {allProjects.length > 1 && (
            <div className="mt-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Proyek Lainnya</h2>
              <div className="grid md:grid-cols-3 gap-8">
                {allProjects
                  .filter((_, index) => index.toString() !== id)
                  .slice(0, 3)
                  .map((relatedProject, index) => (
                    <Link
                      key={index}
                      to={`/portfolio/${allProjects.indexOf(relatedProject)}`}
                      className="group block bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                    >
                      <div className="relative overflow-hidden h-48">
                        <img 
                          src={relatedProject.image_url}
                          alt={relatedProject.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
                          }}
                        />
                        <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-xs">
                          {relatedProject.category}
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                          {relatedProject.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {relatedProject.description}
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">{relatedProject.client}</span>
                          <span className="text-blue-600 flex items-center text-sm font-medium">
                            Lihat Detail
                            <ArrowRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PortfolioDetail;
