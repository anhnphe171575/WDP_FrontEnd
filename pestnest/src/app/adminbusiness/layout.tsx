'use client';

import {
  BarChart3,
  Home,
  Search,
  Settings,
  FileText,
  TrendingUp,
  LogOut,
  User,
  ChevronUp,
  Building,
  Users,
  ShoppingCart,
  Package,
  DollarSign,
  Calendar,
  Languages,
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
import { useLanguage } from "@/context/LanguageContext"

// Menu items for the sidebar
const menuItems = [
  {
    title: "Bảng điều khiển",
    url: "/adminbusiness/dashboard",
    icon: Home,
  },
  {
    title: "Quản lý sản phẩm",
    url: "/adminbusiness/manageproduct",
    icon: Package,
  },
  {
    title: "Thống kê doanh thu",
    url: "/adminbusiness/statistics",
    icon: BarChart3,
  },
  {
    title: "Quản lý đơn hàng",
    url: "/adminbusiness/orders",
    icon: ShoppingCart,
  },
  {
    title: "Quản lý khách hàng",
    url: "/adminbusiness/customers",
    icon: Users,
  },
  {
    title: "Quản lý doanh thu",
    url: "/adminbusiness/revenue",
    icon: DollarSign,
  },
  {
    title: "Báo cáo & Phân tích",
    url: "/adminbusiness/analytics",
    icon: BarChart3,
  },
  {
    title: "Lịch làm việc",
    url: "/adminbusiness/schedule",
    icon: Calendar,
  },
  {
    title: "Quản lý kho",
    url: "/adminbusiness/inventory",
    icon: FileText,
  },
  {
    title: "Cài đặt doanh nghiệp",
    url: "/adminbusiness/settings",
    icon: Building,
  },
]

const settingsItems = [
  {
    title: "Cài đặt",
    url: "/adminbusiness/settings",
    icon: Settings,
  },
  {
    title: "Tìm kiếm",
    url: "/adminbusiness/search",
    icon: Search,
  },
]

function AdminBusinessSidebar() {
  const { lang, setLang } = useLanguage();

  const toggleLanguage = () => {
    setLang(lang === 'vi' ? 'en' : 'vi');
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/adminbusiness/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Building className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">Admin Business</span>
                  <span className="text-xs">v1.0.0</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Quản lý Doanh nghiệp</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Khác</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton onClick={toggleLanguage}>
                  <Languages />
                  <span>{lang === 'vi' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}</span>
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
                    <span className="font-semibold">Admin Business</span>
                    <span className="text-xs text-sidebar-foreground/70">admin@business.com</span>
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
                  <User className="mr-2 h-4 w-4" />
                  <span>Hồ sơ</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Cài đặt</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Đăng xuất</span>
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

export default function AdminBusinessLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <AdminBusinessSidebar />
      <div className="p-2">
          <SidebarTrigger className="ml-2" />
        </div>
      <SidebarInset>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
