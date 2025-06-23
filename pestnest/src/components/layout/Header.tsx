'use client';

import * as React from "react"
import {
  Search,
  ShoppingCart,
  Bell,
  User,
  Heart,
  ChevronDown,
  Package,
  Settings,
  LogOut,
} from "lucide-react"
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { api } from "../../../utils/axios"
import { useRouter, usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { useCart } from '@/context/CartContext';
import { MessageCircle } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext';

import axios from 'axios'
import pagesConfigEn from '../../../utils/petPagesConfig.en.js';
import pagesConfigVi from '../../../utils/petPagesConfig.vi.js';

declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          disableAutoSelect: () => void;
        };
      };
    };
  }
}

interface CartItem {
  _id: string;
  variantId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

// Sample cart items


// Sample notifications
const notifications = [
  {
    id: 1,
    title: "Order Shipped",
    message: "Your order #12345 has been shipped",
    time: "2 hours ago",
    read: false,
  },
  {
    id: 2,
    title: "New Offer",
    message: "50% off on electronics - Limited time",
    time: "1 day ago",
    read: false,
  },
  {
    id: 3,
    title: "Order Delivered",
    message: "Your order #12344 has been delivered",
    time: "2 days ago",
    read: true,
  },
]

function CartDropdown() {
  const { items, removeFromCart, updateQuantity, totalItems, totalPrice } = useCart();
  const [isLoading, setIsLoading] = useState(true);
  const [cartData, setCartData] = useState<CartItem[]>([]);
  const { lang, setLang } = useLanguage();
  const config = lang === 'vi' ? pagesConfigVi.header : pagesConfigEn.header;
  useEffect(() => {
    const fetchCartData = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/cart/getlatestcartitem');
        console.log(response.data);

        if (response.data.success && response.data.data) {
          const latestItem = response.data.data;

          // Check if the required properties exist before transforming
          if (latestItem.product && latestItem.product.selectedVariant) {
            // Transform the data to match CartItem interface
            const transformedItem: CartItem = {
              _id: latestItem._id || '',
              variantId: latestItem.product.selectedVariant._id || '',
              name: latestItem.product.name || 'Unknown Product',
              price: latestItem.product.selectedVariant.price || 0,
              quantity: latestItem.quantity || 1,
              image: latestItem.product.selectedVariant.images?.[0]?.url || "/placeholder.svg"
            };
            setCartData([transformedItem]);
          } else {
            // If selectedVariant is missing, set empty cart
            console.warn('Cart item missing selectedVariant:', latestItem);
            setCartData([]);
          }
        } else {
          setCartData([]);
        }
      } catch (error) {
        console.error("Failed to fetch cart data:", error);
        setCartData([]); // Set empty array on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchCartData();
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <ShoppingCart className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="p-4">
          <h3 className="font-semibold mb-3">{config.cart.title}</h3>
          {isLoading ? (
            <div className="flex justify-center items-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : cartData.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              {config.cart.empty}
            </div>
          ) : (
            <>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {cartData.map((item) => (
                  <div key={`${item._id}-${item.variantId}`} className="flex items-center space-x-3">
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      className="w-12 h-12 rounded-md object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      <div className="flex items-center space-x-2">


                      </div>
                    </div>

                  </div>
                ))}
              </div>
              <Separator className="my-3" />

              <div className="space-y-2">
                <Button className="w-full" size="sm" asChild>
                  <Link href="/cart">{config.cart.viewCart}</Link>
                </Button>
              </div>
            </>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function NotificationDropdown() {
  const unreadCount = notifications.filter((n) => !n.read).length

  return (

    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="p-4">
          <h3 className="font-semibold mb-3">Notifications</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 rounded-lg border ${!notification.read ? "bg-blue-50 border-blue-200" : "bg-gray-50"}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <h4 className="text-sm font-medium">{notification.title}</h4>
                  {!notification.read && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                </div>
                <p className="text-sm text-muted-foreground mb-1">{notification.message}</p>
                <p className="text-xs text-muted-foreground">{notification.time}</p>
              </div>
            ))}
          </div>
          <Separator className="my-3" />
          <Button variant="outline" size="sm" className="w-full">
            View All Notifications
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function UserDropdown() {
  const { lang, setLang } = useLanguage();
  const config = lang === 'vi' ? pagesConfigVi.header : pagesConfigEn.header;

  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [user, setUser] = React.useState<{ name: string, email: string } | null>(null);

  React.useEffect(() => {
    const checkAuth = async () => {
      try {
        // Chỉ lấy token từ sessionStorage
        const token = sessionStorage.getItem('token');

        if (!token) {
          setIsLoggedIn(false);
          setUser(null);
          return;
        }

        const axiosInstance = axios.create({
          baseURL: 'http://localhost:5000',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const response = await axiosInstance.get('/api/auth/myprofile');

        if (response.data.success) {
          setUser(response.data.user);
          setIsLoggedIn(true);
        } else {
          // Nếu token không hợp lệ, xóa token
          sessionStorage.removeItem('token');
          setIsLoggedIn(false);
          setUser(null);
        }
      } catch (error: unknown) {
        console.error('Error checking auth:', error);
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 401 || error.response?.status === 403) {
            // Token không hợp lệ hoặc hết hạn
            sessionStorage.removeItem('token');
          }
        }
        setIsLoggedIn(false);
        setUser(null);
      }
    };

    checkAuth();
  }, []);

  const handleLogout = () => {
    try {
      // Xóa token từ sessionStorage
      sessionStorage.removeItem('token');

      // Xóa thông tin Google Sign-In nếu có
      if (typeof window !== 'undefined' && window.google?.accounts?.id) {
        try {
          window.google.accounts.id.disableAutoSelect();
        } catch (error) {
          console.error('Error disabling Google auto select:', error);
        }
      }

      // Cập nhật trạng thái
      setIsLoggedIn(false);
      setUser(null);

      // Reload lại trang để cập nhật UI
      window.location.reload();
    } catch (error) {
      console.error('Error during logout:', error);
      // Dù có lỗi vẫn reload lại trang
      window.location.reload();
    }
  }

  if (!isLoggedIn) {
    return (
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/login">{config.user.login}</Link>
        </Button>
        <Button size="sm" asChild>
          <Link href="/signup">{config.user.signup}</Link>
        </Button>
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
            <User className="h-4 w-4" />
          </div>
          <span className="hidden md:block">{user?.name}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="p-2">
          <p className="text-sm font-medium">{user?.name}</p>
          <p className="text-xs text-muted-foreground">{user?.email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/userProfile" className="flex items-center">
            <User className="mr-2 h-4 w-4" />
            {config.user.myProfile}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/myorder" className="flex items-center">
            <Package className="mr-2 h-4 w-4" />
            {config.user.myOrders}
          </Link>
        </DropdownMenuItem>
        {/* <DropdownMenuItem>
          <Heart className="mr-2 h-4 w-4" />
          Wishlist
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </DropdownMenuItem> */}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-red-600" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          {config.user.logout}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default function Header({ initialSearchTerm = "" }: { initialSearchTerm?: string }) {
  const [searchQuery, setSearchQuery] = React.useState(initialSearchTerm)
  const { lang, setLang } = useLanguage();
  const router = useRouter();
  const [showContacting, setShowContacting] = useState(false);

  // Xử lý khi click vào nút chat
  const handleContactChatbot = () => {
    setShowContacting(true);
    setTimeout(() => {
      setShowContacting(false);
      router.push('/messages');
    }, 1500);
  };

  // Nếu initialSearchTerm thay đổi (khi chuyển trang search), đồng bộ input
  React.useEffect(() => {
    setSearchQuery(initialSearchTerm);
  }, [initialSearchTerm]);

  // Xử lý tìm kiếm khi nhấn nút hoặc Enter
  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products/search/${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="border-b bg-white">
      {/* Main header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href='/homepage'>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">{lang === 'vi' ? pagesConfigVi.header.brand.short : pagesConfigEn.header.brand.short}</span>
              </div>
              <span className="text-xl font-bold">{lang === 'vi' ? pagesConfigVi.header.brand.full : pagesConfigEn.header.brand.full}</span>
            </div>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-8 hidden md:block">
            <form className="relative" onSubmit={handleSearch}>
              <Input
                type="text"
                placeholder={lang === 'vi' ? pagesConfigVi.header.search.placeholder : pagesConfigEn.header.search.placeholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-4 pr-12 py-2 w-full"
              />
              <Button size="sm" className="absolute right-1 top-1 h-8" type="submit">
                <Search className="h-4 w-4" />
              </Button>
            </form>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-2">
            {/* Mobile search */}
            <Button variant="ghost" size="sm" className="md:hidden">
              <Search className="h-5 w-5" />
            </Button>

            {/* Wishlist */}
            <Button variant="ghost" size="sm" className="hidden sm:flex" asChild>
              <Link href="/wishlist" aria-label="Yêu thích">
                <Heart className="h-5 w-5" />
              </Link>
            </Button>

            {/* Language Switcher */}
            <Button variant="outline" size="sm" onClick={() => setLang(lang === 'vi' ? 'en' : 'vi')}>
              {lang === 'vi' ? pagesConfigVi.header.language.vi : pagesConfigEn.header.language.en}
            </Button>
            {/* Nút Chatbot */}
            <Button
              onClick={handleContactChatbot}
              variant="ghost"
              size="sm"
              className="rounded-full p-0 w-10 h-10 flex items-center justify-center transition-all duration-200"
              title="Chat với CSKH"
            >
              <MessageCircle className="h-5 w-5 mx-auto" />
            </Button>

            {/* Notifications và Chat chỉ hiển thị nếu đã đăng nhập */}
            {React.useState(false) && <NotificationDropdown />}

            {/* Cart chỉ hiển thị nếu đã đăng nhập */}
            {React.useState(false) && <CartDropdown />}

            {/* User Account */}
            <UserDropdown />
          </div>
        </div>
      </div>

      {/* Modal thông báo liên hệ CSKH */}
      {showContacting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-lg shadow-lg px-8 py-6 text-center animate-fade-in">
            <p className="text-lg font-semibold text-blue-600 mb-1">Đang liên hệ tới nhân viên chăm sóc khách hàng...</p>
            <div className="flex justify-center mt-2">
              <span className="inline-block w-6 h-6 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></span>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Search Bar */}
      <div className="md:hidden border-t p-4">
        <form className="relative" onSubmit={handleSearch}>
          <Input
            type="text"
            placeholder={lang === 'vi' ? pagesConfigVi.header.search.mobilePlaceholder : pagesConfigEn.header.search.mobilePlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-4 pr-12 py-2 w-full"
          />
          <Button size="sm" className="absolute right-1 top-1 h-8" type="submit">
            <Search className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}