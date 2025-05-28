
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Github, Calendar, User, Building, Tag } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';

interface Project {
  id: string;
  title: string;
  description: string;
  image_url: string;
  client: string;
  category: string;
  technologies: string[];
  demo_url?: string;
  github_url?: string;
  created_at: string;
}

const PortfolioDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

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
          setProject({ ...projects[projectIndex], id: projectIndex.toString() });
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
      
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Back Button */}
          <Link 
            to="/" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Portfolio
          </Link>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Project Image */}
            <div className="relative">
              <img 
                src={project.image_url}
                alt={project.title}
                className="w-full h-96 object-cover rounded-2xl shadow-xl"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
                }}
              />
              <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                {project.category}
              </div>
            </div>

            {/* Project Details */}
            <div className="space-y-8">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  {project.title}
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  {project.description}
                </p>
              </div>

              {/* Project Info */}
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-white p-4 rounded-xl shadow-lg flex items-center">
                  <Building className="h-5 w-5 text-blue-600 mr-3" />
                  <div>
                    <span className="text-sm text-gray-500">Klien</span>
                    <div className="font-semibold text-gray-900">{project.client}</div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-lg flex items-center">
                  <Tag className="h-5 w-5 text-green-600 mr-3" />
                  <div>
                    <span className="text-sm text-gray-500">Kategori</span>
                    <div className="font-semibold text-gray-900">{project.category}</div>
                  </div>
                </div>
              </div>

              {/* Technologies */}
              {project.technologies && project.technologies.length > 0 && (
                <div className="bg-white p-6 rounded-xl shadow-lg">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Teknologi yang Digunakan</h3>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech, index) => (
                      <span 
                        key={index}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Project Links */}
              <div className="flex space-x-4">
                {project.demo_url && (
                  <a
                    href={project.demo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
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
                    className="flex items-center bg-gray-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-900 transition-colors"
                  >
                    <Github className="h-4 w-4 mr-2" />
                    Source Code
                  </a>
                )}
              </div>

              {/* CTA Section */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-xl text-white">
                <h3 className="text-xl font-semibold mb-2">Tertarik dengan proyek serupa?</h3>
                <p className="mb-4 opacity-90">
                  Diskusikan kebutuhan proyek Anda dengan tim ahli kami
                </p>
                <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                  Konsultasi Proyek
                </button>
              </div>
            </div>
          </div>

          {/* Related Projects */}
          {allProjects.length > 1 && (
            <div className="mt-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Proyek Lainnya</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {allProjects
                  .filter((_, index) => index.toString() !== id)
                  .slice(0, 3)
                  .map((relatedProject, index) => (
                    <Link
                      key={index}
                      to={`/portfolio/${allProjects.indexOf(relatedProject)}`}
                      className="group block bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                    >
                      <img 
                        src={relatedProject.image_url}
                        alt={relatedProject.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
                        }}
                      />
                      <div className="p-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                          {relatedProject.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {relatedProject.description}
                        </p>
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                          {relatedProject.category}
                        </span>
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
