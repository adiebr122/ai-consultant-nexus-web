
import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ServiceFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingService?: {
    id: string;
    title: string;
    content: string;
    is_active: boolean;
  } | null;
}

const ServiceForm = ({ isOpen, onClose, editingService }: ServiceFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    is_active: true
  });

  useEffect(() => {
    if (editingService) {
      setFormData({
        title: editingService.title,
        content: editingService.content,
        is_active: editingService.is_active
      });
    } else {
      setFormData({
        title: '',
        content: '',
        is_active: true
      });
    }
  }, [editingService]);

  // Create service mutation
  const createServiceMutation = useMutation({
    mutationFn: async (newService: typeof formData) => {
      const { error } = await supabase
        .from('website_content')
        .insert({
          title: newService.title,
          content: newService.content,
          section: 'services',
          is_active: newService.is_active,
          user_id: user?.id
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      onClose();
      toast({
        title: "Berhasil",
        description: "Layanan berhasil ditambahkan",
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

  // Update service mutation
  const updateServiceMutation = useMutation({
    mutationFn: async (updates: typeof formData) => {
      if (!editingService) return;
      
      const { error } = await supabase
        .from('website_content')
        .update({
          title: updates.title,
          content: updates.content,
          is_active: updates.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingService.id)
        .eq('user_id', user?.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      onClose();
      toast({
        title: "Berhasil",
        description: "Layanan berhasil diperbarui",
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "Nama layanan harus diisi",
        variant: "destructive",
      });
      return;
    }

    if (editingService) {
      updateServiceMutation.mutate(formData);
    } else {
      createServiceMutation.mutate(formData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              {editingService ? 'Edit Layanan' : 'Tambah Layanan'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Layanan *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Masukkan nama layanan"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deskripsi Layanan
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Deskripsikan layanan Anda secara detail..."
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
                Tampilkan layanan ini di website
              </label>
            </div>
            
            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                disabled={createServiceMutation.isPending || updateServiceMutation.isPending}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {editingService ? 'Perbarui' : 'Tambah'} Layanan
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ServiceForm;
