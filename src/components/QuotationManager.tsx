import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  Eye, 
  Edit, 
  Trash2, 
  Plus, 
  Search,
  Mail
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import QuotationForm from './QuotationForm';
import QuotationView from './QuotationView';

interface Quotation {
  id: string;
  quotation_number: string;
  quotation_date: string;
  client_name: string;
  client_email: string;
  client_company: string;
  total_amount: number;
}

const QuotationManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState(false);
  const [view, setView] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);

  // Fetch quotations
  const { data: quotations = [], isLoading: quotationsLoading } = useQuery({
    queryKey: ['quotations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quotations')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Quotation[];
    },
    enabled: !!user
  });

  // Create quotation mutation
  const createQuotationMutation = useMutation({
    mutationFn: async (newQuotation: any) => {
      const { error } = await supabase
        .from('quotations')
        .insert(newQuotation);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      toast({
        title: "Berhasil",
        description: "Quotation berhasil dibuat",
      });
      setOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Gagal membuat quotation: " + error.message,
        variant: "destructive",
      });
    }
  });

  // Update quotation mutation
  const updateQuotationMutation = useMutation({
    mutationFn: async (updatedQuotation: any) => {
      const { error } = await supabase
        .from('quotations')
        .update(updatedQuotation)
        .eq('id', updatedQuotation.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      toast({
        title: "Berhasil",
        description: "Quotation berhasil diupdate",
      });
      setEdit(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Gagal mengupdate quotation: " + error.message,
        variant: "destructive",
      });
    }
  });

  // Delete quotation mutation
  const deleteQuotationMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('quotations')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      toast({
        title: "Berhasil",
        description: "Quotation berhasil dihapus",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Gagal menghapus quotation: " + error.message,
        variant: "destructive",
      });
    }
  });

  // Send quotation email mutation
  const sendQuotationEmailMutation = useMutation({
    mutationFn: async (quotationId: string) => {
      const response = await fetch('/functions/v1/send-quotation-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ quotationId })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send quotation email');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Email Terkirim",
        description: "Penawaran berhasil dikirim ke email klien dan admin",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Gagal mengirim email: " + error.message,
        variant: "destructive",
      });
    }
  });

  const handleCreate = () => {
    setSelectedQuotation(null);
    setOpen(true);
  };

  const handleEdit = (quotation: Quotation) => {
    setSelectedQuotation(quotation);
    setEdit(true);
  };

  const handleView = (quotation: Quotation) => {
    setSelectedQuotation(quotation);
    setView(true);
  };

  const handleDelete = (id: string) => {
    deleteQuotationMutation.mutate(id);
  };

  const handleSendEmail = (quotation: any) => {
    if (!quotation.client_email) {
      toast({
        title: "Error",
        description: "Email klien tidak tersedia",
        variant: "destructive",
      });
      return;
    }
    sendQuotationEmailMutation.mutate(quotation.id);
  };

  const filteredQuotations = quotations.filter(quotation =>
    quotation.quotation_number.toLowerCase().includes(search.toLowerCase()) ||
    quotation.client_name.toLowerCase().includes(search.toLowerCase()) ||
    quotation.client_email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Quotation Manager</h2>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Buat Quotation
        </Button>
      </div>
      <div className="flex items-center">
        <Input
          placeholder="Cari quotation..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">No. Quotation</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Nama Klien</TableHead>
              <TableHead>Email Klien</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quotationsLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">Loading...</TableCell>
              </TableRow>
            ) : filteredQuotations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">No quotations found.</TableCell>
              </TableRow>
            ) : (
              filteredQuotations.map((quotation) => (
                <TableRow key={quotation.id}>
                  <TableCell className="font-medium">{quotation.quotation_number}</TableCell>
                  <TableCell>{new Date(quotation.quotation_date).toLocaleDateString()}</TableCell>
                  <TableCell>{quotation.client_name}</TableCell>
                  <TableCell>{quotation.client_email}</TableCell>
                  <TableCell className="text-right">Rp {quotation.total_amount.toLocaleString()}</TableCell>
                  
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleView(quotation)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(quotation)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSendEmail(quotation)}
                      disabled={!quotation.client_email || sendQuotationEmailMutation.isPending}
                      title={!quotation.client_email ? "Email klien tidak tersedia" : "Kirim email penawaran"}
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(quotation.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modals */}
      <QuotationForm 
        open={open} 
        setOpen={setOpen} 
        mutation={createQuotationMutation}
        quotation={null}
      />
      <QuotationForm 
        open={edit} 
        setOpen={setEdit} 
        mutation={updateQuotationMutation}
        quotation={selectedQuotation}
      />
      <QuotationView 
        open={view} 
        setOpen={setView}
        quotation={selectedQuotation}
      />
    </div>
  );
};

export default QuotationManager;
