import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Upload, 
  RefreshCw, 
  Save, 
  X, 
  Globe, 
  Github, 
  Calendar,
  Users,
  Clock,
  Target,
  Lightbulb,
  CheckCircle,
  TrendingUp,
  ExternalLink,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';

interface Project {
  id?: string;
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

interface PortfolioContent {
  title: string;
  description: string;
  projects: Project[];
}

interface PortfolioManagerProps {
  onProjectSelect?: (project: Project) => void;
}

const PortfolioManager = ({ onProjectSelect }: PortfolioManagerProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [content, setContent] = useState<PortfolioContent>({
    title: 'Portfolio Proyek Terbaik',
    description: 'Lihat hasil karya terbaik kami dalam mengembangkan solusi AI dan aplikasi untuk berbagai industri.',
    projects: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formProject, setFormProject] = useState<Project>({
    title: '',
    description: '',
    detailed_description: '',
    image_url: '',
    gallery_images: [],
    client: '',
    category: '',
    technologies: [],
    demo_url: '',
    github_url: '',
    project_duration: '',
    team_size: '',
    challenges: '',
    solutions: '',
    results: ''
  });

  useEffect(() => {
    if (user) {
      fetchContent();
    }
  }, [user]);

  const getDefaultProjects = (): Project[] => [
    {
      title: 'AI Chatbot Bank Digital',
      description: 'Chatbot AI canggih untuk layanan perbankan digital yang dapat menangani 10,000+ query harian dengan akurasi 95%.',
      detailed_description: 'Sistem chatbot AI yang dirancang khusus untuk industri perbankan dengan kemampuan natural language processing yang canggih. Chatbot ini dapat menangani berbagai jenis pertanyaan nasabah mulai dari informasi saldo, transfer dana, hingga layanan customer service 24/7.',
      image_url: 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      gallery_images: [
        'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      ],
      client: 'Bank Central Asia',
      category: 'AI Chatbot',
      technologies: ['Python', 'TensorFlow', 'NLP', 'React', 'Node.js', 'PostgreSQL'],
      demo_url: 'https://demo.example.com/chatbot',
      github_url: 'https://github.com/example/ai-chatbot',
      project_duration: '6 bulan',
      team_size: '8 developer, 2 AI specialist, 1 project manager',
      challenges: 'Membangun sistem yang dapat memahami bahasa Indonesia dengan berbagai dialek dan slang, serta mengintegrasikan dengan sistem perbankan yang kompleks.',
      solutions: 'Menggunakan model NLP yang dilatih khusus untuk bahasa Indonesia dan implementasi API gateway yang aman untuk integrasi banking system.',
      results: 'Berhasil mengurangi beban customer service hingga 70% dan meningkatkan kepuasan nasabah dengan response time rata-rata 2 detik.'
    },
    {
      title: 'E-commerce Platform',
      description: 'Platform e-commerce lengkap dengan sistem rekomendasi AI yang meningkatkan conversion rate hingga 40%.',
      detailed_description: 'Platform e-commerce modern dengan fitur marketplace, sistem pembayaran terintegrasi, dan algoritma rekomendasi produk berbasis machine learning untuk meningkatkan pengalaman berbelanja pengguna.',
      image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      gallery_images: [
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      ],
      client: 'Tokopedia',
      category: 'Web Development',
      technologies: ['React', 'Node.js', 'MongoDB', 'AI/ML', 'AWS', 'Redis'],
      demo_url: 'https://demo.example.com/ecommerce',
      project_duration: '8 bulan',
      team_size: '12 developer, 3 designer, 2 devops engineer',
      challenges: 'Menangani traffic tinggi pada event flash sale dan mengintegrasikan multiple payment gateway dengan tingkat keamanan tinggi.',
      solutions: 'Implementasi microservices architecture dengan load balancing dan caching strategy yang optimal, serta enkripsi end-to-end untuk payment processing.',
      results: 'Platform mampu menangani 100,000+ concurrent users dengan uptime 99.9% dan peningkatan conversion rate 40%.'
    }
  ];

  const fetchContent = async () => {
    if (!user) return;
    
    try {
      console.log('Fetching portfolio content for user:', user.id);
      
      const { data, error } = await supabase
        .from('website_content')
        .select('*')
        .eq('section', 'portfolio')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching portfolio content:', error);
        throw error;
      }

      if (data && data.metadata) {
        console.log('Found portfolio data:', data);
        const metadata = data.metadata as any;
        setContent({
          title: data.title || 'Portfolio Proyek Terbaik',
          description: data.content || 'Lihat hasil karya terbaik kami dalam mengembangkan solusi AI dan aplikasi untuk berbagai industri.',
          projects: metadata.projects || []
        });
      } else {
        console.log('No portfolio data found, using default projects');
        const defaultProjects = getDefaultProjects();
        setContent({
          title: 'Portfolio Proyek Terbaik',
          description: 'Lihat hasil karya terbaik kami dalam mengembangkan solusi AI dan aplikasi untuk berbagai industri.',
          projects: defaultProjects
        });
      }
    } catch (error) {
      console.error('Error fetching portfolio content:', error);
      
      const defaultProjects = getDefaultProjects();
      setContent({
        title: 'Portfolio Proyek Terbaik',
        description: 'Lihat hasil karya terbaik kami dalam mengembangkan solusi AI dan aplikasi untuk berbagai industri.',
        projects: defaultProjects
      });
      
      toast({
        title: "Info",
        description: "Menggunakan data portfolio default",
        variant: "default",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveContent = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "Anda harus login untuk menyimpan konten",
        variant: "destructive",
      });
      return;
    }
    
    setSaving(true);

    try {
      console.log('Saving portfolio content:', content);
      
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
      
      toast({
        title: "Berhasil",
        description: "Konten portfolio berhasil disimpan",
        variant: "success",
      });
    } catch (error) {
      console.error('Error saving portfolio content:', error);
      toast({
        title: "Error",
        description: "Gagal menyimpan konten portfolio",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `portfolio/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('portfolio-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('portfolio-images')
        .getPublicUrl(filePath);

      setFormProject({ ...formProject, image_url: urlData.publicUrl });
      
      toast({
        title: "Berhasil",
        description: "Gambar berhasil diupload",
        variant: "success",
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: "Gagal mengupload gambar",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFormProject({
      title: '',
      description: '',
      detailed_description: '',
      image_url: '',
      gallery_images: [],
      client: '',
      category: '',
      technologies: [],
      demo_url: '',
      github_url: '',
      project_duration: '',
      team_size: '',
      challenges: '',
      solutions: '',
      results: ''
    });
    setEditingIndex(null);
    setShowProjectForm(false);
  };

  const addProject = () => {
    resetForm();
    setShowProjectForm(true);
  };

  const editProject = (project: Project, index: number) => {
    setFormProject({ ...project });
    setEditingIndex(index);
    setShowProjectForm(true);
  };

  const deleteProject = (index: number) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus proyek ini?')) {
      const newProjects = content.projects.filter((_, i) => i !== index);
      setContent({ ...content, projects: newProjects });
      
      toast({
        title: "Berhasil",
        description: "Proyek berhasil dihapus",
        variant: "success",
      });
    }
  };

  const saveProject = () => {
    // Validasi form
    if (!formProject.title.trim()) {
      toast({
        title: "Error",
        description: "Judul proyek harus diisi",
        variant: "destructive",
      });
      return;
    }

    if (!formProject.description.trim()) {
      toast({
        title: "Error",
        description: "Deskripsi proyek harus diisi",
        variant: "destructive",
      });
      return;
    }

    const newProjects = [...content.projects];
    
    if (editingIndex !== null) {
      // Edit existing project
      newProjects[editingIndex] = { ...formProject };
      toast({
        title: "Berhasil",
        description: "Proyek berhasil diperbarui",
        variant: "success",
      });
    } else {
      // Add new project
      newProjects.push({ ...formProject });
      toast({
        title: "Berhasil",
        description: "Proyek berhasil ditambahkan",
        variant: "success",
      });
    }

    setContent({ ...content, projects: newProjects });
    resetForm();
  };

  const handleTechnologiesChange = (value: string) => {
    const technologies = value.split(',').map(tech => tech.trim()).filter(tech => tech);
    setFormProject({ ...formProject, technologies });
  };

  const renderProjectCard = (project: Project, index: number) => (
    <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-200 bg-white">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <CardTitle className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
              {project.title}
            </CardTitle>
            <CardDescription className="text-sm text-gray-600 line-clamp-2">
              {project.description}
            </CardDescription>
          </div>
          <div className="flex space-x-1 ml-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onProjectSelect?.(project)}
              className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editProject(project, index)}
              className="h-8 w-8 p-0 hover:bg-yellow-50 hover:text-yellow-600"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => deleteProject(index)}
              className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {project.image_url && (
          <div className="mb-4 rounded-lg overflow-hidden bg-gray-100">
            <img 
              src={project.image_url} 
              alt={project.title}
              className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}
        
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-gray-600">
              <Calendar className="h-4 w-4 mr-1" />
              <span>{project.project_duration || 'N/A'}</span>
            </div>
            <Badge variant="outline" className="text-xs">
              {project.category || 'Uncategorized'}
            </Badge>
          </div>
          
          {project.client && (
            <div className="flex items-center text-sm text-gray-600">
              <Users className="h-4 w-4 mr-1" />
              <span>Client: {project.client}</span>
            </div>
          )}
          
          {project.technologies && project.technologies.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {project.technologies.slice(0, 3).map((tech, techIndex) => (
                <Badge key={techIndex} variant="secondary" className="text-xs px-2 py-1">
                  {tech}
                </Badge>
              ))}
              {project.technologies.length > 3 && (
                <Badge variant="secondary" className="text-xs px-2 py-1">
                  +{project.technologies.length - 3} more
                </Badge>
              )}
            </div>
          )}
          
          <div className="flex justify-between items-center pt-2 border-t border-gray-100">
            <div className="flex space-x-2">
              {project.demo_url && (
                <Button variant="ghost" size="sm" className="h-8 px-2 text-blue-600 hover:bg-blue-50">
                  <Globe className="h-3 w-3 mr-1" />
                  <span className="text-xs">Demo</span>
                </Button>
              )}
              {project.github_url && (
                <Button variant="ghost" size="sm" className="h-8 px-2 text-gray-600 hover:bg-gray-50">
                  <Github className="h-3 w-3 mr-1" />
                  <span className="text-xs">Code</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderProjectForm = () => (
    <Card className="border-2 border-blue-200 bg-blue-50/30">
      <CardHeader>
        <CardTitle className="flex items-center text-blue-900">
          {editingIndex !== null ? <Edit className="h-5 w-5 mr-2" /> : <Plus className="h-5 w-5 mr-2" />}
          {editingIndex !== null ? 'Edit Project' : 'Add New Project'}
        </CardTitle>
        <CardDescription>
          {editingIndex !== null ? 'Update project details' : 'Create a new portfolio project'}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium text-gray-700">
              Project Title *
            </Label>
            <Input
              id="title"
              type="text"
              value={formProject.title}
              onChange={(e) => setFormProject({...formProject, title: e.target.value})}
              placeholder="Enter project title"
              className="border-gray-300 focus:border-blue-500"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium text-gray-700">
              Category
            </Label>
            <Input
              id="category"
              type="text"
              value={formProject.category}
              onChange={(e) => setFormProject({...formProject, category: e.target.value})}
              placeholder="e.g., Web Development, Mobile App"
              className="border-gray-300 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-medium text-gray-700">
            Short Description *
          </Label>
          <Textarea
            id="description"
            value={formProject.description}
            onChange={(e) => setFormProject({...formProject, description: e.target.value})}
            placeholder="Brief description of the project"
            rows={2}
            className="border-gray-300 focus:border-blue-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="detailed_description" className="text-sm font-medium text-gray-700">
            Detailed Description
          </Label>
          <Textarea
            id="detailed_description"
            value={formProject.detailed_description}
            onChange={(e) => setFormProject({...formProject, detailed_description: e.target.value})}
            placeholder="Comprehensive project description"
            rows={4}
            className="border-gray-300 focus:border-blue-500"
          />
        </div>

        {/* Project Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="client" className="text-sm font-medium text-gray-700">
              Client
            </Label>
            <Input
              id="client"
              type="text"
              value={formProject.client}
              onChange={(e) => setFormProject({...formProject, client: e.target.value})}
              placeholder="Client name"
              className="border-gray-300 focus:border-blue-500"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="project_duration" className="text-sm font-medium text-gray-700">
              Duration
            </Label>
            <Input
              id="project_duration"
              type="text"
              value={formProject.project_duration}
              onChange={(e) => setFormProject({...formProject, project_duration: e.target.value})}
              placeholder="e.g., 3 months"
              className="border-gray-300 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="team_size" className="text-sm font-medium text-gray-700">
            Team Size
          </Label>
          <Input
            id="team_size"
            type="text"
            value={formProject.team_size}
            onChange={(e) => setFormProject({...formProject, team_size: e.target.value})}
            placeholder="e.g., 5 developers, 2 designers"
            className="border-gray-300 focus:border-blue-500"
          />
        </div>

        {/* Technologies */}
        <div className="space-y-2">
          <Label htmlFor="technologies" className="text-sm font-medium text-gray-700">
            Technologies Used
          </Label>
          <Input
            id="technologies"
            type="text"
            value={formProject.technologies.join(', ')}
            onChange={(e) => handleTechnologiesChange(e.target.value)}
            placeholder="React, Node.js, MongoDB (separate with commas)"
            className="border-gray-300 focus:border-blue-500"
          />
        </div>

        {/* URLs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="demo_url" className="text-sm font-medium text-gray-700 flex items-center">
              <Globe className="h-4 w-4 mr-1" />
              Demo URL
            </Label>
            <Input
              id="demo_url"
              type="url"
              value={formProject.demo_url || ''}
              onChange={(e) => setFormProject({...formProject, demo_url: e.target.value})}
              placeholder="https://demo.example.com"
              className="border-gray-300 focus:border-blue-500"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="github_url" className="text-sm font-medium text-gray-700 flex items-center">
              <Github className="h-4 w-4 mr-1" />
              GitHub URL
            </Label>
            <Input
              id="github_url"
              type="url"
              value={formProject.github_url || ''}
              onChange={(e) => setFormProject({...formProject, github_url: e.target.value})}
              placeholder="https://github.com/user/repo"
              className="border-gray-300 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Image Upload */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Project Image</Label>
          <div className="flex items-center space-x-2">
            <Input
              type="text"
              value={formProject.image_url}
              onChange={(e) => setFormProject({...formProject, image_url: e.target.value})}
              placeholder="Image URL or upload file"
              className="flex-1 border-gray-300 focus:border-blue-500"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading}
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) handleImageUpload(file);
                };
                input.click();
              }}
            >
              {uploading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
            </Button>
          </div>
          {formProject.image_url && (
            <div className="mt-2 border rounded-lg p-2 bg-gray-50">
              <img 
                src={formProject.image_url} 
                alt="Project preview"
                className="max-h-32 max-w-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}
        </div>

        {/* Project Challenges & Solutions */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="challenges" className="text-sm font-medium text-gray-700 flex items-center">
              <Target className="h-4 w-4 mr-1" />
              Challenges
            </Label>
            <Textarea
              id="challenges"
              value={formProject.challenges}
              onChange={(e) => setFormProject({...formProject, challenges: e.target.value})}
              placeholder="What challenges did you face during this project?"
              rows={3}
              className="border-gray-300 focus:border-blue-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="solutions" className="text-sm font-medium text-gray-700 flex items-center">
              <Lightbulb className="h-4 w-4 mr-1" />
              Solutions
            </Label>
            <Textarea
              id="solutions"
              value={formProject.solutions}
              onChange={(e) => setFormProject({...formProject, solutions: e.target.value})}
              placeholder="How did you solve the challenges?"
              rows={3}
              className="border-gray-300 focus:border-blue-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="results" className="text-sm font-medium text-gray-700 flex items-center">
              <TrendingUp className="h-4 w-4 mr-1" />
              Results & Impact
            </Label>
            <Textarea
              id="results"
              value={formProject.results}
              onChange={(e) => setFormProject({...formProject, results: e.target.value})}
              placeholder="What were the outcomes and impact of the project?"
              rows={3}
              className="border-gray-300 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={resetForm}
            className="flex items-center"
          >
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
          <Button
            onClick={saveProject}
            disabled={saving || !formProject.title || !formProject.description}
            className="bg-blue-600 hover:bg-blue-700 flex items-center"
          >
            {saving ? (
              <>
                <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-1" />
                {editingIndex !== null ? 'Update Project' : 'Save Project'}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (!user) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Login Diperlukan</h3>
        <p className="text-gray-500">Anda harus login untuk mengelola portfolio</p>
      </div>
    );
  }

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
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Kelola Portfolio</h2>
          <p className="text-gray-600 mt-1">Total proyek: {content.projects.length}</p>
        </div>
        <div className="flex space-x-3">
          <Button
            onClick={saveContent}
            disabled={saving}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </Button>
        </div>
      </div>

      {/* Header Content */}
      <Card>
        <CardHeader>
          <CardTitle>Konten Header Portfolio</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Judul</label>
            <input
              type="text"
              value={content.title}
              onChange={(e) => setContent({ ...content, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Masukkan judul portfolio"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi</label>
            <Textarea
              value={content.description}
              onChange={(e) => setContent({ ...content, description: e.target.value })}
              rows={3}
              className="w-full"
              placeholder="Masukkan deskripsi portfolio"
            />
          </div>
        </CardContent>
      </Card>

      {/* Projects Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Daftar Proyek Portfolio</CardTitle>
          <Button
            onClick={addProject}
            className="bg-green-600 text-white hover:bg-green-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Tambah Proyek
          </Button>
        </CardHeader>
        <CardContent>
          {content.projects.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Belum Ada Proyek</h3>
              <p className="text-gray-500 mb-4">Mulai dengan menambahkan proyek portfolio pertama Anda</p>
              <Button onClick={addProject} className="bg-blue-600 text-white hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Tambah Proyek Pertama
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {content.projects.map((project, index) => renderProjectCard(project, index))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Project Form Modal */}
      {showProjectForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {renderProjectForm()}
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioManager;
