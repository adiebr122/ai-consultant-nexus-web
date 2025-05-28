
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import AdminSidebar from '@/components/AdminSidebar';
import HeroEditor from '@/components/HeroEditor';
import ServiceManager from '@/components/ServiceManager';
import PortfolioManager from '@/components/PortfolioManager';
import ClientLogosManager from '@/components/ClientLogosManager';
import TestimonialManager from '@/components/TestimonialManager';
import FormSubmissions from '@/components/FormSubmissions';
import LiveChatManager from '@/components/LiveChatManager';
import CRMManager from '@/components/CRMManager';
import QuotationManager from '@/components/QuotationManager';
import InvoiceManager from '@/components/InvoiceManager';
import UserManagement from '@/components/UserManagement';
import SettingsManager from '@/components/SettingsManager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  FileText, 
  Star, 
  MessageSquare, 
  Building,
  Calculator,
  Receipt,
  TrendingUp,
  Eye,
  Mail,
  Phone
} from 'lucide-react';

const Admin = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardContent />;
      case 'hero':
        return <HeroEditor />;
      case 'services':
        return <ServiceManager />;
      case 'portfolio':
        return <PortfolioManager />;
      case 'clientlogos':
        return <ClientLogosManager />;
      case 'testimonials':
        return <TestimonialManager />;
      case 'submissions':
        return <FormSubmissions />;
      case 'livechat':
        return <LiveChatManager />;
      case 'crm':
        return <CRMManager />;
      case 'quotations':
        return <QuotationManager />;
      case 'invoices':
        return <InvoiceManager />;
      case 'users':
        return <UserManagement />;
      case 'settings':
        return <SettingsManager />;
      default:
        return <DashboardContent />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex bg-gray-50">
        <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        
        <main className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto">
            <div className="p-6">
              {renderContent()}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

const DashboardContent = () => {
  const statsCards = [
    {
      title: 'Total Kontak CRM',
      value: '0',
      description: 'Kontak yang terdaftar',
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-100'
    },
    {
      title: 'Penawaran Aktif',
      value: '0',
      description: 'Penawaran yang terkirim',
      icon: Calculator,
      color: 'text-purple-600',
      bg: 'bg-purple-100'
    },
    {
      title: 'Invoice Pending',
      value: '0',
      description: 'Invoice belum dibayar',
      icon: Receipt,
      color: 'text-green-600',
      bg: 'bg-green-100'
    },
    {
      title: 'Form Submissions',
      value: '0',
      description: 'Formulir masuk hari ini',
      icon: MessageSquare,
      color: 'text-orange-600',
      bg: 'bg-orange-100'
    },
    {
      title: 'Client Logos',
      value: '0',
      description: 'Logo klien aktif',
      icon: Building,
      color: 'text-cyan-600',
      bg: 'bg-cyan-100'
    },
    {
      title: 'Testimonials',
      value: '0',
      description: 'Testimonial aktif',
      icon: Star,
      color: 'text-yellow-600',
      bg: 'bg-yellow-100'
    }
  ];

  const quickActions = [
    {
      title: 'Buat Penawaran',
      description: 'Buat penawaran baru untuk klien',
      icon: Calculator,
      action: 'quotations',
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      title: 'Buat Invoice',
      description: 'Generate invoice dari penawaran',
      icon: Receipt,
      action: 'invoices',
      color: 'bg-green-600 hover:bg-green-700'
    },
    {
      title: 'Kelola CRM',
      description: 'Tambah kontak dan leads baru',
      icon: Users,
      action: 'crm',
      color: 'bg-purple-600 hover:bg-purple-700'
    },
    {
      title: 'Lihat Submissions',
      description: 'Cek form yang masuk',
      icon: Mail,
      action: 'submissions',
      color: 'bg-orange-600 hover:bg-orange-700'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
            <p className="text-gray-600 mt-1">Selamat datang di panel admin website Anda</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-500">Last Updated</p>
              <p className="font-medium">{new Date().toLocaleDateString('id-ID')}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statsCards.map((card, index) => {
          const IconComponent = card.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {card.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${card.bg}`}>
                  <IconComponent className={`h-4 w-4 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{card.value}</div>
                <p className="text-xs text-gray-500 mt-1">{card.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => {
            const IconComponent = action.icon;
            return (
              <div
                key={index}
                className={`p-4 rounded-lg text-white cursor-pointer transition-all duration-200 hover:scale-105 ${action.color}`}
              >
                <div className="flex items-center space-x-3">
                  <IconComponent className="h-6 w-6" />
                  <div>
                    <h3 className="font-medium">{action.title}</h3>
                    <p className="text-xs opacity-90">{action.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-blue-600" />
              Aktivitas Terbaru
            </CardTitle>
            <CardDescription>
              Aktivitas sistem dalam 24 jam terakhir
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center py-8 text-gray-500">
                <Eye className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Belum ada aktivitas terbaru</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Phone className="h-5 w-5 mr-2 text-green-600" />
              Kontak Terbaru
            </CardTitle>
            <CardDescription>
              Lead dan kontak yang masuk
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center py-8 text-gray-500">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Belum ada kontak masuk</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;
