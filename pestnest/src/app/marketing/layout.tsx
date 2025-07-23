'use client';

import {
  Search,
  Settings,
  FileText,
  TrendingUp,
  LogOut,
  User,
  ChevronUp,
  Mail,
  Languages,
  MessageCircle,
  LifeBuoy,
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
    title: "Marketing Dashboard",
    url: "/marketing/dashboard",
    icon: TrendingUp,
  },
  {
    title: "Email Marketing",
    url: "/marketing/email",
    icon: Mail,
  },
  {
    title: "Manage Blog",
    url: "/marketing/blog",
    icon: FileText,
  },
  {
    title: "Manage Banner",
    url: "/marketing/banner",
    icon: FileText,
  },
  {
    title: "Manage Review",
    url: "/marketing/review",
    icon: FileText,
  },
  {
    title: "Chăm Sóc Khách Hàng",
    url: "/marketing/messages", // <-- đổi từ /messages thành /marketing/messages
    icon: MessageCircle,
  },
  {
    title: "Yêu cầu hỗ trợ",
    url: "/marketing/supportrequest",
    icon: LifeBuoy,
  }
]

const settingsItems = [
  {
    title: "Cài đặt",
    url: "/marketing/settings",
    icon: Settings,
  },
  {
    title: "Tìm kiếm",
    url: "/marketing/search",
    icon: Search,
  },
]

function MarketingSidebar() {
  const { lang, setLang } = useLanguage();

  const toggleLanguage = () => {
    setLang(lang === 'vi' ? 'en' : 'vi');
  };

  const handleLogout = () => {
    try {
      sessionStorage.removeItem('token');
      if (typeof window !== 'undefined' && window.google?.accounts?.id) {
        try {
          window.google.accounts.id.disableAutoSelect();
        } catch (error) {
          console.error('Error disabling Google auto select:', error);
        }
      }
      window.location.reload();
    } catch (error) {
      console.error('Error during logout:', error);
      window.location.reload();
    }
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/marketing/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <TrendingUp className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">Marketing</span>
                  <span className="text-xs">v1.0.0</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Công cụ Marketing</SidebarGroupLabel>
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
                    <span className="font-semibold">Người dùng Marketing</span>
                    <span className="text-xs text-sidebar-foreground/70">marketing@example.com</span>
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
                <DropdownMenuItem onClick={() => window.location.href = '/marketing/profile'}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Hồ sơ</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Cài đặt</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600" onClick={handleLogout}>
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

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <MarketingSidebar />
      <div className="p-2">
          <SidebarTrigger className="ml-2" />
        </div>
      <SidebarInset>
        {/* Không render Footer ở marketing */}
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
