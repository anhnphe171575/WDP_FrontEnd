"use client"

import { useState, useEffect, Fragment } from "react"
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
import { useOrder } from "@/context/OrderContext"
import { useLanguage } from '@/context/LanguageContext';
import viConfig from '../../../utils/petPagesConfig.vi';
import enConfig from '../../../utils/petPagesConfig.en';

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

// Thêm hàm chỉnh sửa địa chỉ
async function updateAddress(addressId: string, addressData: Partial<Address>) {
  try {
    const response = await axiosInstance.put(`/users/addresses/${addressId}`, addressData)
    return response.data
  } catch (error) {
    console.error('Error updating address:', error)
    throw error
  }
}

export { updateAddress }

export default function CheckoutPage() {
  const { lang } = useLanguage();
  const pagesConfig = lang === 'vi' ? viConfig : enConfig;
  const checkoutConfig = pagesConfig.checkout;
  const router = useRouter()
  const { setOrderData } = useOrder()
  const [shippingMethod, setShippingMethod] = useState("standard")
  const [paymentMethod, setPaymentMethod] = useState("")
  const [selectedAddress, setSelectedAddress] = useState<string>("")
  const [showNewAddressForm, setShowNewAddressForm] = useState(false)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)
  const [paymentError, setPaymentError] = useState("")
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [editAddressData, setEditAddressData] = useState({
    street: "",
    city: "",
    state: "",
    postalCode: "",
  })
  // Fetch user vouchers
  const [vouchers, setVouchers] = useState<any[]>([])
  const [selectedVoucherId, setSelectedVoucherId] = useState<string>("")
  const [showVoucherModal, setShowVoucherModal] = useState(false)
  const [showAddressModal, setShowAddressModal] = useState(false)

  // Lọc voucher hợp lệ (chưa dùng và còn hạn)
  const now = new Date();
  const validVouchers = vouchers.filter(voucher => {
    if (voucher.used) return false;
    const validFrom = voucher.voucherId?.validFrom ? new Date(voucher.voucherId.validFrom) : null;
    const validTo = voucher.voucherId?.validTo ? new Date(voucher.voucherId.validTo) : null;
    const isValid = (!validFrom || now >= validFrom) && (!validTo || now <= validTo);
    return isValid;
  });

  // Thêm hàm fetchAddresses để lấy lại danh sách địa chỉ mới nhất thay vì chỉ cập nhật state cục bộ
  const fetchAddresses = async () => {
    try {
      const addressesResponse = await axiosInstance.get('/users/addresses')
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
      }
    } catch (err) {
      console.error('Error fetching addresses:', err)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch cart items
        const selectedItems = JSON.parse(localStorage.getItem('checkoutItems') || '[]')
        if (selectedItems.length === 0) {
          router.push('/cart')
          return
        }

        const [cartResponse, addressesResponse, vouchersResponse] = await Promise.all([
          axiosInstance.get('/cart/getcart'),
          axiosInstance.get('/users/addresses'),
          axiosInstance.get('/vouchers/user'),
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

        // Set vouchers state
        if (Array.isArray(vouchersResponse.data)) {
          setVouchers(vouchersResponse.data)
        } else if (vouchersResponse.data && vouchersResponse.data.data) {
          setVouchers(vouchersResponse.data.data)
        } else {
          setVouchers([])
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
  // Calculate voucher discount
  let voucherDiscount = 0
  let selectedVoucher: any = null
  if (selectedVoucherId) {
    selectedVoucher = vouchers.find(v => v._id === selectedVoucherId)
    if (selectedVoucher && !selectedVoucher.used) {
      const now = new Date()
      const validFrom = selectedVoucher.voucherId?.validFrom ? new Date(selectedVoucher.voucherId.validFrom) : null
      const validTo = selectedVoucher.voucherId?.validTo ? new Date(selectedVoucher.voucherId.validTo) : null
      const isValid = (!validFrom || now >= validFrom) && (!validTo || now <= validTo)
      if (isValid) {
        if (selectedVoucher.voucherId?.discountAmount > 0) {
          voucherDiscount = selectedVoucher.voucherId.discountAmount
        } else if (selectedVoucher.voucherId?.discountPercent > 0) {
          voucherDiscount = Math.round(subtotal * (selectedVoucher.voucherId.discountPercent / 100))
        }
      }
    }
  }
  const shipping = shippingMethod === "express" ? 0 : 0
  const tax = Math.round(subtotal * 0.0)
  const total = subtotal + shipping + tax - voucherDiscount

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
        await fetchAddresses(); // Fetch lại danh sách địa chỉ từ server

        setSelectedAddress(response.data.data.id); // Chọn địa chỉ mới làm selected
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
      alert(checkoutConfig.errorSelectAddress)
      return
    }
    
    if (!paymentMethod) {
      setPaymentError(checkoutConfig.errorSelectPayment)
      setPaymentError("")
      return
    }
    
    setPaymentError("")
    setIsPlacingOrder(true)
    try {
      // Lấy dữ liệu từ sessionStorage và localStorage
      const rebuyItems = JSON.parse(sessionStorage.getItem('rebuyItems') || '[]')
      const buyAgainMode = localStorage.getItem('buyAgainMode') === 'true'
      
      const payload = {
        addressId: selectedAddress,
        shippingMethod,
        paymentMethod,
        items: cartItems.map(item => ({
          cartItemId: item._id,
          quantity: item.quantity,
        })),
        amount: total,
        voucherId: selectedVoucherId, // Thêm voucherId vào payload
        // Thêm dữ liệu mua lại vào payload
        rebuyItems: rebuyItems
      }
      
      // Nếu chọn COD, lưu vào context và chuyển hướng
      console.log("payload",payload)
      if (paymentMethod === 'cod') {
        setOrderData(payload)
        // Chỉ xóa items đã checkout khỏi localStorage nếu không ở chế độ mua lại
        
        // Xóa flag chế độ mua lại
        // Chuyển đến trang thành công
        router.push('/payment/result?method=cod')
      } else {
        // Thanh toán online - gọi API payment như cũ
        const response = await axiosInstance.post('/payment/create-payment', payload)
        if (response.data && response.data.error === 0 && response.data.url) {
          // Lưu thông tin chế độ mua lại vào sessionStorage để sử dụng sau khi thanh toán
          
          // Xóa flag chế độ mua lại khỏi localStorage
          window.location.href = response.data.url
        } else {
          alert(checkoutConfig.errorCreatePayment)
        }
      }
    } catch (error) {
      alert(checkoutConfig.errorPlaceOrder)
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
      <h1 className="text-3xl font-bold mb-8 text-center w-full mt-10">Thanh toán</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column - Cart items and forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cart Items */}
          <Card>
            <CardHeader>
              <CardTitle>{checkoutConfig.productTitle}</CardTitle>
              <CardDescription>{checkoutConfig.productDescription}</CardDescription>
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
                    <p className="text-sm text-muted-foreground">{checkoutConfig.productQuantity.replace('{item.quantity}', String(item.quantity))}</p>
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
              <CardTitle>{checkoutConfig.addressTitle}</CardTitle>
              <CardDescription>{checkoutConfig.addressDescription}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Saved Addresses */}
              {addresses.length > 0 && (
                <Fragment>
                  <div className="space-y-3">
                    <h4 className="font-medium">Địa chỉ đã lưu</h4>
                    <RadioGroup value={selectedAddress} onValueChange={setSelectedAddress}>
                      {(addresses.length > 1 ? addresses.slice(0, 1) : addresses).map((address) => (
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
                              </div>
                            </Label>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => {
                                  setEditingAddress(address)
                                  setEditAddressData({
                                    street: address.street,
                                    city: address.city,
                                    state: address.state,
                                    postalCode: address.postalCode,
                                  })
                                }}
                              >
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
                    {addresses.length > 1 && (
                      <Button variant="outline" className="w-full mt-2" onClick={() => setShowAddressModal(true)}>
                        Xem thêm địa chỉ
                      </Button>
                    )}
                  </div>
                  {/* Modal Popup for all addresses */}
                  {showAddressModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                      <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative">
                        <button
                          className="absolute top-2 right-2 text-gray-500 hover:text-black text-xl"
                          onClick={() => setShowAddressModal(false)}
                          aria-label="Đóng"
                        >
                          ×
                        </button>
                        <h2 className="text-xl font-bold mb-4">Tất cả địa chỉ của bạn</h2>
                        <RadioGroup value={selectedAddress} onValueChange={setSelectedAddress}>
                          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
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
                                    </div>
                                  </Label>
                                  <div className="flex gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0"
                                      onClick={() => {
                                        setEditingAddress(address)
                                        setEditAddressData({
                                          street: address.street,
                                          city: address.city,
                                          state: address.state,
                                          postalCode: address.postalCode,
                                        })
                                      }}
                                    >
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
                          </div>
                        </RadioGroup>
                      </div>
                    </div>
                  )}
                </Fragment>
              )}

              {editingAddress && (
                <div className="border rounded-lg p-4 space-y-4 mt-4">
                  <h4 className="font-medium">{checkoutConfig.editAddressTitle}</h4>
                  <div className="space-y-2">
                    <Label htmlFor="edit-street">{checkoutConfig.streetLabel}</Label>
                    <Input
                      id="edit-street"
                      value={editAddressData.street}
                      onChange={e => setEditAddressData({ ...editAddressData, street: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-city">{checkoutConfig.cityLabel}</Label>
                      <Input
                        id="edit-city"
                        value={editAddressData.city}
                        onChange={e => setEditAddressData({ ...editAddressData, city: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-state">{checkoutConfig.stateLabel}</Label>
                      <Input
                        id="edit-state"
                        value={editAddressData.state}
                        onChange={e => setEditAddressData({ ...editAddressData, state: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-postalCode">{checkoutConfig.postalCodeLabel}</Label>
                    <Input
                      id="edit-postalCode"
                      value={editAddressData.postalCode}
                      onChange={e => setEditAddressData({ ...editAddressData, postalCode: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      onClick={async () => {
                        try {
                          await updateAddress(editingAddress.id, editAddressData)
                          await fetchAddresses()
                          setEditingAddress(null)
                        } catch (error) {
                          alert(checkoutConfig.errorUpdateAddress)
                        }
                      }}
                    >
                      {checkoutConfig.saveChanges}
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setEditingAddress(null)}
                    >
                      {checkoutConfig.cancel}
                    </Button>
                  </div>
                </div>
              )}

              {/* Add New Address Button */}
              {!showNewAddressForm && (
                <Button variant="outline" className="w-full" onClick={() => setShowNewAddressForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  {checkoutConfig.addNewAddress}
                </Button>
              )}

              {/* New Address Form */}
              {showNewAddressForm && (
                <div className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{checkoutConfig.addNewAddressTitle}</h4>
                    <Button variant="ghost" size="sm" onClick={() => setShowNewAddressForm(false)}>
                      {checkoutConfig.cancel}
                    </Button>
                  </div>            

                  <div className="space-y-2">
                    <Label htmlFor="street">{checkoutConfig.streetLabel}</Label>
                    <Input
                      id="street"
                      placeholder={checkoutConfig.streetPlaceholder}
                      value={newAddress.street}
                      onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">{checkoutConfig.cityLabel}</Label>
                      <Input
                        id="city"
                        placeholder={checkoutConfig.cityPlaceholder}
                        value={newAddress.city}
                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">{checkoutConfig.stateLabel}</Label>
                      <Input
                        id="state"
                        placeholder={checkoutConfig.statePlaceholder}
                        value={newAddress.state}
                        onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="postalCode">{checkoutConfig.postalCodeLabel}</Label>
                    <Input
                      id="postalCode"
                      placeholder={checkoutConfig.postalCodePlaceholder}
                      value={newAddress.postalCode}
                      onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button className="flex-1" onClick={() => handleSaveAddress(false)}>
                      {checkoutConfig.saveAddress}
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={() => handleSaveAddress(true)}>
                      {checkoutConfig.saveAndSetDefault}
                    </Button>
                  </div>
                </div>
              )}
              {/* Voucher List */}
              {validVouchers.length > 0 && (
                <Fragment>
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle>Voucher của bạn</CardTitle>
                      <CardDescription>Chọn voucher để áp dụng giảm giá cho đơn hàng</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {(validVouchers.length > 1 ? validVouchers.slice(0, 1) : validVouchers).map((voucher: any) => (
                        <div key={voucher._id} className={`border rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2 ${selectedVoucherId === voucher._id ? 'border-blue-500 bg-blue-50' : ''}`}>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-lg">{voucher.voucherId?.code}</span>
                              {voucher.used && (
                                <Badge variant="destructive">Đã dùng</Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {voucher.voucherId?.discountAmount > 0
                                ? `Giảm ${formatCurrency(voucher.voucherId.discountAmount)}`
                                : voucher.voucherId?.discountPercent > 0
                                ? `Giảm ${voucher.voucherId.discountPercent}%`
                                : 'Không có giảm giá'}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Hiệu lực: {voucher.voucherId?.validFrom ? new Date(voucher.voucherId.validFrom).toLocaleDateString() : ''} - {voucher.voucherId?.validTo ? new Date(voucher.voucherId.validTo).toLocaleDateString() : ''}
                            </div>
                          </div>
                          <div>
                            <Button
                              size="sm"
                              variant={selectedVoucherId === voucher._id ? 'secondary' : 'outline'}
                              disabled={selectedVoucherId === voucher._id}
                              onClick={() => setSelectedVoucherId(voucher._id)}
                            >
                              {selectedVoucherId === voucher._id ? 'Đã chọn' : 'Chọn'}
                            </Button>
                          </div>
                        </div>
                      ))}
                      {validVouchers.length > 1 && (
                        <Button variant="outline" className="w-full mt-2" onClick={() => setShowVoucherModal(true)}>
                          Xem thêm voucher
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                  {/* Modal Popup for all vouchers */}
                  {showVoucherModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                      <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative">
                        <button
                          className="absolute top-2 right-2 text-gray-500 hover:text-black text-xl"
                          onClick={() => setShowVoucherModal(false)}
                          aria-label="Đóng"
                        >
                          ×
                        </button>
                        <h2 className="text-xl font-bold mb-4">Tất cả voucher của bạn</h2>
                        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                          {validVouchers.map((voucher: any) => (
                            <div key={voucher._id} className={`border rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2 ${selectedVoucherId === voucher._id ? 'border-blue-500 bg-blue-50' : ''}`}>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-lg">{voucher.voucherId?.code}</span>
                                  {voucher.used && (
                                    <Badge variant="destructive">Đã dùng</Badge>
                                  )}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {voucher.voucherId?.discountAmount > 0
                                    ? `Giảm ${formatCurrency(voucher.voucherId.discountAmount)}`
                                    : voucher.voucherId?.discountPercent > 0
                                    ? `Giảm ${voucher.voucherId.discountPercent}%`
                                    : 'Không có giảm giá'}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Hiệu lực: {voucher.voucherId?.validFrom ? new Date(voucher.voucherId.validFrom).toLocaleDateString() : ''} - {voucher.voucherId?.validTo ? new Date(voucher.voucherId.validTo).toLocaleDateString() : ''}
                                </div>
                              </div>
                              <div>
                                <Button
                                  size="sm"
                                  variant={selectedVoucherId === voucher._id ? 'secondary' : 'outline'}
                                  disabled={selectedVoucherId === voucher._id}
                                  onClick={() => setSelectedVoucherId(voucher._id)}
                                >
                                  {selectedVoucherId === voucher._id ? 'Đã chọn' : 'Chọn'}
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </Fragment>
              )}
            </CardContent>
          </Card>

          {/* Shipping Method */}
          <Card>
            <CardHeader>
              <CardTitle>{checkoutConfig.shippingTitle}</CardTitle>
              <CardDescription>{checkoutConfig.shippingDescription}</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={shippingMethod} onValueChange={setShippingMethod} className="space-y-4">
                <div className="flex items-center space-x-2 border rounded-md p-4">
                  <RadioGroupItem value="standard" id="standard" />
                  <Label htmlFor="standard" className="flex items-center gap-2 cursor-pointer">
                    <Truck className="h-5 w-5" />
                    <div>
                      <p className="font-medium">{checkoutConfig.shippingStandard}</p>
                      <p className="text-sm text-muted-foreground">{checkoutConfig.shippingStandardDesc}</p>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-md p-4">
                  <RadioGroupItem value="express" id="express" />
                  <Label htmlFor="express" className="flex items-center gap-2 cursor-pointer">
                    <Package className="h-5 w-5" />
                    <div>
                      <p className="font-medium">{checkoutConfig.shippingExpress}</p>
                      <p className="text-sm text-muted-foreground">{checkoutConfig.shippingExpressDesc}</p>
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
              <CardTitle>{checkoutConfig.orderSummaryTitle}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>{checkoutConfig.subtotal}</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                {voucherDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Giảm giá voucher</span>
                    <span>-{formatCurrency(voucherDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>{checkoutConfig.shippingFee}</span>
                  <span>{formatCurrency(shipping)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{checkoutConfig.tax}</span>
                  <span>{formatCurrency(tax)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium text-lg">
                  <span>{checkoutConfig.total}</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle>{checkoutConfig.paymentTitle}</CardTitle>
              <CardDescription>{checkoutConfig.paymentDescription}</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={paymentMethod} onValueChange={(value) => {
                setPaymentMethod(value)
                setPaymentError("")
              }} className="space-y-4">
                <div className="flex items-center space-x-2 border rounded-md p-4">
                  <RadioGroupItem value="PayOs" id="PayOs" />
                  <Label htmlFor="PayOs" className="flex items-center gap-2 cursor-pointer">
                    <CreditCard className="h-5 w-5" />
                    <div>
                      <p className="font-medium">{checkoutConfig.paymentCreditCard}</p>
                      <p className="text-sm text-muted-foreground">{checkoutConfig.paymentCreditCardDesc}</p>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-md p-4">
                  <RadioGroupItem value="cod" id="cod" />
                  <Label htmlFor="cod" className="flex items-center gap-2 cursor-pointer">
                    <Package className="h-5 w-5" />
                    <div>
                      <p className="font-medium">{checkoutConfig.paymentCOD}</p>
                      <p className="text-sm text-muted-foreground">{checkoutConfig.paymentCODDesc}</p>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
              {paymentError && (
                <p className="text-sm text-red-500 mt-2">{paymentError}</p>
              )}
            </CardContent>
            <CardFooter>
              <Button className="w-full" size="lg" onClick={handlePlaceOrder} disabled={isPlacingOrder}>
                {isPlacingOrder ? checkoutConfig.processing : checkoutConfig.placeOrder}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
