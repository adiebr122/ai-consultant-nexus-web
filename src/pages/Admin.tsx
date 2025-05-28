
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
  Target,
  ArrowUpRight,
  Plus,
  Bell,
  Search
} from 'lucide-react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
      changeType: 'increase',
      icon: FileText,
      color: 'blue'
    },
    { 
      title: 'Klien Aktif', 
      value: '89', 
      change: '+8%', 
      changeType: 'increase',
      icon: Users,
      color: 'emerald'
    },
    { 
      title: 'Revenue Bulan Ini', 
      value: 'Rp 2.1M', 
      change: '+15%', 
      changeType: 'increase',
      icon: TrendingUp,
      color: 'purple'
    },
    { 
      title: 'Rating Rata-rata', 
      value: '4.9', 
      change: '+0.1', 
      changeType: 'increase',
      icon: Star,
      color: 'amber'
    }
  ];

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        icon: 'bg-blue-500',
        text: 'text-blue-600'
      },
      emerald: {
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        icon: 'bg-emerald-500',
        text: 'text-emerald-600'
      },
      purple: {
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        icon: 'bg-purple-500',
        text: 'text-purple-600'
      },
      amber: {
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        icon: 'bg-amber-500',
        text: 'text-amber-600'
      }
    };
    return colorMap[color] || colorMap.blue;
  };

  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Selamat Datang, {user?.email?.split('@')[0]}! 👋
          </h1>
          <p className="text-gray-600 text-lg">
            Kelola bisnis Anda dengan dashboard yang powerful dan mudah digunakan
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
            <Calendar className="h-4 w-4" />
            <span>{new Date().toLocaleDateString('id-ID', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Cari..." 
              className="pl-10 w-64"
            />
          </div>
          <Button variant="outline" size="icon">
            <Bell className="h-4 w-4" />
          </Button>
          <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Tambah Proyek
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          const colors = getColorClasses(stat.color);
          
          return (
            <Card key={index} className={`${colors.bg} border-2 ${colors.border} hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group cursor-pointer`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`${colors.icon} p-3 rounded-xl shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  <ArrowUpRight className={`h-5 w-5 ${colors.text} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={`${stat.changeType === 'increase' ? 'border-emerald-200 text-emerald-700 bg-emerald-50' : 'border-red-200 text-red-700 bg-red-50'} font-semibold`}
                    >
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {stat.change}
                    </Badge>
                    <span className="text-xs text-gray-500">vs bulan lalu</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Projects - Takes 2 columns */}
        <Card className="lg:col-span-2 border-0 shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Zap className="h-5 w-5 text-blue-600" />
                  Proyek Terbaru
                </CardTitle>
                <CardDescription className="text-gray-600 mt-1">
                  Pantau progress proyek yang sedang berjalan
                </CardDescription>
              </div>
              <Button variant="outline" size="sm">
                Lihat Semua
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[
                { client: 'Bank Mandiri', project: 'Corporate Website', status: 'In Progress', progress: 75, priority: 'High', deadline: '2 hari', color: 'blue' },
                { client: 'Telkomsel', project: 'Mobile App Development', status: 'Review', progress: 90, priority: 'Medium', deadline: '5 hari', color: 'amber' },
                { client: 'Indofood', project: 'E-commerce Platform', status: 'Planning', progress: 25, priority: 'Low', deadline: '1 minggu', color: 'purple' }
              ].map((project, index) => (
                <div key={index} className="border border-gray-200 rounded-xl p-5 hover:border-gray-300 hover:shadow-sm transition-all duration-200 bg-white">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 text-lg mb-1">{project.project}</h4>
                      <p className="text-gray-600 mb-2">{project.client}</p>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            project.status === 'In Progress' ? 'border-blue-200 text-blue-700 bg-blue-50' :
                            project.status === 'Review' ? 'border-amber-200 text-amber-700 bg-amber-50' :
                            'border-purple-200 text-purple-700 bg-purple-50'
                          }`}
                        >
                          {project.status}
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            project.priority === 'High' ? 'border-red-200 text-red-700 bg-red-50' :
                            project.priority === 'Medium' ? 'border-yellow-200 text-yellow-700 bg-yellow-50' :
                            'border-gray-200 text-gray-700 bg-gray-50'
                          }`}
                        >
                          {project.priority}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Deadline</p>
                      <p className="text-sm font-medium text-gray-900">{project.deadline}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-semibold text-gray-900">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`${
                          project.color === 'blue' ? 'bg-blue-500' :
                          project.color === 'amber' ? 'bg-amber-500' :
                          'bg-purple-500'
                        } h-2 rounded-full transition-all duration-700 ease-out`}
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions & Notifications */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-gray-100">
              <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Rocket className="h-5 w-5 text-emerald-600" />
                Aksi Cepat
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                {[
                  { label: 'Tambah Proyek Baru', icon: Plus, color: 'bg-blue-500' },
                  { label: 'Upload Portfolio', icon: FileText, color: 'bg-purple-500' },
                  { label: 'Kelola Testimoni', icon: Star, color: 'bg-amber-500' },
                  { label: 'Lihat Pesan', icon: Clock, color: 'bg-emerald-500' }
                ].map((action, index) => (
                  <Button key={index} variant="ghost" className="w-full justify-start h-auto p-3 hover:bg-gray-50">
                    <div className={`${action.color} p-2 rounded-lg mr-3`}>
                      <action.icon className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-gray-700 font-medium">{action.label}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Messages */}
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 border-b border-gray-100">
              <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Activity className="h-5 w-5 text-orange-600" />
                Pesan Terbaru
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-4">
                {[
                  { name: 'Ahmad Rizki', company: 'PT Astra', message: 'Tertarik dengan development website', time: '2 jam', avatar: 'AR', color: 'bg-blue-500' },
                  { name: 'Linda Sari', company: 'Shopee', message: 'Konsultasi mobile app', time: '4 jam', avatar: 'LS', color: 'bg-purple-500' },
                  { name: 'Budi Santoso', company: 'OVO', message: 'Solusi e-commerce platform', time: '1 hari', avatar: 'BS', color: 'bg-emerald-500' }
                ].map((message, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                    <div className={`w-10 h-10 ${message.color} rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-sm`}>
                      {message.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-semibold text-gray-900 truncate">{message.name}</h4>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{message.time}</span>
                      </div>
                      <p className="text-xs text-gray-600 mb-1">{message.company}</p>
                      <p className="text-sm text-gray-700 line-clamp-2">{message.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
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
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <div className="pt-16">
          <SidebarProvider defaultOpen={true}>
            <div className="flex min-h-screen w-full">
              <AdminSidebar activeTab={activeTab} onTabChange={handleTabChange} />
              
              <SidebarInset className="flex-1">
                <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white/95 backdrop-blur-sm px-6 sticky top-0 z-10 shadow-sm">
                  <SidebarTrigger className="text-gray-600 hover:text-purple-600 transition-colors" />
                  <div className="flex-1 flex items-center justify-between">
                    <div>
                      <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                        Admin Dashboard
                      </h1>
                      <p className="text-sm text-gray-600">Kelola semua aspek bisnis Anda dengan mudah</p>
                    </div>
                    <Button
                      onClick={handleRefresh}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 hover:border-purple-300 transition-all duration-300 border font-medium"
                    >
                      <RefreshCw className="h-4 w-4" />
                      <span className="hidden sm:inline">Refresh</span>
                    </Button>
                  </div>
                </header>
                
                <div className="flex-1 p-6 overflow-auto">
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
