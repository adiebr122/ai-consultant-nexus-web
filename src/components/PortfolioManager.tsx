
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Upload, Save, X, ExternalLink, Github, Image, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

const PortfolioManager = () => {
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

  const fetchContent = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('website_content')
        .select('*')
        .eq('section', 'portfolio')
        .eq('user_id', user.id)
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
      toast({
        title: "Error",
        description: "Gagal memuat konten portfolio",
        variant: "destructive",
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
        <h2 className="text-2xl font-bold text-gray-900">Kelola Portfolio</h2>
        <button
          onClick={saveContent}
          disabled={saving}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          <span>{saving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
        </button>
      </div>

      {/* Header Content */}
      <Card>
        <CardHeader>
          <CardTitle>Konten Header</CardTitle>
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
          <CardTitle>Proyek</CardTitle>
          <button
            onClick={addProject}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Proyek</span>
          </button>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {content.projects.map((project, index) => (
              <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
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
                  <h4 className="font-semibold mb-1">{project.title}</h4>
                  <p className="text-sm text-gray-600 mb-2">{project.client}</p>
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mb-2">
                    {project.category}
                  </span>
                  <p className="text-sm text-gray-700 mb-3 line-clamp-2">{project.description}</p>
                  {project.detailed_description && (
                    <div className="mb-3">
                      <span className="text-xs text-green-600 font-medium">
                        Deskripsi detail tersedia
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-2">
                      {project.demo_url && (
                        <ExternalLink className="h-4 w-4 text-blue-600" />
                      )}
                      {project.github_url && (
                        <Github className="h-4 w-4 text-gray-600" />
                      )}
                      {(project.gallery_images?.length > 0) && (
                        <Image className="h-4 w-4 text-purple-600" />
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
        </CardContent>
      </Card>

      {/* Project Form Modal */}
      {showProjectForm && editingProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white z-10 p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                {editingProject.id && editingProject.id !== 'new' ? 'Edit Proyek' : 'Tambah Proyek Baru'}
              </h3>
              <button
                onClick={() => setShowProjectForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="space-y-6">
                <h4 className="font-semibold text-blue-600 flex items-center gap-2">
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deskripsi Singkat <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    value={editingProject.description}
                    onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                    placeholder="Deskripsi singkat proyek (1-2 kalimat)"
                    className="w-full"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Teknologi (pisahkan dengan koma)</label>
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ukuran Tim</label>
                  <input
                    type="text"
                    value={editingProject.team_size || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, team_size: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Contoh: 5 developer, 1 designer, 1 project manager"
                  />
                </div>

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
                              <button
                                onClick={() => removeGalleryImage(idx)}
                                className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                              >
                                <X className="h-3 w-3" />
                              </button>
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

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowProjectForm(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Batal
                  </button>
                  <button
                    onClick={saveProject}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Simpan Proyek
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
