
import {
  LayoutDashboard,
  FileText,
  Users,
  MessageSquare,
  Star,
  Briefcase,
  Settings,
  PlusCircle,
  BarChart3,
  Building,
  Zap,
  UserCheck,
  Globe
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
      description: 'Overview & Analytics'
    },
    {
      title: 'Hero Section',
      icon: Zap,
      id: 'hero',
      description: 'Manage homepage hero'
    },
    {
      title: 'Services',
      icon: Briefcase,
      id: 'services',
      description: 'Manage service offerings'
    },
    {
      title: 'Portfolio',
      icon: FileText,
      id: 'portfolio',
      description: 'Manage project portfolio'
    },
    {
      title: 'Client Logos',
      icon: Building,
      id: 'clientlogos',
      description: 'Manage client logos'
    },
    {
      title: 'Testimonials',
      icon: Star,
      id: 'testimonials',
      description: 'Manage client reviews'
    },
    {
      title: 'Form Submissions',
      icon: MessageSquare,
      id: 'submissions',
      description: 'View contact forms'
    },
    {
      title: 'Live Chat',
      icon: MessageSquare,
      id: 'livechat',
      description: 'Manage chat system'
    },
    {
      title: 'CRM',
      icon: Users,
      id: 'crm',
      description: 'Customer management'
    },
    {
      title: 'User Management',
      icon: UserCheck,
      id: 'users',
      description: 'Manage system users'
    },
    {
      title: 'Settings',
      icon: Settings,
      id: 'settings',
      description: 'System configuration'
    }
  ];

  return (
    <Sidebar className="w-80 bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900">
      <SidebarContent className="bg-transparent">
        <SidebarGroup>
          <SidebarGroupLabel className="text-white/80 text-lg font-bold mb-6 px-4">
            <Globe className="h-6 w-6 mr-3 text-purple-400" />
            Admin Panel
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {menuItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = activeTab === item.id;
                
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      onClick={() => onTabChange(item.id)}
                      className={`
                        group relative w-full h-16 rounded-xl transition-all duration-300 hover:scale-105
                        ${isActive 
                          ? 'bg-gradient-to-r from-purple-500 to-blue-600 text-white shadow-xl shadow-purple-500/25' 
                          : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                        }
                      `}
                    >
                      <div className="flex items-center space-x-4 px-4">
                        <div className={`
                          p-2 rounded-lg transition-all duration-300
                          ${isActive 
                            ? 'bg-white/20 text-white' 
                            : 'bg-white/10 text-white/60 group-hover:bg-white/20 group-hover:text-white'
                          }
                        `}>
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <div className="flex-1 text-left">
                          <div className={`font-semibold text-sm ${isActive ? 'text-white' : 'text-white/80'}`}>
                            {item.title}
                          </div>
                          <div className={`text-xs ${isActive ? 'text-white/80' : 'text-white/50'}`}>
                            {item.description}
                          </div>
                        </div>
                      </div>
                      
                      {isActive && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                        </div>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AdminSidebar;
