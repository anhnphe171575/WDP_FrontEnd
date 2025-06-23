"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React from "react";
import {api} from '../../../../utils/axios';
import { useOrder } from "@/context/OrderContext";

export default function PaymentSuccessPage() {

  const searchParams = useSearchParams();
  const { orderData } = useOrder();
  const [paymentStatus, setPaymentStatus] = React.useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = React.useState('');
  const hasFetchedRef = React.useRef(false);

  // Lấy từng tham số
  const items = searchParams.get("items");
  const addressId = searchParams.get("addressId");
  const amount = searchParams.get("amount");
  const shippingMethod = searchParams.get("shippingMethod");
  const paymentMethod = searchParams.get("paymentMethod");
  const code = searchParams.get("code");
  const id = searchParams.get("id");
  const cancel = searchParams.get("cancel");
  const status = searchParams.get("status");
  const orderCode = searchParams.get("orderCode");
  const method = searchParams.get("method");

  React.useEffect(() => {
    // Chỉ fetch một lần duy nhất
    if (hasFetchedRef.current) return;
    
    // Chỉ fetch khi có đủ dữ liệu cần thiết
    const shouldFetch = method === 'cod' ? orderData !== null : true;
    
    if (!shouldFetch) return;

    hasFetchedRef.current = true;

    const fetchPaymentCallback = async () => {
      try {
        // Chuẩn bị payload cho API callback
        let payload: any = {
          items,
          addressId,
          amount,
          shippingMethod,
          paymentMethod,
          code,
          id,
          cancel,
          status,
          orderCode
        };

        // Nếu là COD, sử dụng dữ liệu từ context
        if (method === 'cod' && orderData) {
          payload = {
            ...payload,
            items: JSON.stringify(orderData.items),
            addressId: orderData.addressId,
            amount: orderData.amount.toString(),
            shippingMethod: orderData.shippingMethod,
            paymentMethod: orderData.paymentMethod,
            method: 'cod'
          };
        }

        // Gọi API /payment/callback cho cả COD và card payment
        const response = await api.post('/payment/callback', payload);
        console.log('Payment callback response:', response.data);
        
        // Kiểm tra giá trị error từ response
        if (response.data.error === 0) {
          setPaymentStatus('success');
          setMessage('Thanh toán thành công! Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đã được xử lý thành công.');
        } else if (response.data.error === 1) {
          setPaymentStatus('error');
          setMessage('Thanh toán thất bại! Có lỗi xảy ra trong quá trình xử lý đơn hàng.');
        } else {
          setPaymentStatus('error');
          setMessage('Có lỗi không xác định xảy ra. Vui lòng thử lại sau.');
        }
      } catch (error) {
        console.error('Error fetching payment callback:', error);
        setPaymentStatus('error');
        setMessage('Có lỗi kết nối xảy ra. Vui lòng kiểm tra lại kết nối mạng.');
      }
    };
    fetchPaymentCallback();
  }, [method, orderData]); // Loại bỏ hasFetched khỏi dependency array

  if (paymentStatus === 'loading') {
    return (
      <div style={{
        minHeight: "80vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#f6fff7"
      }}>
        <div style={{ fontSize: 18, color: "#16a34a" }}>Đang xử lý thanh toán...</div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "80vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "#f6fff7"
    }}>
      {paymentStatus === 'success' ? (
        <>
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="12" fill="#4ade80"/>
            <path d="M7 13l3 3 7-7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h1 style={{ color: "#16a34a", marginTop: 24 }}>Thanh toán thành công!</h1>
        </>
      ) : (
        <>
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="12" fill="#ef4444"/>
            <path d="M15 9l-6 6M9 9l6 6" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h1 style={{ color: "#dc2626", marginTop: 24 }}>Thanh toán thất bại!</h1>
        </>
      )}
      <p style={{ margin: "16px 0 32px 0", color: "#333", textAlign: "center", maxWidth: "400px" }}>
        {message}
      </p>
      <Link href="/homepage">
        <button style={{
          background: paymentStatus === 'success' ? "#16a34a" : "#dc2626",
          color: "#fff",
          padding: "10px 24px",
          border: "none",
          borderRadius: 6,
          fontSize: 16,
          cursor: "pointer"
        }}>
          Về trang chủ
        </button>
      </Link>
    </div>
  );
}
