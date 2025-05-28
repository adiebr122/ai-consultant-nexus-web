
import { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Mail, 
  Phone, 
  Building, 
  Calendar,
  Eye,
  MoreHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface UserData {
  id: string;
  client_name: string;
  client_email: string;
  client_phone?: string;
  client_company?: string;
  client_position?: string;
  lead_status?: string;
  lead_source?: string;
  estimated_value?: number;
  last_contact_date?: string;
  next_follow_up?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

const UserManagement = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [formData, setFormData] = useState({
    client_name: '',
    client_email: '',
    client_phone: '',
    client_company: '',
    client_position: '',
    lead_status: 'new',
    lead_source: '',
    estimated_value: '',
    notes: '',
    next_follow_up: ''
  });
  const { user } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_management')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userData = {
        ...formData,
        estimated_value: formData.estimated_value ? Number(formData.estimated_value) : null,
        admin_user_id: user?.id,
        last_contact_date: new Date().toISOString()
      };

      if (editingUser) {
        const { error } = await supabase
          .from('user_management')
          .update(userData)
          .eq('id', editingUser.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_management')
          .insert([userData]);
        if (error) throw error;
      }

      setIsDialogOpen(false);
      setEditingUser(null);
      resetForm();
      fetchUsers();
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const handleEdit = (user: UserData) => {
    setEditingUser(user);
    setFormData({
      client_name: user.client_name,
      client_email: user.client_email,
      client_phone: user.client_phone || '',
      client_company: user.client_company || '',
      client_position: user.client_position || '',
      lead_status: user.lead_status || 'new',
      lead_source: user.lead_source || '',
      estimated_value: user.estimated_value?.toString() || '',
      notes: user.notes || '',
      next_follow_up: user.next_follow_up ? user.next_follow_up.split('T')[0] : ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('user_management')
        .delete()
        .eq('id', userId);
      if (error) throw error;
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      client_name: '',
      client_email: '',
      client_phone: '',
      client_company: '',
      client_position: '',
      lead_status: 'new',
      lead_source: '',
      estimated_value: '',
      notes: '',
      next_follow_up: ''
    });
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.client_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.client_company && user.client_company.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || user.lead_status === statusFilter;
    const matchesSource = sourceFilter === 'all' || user.lead_source === sourceFilter;
    
    return matchesSearch && matchesStatus && matchesSource;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(filteredUsers.map(user => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers(prev => [...prev, userId]);
    } else {
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'contacted': return 'bg-yellow-100 text-yellow-800';
      case 'qualified': return 'bg-green-100 text-green-800';
      case 'proposal': return 'bg-purple-100 text-purple-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="h-64 bg-gray-100 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-gray-600">Kelola data pengguna dan prospek bisnis</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setEditingUser(null); }}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah User
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingUser ? 'Edit User' : 'Tambah User Baru'}</DialogTitle>
              <DialogDescription>
                {editingUser ? 'Perbarui informasi user' : 'Tambahkan user baru ke sistem'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="client_name">Nama Lengkap *</Label>
                  <Input
                    id="client_name"
                    value={formData.client_name}
                    onChange={(e) => setFormData({...formData, client_name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="client_email">Email *</Label>
                  <Input
                    id="client_email"
                    type="email"
                    value={formData.client_email}
                    onChange={(e) => setFormData({...formData, client_email: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="client_phone">Nomor Telepon</Label>
                  <Input
                    id="client_phone"
                    value={formData.client_phone}
                    onChange={(e) => setFormData({...formData, client_phone: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="client_company">Perusahaan</Label>
                  <Input
                    id="client_company"
                    value={formData.client_company}
                    onChange={(e) => setFormData({...formData, client_company: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="client_position">Posisi</Label>
                  <Input
                    id="client_position"
                    value={formData.client_position}
                    onChange={(e) => setFormData({...formData, client_position: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="lead_status">Status Lead</Label>
                  <Select value={formData.lead_status} onValueChange={(value) => setFormData({...formData, lead_status: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">Baru</SelectItem>
                      <SelectItem value="contacted">Telah Dihubungi</SelectItem>
                      <SelectItem value="qualified">Berkualitas</SelectItem>
                      <SelectItem value="proposal">Proposal</SelectItem>
                      <SelectItem value="closed">Ditutup</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="lead_source">Sumber Lead</Label>
                  <Input
                    id="lead_source"
                    value={formData.lead_source}
                    onChange={(e) => setFormData({...formData, lead_source: e.target.value})}
                    placeholder="Website, Referral, Social Media, dll"
                  />
                </div>
                <div>
                  <Label htmlFor="estimated_value">Estimasi Nilai (Rp)</Label>
                  <Input
                    id="estimated_value"
                    type="number"
                    value={formData.estimated_value}
                    onChange={(e) => setFormData({...formData, estimated_value: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="next_follow_up">Follow Up Berikutnya</Label>
                <Input
                  id="next_follow_up"
                  type="date"
                  value={formData.next_follow_up}
                  onChange={(e) => setFormData({...formData, next_follow_up: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="notes">Catatan</Label>
                <textarea
                  id="notes"
                  className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Tambahkan catatan tentang user ini..."
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Batal
                </Button>
                <Button type="submit">
                  {editingUser ? 'Update' : 'Simpan'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold">{users.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Mail className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Leads Baru</p>
              <p className="text-2xl font-bold">{users.filter(u => u.lead_status === 'new').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Phone className="h-8 w-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Dihubungi</p>
              <p className="text-2xl font-bold">{users.filter(u => u.lead_status === 'contacted').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Building className="h-8 w-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Qualified</p>
              <p className="text-2xl font-bold">{users.filter(u => u.lead_status === 'qualified').length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Cari nama, email, atau perusahaan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="new">Baru</SelectItem>
                <SelectItem value="contacted">Dihubungi</SelectItem>
                <SelectItem value="qualified">Qualified</SelectItem>
                <SelectItem value="proposal">Proposal</SelectItem>
                <SelectItem value="closed">Ditutup</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sumber" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Sumber</SelectItem>
                <SelectItem value="website">Website</SelectItem>
                <SelectItem value="referral">Referral</SelectItem>
                <SelectItem value="social_media">Social Media</SelectItem>
                <SelectItem value="email">Email</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Nama</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Perusahaan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Nilai Estimasi</TableHead>
              <TableHead>Tanggal Dibuat</TableHead>
              <TableHead className="w-12">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedUsers.includes(user.id)}
                    onCheckedChange={(checked) => handleSelectUser(user.id, checked as boolean)}
                  />
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{user.client_name}</div>
                    {user.client_position && (
                      <div className="text-sm text-gray-500">{user.client_position}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 text-gray-400 mr-2" />
                    {user.client_email}
                  </div>
                  {user.client_phone && (
                    <div className="flex items-center text-sm text-gray-500">
                      <Phone className="h-4 w-4 text-gray-400 mr-2" />
                      {user.client_phone}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {user.client_company || '-'}
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(user.lead_status || 'new')}`}>
                    {user.lead_status === 'new' ? 'Baru' :
                     user.lead_status === 'contacted' ? 'Dihubungi' :
                     user.lead_status === 'qualified' ? 'Qualified' :
                     user.lead_status === 'proposal' ? 'Proposal' :
                     user.lead_status === 'closed' ? 'Ditutup' : 'Baru'}
                  </span>
                </TableCell>
                <TableCell>
                  {formatCurrency(user.estimated_value)}
                </TableCell>
                <TableCell>
                  {formatDate(user.created_at)}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleEdit(user)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDelete(user.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Hapus
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {filteredUsers.length === 0 && (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada data</h3>
            <p className="text-gray-500">
              {searchTerm || statusFilter !== 'all' || sourceFilter !== 'all' 
                ? 'Tidak ada user yang sesuai dengan filter' 
                : 'Belum ada user yang terdaftar'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
