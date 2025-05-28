
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
  Zap,
  Sparkles,
  Rocket,
  Target
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-purple-200 border-t-purple-600 mx-auto mb-6"></div>
            <Sparkles className="h-8 w-8 text-purple-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-gray-700 text-xl font-medium">Memuat dashboard admin...</p>
          <p className="text-gray-500 text-sm mt-2">Siapkan pengalaman terbaik untuk Anda ✨</p>
        </div>
      </div>
    );
  }

  // Show error if auth failed
  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-pink-50 to-orange-50">
        <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-red-600 text-xl">Oops! Ada Masalah</CardTitle>
            <CardDescription className="text-gray-600">Terjadi kesalahan saat memuat halaman admin</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-red-600 mb-6 p-4 bg-red-50 rounded-lg text-sm">{authError}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-medium py-3 rounded-xl transition-all duration-300 hover:scale-105"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
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
      gradient: 'from-blue-500 via-purple-500 to-indigo-600',
      lightBg: 'from-blue-50 to-purple-50',
      borderColor: 'border-blue-200',
      iconBg: 'from-blue-500 to-purple-600'
    },
    { 
      title: 'Klien Aktif', 
      value: '89', 
      change: '+8%', 
      icon: Users,
      gradient: 'from-emerald-500 via-teal-500 to-green-600',
      lightBg: 'from-emerald-50 to-teal-50',
      borderColor: 'border-emerald-200',
      iconBg: 'from-emerald-500 to-teal-600'
    },
    { 
      title: 'Revenue Bulan Ini', 
      value: 'Rp 2.1M', 
      change: '+15%', 
      icon: TrendingUp,
      gradient: 'from-purple-500 via-pink-500 to-rose-600',
      lightBg: 'from-purple-50 to-pink-50',
      borderColor: 'border-purple-200',
      iconBg: 'from-purple-500 to-pink-600'
    },
    { 
      title: 'Rating Rata-rata', 
      value: '4.9', 
      change: '+0.1', 
      icon: Star,
      gradient: 'from-amber-500 via-orange-500 to-yellow-600',
      lightBg: 'from-amber-50 to-orange-50',
      borderColor: 'border-amber-200',
      iconBg: 'from-amber-500 to-orange-600'
    }
  ];

  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-700 rounded-3xl p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-indigo-600/20"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="max-w-2xl">
              <div className="flex items-center mb-4">
                <Sparkles className="h-8 w-8 text-yellow-300 mr-3 animate-pulse" />
                <h1 className="text-4xl font-bold">Halo, {user?.email?.split('@')[0]}! 👋</h1>
              </div>
              <p className="text-purple-100 text-xl leading-relaxed">
                Selamat datang di dashboard admin yang modern dan powerful! 
                Kelola bisnis Anda dengan mudah dan efisien. ✨
              </p>
              <div className="flex items-center mt-6 text-purple-100">
                <Calendar className="h-5 w-5 mr-2" />
                <span className="font-medium">{new Date().toLocaleDateString('id-ID', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="relative">
                <Rocket className="h-24 w-24 text-white/20" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Activity className="h-12 w-12 text-yellow-300 animate-bounce" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index} className={`relative overflow-hidden bg-gradient-to-br ${stat.lightBg} border-2 ${stat.borderColor} hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-1 group`}>
              <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent"></div>
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                      {stat.title}
                    </p>
                    <p className="text-4xl font-bold text-gray-900 mb-2 group-hover:scale-110 transition-transform duration-300">
                      {stat.value}
                    </p>
                    <div className="flex items-center">
                      <span className="text-sm font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full flex items-center">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  <div className={`bg-gradient-to-r ${stat.iconBg} p-4 rounded-2xl shadow-lg group-hover:rotate-12 transition-transform duration-300`}>
                    <IconComponent className="h-8 w-8 text-white" />
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
        <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50 hover:shadow-2xl transition-all duration-300">
          <CardHeader className="pb-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-xl">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold flex items-center">
                  <Zap className="h-6 w-6 mr-3 text-yellow-300" />
                  Proyek Terbaru
                </CardTitle>
                <CardDescription className="text-blue-100 mt-1">
                  Pantau progress proyek yang sedang berjalan
                </CardDescription>
              </div>
              <div className="bg-white/20 p-2 rounded-lg">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-5">
              {[
                { client: 'Bank Mandiri', project: 'Corporate Website', status: 'In Progress', progress: 75, color: 'blue', bgColor: 'bg-blue-500' },
                { client: 'Telkomsel', project: 'Mobile App Development', status: 'Review', progress: 90, color: 'amber', bgColor: 'bg-amber-500' },
                { client: 'Indofood', project: 'E-commerce Platform', status: 'Planning', progress: 25, color: 'purple', bgColor: 'bg-purple-500' }
              ].map((project, index) => (
                <div key={index} className="bg-gradient-to-r from-gray-50 to-white border-2 border-gray-100 p-5 rounded-2xl hover:shadow-lg transition-all duration-300 hover:scale-102">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg">{project.project}</h4>
                      <p className="text-gray-600 font-medium">{project.client}</p>
                    </div>
                    <span className={`px-4 py-2 text-sm font-bold rounded-full ${
                      project.status === 'In Progress' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                      project.status === 'Review' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                      'bg-purple-100 text-purple-800 border border-purple-200'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-gray-700">Progress</span>
                      <span className="text-gray-900 font-bold">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div 
                        className={`${project.bgColor} h-3 rounded-full transition-all duration-1000 ease-out shadow-inner`}
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
        <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50 hover:shadow-2xl transition-all duration-300">
          <CardHeader className="pb-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-t-xl">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold flex items-center">
                  <Clock className="h-6 w-6 mr-3 text-emerald-200" />
                  Pesan Terbaru
                </CardTitle>
                <CardDescription className="text-emerald-100 mt-1">
                  Komunikasi terbaru dengan klien
                </CardDescription>
              </div>
              <div className="bg-white/20 p-2 rounded-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-5">
              {[
                { name: 'Ahmad Rizki', company: 'PT Astra', message: 'Tertarik dengan development website corporate', time: '2 jam lalu', avatar: 'AR', bgColor: 'bg-blue-500' },
                { name: 'Linda Sari', company: 'Shopee', message: 'Ingin konsultasi tentang mobile app development', time: '4 jam lalu', avatar: 'LS', bgColor: 'bg-purple-500' },
                { name: 'Budi Santoso', company: 'OVO', message: 'Perlu solusi e-commerce platform', time: '1 hari lalu', avatar: 'BS', bgColor: 'bg-emerald-500' }
              ].map((message, index) => (
                <div key={index} className="bg-gradient-to-r from-gray-50 to-white border-2 border-gray-100 p-5 rounded-2xl hover:shadow-lg transition-all duration-300 hover:scale-102">
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 ${message.bgColor} rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
                      {message.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-bold text-gray-900 text-lg">{message.name}</h4>
                          <p className="text-sm text-gray-600 font-medium">{message.company}</p>
                        </div>
                        <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full font-medium">
                          {message.time}
                        </span>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{message.message}</p>
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-blue-50/30">
        <Navbar />
        
        <div className="pt-16">
          <SidebarProvider>
            <div className="flex min-h-screen w-full">
              <AdminSidebar activeTab={activeTab} onTabChange={handleTabChange} />
              
              <SidebarInset>
                <header className="flex h-20 shrink-0 items-center gap-2 border-b bg-white/90 backdrop-blur-md px-8 sticky top-0 z-10 shadow-sm">
                  <SidebarTrigger className="-ml-1 text-gray-600 hover:text-purple-600 transition-colors" />
                  <div className="flex-1 flex items-center justify-between">
                    <div>
                      <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                        Admin Dashboard
                      </h1>
                      <p className="text-gray-600 font-medium">Kelola semua aspek bisnis Anda dengan mudah</p>
                    </div>
                    <Button
                      onClick={handleRefresh}
                      variant="outline"
                      className="flex items-center gap-2 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 hover:border-purple-300 transition-all duration-300 border-2 font-medium"
                      title="Refresh halaman"
                    >
                      <RefreshCw className="h-5 w-5" />
                      <span className="hidden sm:inline">Refresh</span>
                    </Button>
                  </div>
                </header>
                
                <div className="flex-1 p-8">
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
