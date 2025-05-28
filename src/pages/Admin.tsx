
import { useState, Suspense, lazy, useEffect, useCallback } from 'react';
import { 
  Users, 
  BarChart3, 
  FileText, 
  Star,
  TrendingUp,
  RefreshCw,
  Calendar,
  Clock,
  Activity,
  Zap
} from 'lucide-react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import AdminSidebar from '@/components/AdminSidebar';
import ProtectedRoute from '@/components/ProtectedRoute';
import LoadingWrapper from '@/components/LoadingWrapper';
import AdminSkeleton from '@/components/AdminSkeleton';
import { useAuth } from '@/hooks/useAuth';

// Import critical components directly (no lazy loading for frequently used ones)
import HeroEditor from '@/components/HeroEditor';
import FormSubmissions from '@/components/FormSubmissions';
import UserManagement from '@/components/UserManagement';

// Keep lazy loading only for less frequently used components
const LiveChatManager = lazy(() => import('@/components/LiveChatManager'));
const TestimonialManager = lazy(() => import('@/components/TestimonialManager'));
const ServiceManager = lazy(() => import('@/components/ServiceManager'));
const PortfolioManager = lazy(() => import('@/components/PortfolioManager'));
const PortfolioDetail = lazy(() => import('@/components/PortfolioDetail'));
const CRMManager = lazy(() => import('@/components/CRMManager'));
const SettingsManager = lazy(() => import('@/components/SettingsManager'));
const ClientLogosManager = lazy(() => import('@/components/ClientLogosManager'));

const Admin = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedProject, setSelectedProject] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isTabLoading, setIsTabLoading] = useState(false);
  const { user, loading: authLoading, error: authError } = useAuth();

  const handleRefresh = useCallback(() => {
    setRefreshKey(prev => prev + 1);
    setSelectedProject(null);
  }, []);

  const handleTabChange = useCallback((tab: string) => {
    if (tab === activeTab) return;
    
    setIsTabLoading(true);
    setActiveTab(tab);
    
    setTimeout(() => setIsTabLoading(false), 50);
  }, [activeTab]);

  // Show loading if auth is still loading
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg">Memuat halaman admin...</p>
        </div>
      </div>
    );
  }

  // Show error if auth failed
  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error Autentikasi</CardTitle>
            <CardDescription>Terjadi kesalahan saat memuat halaman</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-red-600 mb-4">{authError}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="w-full"
            >
              Muat Ulang Halaman
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = [
    { 
      title: 'Total Proyek', 
      value: '156', 
      change: '+12%', 
      icon: FileText,
      color: 'bg-gradient-to-r from-blue-500 to-blue-600',
      lightColor: 'bg-blue-50 border-blue-200'
    },
    { 
      title: 'Klien Aktif', 
      value: '89', 
      change: '+8%', 
      icon: Users,
      color: 'bg-gradient-to-r from-green-500 to-green-600',
      lightColor: 'bg-green-50 border-green-200'
    },
    { 
      title: 'Revenue Bulan Ini', 
      value: 'Rp 2.1M', 
      change: '+15%', 
      icon: TrendingUp,
      color: 'bg-gradient-to-r from-purple-500 to-purple-600',
      lightColor: 'bg-purple-50 border-purple-200'
    },
    { 
      title: 'Rating Rata-rata', 
      value: '4.9', 
      change: '+0.1', 
      icon: Star,
      color: 'bg-gradient-to-r from-yellow-500 to-orange-500',
      lightColor: 'bg-yellow-50 border-yellow-200'
    }
  ];

  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Selamat Datang, {user?.email}</h1>
            <p className="text-blue-100 text-lg">Kelola bisnis Anda dengan mudah dari dashboard ini</p>
          </div>
          <div className="hidden md:block">
            <Activity className="h-16 w-16 text-blue-200" />
          </div>
        </div>
        <div className="flex items-center mt-6 text-blue-100">
          <Calendar className="h-5 w-5 mr-2" />
          <span>{new Date().toLocaleDateString('id-ID', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index} className={`${stat.lightColor} border-2 hover:shadow-lg transition-all duration-300 hover:scale-105`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-2">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  <div className={`${stat.color} p-3 rounded-xl`}>
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Projects */}
        <Card className="border-2 hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-gray-900">Proyek Terbaru</CardTitle>
                <CardDescription>Pantau progress proyek yang sedang berjalan</CardDescription>
              </div>
              <Zap className="h-6 w-6 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { client: 'Bank Mandiri', project: 'Corporate Website', status: 'In Progress', progress: 75, color: 'bg-blue-500' },
                { client: 'Telkomsel', project: 'Mobile App Development', status: 'Review', progress: 90, color: 'bg-yellow-500' },
                { client: 'Indofood', project: 'E-commerce Platform', status: 'Planning', progress: 25, color: 'bg-gray-500' }
              ].map((project, index) => (
                <div key={index} className="bg-gray-50 border border-gray-200 p-4 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900">{project.project}</h4>
                      <p className="text-sm text-gray-600">{project.client}</p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      project.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                      project.status === 'Review' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`${project.color} h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Messages */}
        <Card className="border-2 hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-gray-900">Pesan Terbaru</CardTitle>
                <CardDescription>Komunikasi terbaru dengan klien</CardDescription>
              </div>
              <Clock className="h-6 w-6 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'Ahmad Rizki', company: 'PT Astra', message: 'Tertarik dengan development website corporate', time: '2 jam lalu', avatar: 'AR' },
                { name: 'Linda Sari', company: 'Shopee', message: 'Ingin konsultasi tentang mobile app development', time: '4 jam lalu', avatar: 'LS' },
                { name: 'Budi Santoso', company: 'OVO', message: 'Perlu solusi e-commerce platform', time: '1 hari lalu', avatar: 'BS' }
              ].map((message, index) => (
                <div key={index} className="bg-gray-50 border border-gray-200 p-4 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {message.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <div>
                          <h4 className="font-semibold text-gray-900">{message.name}</h4>
                          <p className="text-xs text-gray-600">{message.company}</p>
                        </div>
                        <span className="text-xs text-gray-500">{message.time}</span>
                      </div>
                      <p className="text-sm text-gray-700">{message.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
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

    const content = (() => {
      switch (activeTab) {
        case 'dashboard':
          return renderDashboard();
        case 'hero':
          return <HeroEditor key={refreshKey} />;
        case 'portfolio':
          return (
            <Suspense fallback={<AdminSkeleton />}>
              <PortfolioManager key={refreshKey} onProjectSelect={setSelectedProject} />
            </Suspense>
          );
        case 'clientlogos':
          return (
            <Suspense fallback={<AdminSkeleton />}>
              <ClientLogosManager key={refreshKey} />
            </Suspense>
          );
        case 'submissions':
          return <FormSubmissions key={refreshKey} />;
        case 'livechat':
          return (
            <Suspense fallback={<AdminSkeleton />}>
              <LiveChatManager key={refreshKey} />
            </Suspense>
          );
        case 'testimonials':
          return (
            <Suspense fallback={<AdminSkeleton />}>
              <TestimonialManager key={refreshKey} />
            </Suspense>
          );
        case 'services':
          return (
            <Suspense fallback={<AdminSkeleton />}>
              <ServiceManager key={refreshKey} />
            </Suspense>
          );
        case 'crm':
          return (
            <Suspense fallback={<AdminSkeleton />}>
              <CRMManager key={refreshKey} />
            </Suspense>
          );
        case 'users':
          return <UserManagement key={refreshKey} />;
        case 'settings':
          return (
            <Suspense fallback={<AdminSkeleton />}>
              <SettingsManager key={refreshKey} />
            </Suspense>
          );
        default:
          return renderDashboard();
      }
    })();

    return (
      <LoadingWrapper loading={isTabLoading} loadingText="Memuat...">
        {content}
      </LoadingWrapper>
    );
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <Navbar />
        
        <div className="pt-16">
          <SidebarProvider>
            <div className="flex min-h-screen w-full">
              <AdminSidebar activeTab={activeTab} onTabChange={handleTabChange} />
              
              <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white/80 backdrop-blur-sm px-6 sticky top-0 z-10">
                  <SidebarTrigger className="-ml-1" />
                  <div className="flex-1 flex items-center justify-between">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                      <p className="text-sm text-gray-600">Kelola semua aspek bisnis Anda</p>
                    </div>
                    <Button
                      onClick={handleRefresh}
                      variant="outline"
                      className="flex items-center gap-2 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                      title="Refresh halaman"
                    >
                      <RefreshCw className="h-4 w-4" />
                      <span className="hidden sm:inline">Refresh</span>
                    </Button>
                  </div>
                </header>
                
                <div className="flex-1 p-6">
                  {renderContent()}
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
