
import { ArrowLeft, ExternalLink, Github, Calendar, Users, Target, CheckCircle, Award } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface Project {
  title: string;
  description: string;
  detailed_description: string;
  image_url: string;
  gallery_images: string[];
  client: string;
  category: string;
  technologies: string[];
  demo_url?: string;
  github_url?: string;
  project_duration: string;
  team_size: string;
  challenges: string;
  solutions: string;
  results: string;
}

interface PortfolioDetailProps {
  project: Project;
  onBack: () => void;
}

const PortfolioDetail = ({ project, onBack }: PortfolioDetailProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Kembali ke Portfolio
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <img 
              src={project.image_url} 
              alt={project.title}
              className="w-full h-64 object-cover rounded-lg border border-gray-200"
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
              }}
            />
          </div>

          {project.gallery_images && project.gallery_images.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3">Galeri Proyek</h4>
              <div className="grid grid-cols-2 gap-4">
                {project.gallery_images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`Gallery ${idx + 1}`}
                    className="w-full h-32 object-cover rounded-lg border border-gray-200"
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
              <span className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                {project.category}
              </span>
            </div>
            <p className="text-xl text-gray-600 mb-4">{project.description}</p>
            <p className="text-gray-700 leading-relaxed">{project.detailed_description}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Durasi Proyek</p>
                    <p className="font-medium">{project.project_duration || 'Tidak disebutkan'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Tim</p>
                    <p className="font-medium">{project.team_size || 'Tidak disebutkan'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Teknologi yang Digunakan</h3>
            <div className="flex flex-wrap gap-2">
              {project.technologies.map((tech, idx) => (
                <span
                  key={idx}
                  className="bg-gray-100 text-gray-800 text-sm px-3 py-1 rounded-full"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          <div className="flex space-x-4">
            {project.demo_url && (
              <a
                href={project.demo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
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
                className="flex items-center bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors"
              >
                <Github className="h-4 w-4 mr-2" />
                Source Code
              </a>
            )}
          </div>
        </div>
      </div>

      {(project.challenges || project.solutions || project.results) && (
        <div className="border-t border-gray-200 pt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Detail Proyek</h2>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {project.challenges && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Target className="h-6 w-6 text-red-600" />
                    <h3 className="text-lg font-semibold">Tantangan</h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{project.challenges}</p>
                </CardContent>
              </Card>
            )}

            {project.solutions && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <CheckCircle className="h-6 w-6 text-blue-600" />
                    <h3 className="text-lg font-semibold">Solusi</h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{project.solutions}</p>
                </CardContent>
              </Card>
            )}

            {project.results && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Award className="h-6 w-6 text-green-600" />
                    <h3 className="text-lg font-semibold">Hasil</h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{project.results}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioDetail;
