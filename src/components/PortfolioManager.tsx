
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Upload, Save, X, ExternalLink, Github } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Project {
  id?: string;
  title: string;
  description: string;
  image_url: string;
  client: string;
  category: string;
  technologies: string[];
  demo_url?: string;
  github_url?: string;
}

interface PortfolioContent {
  title: string;
  description: string;
  projects: Project[];
}

const PortfolioManager = () => {
  const { user } = useAuth();
  const [content, setContent] = useState<PortfolioContent>({
    title: 'Portfolio Proyek Terbaik',
    description: 'Lihat hasil karya terbaik kami dalam mengembangkan solusi AI dan aplikasi untuk berbagai industri.',
    projects: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [showProjectForm, setShowProjectForm] = useState(false);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const { data, error } = await supabase
        .from('website_content')
        .select('*')
        .eq('section', 'portfolio')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data && data.metadata) {
        const metadata = data.metadata as any;
        setContent({
          title: data.title || 'Portfolio Proyek Terbaik',
          description: data.content || 'Lihat hasil karya terbaik kami dalam mengembangkan solusi AI dan aplikasi untuk berbagai industri.',
          projects: metadata.projects || []
        });
      }
    } catch (error) {
      console.error('Error fetching portfolio content:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveContent = async () => {
    if (!user) return;
    setSaving(true);

    try {
      const { error } = await supabase
        .from('website_content')
        .upsert({
          section: 'portfolio',
          title: content.title,
          content: content.description,
          metadata: { projects: content.projects } as any,
          user_id: user.id,
          is_active: true
        }, {
          onConflict: 'section,user_id'
        });

      if (error) throw error;
      alert('Portfolio content saved successfully!');
    } catch (error) {
      console.error('Error saving portfolio content:', error);
      alert('Error saving portfolio content');
    } finally {
      setSaving(false);
    }
  };

  const addProject = () => {
    setEditingProject({
      title: '',
      description: '',
      image_url: '',
      client: '',
      category: '',
      technologies: [],
      demo_url: '',
      github_url: ''
    });
    setShowProjectForm(true);
  };

  const editProject = (project: Project, index: number) => {
    setEditingProject({ ...project, id: index.toString() });
    setShowProjectForm(true);
  };

  const deleteProject = (index: number) => {
    if (confirm('Are you sure you want to delete this project?')) {
      const newProjects = content.projects.filter((_, i) => i !== index);
      setContent({ ...content, projects: newProjects });
    }
  };

  const saveProject = () => {
    if (!editingProject) return;

    const newProjects = [...content.projects];
    
    if (editingProject.id && editingProject.id !== 'new') {
      // Edit existing project
      const index = parseInt(editingProject.id);
      newProjects[index] = { ...editingProject };
      delete newProjects[index].id;
    } else {
      // Add new project
      const { id, ...projectData } = editingProject;
      newProjects.push(projectData);
    }

    setContent({ ...content, projects: newProjects });
    setShowProjectForm(false);
    setEditingProject(null);
  };

  const handleTechnologiesChange = (value: string) => {
    if (!editingProject) return;
    const technologies = value.split(',').map(tech => tech.trim()).filter(tech => tech);
    setEditingProject({ ...editingProject, technologies });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Portfolio Management</h2>
        <button
          onClick={saveContent}
          disabled={saving}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          <span>{saving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>

      {/* Header Content */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Header Content</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input
              type="text"
              value={content.title}
              onChange={(e) => setContent({ ...content, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={content.description}
              onChange={(e) => setContent({ ...content, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Projects Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Projects</h3>
          <button
            onClick={addProject}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Project</span>
          </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {content.projects.map((project, index) => (
            <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
              <img 
                src={project.image_url} 
                alt={project.title}
                className="w-full h-32 object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
                }}
              />
              <div className="p-4">
                <h4 className="font-semibold mb-1">{project.title}</h4>
                <p className="text-sm text-gray-600 mb-2">{project.client}</p>
                <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mb-2">
                  {project.category}
                </span>
                <p className="text-sm text-gray-700 mb-3 line-clamp-2">{project.description}</p>
                <div className="flex justify-between items-center">
                  <div className="flex space-x-2">
                    {project.demo_url && (
                      <ExternalLink className="h-4 w-4 text-blue-600" />
                    )}
                    {project.github_url && (
                      <Github className="h-4 w-4 text-gray-600" />
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => editProject(project, index)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteProject(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Project Form Modal */}
      {showProjectForm && editingProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">
                  {editingProject.id && editingProject.id !== 'new' ? 'Edit Project' : 'Add New Project'}
                </h3>
                <button
                  onClick={() => setShowProjectForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Project Title</label>
                    <input
                      type="text"
                      value={editingProject.title}
                      onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Client</label>
                    <input
                      type="text"
                      value={editingProject.client}
                      onChange={(e) => setEditingProject({ ...editingProject, client: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={editingProject.description}
                    onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <input
                      type="text"
                      value={editingProject.category}
                      onChange={(e) => setEditingProject({ ...editingProject, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., AI Chatbot, Mobile App"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                    <input
                      type="url"
                      value={editingProject.image_url}
                      onChange={(e) => setEditingProject({ ...editingProject, image_url: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Technologies (comma separated)</label>
                  <input
                    type="text"
                    value={editingProject.technologies.join(', ')}
                    onChange={(e) => handleTechnologiesChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="React, Python, TensorFlow, Node.js"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Demo URL (optional)</label>
                    <input
                      type="url"
                      value={editingProject.demo_url || ''}
                      onChange={(e) => setEditingProject({ ...editingProject, demo_url: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">GitHub URL (optional)</label>
                    <input
                      type="url"
                      value={editingProject.github_url || ''}
                      onChange={(e) => setEditingProject({ ...editingProject, github_url: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => setShowProjectForm(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveProject}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Save Project
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioManager;
