
import { 
  Home,
  FileText,
  Users,
  MessageSquare,
  Star,
  Settings,
  BarChart3,
  Briefcase,
  UserPlus,
  Image
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
} from "@/components/ui/sidebar";

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const AdminSidebar = ({ activeTab, onTabChange }: AdminSidebarProps) => {
  const menuItems = [
    {
      title: "Dashboard",
      icon: Home,
      id: "dashboard"
    },
    {
      title: "Hero Section",
      icon: FileText,
      id: "hero"
    },
    {
      title: "Portfolio",
      icon: Briefcase,
      id: "portfolio"
    },
    {
      title: "Logo Klien",
      icon: Image,
      id: "clientlogos"
    },
    {
      title: "Layanan",
      icon: Briefcase,
      id: "services"
    },
    {
      title: "Testimoni",
      icon: Star,
      id: "testimonials"
    },
    {
      title: "Form Submissions",
      icon: MessageSquare,
      id: "submissions"
    },
    {
      title: "Live Chat",
      icon: MessageSquare,
      id: "livechat"
    },
    {
      title: "CRM",
      icon: UserPlus,
      id: "crm"
    },
    {
      title: "Users",
      icon: Users,
      id: "users"
    },
    {
      title: "Settings",
      icon: Settings,
      id: "settings"
    }
  ];

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Konten Utama</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.slice(0, 6).map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton 
                    onClick={() => onTabChange(item.id)}
                    isActive={activeTab === item.id}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Manajemen</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.slice(6).map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton 
                    onClick={() => onTabChange(item.id)}
                    isActive={activeTab === item.id}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AdminSidebar;
