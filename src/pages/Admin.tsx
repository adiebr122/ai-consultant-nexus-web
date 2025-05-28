import { useState } from 'react';
import { 
  Users, 
  BarChart3, 
  FileText, 
  Star,
  TrendingUp
} from 'lucide-react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import Navbar from '@/components/Navbar';
import AdminSidebar from '@/components/AdminSidebar';
import HeroEditor from '@/components/HeroEditor';
import FormSubmissions from '@/components/FormSubmissions';
import LiveChatManager from '@/components/LiveChatManager';
import TestimonialManager from '@/components/TestimonialManager';
import ServiceManager from '@/components/ServiceManager';
import PortfolioManager from '@/components/PortfolioManager';
import CRMManager from '@/components/CRMManager';
import SettingsManager from '@/components/SettingsManager';
import ClientLogosManager from '@/components/ClientLogosManager';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user } = useAuth();

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

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'hero':
        return <HeroEditor />;
      case 'portfolio':
        return <PortfolioManager />;
      case 'clientlogos':
        return <ClientLogosManager />;
      case 'submissions':
        return <FormSubmissions />;
      case 'livechat':
        return <LiveChatManager />;
      case 'testimonials':
        return <TestimonialManager />;
      case 'services':
        return <ServiceManager />;
      case 'crm':
        return <CRMManager />;
      case 'users':
        return (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Kelola Pengguna</h3>
            <p className="text-gray-500">Fitur kelola pengguna akan segera tersedia</p>
          </div>
        );
      case 'settings':
        return <SettingsManager />;
      default:
        return renderDashboard();
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <div className="pt-16">
          <SidebarProvider>
            <div className="flex min-h-screen w-full">
              <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
              
              <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                  <SidebarTrigger className="-ml-1" />
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                  </div>
                </header>
                
                <div className="flex-1 p-6">
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    {renderContent()}
                  </div>
                </div>
              </SidebarInset>
            </div>
          </SidebarProvider>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Admin;
