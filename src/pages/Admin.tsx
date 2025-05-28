import { useState, Suspense, lazy, useEffect } from 'react';
import { 
  Users, 
  BarChart3, 
  FileText, 
  Star,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import Navbar from '@/components/Navbar';
import AdminSidebar from '@/components/AdminSidebar';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminSkeleton from '@/components/AdminSkeleton';
import LoadingWrapper from '@/components/LoadingWrapper';
import { useAuth } from '@/hooks/useAuth';

// Lazy load components with preloading
const HeroEditor = lazy(() => 
  import('@/components/HeroEditor').then(module => ({ default: module.default }))
);
const FormSubmissions = lazy(() => import('@/components/FormSubmissions'));
const LiveChatManager = lazy(() => import('@/components/LiveChatManager'));
const TestimonialManager = lazy(() => import('@/components/TestimonialManager'));
const ServiceManager = lazy(() => import('@/components/ServiceManager'));
const PortfolioManager = lazy(() => import('@/components/PortfolioManager'));
const PortfolioDetail = lazy(() => import('@/components/PortfolioDetail'));
const CRMManager = lazy(() => import('@/components/CRMManager'));
const SettingsManager = lazy(() => import('@/components/SettingsManager'));
const ClientLogosManager = lazy(() => import('@/components/ClientLogosManager'));
const UserManagement = lazy(() => import('@/components/UserManagement'));

const Admin = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedProject, setSelectedProject] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const { user } = useAuth();

  // Preload commonly used components
  useEffect(() => {
    const preloadComponents = async () => {
      try {
        // Preload hero editor and portfolio manager as they're commonly accessed
        const heroPromise = import('@/components/HeroEditor');
        const portfolioPromise = import('@/components/PortfolioManager');
        await Promise.all([heroPromise, portfolioPromise]);
      } catch (error) {
        console.log('Preload failed:', error);
      }
    };

    const timer = setTimeout(() => {
      preloadComponents();
      setIsInitialLoad(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    setSelectedProject(null);
    // Use a more targeted refresh instead of full page reload
    window.location.reload();
  };

  const stats = [
    { title: 'Total Proyek', value: '156', change: '+12%', icon: FileText },
    { title: 'Klien Aktif', value: '89', change: '+8%', icon: Users },
    { title: 'Revenue Bulan Ini', value: 'Rp 2.1M', change: '+15%', icon: TrendingUp },
    { title: 'Rating Rata-rata', value: '4.9', change: '+0.1', icon: Star }
  ];

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div key={index} className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-green-600">{stat.change}</p>
                </div>
                <IconComponent className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Proyek Terbaru</h3>
          <div className="space-y-3">
            {[
              { client: 'Bank Mandiri', project: 'Corporate Website', status: 'In Progress', progress: 75 },
              { client: 'Telkomsel', project: 'Mobile App Development', status: 'Review', progress: 90 },
              { client: 'Indofood', project: 'E-commerce Platform', status: 'Planning', progress: 25 }
            ].map((project, index) => (
              <div key={index} className="border border-gray-200 p-3 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium text-sm">{project.project}</h4>
                    <p className="text-xs text-gray-600">{project.client}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    project.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                    project.status === 'Review' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {project.status}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Pesan Terbaru</h3>
          <div className="space-y-3">
            {[
              { name: 'Ahmad Rizki', company: 'PT Astra', message: 'Tertarik dengan development website corporate', time: '2 jam lalu' },
              { name: 'Linda Sari', company: 'Shopee', message: 'Ingin konsultasi tentang mobile app development', time: '4 jam lalu' },
              { name: 'Budi Santoso', company: 'OVO', message: 'Perlu solusi e-commerce platform', time: '1 hari lalu' }
            ].map((message, index) => (
              <div key={index} className="border border-gray-200 p-3 rounded-lg">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <h4 className="font-medium text-sm">{message.name}</h4>
                    <p className="text-xs text-gray-600">{message.company}</p>
                  </div>
                  <span className="text-xs text-gray-500">{message.time}</span>
                </div>
                <p className="text-xs text-gray-700">{message.message}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    if (activeTab === 'portfolio' && selectedProject) {
      return (
        <Suspense fallback={<AdminSkeleton />}>
          <PortfolioDetail 
            project={selectedProject} 
            onBack={() => setSelectedProject(null)} 
          />
        </Suspense>
      );
    }

    const ComponentSkeleton = () => (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="h-32 bg-gray-100 rounded animate-pulse"></div>
      </div>
    );

    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'hero':
        return (
          <Suspense fallback={<ComponentSkeleton />}>
            <HeroEditor key={refreshKey} />
          </Suspense>
        );
      case 'portfolio':
        return (
          <Suspense fallback={<ComponentSkeleton />}>
            <PortfolioManager key={refreshKey} onProjectSelect={setSelectedProject} />
          </Suspense>
        );
      case 'clientlogos':
        return (
          <Suspense fallback={<ComponentSkeleton />}>
            <ClientLogosManager key={refreshKey} />
          </Suspense>
        );
      case 'submissions':
        return (
          <Suspense fallback={<ComponentSkeleton />}>
            <FormSubmissions key={refreshKey} />
          </Suspense>
        );
      case 'livechat':
        return (
          <Suspense fallback={<ComponentSkeleton />}>
            <LiveChatManager key={refreshKey} />
          </Suspense>
        );
      case 'testimonials':
        return (
          <Suspense fallback={<ComponentSkeleton />}>
            <TestimonialManager key={refreshKey} />
          </Suspense>
        );
      case 'services':
        return (
          <Suspense fallback={<ComponentSkeleton />}>
            <ServiceManager key={refreshKey} />
          </Suspense>
        );
      case 'crm':
        return (
          <Suspense fallback={<ComponentSkeleton />}>
            <CRMManager key={refreshKey} />
          </Suspense>
        );
      case 'users':
        return (
          <Suspense fallback={<ComponentSkeleton />}>
            <UserManagement key={refreshKey} />
          </Suspense>
        );
      case 'settings':
        return (
          <Suspense fallback={<ComponentSkeleton />}>
            <SettingsManager key={refreshKey} />
          </Suspense>
        );
      default:
        return renderDashboard();
    }
  };

  if (isInitialLoad) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="pt-16">
            <div className="p-6">
              <AdminSkeleton />
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <div className="pt-16">
          <SidebarProvider>
            <div className="flex min-h-screen w-full">
              <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
              
              <SidebarInset>
                <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4 bg-white">
                  <SidebarTrigger className="-ml-1" />
                  <div className="flex-1 flex items-center justify-between">
                    <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                    <button
                      onClick={handleRefresh}
                      className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      title="Refresh halaman"
                    >
                      <RefreshCw className="h-4 w-4" />
                      <span className="hidden sm:inline">Refresh</span>
                    </button>
                  </div>
                </header>
                
                <div className="flex-1 p-4">
                  <div className="bg-white rounded-lg shadow-sm border p-4">
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
