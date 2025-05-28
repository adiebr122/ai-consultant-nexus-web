import { useState } from 'react';
import { 
  Users, 
  MessageSquare, 
  BarChart3, 
  Settings, 
  FileText, 
  Star,
  TrendingUp,
  Eye,
  Edit,
  Trash2,
  Plus,
  LogOut,
  Globe
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import CMSEditor from '@/components/CMSEditor';
import FormSubmissions from '@/components/FormSubmissions';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user, signOut } = useAuth();
  
  const [testimonials, setTestimonials] = useState([
    {
      id: 1,
      name: 'Budi Santoso',
      company: 'PT Telkom Indonesia',
      position: 'CEO',
      rating: 5,
      text: 'Visual Media X telah mentransformasi operasional kami dengan website dan aplikasi yang luar biasa.',
      status: 'published'
    },
    {
      id: 2,
      name: 'Sari Dewi',
      company: 'Bank Central Asia',
      position: 'Director of Digital Innovation',
      rating: 5,
      text: 'Implementasi sistem digital yang mereka kembangkan berhasil meningkatkan efisiensi hingga 60%.',
      status: 'published'
    }
  ]);

  const [services, setServices] = useState([
    {
      id: 1,
      title: 'Website Development',
      description: 'Pembuatan website profesional dengan teknologi terdepan',
      price: 'Mulai dari Rp 15.000.000',
      status: 'active'
    },
    {
      id: 2,
      title: 'Mobile App Development',
      description: 'Pengembangan aplikasi mobile Android dan iOS',
      price: 'Mulai dari Rp 25.000.000',
      status: 'active'
    }
  ]);

  const stats = [
    { title: 'Total Proyek', value: '156', change: '+12%', icon: FileText },
    { title: 'Klien Aktif', value: '89', change: '+8%', icon: Users },
    { title: 'Revenue Bulan Ini', value: 'Rp 2.1M', change: '+15%', icon: TrendingUp },
    { title: 'Rating Rata-rata', value: '4.9', change: '+0.1', icon: Star }
  ];

  const renderDashboard = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div key={index} className="bg-white p-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-green-600">{stat.change}</p>
                </div>
                <IconComponent className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Proyek Terbaru</h3>
          <div className="space-y-4">
            {[
              { client: 'Bank Mandiri', project: 'Corporate Website', status: 'In Progress', progress: 75 },
              { client: 'Telkomsel', project: 'Mobile App Development', status: 'Review', progress: 90 },
              { client: 'Indofood', project: 'E-commerce Platform', status: 'Planning', progress: 25 }
            ].map((project, index) => (
              <div key={index} className="border border-gray-200 p-4 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium">{project.project}</h4>
                    <p className="text-sm text-gray-600">{project.client}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    project.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                    project.status === 'Review' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {project.status}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Pesan Terbaru</h3>
          <div className="space-y-4">
            {[
              { name: 'Ahmad Rizki', company: 'PT Astra', message: 'Tertarik dengan development website corporate', time: '2 jam lalu' },
              { name: 'Linda Sari', company: 'Shopee', message: 'Ingin konsultasi tentang mobile app development', time: '4 jam lalu' },
              { name: 'Budi Santoso', company: 'OVO', message: 'Perlu solusi e-commerce platform', time: '1 hari lalu' }
            ].map((message, index) => (
              <div key={index} className="border border-gray-200 p-4 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium">{message.name}</h4>
                    <p className="text-sm text-gray-600">{message.company}</p>
                  </div>
                  <span className="text-xs text-gray-500">{message.time}</span>
                </div>
                <p className="text-sm text-gray-700">{message.message}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderTestimonials = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Kelola Testimoni</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700">
          <Plus className="h-4 w-4" />
          <span>Tambah Testimoni</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Klien</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Perusahaan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {testimonials.map((testimonial) => (
                <tr key={testimonial.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{testimonial.name}</div>
                      <div className="text-sm text-gray-500">{testimonial.position}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {testimonial.company}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      testimonial.status === 'published' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {testimonial.status === 'published' ? 'Dipublikasi' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button className="text-blue-600 hover:text-blue-900">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="text-green-600 hover:text-green-900">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderServices = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Kelola Layanan</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700">
          <Plus className="h-4 w-4" />
          <span>Tambah Layanan</span>
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <div key={service.id} className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold">{service.title}</h3>
              <span className={`px-2 py-1 text-xs rounded-full ${
                service.status === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {service.status === 'active' ? 'Aktif' : 'Nonaktif'}
              </span>
            </div>
            <p className="text-gray-600 mb-4">{service.description}</p>
            <p className="text-lg font-semibold text-blue-600 mb-4">{service.price}</p>
            <div className="flex space-x-2">
              <button className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                Edit
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Trash2 className="h-4 w-4 text-red-600" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'cms', label: 'CMS', icon: Globe },
    { id: 'submissions', label: 'Form Submissions', icon: MessageSquare },
    { id: 'testimonials', label: 'Testimoni', icon: Star },
    { id: 'services', label: 'Layanan', icon: FileText },
    { id: 'users', label: 'Pengguna', icon: Users },
    { id: 'settings', label: 'Pengaturan', icon: Settings }
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <div className="pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8 flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600">Selamat datang, {user?.email}</p>
              </div>
              <button
                onClick={signOut}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-200">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-t-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    <IconComponent className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              {activeTab === 'dashboard' && renderDashboard()}
              {activeTab === 'cms' && <CMSEditor />}
              {activeTab === 'submissions' && <FormSubmissions />}
              {activeTab === 'testimonials' && (
                <div className="text-center py-12">
                  <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Kelola Testimoni</h3>
                  <p className="text-gray-500">Fitur kelola testimoni akan segera tersedia</p>
                </div>
              )}
              {activeTab === 'services' && (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Kelola Layanan</h3>
                  <p className="text-gray-500">Fitur kelola layanan akan segera tersedia</p>
                </div>
              )}
              {activeTab === 'users' && (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Kelola Pengguna</h3>
                  <p className="text-gray-500">Fitur kelola pengguna akan segera tersedia</p>
                </div>
              )}
              {activeTab === 'settings' && (
                <div className="text-center py-12">
                  <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Pengaturan</h3>
                  <p className="text-gray-500">Fitur pengaturan akan segera tersedia</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Admin;
