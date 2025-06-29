"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React from "react";
import { CheckCircle, Package, Home, ShoppingBag, RotateCcw } from "lucide-react";
import Header from "@/components/layout/Header";
import { useOrder } from "@/context/OrderContext";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const { orderData, clearOrderData } = useOrder();
  const method = searchParams.get("method");
  const [buyAgainMode, setBuyAgainMode] = React.useState(false);

  React.useEffect(() => {
    // Kiểm tra chế độ mua lại từ sessionStorage
    const isBuyAgainMode = sessionStorage.getItem('buyAgainMode') === 'true';
    setBuyAgainMode(isBuyAgainMode);
    
    // Xóa flag chế độ mua lại khỏi sessionStorage
    if (isBuyAgainMode) {
      sessionStorage.removeItem('buyAgainMode');
    }
    
    // Nếu không có orderData và method là cod, chuyển về trang chủ
    if (!orderData && method === 'cod') {
      window.location.href = '/homepage';
    }
  }, [orderData, method]);

  // Tạo orderId giả cho COD (có thể thay bằng timestamp hoặc random string)
  const orderId = method === 'cod' ? `COD-${Date.now()}` : null;

  const handleClearOrderData = () => {
    clearOrderData();
    // Nếu ở chế độ mua lại, không xóa items khỏi localStorage
    if (!buyAgainMode) {
      localStorage.removeItem('checkoutItems');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          {/* Success Icon */}
          <div className="mb-8">
            <CheckCircle className="h-24 w-24 text-green-500 mx-auto" />
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Đặt hàng thành công!
          </h1>
          
          <p className="text-lg text-gray-600 mb-8">
            {method === 'cod' 
              ? 'Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ liên hệ với bạn sớm nhất để xác nhận đơn hàng.'
              : 'Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đã được xử lý thành công.'
            }
          </p>

          {/* Buy Again Mode Notice */}
          {buyAgainMode && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
              <div className="flex items-center justify-center gap-2 text-green-800">
                <RotateCcw className="h-5 w-5" />
                <p className="font-medium">Chế độ mua lại: Sản phẩm vẫn còn trong giỏ hàng để bạn có thể mua lại dễ dàng!</p>
              </div>
            </div>
          )}

          {/* Order Details */}
          {orderData && method === 'cod' && (
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
              <div className="flex items-center justify-center mb-4">
                <Package className="h-6 w-6 text-blue-500 mr-2" />
                <h2 className="text-xl font-semibold">Thông tin đơn hàng</h2>
              </div>
              <p className="text-gray-600 mb-2">
                <span className="font-medium">Mã đơn hàng:</span> {orderId}
              </p>
              <p className="text-gray-600 mb-2">
                <span className="font-medium">Tổng tiền:</span> {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }).format(orderData.amount)}
              </p>
              <p className="text-gray-600 mb-4">
                <span className="font-medium">Phương thức thanh toán:</span> Thanh toán khi nhận hàng (COD)
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <p className="text-blue-800 text-sm">
                  <strong>Lưu ý:</strong> Bạn sẽ thanh toán bằng tiền mặt khi nhận hàng. 
                  Nhân viên giao hàng sẽ liên hệ với bạn trước khi giao hàng.
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/homepage">
              <button 
                className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                onClick={handleClearOrderData}
              >
                <Home className="h-5 w-5" />
                Về trang chủ
              </button>
            </Link>
            
            <Link href="/myorder">
              <button 
                className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
                onClick={handleClearOrderData}
              >
                <ShoppingBag className="h-5 w-5" />
                Xem đơn hàng
              </button>
            </Link>

            {/* Buy Again Button */}
            {buyAgainMode && (
              <Link href="/cart">
                <button 
                  className="flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                  onClick={handleClearOrderData}
                >
                  <RotateCcw className="h-5 w-5" />
                  Mua lại
                </button>
              </Link>
            )}
          </div>

          {/* Additional Info */}
          <div className="mt-12 text-sm text-gray-500">
            <p>Bạn sẽ nhận được email xác nhận đơn hàng trong vài phút tới.</p>
            <p className="mt-2">
              Nếu có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi qua email hoặc số điện thoại hỗ trợ.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 