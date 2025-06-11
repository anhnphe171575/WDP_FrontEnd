"use client"

import { useState } from "react"
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import Header from "@/components/layout/Header"

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image: string
  size?: string
  color?: string
}

export default function ShoppingCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: "1",
      name: "Áo thun Premium Cotton",
      price: 299000,
      quantity: 2,
      image: "/placeholder.svg?height=100&width=100",
      size: "L",
      color: "Đen",
    },
    {
      id: "2",
      name: "Quần jeans Slim Fit",
      price: 599000,
      quantity: 1,
      image: "/placeholder.svg?height=100&width=100",
      size: "32",
      color: "Xanh đậm",
    },
    {
      id: "3",
      name: "Giày sneaker thể thao",
      price: 899000,
      quantity: 1,
      image: "/placeholder.svg?height=100&width=100",
      size: "42",
      color: "Trắng",
    },
  ])

  const [selectedItems, setSelectedItems] = useState<string[]>([])

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return
    setCartItems((items) => items.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item)))
  }

  const removeItem = (id: string) => {
    setCartItems((items) => items.filter((item) => item.id !== id))
    setSelectedItems((prev) => prev.filter((itemId) => itemId !== id))
  }

  const toggleItemSelection = (id: string) => {
    setSelectedItems((prev) => (prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]))
  }

  const toggleSelectAll = () => {
    if (selectedItems.length === cartItems.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(cartItems.map((item) => item.id))
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price)
  }

  const calculateSelectedTotal = () => {
    return cartItems
      .filter((item) => selectedItems.includes(item.id))
      .reduce((sum, item) => sum + item.price * item.quantity, 0)
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Tiếp tục mua sắm
            </Button>
          </div>

          <Card className="text-center py-16">
            <CardContent>
              <ShoppingBag className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h2 className="text-2xl font-semibold mb-2">Giỏ hàng trống</h2>
              <p className="text-gray-600 mb-6">Bạn chưa có sản phẩm nào trong giỏ hàng</p>
              <Button>Bắt đầu mua sắm</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-8 pb-32">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="hover:bg-gray-100">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Tiếp tục mua sắm
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Giỏ hàng</h1>
            <Badge variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-200">
              {cartItems.length} sản phẩm
            </Badge>
          </div>
        </div>

        <div className="space-y-6">
          {/* Select All */}
          <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="select-all"
                    checked={selectedItems.length === cartItems.length && cartItems.length > 0}
                    onChange={toggleSelectAll}
                    className="border-gray-300"
                  />
                  <label htmlFor="select-all" className="font-medium cursor-pointer text-gray-700">
                    Chọn tất cả ({selectedItems.length}/{cartItems.length})
                  </label>
                </div>

                {selectedItems.length > 0 && (
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Tổng tiền đã chọn</div>
                    <div className="text-xl font-semibold text-blue-600">{formatPrice(calculateSelectedTotal())}</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Cart Items */}
          {cartItems.map((item) => (
            <Card 
              key={item.id} 
              className={`shadow-sm hover:shadow-md transition-all duration-200 ${
                selectedItems.includes(item.id) ? "ring-2 ring-blue-500 bg-blue-50/50" : ""
              }`}
            >
              <CardContent className="p-6">
                <div className="flex gap-6">
                  <div className="flex items-start pt-2">
                    <Checkbox
                      id={`item-${item.id}`}
                      checked={selectedItems.includes(item.id)}
                      onChange={() => toggleItemSelection(item.id)}
                      className="border-gray-300"
                    />
                  </div>

                  <img
                    src={item.image || "/placeholder.svg"}
                    alt={item.name}
                    className="w-28 h-28 object-cover rounded-lg shadow-sm"
                  />

                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold text-lg text-gray-900">{item.name}</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex gap-4 text-sm text-gray-600 mb-4">
                      {item.size && (
                        <span className="bg-gray-100 px-3 py-1 rounded-full">Size: {item.size}</span>
                      )}
                      {item.color && (
                        <span className="bg-gray-100 px-3 py-1 rounded-full">Màu: {item.color}</span>
                      )}
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="border-gray-300 hover:bg-gray-100"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-12 text-center font-medium text-gray-900">{item.quantity}</span>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="border-gray-300 hover:bg-gray-100"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="text-right">
                        <div
                          className={`font-semibold text-xl ${
                            selectedItems.includes(item.id) ? "text-blue-600" : "text-gray-900"
                          }`}
                        >
                          {formatPrice(item.price * item.quantity)}
                          {selectedItems.includes(item.id) && (
                            <span className="text-xs text-blue-500 block mt-1">✓ Đã chọn</span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">{formatPrice(item.price)} / sản phẩm</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Floating Action Bar */}
      {selectedItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-50">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <div className="font-medium text-gray-900">
              Đã chọn {selectedItems.length} sản phẩm
              <span className="text-blue-600 font-semibold ml-2 text-xl">{formatPrice(calculateSelectedTotal())}</span>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="border-gray-300 hover:bg-gray-100">
                Thêm vào yêu thích
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8">
                Mua ngay ({selectedItems.length})
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
