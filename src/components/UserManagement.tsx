
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Mail, 
  Phone, 
  Building, 
  User,
  Calendar,
  DollarSign,
  Tag,
  Clock,
  UserCheck,
  Search,
  Filter,
  MoreHorizontal,
  Star,
  TrendingUp,
  Archive,
  RefreshCw,
  Download,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';

interface UserRecord {
  id: string;
  admin_user_id: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  client_company: string;
  client_position: string;
  lead_status: string;
  lead_source: string;
  assigned_to: string;
  estimated_value: number;
  last_contact_date: string;
  next_follow_up: string;
  notes: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

const UserManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);
  const [showUserForm, setShowUserForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const [newUser, setNewUser] = useState<Partial<UserRecord>>({
    client_name: '',
    client_email: '',
    client_phone: '',
    client_company: '',
    client_position: '',
    lead_status: 'new',
    lead_source: '',
    estimated_value: 0,
    notes: '',
    tags: []
  });

  useEffect(() => {
    if (user) {
      fetchUsers();
    }
  }, [user]);

  const fetchUsers = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_management')
        .select('*')
        .eq('admin_user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveUser = async () => {
    if (!user) return;
    if (!newUser.client_name || !newUser.client_email) {
      toast({
        title: "Error",
        description: "Nama dan email client harus diisi",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      
      if (editingUser) {
        const { error } = await supabase
          .from('user_management')
          .update({
            ...newUser,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingUser.id);

        if (error) throw error;
        
        setUsers(prev => prev.map(u => 
          u.id === editingUser.id 
            ? { ...u, ...newUser, updated_at: new Date().toISOString() } as UserRecord
            : u
        ));
        
        toast({
          title: "Berhasil",
          description: "Data user berhasil diperbarui",
        });
      } else {
        const { data, error } = await supabase
          .from('user_management')
          .insert({
            ...newUser,
            admin_user_id: user.id
          })
          .select()
          .single();

        if (error) throw error;
        
        setUsers(prev => [data, ...prev]);
        
        toast({
          title: "Berhasil",
          description: "User baru berhasil ditambahkan",
        });
      }

      resetForm();
      setShowUserForm(false);
    } catch (error: any) {
      console.error('Error saving user:', error);
      toast({
        title: "Error",
        description: "Gagal menyimpan data user",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus user ini?')) return;

    try {
      setDeleting(id);
      const { error } = await supabase
        .from('user_management')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setUsers(prev => prev.filter(u => u.id !== id));
      
      toast({
        title: "Berhasil",
        description: "User berhasil dihapus",
      });
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: "Gagal menghapus user",
        variant: "destructive",
      });
    } finally {
      setDeleting(null);
    }
  };

  const resetForm = () => {
    setNewUser({
      client_name: '',
      client_email: '',
      client_phone: '',
      client_company: '',
      client_position: '',
      lead_status: 'new',
      lead_source: '',
      estimated_value: 0,
      notes: '',
      tags: []
    });
    setEditingUser(null);
  };

  const startEdit = (user: UserRecord) => {
    setEditingUser(user);
    setNewUser(user);
    setShowUserForm(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'contacted': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'qualified': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'proposal': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'negotiation': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'closed_won': return 'bg-green-100 text-green-800 border-green-200';
      case 'closed_lost': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.client_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.client_company?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || user.lead_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Company', 'Position', 'Status', 'Estimated Value', 'Created At'];
    const csvContent = [
      headers.join(','),
      ...filteredUsers.map(user => [
        user.client_name,
        user.client_email,
        user.client_phone || '',
        user.client_company || '',
        user.client_position || '',
        user.lead_status,
        user.estimated_value || 0,
        new Date(user.created_at).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `user-management-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Login Diperlukan</h3>
        <p className="text-gray-500">Anda harus login untuk mengelola users</p>
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
      {/* Header */}
      <Card className="border-0 shadow-xl bg-gradient-to-r from-purple-500 to-blue-600 text-white">
        <CardHeader className="pb-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl font-bold flex items-center mb-2">
                <Users className="h-8 w-8 mr-3 text-purple-200" />
                User Management
              </CardTitle>
              <CardDescription className="text-purple-100 text-lg">
                Kelola leads, clients, dan customer relationship
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold">{users.length}</div>
              <div className="text-purple-200">Total Users</div>
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
                  <SelectItem value="contacted">Dihubungi</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="proposal">Proposal</SelectItem>
                  <SelectItem value="negotiation">Negosiasi</SelectItem>
                  <SelectItem value="closed_won">Closed Won</SelectItem>
                  <SelectItem value="closed_lost">Closed Lost</SelectItem>
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
                onClick={() => {
                  resetForm();
                  setShowUserForm(true);
                }}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Tambah User
              </Button>
              
              <Button
                onClick={fetchUsers}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <div className="grid gap-6">
        {filteredUsers.length === 0 ? (
          <Card className="border-2 border-dashed border-gray-200">
            <CardContent className="py-12 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {users.length === 0 ? 'Belum Ada User' : 'Tidak Ada Hasil'}
              </h3>
              <p className="text-gray-500 mb-4">
                {users.length === 0 
                  ? 'Mulai dengan menambahkan user pertama' 
                  : 'Coba ubah filter atau kata kunci pencarian'
                }
              </p>
              {users.length === 0 && (
                <Button 
                  onClick={() => {
                    resetForm();
                    setShowUserForm(true);
                  }}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah User Pertama
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredUsers.map((user) => (
            <Card key={user.id} className="border-2 border-gray-100 hover:border-purple-200 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <h3 className="text-xl font-bold text-gray-900">{user.client_name}</h3>
                      <Badge className={`flex items-center gap-1 ${getStatusColor(user.lead_status)}`}>
                        {user.lead_status.replace('_', ' ').toUpperCase()}
                      </Badge>
                      {user.estimated_value > 0 && (
                        <Badge variant="outline" className="text-green-600 border-green-200">
                          <DollarSign className="h-3 w-3 mr-1" />
                          {new Intl.NumberFormat('id-ID', { 
                            style: 'currency', 
                            currency: 'IDR',
                            minimumFractionDigits: 0
                          }).format(user.estimated_value)}
                        </Badge>
                      )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center text-gray-600">
                        <Mail className="h-4 w-4 mr-2 text-purple-500" />
                        <a href={`mailto:${user.client_email}`} className="hover:text-purple-600 transition-colors">
                          {user.client_email}
                        </a>
                      </div>
                      
                      {user.client_phone && (
                        <div className="flex items-center text-gray-600">
                          <Phone className="h-4 w-4 mr-2 text-green-500" />
                          <a href={`tel:${user.client_phone}`} className="hover:text-green-600 transition-colors">
                            {user.client_phone}
                          </a>
                        </div>
                      )}
                      
                      {user.client_company && (
                        <div className="flex items-center text-gray-600">
                          <Building className="h-4 w-4 mr-2 text-blue-500" />
                          {user.client_company}
                          {user.client_position && (
                            <span className="ml-2 text-gray-500">• {user.client_position}</span>
                          )}
                        </div>
                      )}
                      
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-4 w-4 mr-2 text-orange-500" />
                        {new Date(user.created_at).toLocaleDateString('id-ID')}
                      </div>
                    </div>

                    {user.notes && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-gray-700 text-sm leading-relaxed">{user.notes}</p>
                      </div>
                    )}
                  </div>

                  <div className="ml-6 flex flex-col gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedUser(user)}
                          className="w-full"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Detail
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Detail User - {user.client_name}
                          </DialogTitle>
                          <DialogDescription>
                            Lead created on {new Date(user.created_at).toLocaleDateString('id-ID')}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 mt-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="font-semibold text-gray-700">Email:</label>
                              <p className="text-gray-600">{user.client_email}</p>
                            </div>
                            <div>
                              <label className="font-semibold text-gray-700">Phone:</label>
                              <p className="text-gray-600">{user.client_phone || 'N/A'}</p>
                            </div>
                            <div>
                              <label className="font-semibold text-gray-700">Company:</label>
                              <p className="text-gray-600">{user.client_company || 'N/A'}</p>
                            </div>
                            <div>
                              <label className="font-semibold text-gray-700">Position:</label>
                              <p className="text-gray-600">{user.client_position || 'N/A'}</p>
                            </div>
                            <div>
                              <label className="font-semibold text-gray-700">Lead Source:</label>
                              <p className="text-gray-600">{user.lead_source || 'N/A'}</p>
                            </div>
                            <div>
                              <label className="font-semibold text-gray-700">Estimated Value:</label>
                              <p className="text-gray-600">
                                {user.estimated_value > 0 
                                  ? new Intl.NumberFormat('id-ID', { 
                                      style: 'currency', 
                                      currency: 'IDR',
                                      minimumFractionDigits: 0
                                    }).format(user.estimated_value)
                                  : 'N/A'
                                }
                              </p>
                            </div>
                          </div>
                          {user.notes && (
                            <div>
                              <label className="font-semibold text-gray-700">Notes:</label>
                              <p className="text-gray-600 mt-2 p-4 bg-gray-50 rounded-lg">{user.notes}</p>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEdit(user)}
                      className="w-full"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteUser(user.id)}
                      disabled={deleting === user.id}
                      className="w-full text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                    >
                      {deleting === user.id ? (
                        <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 mr-1" />
                      )}
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* User Form Modal */}
      {showUserForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <Card className="border-0">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-t-xl">
                <CardTitle className="flex items-center">
                  {editingUser ? <Edit className="h-5 w-5 mr-2" /> : <Plus className="h-5 w-5 mr-2" />}
                  {editingUser ? 'Edit User' : 'Tambah User Baru'}
                </CardTitle>
                <CardDescription className="text-purple-100">
                  {editingUser ? 'Update informasi user' : 'Tambahkan user baru ke sistem'}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="client_name">Nama Lengkap *</Label>
                    <Input
                      id="client_name"
                      value={newUser.client_name || ''}
                      onChange={(e) => setNewUser({ ...newUser, client_name: e.target.value })}
                      placeholder="Nama lengkap client"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="client_email">Email *</Label>
                    <Input
                      id="client_email"
                      type="email"
                      value={newUser.client_email || ''}
                      onChange={(e) => setNewUser({ ...newUser, client_email: e.target.value })}
                      placeholder="email@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="client_phone">Nomor Telepon</Label>
                    <Input
                      id="client_phone"
                      value={newUser.client_phone || ''}
                      onChange={(e) => setNewUser({ ...newUser, client_phone: e.target.value })}
                      placeholder="+62 xxx xxxx xxxx"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="client_company">Perusahaan</Label>
                    <Input
                      id="client_company"
                      value={newUser.client_company || ''}
                      onChange={(e) => setNewUser({ ...newUser, client_company: e.target.value })}
                      placeholder="Nama perusahaan"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="client_position">Posisi</Label>
                    <Input
                      id="client_position"
                      value={newUser.client_position || ''}
                      onChange={(e) => setNewUser({ ...newUser, client_position: e.target.value })}
                      placeholder="CEO, Manager, etc."
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lead_status">Status Lead</Label>
                    <Select 
                      value={newUser.lead_status || 'new'} 
                      onValueChange={(value) => setNewUser({ ...newUser, lead_status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">Baru</SelectItem>
                        <SelectItem value="contacted">Dihubungi</SelectItem>
                        <SelectItem value="qualified">Qualified</SelectItem>
                        <SelectItem value="proposal">Proposal</SelectItem>
                        <SelectItem value="negotiation">Negosiasi</SelectItem>
                        <SelectItem value="closed_won">Closed Won</SelectItem>
                        <SelectItem value="closed_lost">Closed Lost</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="lead_source">Sumber Lead</Label>
                    <Input
                      id="lead_source"
                      value={newUser.lead_source || ''}
                      onChange={(e) => setNewUser({ ...newUser, lead_source: e.target.value })}
                      placeholder="Website, Referral, Social Media, etc."
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="estimated_value">Estimasi Nilai (IDR)</Label>
                    <Input
                      id="estimated_value"
                      type="number"
                      value={newUser.estimated_value || 0}
                      onChange={(e) => setNewUser({ ...newUser, estimated_value: Number(e.target.value) })}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Catatan</Label>
                  <Textarea
                    id="notes"
                    value={newUser.notes || ''}
                    onChange={(e) => setNewUser({ ...newUser, notes: e.target.value })}
                    placeholder="Catatan tambahan tentang client ini..."
                    rows={4}
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowUserForm(false);
                      resetForm();
                    }}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Batal
                  </Button>
                  <Button
                    onClick={saveUser}
                    disabled={saving || !newUser.client_name || !newUser.client_email}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    {saving ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-1" />
                        {editingUser ? 'Update User' : 'Simpan User'}
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
