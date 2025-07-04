
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  MessageSquare, 
  Eye, 
  Trash2, 
  Mail, 
  Phone, 
  User, 
  Building, 
  Calendar,
  Search,
  Filter,
  MoreHorizontal,
  Check,
  X,
  Clock,
  Star,
  Archive,
  ExternalLink,
  Download,
  RefreshCw,
  MapPin,
  Tag,
  MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';

interface FormSubmission {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  service: string;
  message: string;
  form_type: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const FormSubmissions = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchSubmissions();
    }
  }, [user]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      // Use website_content table temporarily for form submissions
      const { data, error } = await supabase
        .from('website_content')
        .select('*')
        .eq('section', 'contact_form')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform data to match FormSubmission structure
      const transformedData = (data || []).map(item => ({
        id: item.id,
        name: item.title || 'Unknown',
        email: 'contact@example.com', // Default email
        phone: '',
        company: '',
        service: '',
        message: item.content || '',
        form_type: 'contact',
        status: 'new',
        created_at: item.created_at,
        updated_at: item.updated_at
      }));
      
      setSubmissions(transformedData);
    } catch (error: any) {
      console.error('Error fetching submissions:', error);
      toast({
        title: "Info",
        description: "Fitur form submissions akan tersedia setelah konfigurasi database selesai",
      });
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  const updateSubmissionStatus = async (id: string, status: string) => {
    try {
      // Temporary implementation - show success message but don't actually update
      toast({
        title: "Info",
        description: "Fitur update status akan tersedia setelah konfigurasi database selesai",
      });
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Gagal mengubah status submission",
        variant: "destructive",
      });
    }
  };

  const deleteSubmission = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus submission ini?')) return;

    try {
      setDeleting(id);
      toast({
        title: "Info",
        description: "Fitur hapus akan tersedia setelah konfigurasi database selesai",
      });
    } catch (error: any) {
      console.error('Error deleting submission:', error);
      toast({
        title: "Error",
        description: "Gagal menghapus submission",
        variant: "destructive",
      });
    } finally {
      setDeleting(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'archived': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return <Clock className="h-3 w-3" />;
      case 'in_progress': return <RefreshCw className="h-3 w-3" />;
      case 'completed': return <Check className="h-3 w-3" />;
      case 'archived': return <Archive className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  const filteredSubmissions = submissions.filter(submission => {
    const matchesSearch = 
      submission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || submission.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Company', 'Service', 'Status', 'Created At'];
    const csvContent = [
      headers.join(','),
      ...filteredSubmissions.map(sub => [
        sub.name,
        sub.email,
        sub.phone || '',
        sub.company || '',
        sub.service || '',
        sub.status,
        new Date(sub.created_at).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `form-submissions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Login Diperlukan</h3>
        <p className="text-gray-500">Anda harus login untuk melihat form submissions</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center">
          <MessageSquare className="h-5 w-5 text-blue-600 mr-2" />
          <p className="text-blue-800 text-sm">
            <strong>Info:</strong> Modul Form Submissions sedang dalam tahap konfigurasi. Fitur lengkap akan tersedia setelah setup database selesai.
          </p>
        </div>
      </div>

      {/* Header */}
      <Card className="border-0 shadow-xl bg-gradient-to-r from-purple-500 to-blue-600 text-white">
        <CardHeader className="pb-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl font-bold flex items-center mb-2">
                <MessageSquare className="h-8 w-8 mr-3 text-purple-200" />
                Form Submissions
              </CardTitle>
              <CardDescription className="text-purple-100 text-lg">
                Kelola dan pantau semua form submission dari website
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold">{submissions.length}</div>
              <div className="text-purple-200">Total Submissions</div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Filters and Actions */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-1 gap-4 items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Cari nama, email, perusahaan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-2 border-gray-200 focus:border-purple-500"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48 border-2 border-gray-200 focus:border-purple-500">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="new">Baru</SelectItem>
                  <SelectItem value="in_progress">Dalam Proses</SelectItem>
                  <SelectItem value="completed">Selesai</SelectItem>
                  <SelectItem value="archived">Arsip</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={exportToCSV}
                variant="outline"
                className="flex items-center gap-2 border-2 border-gray-200 hover:border-purple-500"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
              
              <Button
                onClick={fetchSubmissions}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submissions List */}
      <div className="grid gap-6">
        {filteredSubmissions.length === 0 ? (
          <Card className="border-2 border-dashed border-gray-200">
            <CardContent className="py-12 text-center">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {submissions.length === 0 ? 'Belum Ada Submission' : 'Tidak Ada Hasil'}
              </h3>
              <p className="text-gray-500">
                {submissions.length === 0 
                  ? 'Form submissions akan muncul di sini setelah pengunjung mengisi form' 
                  : 'Coba ubah filter atau kata kunci pencarian'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredSubmissions.map((submission) => (
            <Card key={submission.id} className="border-2 border-gray-100 hover:border-purple-200 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <h3 className="text-xl font-bold text-gray-900">{submission.name}</h3>
                      <Badge className={`flex items-center gap-1 ${getStatusColor(submission.status)}`}>
                        {getStatusIcon(submission.status)}
                        {submission.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {submission.form_type}
                      </Badge>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center text-gray-600">
                        <Mail className="h-4 w-4 mr-2 text-purple-500" />
                        <a href={`mailto:${submission.email}`} className="hover:text-purple-600 transition-colors">
                          {submission.email}
                        </a>
                      </div>
                      
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-4 w-4 mr-2 text-orange-500" />
                        {new Date(submission.created_at).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-700 leading-relaxed">{submission.message}</p>
                    </div>
                  </div>

                  <div className="ml-6 flex flex-col gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Detail
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full">
                          <MoreHorizontal className="h-4 w-4 mr-1" />
                          Actions
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white border shadow-lg">
                        <DropdownMenuItem onClick={() => updateSubmissionStatus(submission.id, 'new')}>
                          <Clock className="h-4 w-4 mr-2" />
                          Mark as New
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateSubmissionStatus(submission.id, 'completed')}>
                          <Check className="h-4 w-4 mr-2" />
                          Mark Complete
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => deleteSubmission(submission.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          disabled={deleting === submission.id}
                        >
                          {deleting === submission.id ? (
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4 mr-2" />
                          )}
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default FormSubmissions;
