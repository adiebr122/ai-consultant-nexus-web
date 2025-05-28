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
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [newProject, setNewProject] = useState<Project>({
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
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);

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
    },
    {
      title: 'Mobile App Ride Sharing',
      description: 'Aplikasi ride sharing dengan AI route optimization yang mengurangi waktu tempuh hingga 25%.',
      detailed_description: 'Aplikasi mobile ride sharing dengan teknologi GPS tracking real-time, sistem matching driver-passenger otomatis, dan algoritma optimasi rute berbasis AI untuk efisiensi maksimal.',
      image_url: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      gallery_images: [
        'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      ],
      client: 'Gojek Indonesia',
      category: 'Mobile App',
      technologies: ['React Native', 'Python', 'Machine Learning', 'Google Maps API', 'Firebase'],
      demo_url: 'https://demo.example.com/ridesharing',
      project_duration: '10 bulan',
      team_size: '15 developer, 4 mobile specialist, 2 ML engineer',
      challenges: 'Mengoptimalkan algoritma matching dan routing dalam kondisi traffic padat serta memastikan akurasi lokasi yang presisi.',
      solutions: 'Pengembangan algoritma machine learning untuk prediksi traffic pattern dan implementasi GPS correction algorithm untuk akurasi lokasi.',
      results: 'Pengurangan waktu tunggu driver rata-rata 30% dan efisiensi rute yang menghemat waktu tempuh hingga 25%.'
    },
    {
      title: 'Sistem Manajemen Rumah Sakit',
      description: 'Platform terintegrasi untuk manajemen rumah sakit dengan fitur AI diagnosis support dan electronic medical records.',
      detailed_description: 'Sistem informasi rumah sakit komprehensif yang mengintegrasikan manajemen pasien, jadwal dokter, billing system, dan fitur AI assistant untuk membantu diagnosis awal berdasarkan gejala yang diinput.',
      image_url: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      gallery_images: [
        'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      ],
      client: 'RS Siloam',
      category: 'Healthcare System',
      technologies: ['Vue.js', 'Laravel', 'MySQL', 'AI/ML', 'HL7 FHIR', 'Docker'],
      demo_url: 'https://demo.example.com/hospital',
      project_duration: '12 bulan',
      team_size: '20 developer, 5 healthcare specialist, 3 security expert',
      challenges: 'Memastikan keamanan data kesehatan sesuai standar internasional dan integrasi dengan berbagai medical devices.',
      solutions: 'Implementasi enkripsi tingkat enterprise, audit trail system, dan standardisasi HL7 FHIR untuk interoperability.',
      results: 'Efisiensi operasional rumah sakit meningkat 60% dengan pengurangan waktu administrasi dan peningkatan akurasi diagnosis.'
    },
    {
      title: 'Smart City Dashboard',
      description: 'Dashboard analitik real-time untuk monitoring dan manajemen kota cerdas dengan IoT integration.',
      detailed_description: 'Platform dashboard yang mengintegrasikan data dari berbagai sensor IoT di seluruh kota untuk monitoring traffic, kualitas udara, konsumsi energi, dan layanan publik dalam satu interface yang komprehensif.',
      image_url: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      gallery_images: [
        'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      ],
      client: 'Pemerintah DKI Jakarta',
      category: 'IoT & Analytics',
      technologies: ['Angular', 'Spring Boot', 'Apache Kafka', 'Elasticsearch', 'Grafana', 'IoT Sensors'],
      demo_url: 'https://demo.example.com/smartcity',
      project_duration: '15 bulan',
      team_size: '25 developer, 5 IoT specialist, 3 data scientist',
      challenges: 'Mengintegrasikan data dari ribuan sensor dengan protokol berbeda dan memastikan real-time processing untuk data yang massive.',
      solutions: 'Arsitektur event-driven dengan Apache Kafka untuk data streaming dan implementasi data lake untuk storage dan analytics.',
      results: 'Peningkatan efisiensi traffic management 35% dan respons time emergency services berkurang 40%.'
    },
    {
      title: 'Financial Trading Platform',
      description: 'Platform trading online dengan algoritma AI untuk analisis pasar dan automated trading strategies.',
      detailed_description: 'Platform trading saham dan cryptocurrency dengan fitur real-time market data, technical analysis tools, dan algoritma machine learning untuk prediksi trend pasar dan automated trading.',
      image_url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      gallery_images: [
        'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      ],
      client: 'PT Indo Premier Sekuritas',
      category: 'Fintech',
      technologies: ['React', 'Python', 'TensorFlow', 'WebSocket', 'Redis', 'PostgreSQL'],
      demo_url: 'https://demo.example.com/trading',
      project_duration: '9 bulan',
      team_size: '18 developer, 4 financial analyst, 3 ML engineer',
      challenges: 'Memproses data market real-time dengan latency rendah dan memastikan keamanan transaksi finansial tingkat bank.',
      solutions: 'Implementasi low-latency architecture dengan WebSocket connections and multi-layer security with 2FA and biometric authentication.',
      results: 'Platform mampu memproses 50,000+ transaksi per detik dengan latency rata-rata 10ms and 99.99% security.'
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
        // Jika tidak ada data admin, gunakan data default
        const defaultProjects = getDefaultProjects();
        setContent({
          title: 'Portfolio Proyek Terbaik',
          description: 'Lihat hasil karya terbaik kami dalam mengembangkan solusi AI dan aplikasi untuk berbagai industri.',
          projects: defaultProjects
        });
        
        // Simpan data default ke database
        await saveDefaultContent(defaultProjects);
      }
    } catch (error) {
      console.error('Error fetching portfolio content:', error);
      
      // Fallback ke data default jika ada error
      const defaultProjects = getDefaultProjects();
      setContent({
        title: 'Portfolio Proyek Terbaik',
        description: 'Lihat hasil karya terbaik kami dalam mengembangkan solusi AI dan aplikasi untuk berbagai industri.',
        projects: defaultProjects
      });
      
      toast({
        title: "Info",
        description: "Menggunakan data portfolio default",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveDefaultContent = async (defaultProjects: Project[]) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('website_content')
        .upsert({
          section: 'portfolio',
          title: 'Portfolio Proyek Terbaik',
          content: 'Lihat hasil karya terbaik kami dalam mengembangkan solusi AI dan aplikasi untuk berbagai industri.',
          metadata: { projects: defaultProjects } as any,
          user_id: user.id,
          is_active: true
        }, {
          onConflict: 'section,user_id'
        });

      if (error) {
        console.error('Error saving default content:', error);
      } else {
        console.log('Default portfolio content saved successfully');
      }
    } catch (error) {
      console.error('Error saving default content:', error);
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

      setNewProject({ ...newProject, image_url: urlData.publicUrl });
      
      toast({
        title: "Berhasil",
        description: "Gambar berhasil diupload",
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

  const addProject = () => {
    setEditingProject({
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
    setShowProjectForm(true);
  };

  const editProject = (project: Project, index: number) => {
    setEditingProject({ ...project, id: index.toString() });
    setShowProjectForm(true);
  };

  const deleteProject = (index: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus proyek ini?')) {
      const newProjects = content.projects.filter((_, i) => i !== index);
      setContent({ ...content, projects: newProjects });
      toast({
        title: "Berhasil",
        description: "Proyek berhasil dihapus",
      });
    }
  };

  const saveProject = () => {
    if (!editingProject) return;

    // Validasi form
    if (!editingProject.title.trim()) {
      toast({
        title: "Error",
        description: "Judul proyek harus diisi",
        variant: "destructive",
      });
      return;
    }

    if (!editingProject.description.trim()) {
      toast({
        title: "Error",
        description: "Deskripsi proyek harus diisi",
        variant: "destructive",
      });
      return;
    }

    if (!editingProject.client.trim()) {
      toast({
        title: "Error",
        description: "Nama klien harus diisi",
        variant: "destructive",
      });
      return;
    }

    if (!editingProject.category.trim()) {
      toast({
        title: "Error",
        description: "Kategori proyek harus diisi",
        variant: "destructive",
      });
      return;
    }

    const newProjects = [...content.projects];
    
    if (editingProject.id && editingProject.id !== 'new') {
      const index = parseInt(editingProject.id);
      newProjects[index] = { ...editingProject };
      delete newProjects[index].id;
    } else {
      const { id, ...projectData } = editingProject;
      newProjects.push(projectData);
    }

    setContent({ ...content, projects: newProjects });
    setShowProjectForm(false);
    setEditingProject(null);
    
    toast({
      title: "Berhasil",
      description: "Proyek berhasil disimpan",
    });
  };

  const handleTechnologiesChange = (value: string) => {
    if (!editingProject) return;
    const technologies = value.split(',').map(tech => tech.trim()).filter(tech => tech);
    setEditingProject({ ...editingProject, technologies });
  };

  const removeGalleryImage = (index: number) => {
    if (!editingProject) return;
    const newGallery = editingProject.gallery_images.filter((_, i) => i !== index);
    setEditingProject({ ...editingProject, gallery_images: newGallery });
  };

  const handleEditProject = (index: number) => {
    setEditingIndex(index);
    setNewProject(content.projects[index]);
  };

  const handleDeleteProject = (index: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus proyek ini?')) {
      const newProjects = content.projects.filter((_, i) => i !== index);
      setContent({ ...content, projects: newProjects });
      toast({
        title: "Berhasil",
        description: "Proyek berhasil dihapus",
      });
    }
  };

  const handleSaveProject = () => {
    if (!newProject.title || !newProject.description) {
      toast({
        title: "Error",
        description: "Judul dan deskripsi proyek harus diisi",
        variant: "destructive",
      });
      return;
    }

    const newProjects = [...content.projects];
    newProjects.push(newProject);
    setContent({ ...content, projects: newProjects });
    setShowProjectForm(false);
    setNewProject({
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
    resetForm();
    toast({
      title: "Berhasil",
      description: "Proyek berhasil disimpan",
    });
  };

  const resetForm = () => {
    setNewProject({
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
              onClick={() => handleEditProject(index)}
              className="h-8 w-8 p-0 hover:bg-yellow-50 hover:text-yellow-600"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteProject(index)}
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
              value={newProject.title}
              onChange={(e) => setNewProject({...newProject, title: e.target.value})}
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
              value={newProject.category}
              onChange={(e) => setNewProject({...newProject, category: e.target.value})}
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
            value={newProject.description}
            onChange={(e) => setNewProject({...newProject, description: e.target.value})}
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
            value={newProject.detailed_description}
            onChange={(e) => setNewProject({...newProject, detailed_description: e.target.value})}
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
              value={newProject.client}
              onChange={(e) => setNewProject({...newProject, client: e.target.value})}
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
              value={newProject.project_duration}
              onChange={(e) => setNewProject({...newProject, project_duration: e.target.value})}
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
            value={newProject.team_size}
            onChange={(e) => setNewProject({...newProject, team_size: e.target.value})}
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
            value={newProject.technologies.join(', ')}
            onChange={(e) => setNewProject({
              ...newProject, 
              technologies: e.target.value.split(',').map(tech => tech.trim()).filter(tech => tech)
            })}
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
              value={newProject.demo_url || ''}
              onChange={(e) => setNewProject({...newProject, demo_url: e.target.value})}
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
              value={newProject.github_url || ''}
              onChange={(e) => setNewProject({...newProject, github_url: e.target.value})}
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
              value={newProject.image_url}
              onChange={(e) => setNewProject({...newProject, image_url: e.target.value})}
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
          {newProject.image_url && (
            <div className="mt-2 border rounded-lg p-2 bg-gray-50">
              <img 
                src={newProject.image_url} 
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
              value={newProject.challenges}
              onChange={(e) => setNewProject({...newProject, challenges: e.target.value})}
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
              value={newProject.solutions}
              onChange={(e) => setNewProject({...newProject, solutions: e.target.value})}
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
              value={newProject.results}
              onChange={(e) => setNewProject({...newProject, results: e.target.value})}
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
            onClick={() => {
              setEditingIndex(null);
              resetForm();
            }}
            className="flex items-center"
          >
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
          <Button
            onClick={handleSaveProject}
            disabled={saving || !newProject.title || !newProject.description}
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
              {content.projects.map((project, index) => (
                <div key={index} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                  {renderProjectCard(project, index)}
                </div>
              ))}
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
