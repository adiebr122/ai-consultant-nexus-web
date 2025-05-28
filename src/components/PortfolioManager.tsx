import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Upload, Save, X, ExternalLink, Github, Image, FileText, Eye, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

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
      solutions: 'Implementasi low-latency architecture dengan WebSocket connections dan multi-layer security with 2FA and biometric authentication.',
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

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, field: 'image_url' | 'gallery') => {
    const file = event.target.files?.[0];
    if (!file || !editingProject) return;

    setUploadingImage(true);
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

      if (field === 'image_url') {
        setEditingProject({ ...editingProject, image_url: urlData.publicUrl });
      } else {
        const newGallery = [...(editingProject.gallery_images || []), urlData.publicUrl];
        setEditingProject({ ...editingProject, gallery_images: newGallery });
      }
      
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
      setUploadingImage(false);
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
                  <div className="relative">
                    <img 
                      src={project.image_url} 
                      alt={project.title}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
                      }}
                    />
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold mb-1 text-gray-900">{project.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">{project.client}</p>
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mb-2">
                      {project.category}
                    </span>
                    <p className="text-sm text-gray-700 mb-3 line-clamp-2">{project.description}</p>
                    
                    {/* Technology tags */}
                    {project.technologies && project.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {project.technologies.slice(0, 3).map((tech, techIndex) => (
                          <span key={techIndex} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            {tech}
                          </span>
                        ))}
                        {project.technologies.length > 3 && (
                          <span className="text-xs text-gray-500">+{project.technologies.length - 3}</span>
                        )}
                      </div>
                    )}
                    
                    {/* Status indicators */}
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex space-x-2">
                        {project.demo_url && (
                          <ExternalLink className="h-4 w-4 text-blue-600" title="Demo tersedia" />
                        )}
                        {project.github_url && (
                          <Github className="h-4 w-4 text-gray-600" title="GitHub tersedia" />
                        )}
                        {(project.gallery_images?.length > 0) && (
                          <Image className="h-4 w-4 text-purple-600" title="Galeri tersedia" />
                        )}
                        {project.detailed_description && (
                          <FileText className="h-4 w-4 text-green-600" title="Detail lengkap tersedia" />
                        )}
                      </div>
                    </div>
                    
                    {/* Action buttons */}
                    <div className="flex justify-between items-center">
                      <div className="flex space-x-2">
                        {onProjectSelect && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onProjectSelect(project)}
                            className="text-green-600 border-green-600 hover:bg-green-50"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Preview
                          </Button>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => editProject(project, index)}
                          className="text-blue-600 border-blue-600 hover:bg-blue-50"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteProject(index)}
                          className="text-red-600 border-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Project Form Modal */}
      {showProjectForm && editingProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white z-10 p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                {editingProject.id && editingProject.id !== 'new' ? 'Edit Proyek' : 'Tambah Proyek Baru'}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowProjectForm(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="p-6">
              <div className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h4 className="font-semibold text-blue-600 mb-4 flex items-center gap-2">
                    <FileText className="h-4 w-4" /> Informasi Dasar
                  </h4>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Judul Proyek <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={editingProject.title}
                        onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Masukkan judul proyek"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Klien <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={editingProject.client}
                        onChange={(e) => setEditingProject({ ...editingProject, client: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Nama klien"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Deskripsi Singkat <span className="text-red-500">*</span>
                    </label>
                    <Textarea
                      value={editingProject.description}
                      onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                      placeholder="Deskripsi singkat proyek (1-2 kalimat)"
                      className="w-full"
                      rows={3}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kategori <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={editingProject.category}
                        onChange={(e) => setEditingProject({ ...editingProject, category: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Contoh: AI Chatbot, Mobile App"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Durasi Proyek</label>
                      <input
                        type="text"
                        value={editingProject.project_duration}
                        onChange={(e) => setEditingProject({ ...editingProject, project_duration: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Contoh: 3 bulan, Jan-Mar 2023"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Teknologi (pisahkan dengan koma)</label>
                    <input
                      type="text"
                      value={editingProject.technologies.join(', ')}
                      onChange={(e) => handleTechnologiesChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="React, Python, TensorFlow, Node.js"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">URL Demo (opsional)</label>
                      <input
                        type="url"
                        value={editingProject.demo_url || ''}
                        onChange={(e) => setEditingProject({ ...editingProject, demo_url: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="https://demo.example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">URL GitHub (opsional)</label>
                      <input
                        type="url"
                        value={editingProject.github_url || ''}
                        onChange={(e) => setEditingProject({ ...editingProject, github_url: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="https://github.com/username/repo"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ukuran Tim</label>
                    <input
                      type="text"
                      value={editingProject.team_size || ''}
                      onChange={(e) => setEditingProject({ ...editingProject, team_size: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Contoh: 5 developer, 1 designer, 1 project manager"
                    />
                  </div>
                </div>

                {/* Images Section */}
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="font-semibold text-blue-600 mb-4 flex items-center gap-2">
                    <Image className="h-4 w-4" /> Gambar
                  </h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gambar Utama Proyek
                      </label>
                      {editingProject.image_url && (
                        <div className="mb-4 relative w-40 h-40">
                          <img 
                            src={editingProject.image_url} 
                            alt="Project thumbnail" 
                            className="w-full h-full object-cover rounded-md border border-gray-200"
                          />
                        </div>
                      )}
                      <div className="flex items-center space-x-2">
                        <label className="cursor-pointer bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded-lg border border-blue-200">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleImageUpload(e, 'image_url')}
                            disabled={uploadingImage}
                          />
                          <span className="flex items-center">
                            <Upload className="h-4 w-4 mr-2" />
                            {uploadingImage ? 'Mengupload...' : 'Upload Gambar'}
                          </span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Galeri Gambar
                      </label>
                      {editingProject.gallery_images && editingProject.gallery_images.length > 0 && (
                        <div className="grid grid-cols-3 gap-4 mb-4">
                          {editingProject.gallery_images.map((img, idx) => (
                            <div key={idx} className="relative">
                              <img
                                src={img}
                                alt={`Gallery ${idx + 1}`}
                                className="w-full h-32 object-cover rounded-md border border-gray-200"
                              />
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => removeGalleryImage(idx)}
                                className="absolute top-2 right-2 h-6 w-6 p-0"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center space-x-2">
                        <label className="cursor-pointer bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded-lg border border-blue-200">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleImageUpload(e, 'gallery')}
                            disabled={uploadingImage}
                          />
                          <span className="flex items-center">
                            <Upload className="h-4 w-4 mr-2" />
                            {uploadingImage ? 'Mengupload...' : 'Tambah Gambar Galeri'}
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detailed Information */}
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="font-semibold text-blue-600 mb-4 flex items-center gap-2">
                    <FileText className="h-4 w-4" /> Informasi Detail (untuk halaman detail proyek)
                  </h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Deskripsi Detail
                      </label>
                      <Textarea
                        value={editingProject.detailed_description || ''}
                        onChange={(e) => setEditingProject({ ...editingProject, detailed_description: e.target.value })}
                        placeholder="Deskripsi komprehensif tentang proyek"
                        className="w-full min-h-[150px]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tantangan
                      </label>
                      <Textarea
                        value={editingProject.challenges || ''}
                        onChange={(e) => setEditingProject({ ...editingProject, challenges: e.target.value })}
                        placeholder="Tantangan teknis atau proyek yang dihadapi"
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Solusi
                      </label>
                      <Textarea
                        value={editingProject.solutions || ''}
                        onChange={(e) => setEditingProject({ ...editingProject, solutions: e.target.value })}
                        placeholder="Bagaimana tantangan diatasi"
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hasil
                      </label>
                      <Textarea
                        value={editingProject.results || ''}
                        onChange={(e) => setEditingProject({ ...editingProject, results: e.target.value })}
                        placeholder="Hasil dan dampak dari proyek"
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <Button
                    variant="outline"
                    onClick={() => setShowProjectForm(false)}
                  >
                    Batal
                  </Button>
                  <Button
                    onClick={saveProject}
                    className="bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Simpan Proyek
                  </Button>
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
