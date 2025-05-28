
import {
  LayoutDashboard,
  FileText,
  Users,
  MessageSquare,
  Star,
  Briefcase,
  Settings,
  BarChart3,
  Building,
  Zap,
  UserCheck,
  Globe,
  MessageCircle
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const AdminSidebar = ({ activeTab, onTabChange }: AdminSidebarProps) => {
  const menuItems = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      id: 'dashboard',
      description: 'Overview & Analytics',
      gradient: 'from-blue-500 to-purple-600'
    },
    {
      title: 'Hero Section',
      icon: Zap,
      id: 'hero',
      description: 'Manage homepage hero',
      gradient: 'from-purple-500 to-pink-600'
    },
    {
      title: 'Services',
      icon: Briefcase,
      id: 'services',
      description: 'Manage service offerings',
      gradient: 'from-emerald-500 to-teal-600'
    },
    {
      title: 'Portfolio',
      icon: FileText,
      id: 'portfolio',
      description: 'Manage project portfolio',
      gradient: 'from-orange-500 to-red-600'
    },
    {
      title: 'Client Logos',
      icon: Building,
      id: 'clientlogos',
      description: 'Manage client logos',
      gradient: 'from-cyan-500 to-blue-600'
    },
    {
      title: 'Testimonials',
      icon: Star,
      id: 'testimonials',
      description: 'Manage client reviews',
      gradient: 'from-yellow-500 to-orange-600'
    },
    {
      title: 'Form Submissions',
      icon: MessageSquare,
      id: 'submissions',
      description: 'View contact forms',
      gradient: 'from-indigo-500 to-purple-600'
    },
    {
      title: 'Live Chat',
      icon: MessageCircle,
      id: 'livechat',
      description: 'Manage chat system',
      gradient: 'from-green-500 to-emerald-600'
    },
    {
      title: 'CRM',
      icon: Users,
      id: 'crm',
      description: 'Customer management',
      gradient: 'from-pink-500 to-rose-600'
    },
    {
      title: 'User Management',
      icon: UserCheck,
      id: 'users',
      description: 'Manage system users',
      gradient: 'from-violet-500 to-purple-600'
    },
    {
      title: 'Settings',
      icon: Settings,
      id: 'settings',
      description: 'System configuration',
      gradient: 'from-slate-500 to-gray-600'
    }
  ];

  return (
    <Sidebar className="w-80 bg-gradient-to-b from-slate-50 via-white to-gray-50 border-r-2 border-gray-100 shadow-xl">
      <SidebarContent className="bg-transparent p-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-800 text-xl font-bold mb-8 px-4 flex items-center">
            <div className="bg-gradient-to-r from-purple-500 to-blue-600 p-3 rounded-2xl mr-4 shadow-lg">
              <Globe className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Admin Panel
              </div>
              <div className="text-xs text-gray-500 font-normal mt-1">
                Kelola semua aspek website
              </div>
            </div>
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu className="space-y-3">
              {menuItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = activeTab === item.id;
                
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      onClick={() => onTabChange(item.id)}
                      className={`
                        group relative w-full h-16 rounded-2xl transition-all duration-300 hover:scale-105 border-2
                        ${isActive 
                          ? `bg-gradient-to-r ${item.gradient} text-white shadow-xl shadow-purple-500/25 border-transparent` 
                          : 'bg-white/80 text-gray-700 hover:bg-white hover:text-gray-900 border-gray-200 hover:border-gray-300 hover:shadow-lg'
                        }
                      `}
                    >
                      <div className="flex items-center space-x-4 px-4 w-full">
                        <div className={`
                          p-3 rounded-xl transition-all duration-300 shadow-lg
                          ${isActive 
                            ? 'bg-white/20 text-white backdrop-blur-sm' 
                            : `bg-gradient-to-r ${item.gradient} text-white group-hover:scale-110`
                          }
                        `}>
                          <IconComponent className="h-5 w-5" />
                        </div>
                        
                        <div className="flex-1 text-left">
                          <div className={`font-bold text-sm ${isActive ? 'text-white' : 'text-gray-800'}`}>
                            {item.title}
                          </div>
                          <div className={`text-xs ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
                            {item.description}
                          </div>
                        </div>
                        
                        {isActive && (
                          <div className="flex flex-col items-center space-y-1">
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                            <div className="w-1 h-1 bg-white/70 rounded-full"></div>
                          </div>
                        )}
                        
                        {!isActive && (
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className={`w-3 h-3 bg-gradient-to-r ${item.gradient} rounded-full shadow-lg`}></div>
                          </div>
                        )}
                      </div>
                      
                      {/* Subtle gradient overlay for inactive items */}
                      {!isActive && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-50/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        {/* Footer decoration */}
        <div className="mt-8 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl border border-purple-100">
          <div className="text-center">
            <div className="flex justify-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-100"></div>
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-200"></div>
            </div>
            <p className="text-xs text-gray-600 font-medium">Admin Dashboard v2.0</p>
            <p className="text-xs text-gray-500">Modern & Powerful</p>
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
};

export default AdminSidebar;
