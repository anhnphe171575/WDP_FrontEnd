'use client';

import * as React from "react"
import {
  Search,
  ShoppingCart,
  Bell,
  User,
  Menu,
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
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"

// Sample cart items
const cartItems = [
  {
    id: 1,
    name: "Wireless Headphones",
    price: 99.99,
    quantity: 1,
    image: "/placeholder.svg?height=60&width=60",
  },
  {
    id: 2,
    name: "Smart Watch",
    price: 299.99,
    quantity: 2,
    image: "/placeholder.svg?height=60&width=60",
  },
  {
    id: 3,
    name: "Phone Case",
    price: 19.99,
    quantity: 1,
    image: "/placeholder.svg?height=60&width=60",
  },
]

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
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {totalItems > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
              {totalItems}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="p-4">
          <h3 className="font-semibold mb-3">Shopping Cart ({totalItems} items)</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center space-x-3">
                <img
                  src={item.image || "/placeholder.svg"}
                  alt={item.name}
                  className="w-12 h-12 rounded-md object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    ${item.price} × {item.quantity}
                  </p>
                </div>
                <p className="text-sm font-medium">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>
          <Separator className="my-3" />
          <div className="flex justify-between items-center mb-3">
            <span className="font-semibold">Total: ${totalPrice.toFixed(2)}</span>
          </div>
          <div className="space-y-2">
            <Button className="w-full" size="sm">
              View Cart
            </Button>
            <Button className="w-full" variant="outline" size="sm">
              Checkout
            </Button>
          </div>
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
  const [isLoggedIn, setIsLoggedIn] = React.useState(true) // Toggle this for demo

  if (!isLoggedIn) {
    return (
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="sm" onClick={() => setIsLoggedIn(true)}>
          Login
        </Button>
        <Button size="sm">Sign Up</Button>
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
          <span className="hidden md:block">John Doe</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="p-2">
          <p className="text-sm font-medium">John Doe</p>
          <p className="text-xs text-muted-foreground">john@example.com</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/userProfile" className="flex items-center">
            <User className="mr-2 h-4 w-4" />
            My Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Package className="mr-2 h-4 w-4" />
          My Orders
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Heart className="mr-2 h-4 w-4" />
          Wishlist
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-red-600" onClick={() => setIsLoggedIn(false)}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function MobileMenu() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
          <SheetDescription>Browse our categories</SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold">Categories</h3>
            <div className="space-y-1">
              {["Electronics", "Fashion", "Home & Garden", "Sports", "Books", "Toys"].map((category) => (
                <Button key={category} variant="ghost" className="w-full justify-start">
                  {category}
                </Button>
              ))}
            </div>
          </div>
          <Separator />
          <div className="space-y-2">
            <h3 className="font-semibold">Quick Links</h3>
            <div className="space-y-1">
              {["Deals", "New Arrivals", "Best Sellers", "Customer Service"].map((link) => (
                <Button key={link} variant="ghost" className="w-full justify-start">
                  {link}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default function Header() {
  const [searchQuery, setSearchQuery] = React.useState("")

  return (
    <div className="border-b bg-white">
      {/* Top bar */}


      {/* Main header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Mobile Menu */}
          <div className="flex items-center space-x-4">
            <MobileMenu />
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">S</span>
              </div>
              <span className="text-xl font-bold">ShopHub</span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-8 hidden md:block">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search for products, brands and more..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-4 pr-12 py-2 w-full"
              />
              <Button size="sm" className="absolute right-1 top-1 h-8">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-2">
            {/* Mobile search */}
            <Button variant="ghost" size="sm" className="md:hidden">
              <Search className="h-5 w-5" />
            </Button>

            {/* Wishlist */}
            <Button variant="ghost" size="sm" className="hidden sm:flex">
              <Heart className="h-5 w-5" />
            </Button>

            {/* Notifications */}
            <NotificationDropdown />

            {/* Cart */}
            <CartDropdown />

            {/* User Account */}
            <UserDropdown />
          </div>
        </div>
      </div>

      {/* Navigation Categories */}
      <div className="border-t bg-gray-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center space-x-8 overflow-x-auto">
            {["All Categories", "Electronics", "Fashion", "Home & Garden", "Sports", "Books", "Toys", "Deals"].map(
              (category) => (
                <Button key={category} variant="ghost" size="sm" className="whitespace-nowrap">
                  {category}
                </Button>
              ),
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="md:hidden border-t p-4">
        <div className="relative">
          <Input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-4 pr-12 py-2 w-full"
          />
          <Button size="sm" className="absolute right-1 top-1 h-8">
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
} 