
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  Home,
  Briefcase,
  MessageSquare,
  MessageCircle,
  Star,
  Package,
  UserCheck,
  Users,
  Settings,
  LogOut
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
  SidebarHeader,
  SidebarFooter,
  SidebarTrigger
} from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/useAuth';

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const AdminSidebar = ({ activeTab, onTabChange }: AdminSidebarProps) => {
  const { user, signOut } = useAuth();

  const mainTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'hero', label: 'Hero Section', icon: Home },
    { id: 'portfolio', label: 'Portfolio', icon: Briefcase },
    { id: 'services', label: 'Layanan', icon: Package },
    { id: 'testimonials', label: 'Testimoni', icon: Star }
  ];

  const communicationTabs = [
    { id: 'submissions', label: 'Form Submissions', icon: MessageSquare },
    { id: 'livechat', label: 'Live Chat', icon: MessageCircle },
    { id: 'crm', label: 'CRM', icon: UserCheck }
  ];

  const systemTabs = [
    { id: 'users', label: 'Pengguna', icon: Users },
    { id: 'settings', label: 'Pengaturan', icon: Settings }
  ];

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="p-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-lg">Admin Panel</h2>
            <p className="text-sm text-gray-600 truncate">{user?.email}</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Konten Utama</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainTabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <SidebarMenuItem key={tab.id}>
                    <SidebarMenuButton
                      onClick={() => onTabChange(tab.id)}
                      isActive={activeTab === tab.id}
                    >
                      <IconComponent className="h-4 w-4" />
                      <span>{tab.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Komunikasi</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {communicationTabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <SidebarMenuItem key={tab.id}>
                    <SidebarMenuButton
                      onClick={() => onTabChange(tab.id)}
                      isActive={activeTab === tab.id}
                    >
                      <IconComponent className="h-4 w-4" />
                      <span>{tab.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Sistem</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {systemTabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <SidebarMenuItem key={tab.id}>
                    <SidebarMenuButton
                      onClick={() => onTabChange(tab.id)}
                      isActive={activeTab === tab.id}
                    >
                      <IconComponent className="h-4 w-4" />
                      <span>{tab.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={signOut}
              className="text-red-600 hover:text-red-800 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AdminSidebar;
