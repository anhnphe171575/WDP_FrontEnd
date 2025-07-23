'use client';

import {
  BarChart3,
  Calendar,
  Home,
  Inbox,
  Search,
  Settings,
  Users,
  FileText,
  TrendingUp,
  DollarSign,
  Activity,
  CreditCard,
  LogOut,
  User,
  ChevronUp,
  Image,
  Languages,
  Star,
  Package,
  ListTree,
  ListChecks,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { useLanguage } from "@/context/LanguageContext";
import pagesConfigEnRaw from "../../../utils/petPagesConfig.en";
import pagesConfigViRaw from "../../../utils/petPagesConfig.vi";

// Menu items for the sidebar
const menuItems = [
  {
    title: "Dashboard",
    url: "/admin/dashboard",
    icon: Home,
  },
  {
    title: "Analytics",
    url: "/admin/analytics",
    icon: BarChart3,
  },
  {
    title: "Users",
    titleKey: "users",
    url: "/admin/users",
    icon: Users,
  },
  {
    title: "Messages",
    url: "/admin/messages",
    icon: Inbox,
  },
  {
    title: "Manage Product",
    titleKey: "manageProduct",
    url: "/admin/product",
    icon: Package,
  },
  {
    titleKey: "manageCategory",
    url: "/admin/category",
    icon: ListTree,
  },
  {
    titleKey: "manageAttribute",
    url: "/admin/attribute",
    icon: ListChecks,
  },
]



function AppSidebar() {
  const { lang, setLang } = useLanguage();
  const pagesConfig = lang === "vi" ? pagesConfigViRaw : pagesConfigEnRaw;

  const toggleLanguage = () => {
    setLang(lang === 'vi' ? 'en' : 'vi');
  };

  // Hàm xử lý logout
  const handleLogout = () => {
    // Xóa token/session nếu có
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('token');
      // Nếu bạn lưu token ở nơi khác, hãy xóa ở đó
    }
    // Chuyển hướng về trang đăng nhập
    window.location.href = '/login';
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/admin/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <TrendingUp className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">{pagesConfig.adminSidebar.dashboard}</span>
                  <span className="text-xs">{pagesConfig.adminSidebar.version}</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{pagesConfig.adminSidebar.application}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.titleKey}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{pagesConfig.adminSidebar[item.titleKey as keyof typeof pagesConfig.adminSidebar]}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>{pagesConfig.adminSidebar.other}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>

              <SidebarMenuItem>
                <SidebarMenuButton onClick={toggleLanguage}>
                  <Languages />
                  <span>{lang === 'vi' ? pagesConfig.adminSidebar.switchToEnglish : pagesConfig.adminSidebar.switchToVietnamese}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <User className="size-4" />
                  </div>
                  <div className="flex flex-col gap-0.5 leading-none">
                    <span className="font-semibold">{pagesConfig.adminSidebar.userName}</span>
                    <span className="text-xs text-sidebar-foreground/70">{pagesConfig.adminSidebar.userEmail}</span>
                  </div>
                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="top"
                align="start"
                sideOffset={4}
              >
                <DropdownMenuItem>
                  <Link href="/admin/profile" className="flex items-center w-full">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                  <User className="mr-2 h-4 w-4" />
                  <span>{pagesConfig.adminSidebar.profile}</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>{pagesConfig.adminSidebar.settings}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  <Link href="/login" className="flex items-center w-full">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </Link>
                <DropdownMenuItem className="text-red-600" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{pagesConfig.adminSidebar.logout}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="p-2">
          <SidebarTrigger className="ml-2" />
        </div>
      <SidebarInset>
        {/* Không render Footer ở admin */}
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
} 