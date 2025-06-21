"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CreditCard, Package, Truck, Plus, MapPin, Edit, Trash2 } from "lucide-react"
import Image from "next/image"
import Header from "@/components/layout/Header"
import { useRouter } from "next/navigation"
import axiosInstance from "../../../utils/axios"

interface CartItem {
  _id: string
  quantity: number
  product: {
    _id: string
    name: string
    description: string
    selectedVariant: {
      _id: string
      price: number
      images: {
        _id: string
        url: string
      }[]
      attributes: {
        value: string
      }[]
    }
  }
}

interface Address {
  _id: string
  street: string
  city: string
  state: string
  postalCode: string
  country: string
  isDefault?: boolean
  // UI specific fields
  id: string
  name: string
  fullName: string
  phone: string
  address: string
}

// Format currency function
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function CheckoutPage() {
  const router = useRouter()
  const [shippingMethod, setShippingMethod] = useState("standard")
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [selectedAddress, setSelectedAddress] = useState<string>("")
  const [showNewAddressForm, setShowNewAddressForm] = useState(false)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch cart items
        const selectedItems = JSON.parse(localStorage.getItem('checkoutItems') || '[]')
        if (selectedItems.length === 0) {
          router.push('/cart')
          return
        }

        const [cartResponse, addressesResponse] = await Promise.all([
          axiosInstance.get('/cart/getcart'),
          axiosInstance.get('/users/addresses')
        ])

        if (cartResponse.data.success) {
          const allItems = cartResponse.data.data.cartItems
          const filteredItems = allItems.filter((item: CartItem) => 
            selectedItems.includes(item._id)
          )
          setCartItems(filteredItems)
        }

        if (addressesResponse.data.success) {
          const userAddresses = addressesResponse.data.data.map((addr: any) => ({
            _id: addr._id,
            id: addr._id, // For UI compatibility
            street: addr.street,
            city: addr.city,
            state: addr.state,
            postalCode: addr.postalCode,
            country: addr.country,
            name: `${addr.street}, ${addr.city}`,
            fullName: addr.fullName || '',
            phone: addr.phone || '',
            address: `${addr.street}, ${addr.city}, ${addr.state}, ${addr.postalCode}, ${addr.country}`,
            isDefault: addr.isDefault || false
          }))
          setAddresses(userAddresses)
          
          // Set default address as selected if exists
          const defaultAddress = userAddresses.find((addr: Address) => addr.isDefault)
          if (defaultAddress) {
            setSelectedAddress(defaultAddress.id)
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router])

  // New address form state
  const [newAddress, setNewAddress] = useState({
    name: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
  })

  const subtotal = cartItems.reduce((total, item) => total + item.product.selectedVariant.price * item.quantity, 0)
  const shipping = shippingMethod === "express" ? 50000 : 30000
  const tax = Math.round(subtotal * 0.1)
  const total = subtotal + shipping + tax

  const handleDeleteAddress = async (addressId: string) => {
    try {
      const response = await axiosInstance.delete(`/users/addresses/${addressId}`);
      console.log(response)
      if (response.data.success) {
        setAddresses(addresses.filter((addr) => addr.id !== addressId));
        if (selectedAddress === addressId) {
          setSelectedAddress("");
        }
      }
    } catch (error) {
      console.error('Error deleting address:', error);
      // You might want to add error handling UI here
    }
  }

  const handleSaveAddress = async (setAsDefault = false) => {
    try {
      const addressData = {
        street: newAddress.street,
        city: newAddress.city,
        state: newAddress.state,
        postalCode: newAddress.postalCode,
      };

      const response = await axiosInstance.post('/users/addresses', addressData);

      if (response.data.success) {
        // Update local state with the new address from the response
        const newAddressFromServer = response.data.data;
        if (setAsDefault) {
          setAddresses([...addresses.map((addr) => ({ ...addr, isDefault: false })), newAddressFromServer]);
        } else {
          setAddresses([...addresses, newAddressFromServer]);
        }

        setSelectedAddress(newAddressFromServer.id);
        setShowNewAddressForm(false);
        setNewAddress({
          name: "",
          street: "",
          city: "",
          state: "",
          postalCode: "",
        });
      }
    } catch (error) {
      console.error('Error saving address:', error);
      // You might want to add error handling UI here
    }
  }

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      alert('Vui lòng chọn địa chỉ giao hàng!')
      return
    }
    setIsPlacingOrder(true)
    try {
      // Prepare payload as needed by your backend
      const payload = {
        addressId: selectedAddress,
        shippingMethod,
        paymentMethod,
        items: cartItems.map(item => ({
          cartItemId: item._id,
          quantity: item.quantity,
        })),
        amount: total,
      }
      const response = await axiosInstance.post('/payment/create-payment', payload)
      if (response.data && response.data.error === 0 && response.data.url) {
        window.location.href = response.data.url
      } else {
        alert('Không thể tạo thanh toán. Vui lòng thử lại!')
      }
    } catch (error) {
      alert('Có lỗi xảy ra khi đặt hàng!')
      console.error(error)
    } finally {
      setIsPlacingOrder(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <Header />
      <h1 className="text-3xl font-bold mb-8">Thanh toán</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column - Cart items and forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cart Items */}
          <Card>
            <CardHeader>
              <CardTitle>Sản phẩm</CardTitle>
              <CardDescription>Xem lại sản phẩm trước khi thanh toán</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {cartItems.map((item) => (
                <div key={item._id} className="flex items-center space-x-4 py-2">
                  <div className="relative h-20 w-20 overflow-hidden rounded-md border">
                    <Image 
                      src={item.product.selectedVariant.images[0]?.url || "/placeholder.svg"} 
                      alt={item.product.name} 
                      fill 
                      className="object-cover" 
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{item.product.name}</h3>
                    <p className="text-sm text-muted-foreground">SL: {item.quantity}</p>
                  </div>
                  <div className="font-medium">
                    {formatCurrency(item.product.selectedVariant.price * item.quantity)}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Address Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Địa chỉ giao hàng</CardTitle>
              <CardDescription>Chọn địa chỉ giao hàng hoặc thêm địa chỉ mới</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Saved Addresses */}
              {addresses.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium">Địa chỉ đã lưu</h4>
                  <RadioGroup value={selectedAddress} onValueChange={setSelectedAddress}>
                    {addresses.map((address) => (
                      <div key={address.id} className="relative">
                        <div className="flex items-start space-x-3 border rounded-lg p-4 hover:bg-muted/50">
                          <RadioGroupItem value={address.id} id={address.id} className="mt-1" />
                          <Label htmlFor={address.id} className="flex-1 cursor-pointer">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{address.name}</span>
                                {address.isDefault && (
                                  <Badge variant="secondary" className="text-xs">
                                    Mặc định
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm font-medium">{address.fullName}</p>
                              <p className="text-sm text-muted-foreground">{address.phone}</p>
                              <p className="text-sm text-muted-foreground flex items-start gap-1">
                                <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                {address.address}
                              </p>
                            </div>
                          </Label>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              onClick={() => handleDeleteAddress(address.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              )}

              {/* Add New Address Button */}
              {!showNewAddressForm && (
                <Button variant="outline" className="w-full" onClick={() => setShowNewAddressForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm địa chỉ mới
                </Button>
              )}

              {/* New Address Form */}
              {showNewAddressForm && (
                <div className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Thêm địa chỉ mới</h4>
                    <Button variant="ghost" size="sm" onClick={() => setShowNewAddressForm(false)}>
                      Hủy
                    </Button>
                  </div>            

                  <div className="space-y-2">
                    <Label htmlFor="street">Đường</Label>
                    <Input
                      id="street"
                      placeholder="Số nhà, tên đường"
                      value={newAddress.street}
                      onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">Thành phố</Label>
                      <Input
                        id="city"
                        placeholder="Thành phố"
                        value={newAddress.city}
                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">Tỉnh/Thành</Label>
                      <Input
                        id="state"
                        placeholder="Tỉnh/Thành"
                        value={newAddress.state}
                        onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Mã bưu điện</Label>
                    <Input
                      id="postalCode"
                      placeholder="Mã bưu điện"
                      value={newAddress.postalCode}
                      onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button className="flex-1" onClick={() => handleSaveAddress(false)}>
                      Lưu địa chỉ
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={() => handleSaveAddress(true)}>
                      Lưu và đặt làm mặc định
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Shipping Method */}
          <Card>
            <CardHeader>
              <CardTitle>Phương thức vận chuyển</CardTitle>
              <CardDescription>Chọn phương thức vận chuyển phù hợp</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={shippingMethod} onValueChange={setShippingMethod} className="space-y-4">
                <div className="flex items-center space-x-2 border rounded-md p-4">
                  <RadioGroupItem value="standard" id="standard" />
                  <Label htmlFor="standard" className="flex items-center gap-2 cursor-pointer">
                    <Truck className="h-5 w-5" />
                    <div>
                      <p className="font-medium">Giao hàng tiêu chuẩn</p>
                      <p className="text-sm text-muted-foreground">3-5 ngày - 30.000₫</p>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-md p-4">
                  <RadioGroupItem value="express" id="express" />
                  <Label htmlFor="express" className="flex items-center gap-2 cursor-pointer">
                    <Package className="h-5 w-5" />
                    <div>
                      <p className="font-medium">Giao hàng nhanh</p>
                      <p className="text-sm text-muted-foreground">1-2 ngày - 50.000₫</p>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        </div>

        {/* Right column - Order summary and payment */}
        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Tổng đơn hàng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Tạm tính</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Phí vận chuyển</span>
                  <span>{formatCurrency(shipping)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Thuế (10%)</span>
                  <span>{formatCurrency(tax)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium text-lg">
                  <span>Tổng cộng</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle>Phương thức thanh toán</CardTitle>
              <CardDescription>Chọn phương thức thanh toán</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-4">
                <div className="flex items-center space-x-2 border rounded-md p-4">
                  <RadioGroupItem value="card" id="card" />
                  <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer">
                    <CreditCard className="h-5 w-5" />
                    <div>
                      <p className="font-medium">Thẻ tín dụng/ghi nợ</p>
                      <p className="text-sm text-muted-foreground">Visa, Mastercard, JCB</p>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-md p-4">
                  <RadioGroupItem value="cod" id="cod" />
                  <Label htmlFor="cod" className="flex items-center gap-2 cursor-pointer">
                    <Package className="h-5 w-5" />
                    <div>
                      <p className="font-medium">Thanh toán khi nhận hàng (COD)</p>
                      <p className="text-sm text-muted-foreground">Thanh toán bằng tiền mặt</p>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
            <CardFooter>
              <Button className="w-full" size="lg" onClick={handlePlaceOrder} disabled={isPlacingOrder}>
                {isPlacingOrder ? 'Đang xử lý...' : 'Đặt hàng'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
