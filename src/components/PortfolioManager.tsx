
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Save, 
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { ProjectCard } from './portfolio/ProjectCard';
import { ProjectForm } from './portfolio/ProjectForm';
import { PortfolioHeader } from './portfolio/PortfolioHeader';

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
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
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
        variant: "default",
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
    console.log('Editing project at index:', index, project);
    setFormProject({ ...project });
    setEditingIndex(index);
    setShowProjectForm(true);
  };

  const deleteProject = (index: number) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus proyek ini?')) {
      console.log('Deleting project at index:', index);
      const newProjects = content.projects.filter((_, i) => i !== index);
      setContent({ ...content, projects: newProjects });
      
      toast({
        title: "Berhasil",
        description: "Proyek berhasil dihapus",
        variant: "default",
      });
    }
  };

  const saveProject = (project: Project) => {
    console.log('Saving project:', project);
    const newProjects = [...content.projects];
    
    if (editingIndex !== null) {
      console.log('Updating project at index:', editingIndex);
      newProjects[editingIndex] = { ...project };
      toast({
        title: "Berhasil",
        description: "Proyek berhasil diperbarui",
        variant: "default",
      });
    } else {
      console.log('Adding new project');
      newProjects.push({ ...project });
      toast({
        title: "Berhasil",
        description: "Proyek berhasil ditambahkan",
        variant: "default",
      });
    }

    setContent({ ...content, projects: newProjects });
    resetForm();
  };

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

      <PortfolioHeader
        title={content.title}
        description={content.description}
        onTitleChange={(title) => setContent({ ...content, title })}
        onDescriptionChange={(description) => setContent({ ...content, description })}
      />

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
              {content.projects.map((project, index) => (
                <ProjectCard
                  key={`${project.title}-${index}`}
                  project={project}
                  index={index}
                  onEdit={editProject}
                  onDelete={deleteProject}
                  onView={onProjectSelect}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {showProjectForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <ProjectForm
              project={formProject}
              isEditing={editingIndex !== null}
              onSave={saveProject}
              onCancel={resetForm}
              onChange={setFormProject}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioManager;
