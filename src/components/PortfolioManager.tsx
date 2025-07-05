
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Upload, 
  ExternalLink, 
  Calendar,
  Eye,
  Star,
  Image as ImageIcon
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

interface PortfolioItem {
  id: string;
  title: string;
  content: string;
  section: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
}

const PortfolioManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPortfolio, setEditingPortfolio] = useState<PortfolioItem | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    is_active: true
  });

  // Fetch portfolios from website_content table
  const { data: portfolios, isLoading } = useQuery({
    queryKey: ['portfolios'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('website_content')
        .select('*')
        .eq('section', 'portfolio')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });

  // Create portfolio mutation
  const createPortfolioMutation = useMutation({
    mutationFn: async (newPortfolio: typeof formData) => {
      const { error } = await supabase
        .from('website_content')
        .insert({
          title: newPortfolio.title,
          content: newPortfolio.content,
          section: 'portfolio',
          is_active: newPortfolio.is_active,
          user_id: user?.id
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolios'] });
      setIsModalOpen(false);
      resetForm();
      toast({
        title: "Berhasil",
        description: "Portfolio berhasil ditambahkan",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Update portfolio mutation
  const updatePortfolioMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<PortfolioItem> & { id: string }) => {
      const { error } = await supabase
        .from('website_content')
        .update({
          title: updates.title,
          content: updates.content,
          is_active: updates.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user?.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolios'] });
      setIsModalOpen(false);
      setEditingPortfolio(null);
      resetForm();
      toast({
        title: "Berhasil",
        description: "Portfolio berhasil diperbarui",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Delete portfolio mutation
  const deletePortfolioMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('website_content')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolios'] });
      toast({
        title: "Berhasil",
        description: "Portfolio berhasil dihapus",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      is_active: true
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "Nama project harus diisi",
        variant: "destructive",
      });
      return;
    }

    if (editingPortfolio) {
      updatePortfolioMutation.mutate({
        id: editingPortfolio.id,
        ...formData
      });
    } else {
      createPortfolioMutation.mutate(formData);
    }
  };

  const handleEdit = (portfolio: PortfolioItem) => {
    setEditingPortfolio(portfolio);
    setFormData({
      title: portfolio.title,
      content: portfolio.content,
      is_active: portfolio.is_active
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus portfolio ini?')) {
      deletePortfolioMutation.mutate(id);
    }
  };

  const openModal = () => {
    resetForm();
    setEditingPortfolio(null);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-500">Memuat portfolio...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Kelola Portfolio</h3>
          <p className="text-gray-600">Tambah, edit, dan kelola portfolio proyek Anda</p>
        </div>
        <Button
          onClick={openModal}
          className="flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Portfolio</span>
        </Button>
      </div>

      {/* Portfolio Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {portfolios?.map((portfolio) => (
          <div key={portfolio.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
              <ImageIcon className="h-16 w-16 text-gray-400" />
            </div>
            
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900 truncate">{portfolio.title}</h4>
                <div className="flex items-center space-x-1">
                  {portfolio.is_active ? (
                    <div className="w-2 h-2 bg-green-500 rounded-full" title="Aktif" />
                  ) : (
                    <div className="w-2 h-2 bg-gray-400 rounded-full" title="Nonaktif" />
                  )}
                </div>
              </div>
              
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {portfolio.content || 'Tidak ada deskripsi'}
              </p>
              
              <div className="flex items-center text-xs text-gray-500 mb-4">
                <Calendar className="h-3 w-3 mr-1" />
                <span>{new Date(portfolio.created_at).toLocaleDateString('id-ID')}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(portfolio)}
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                    title="Edit"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(portfolio.id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                    title="Hapus"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                
                <button className="text-xs text-gray-500 hover:text-blue-600 flex items-center">
                  <Eye className="h-3 w-3 mr-1" />
                  Preview
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {portfolios?.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <ImageIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Belum Ada Portfolio</h3>
          <p className="text-gray-600 mb-4">Mulai tambahkan portfolio proyek pertama Anda</p>
          <Button onClick={openModal}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Portfolio
          </Button>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                {editingPortfolio ? 'Edit Portfolio' : 'Tambah Portfolio'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Project *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Masukkan nama project"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deskripsi Project
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Deskripsikan project Anda..."
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="is_active" className="text-sm text-gray-700">
                    Tampilkan di website
                  </label>
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <Button 
                    type="submit" 
                    disabled={createPortfolioMutation.isPending || updatePortfolioMutation.isPending}
                    className="flex-1"
                  >
                    {editingPortfolio ? 'Perbarui' : 'Tambah'} Portfolio
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1"
                  >
                    Batal
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioManager;
