'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '@/components/layout/Header';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { api } from '../../../../utils/axios';

interface OrderItem {
    _id: string;
    product: {
        name: string;
        id: string;
    };
    variant: {
        images: Array<{
            url: string;
        }>;
        attributes: Array<{
            value: string;
            parentId: string | null;
        }>;
        sellPrice: number;
    };
    quantity: number;
    price: number;
    totalPrice: number;
}

interface OrderDetails {
    _id: string;
    OrderItems: OrderItem[];
    total: number;
    finalTotal?: number;
    voucherDiscount?: number;
    status: string;
    paymentMethod: string;
    createAt: string;
    updateAt: string;
}

const OrderDetailsPage = ({ params }: { params: Promise<{ id: string }> }) => {
    const resolvedParams = React.use(params);
    const [order, setOrder] = useState<OrderDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showLoginMessage, setShowLoginMessage] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const token = sessionStorage.getItem('token');
        if (!token) {
            setShowLoginMessage(true);
            setLoading(false);
            setTimeout(() => {
                router.push('/login');
            }, 2000);
            return;
        }

        const fetchOrderDetails = async () => {
            try {
                const response = await api.get(`/users/orders/${resolvedParams.id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (response.data.success) {
                    setOrder(response.data.data);
                } else {
                    setError('Không thể tải thông tin đơn hàng. Vui lòng thử lại sau.');
                }
            } catch (err) {
                setError('Không thể tải thông tin đơn hàng. Vui lòng thử lại sau.');
                console.error('Error fetching order details:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrderDetails();
    }, [resolvedParams.id, router]);

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'processing':
                return 'bg-blue-100 text-blue-800';
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    if (showLoginMessage) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="container mx-auto px-4 py-8">
                    <div className="bg-white p-8 rounded-lg shadow-md text-center">
                        <div className="text-yellow-500 text-xl font-medium mb-4">⚠️ Bạn cần đăng nhập để xem chi tiết đơn hàng</div>
                        <p className="text-gray-500">Đang chuyển hướng đến trang đăng nhập...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="container mx-auto px-4 py-8">
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="container mx-auto px-4 py-8">
                    <div className="bg-white p-8 rounded-lg shadow-md text-center">
                        <div className="text-red-500 text-xl font-medium mb-4">⚠️ {error}</div>
                        <button
                            onClick={() => router.back()}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                        >
                            Quay lại
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!order) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <main className="container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-6">
                        <button
                            onClick={() => router.back()}
                            className="inline-flex items-center text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeft className="w-5 h-5 mr-2" />
                            Quay lại
                        </button>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm">
                        <div className="p-6 border-b">
                            <div className="flex justify-between items-center">
                                <h1 className="text-2xl font-semibold text-gray-800">Chi tiết đơn hàng</h1>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                                    {order.status === 'cancelled' ? 'Đã hủy' :
                                        order.status === 'completed' ? 'Hoàn thành' :
                                            order.status === 'processing' ? 'Đang xử lý' : 'Chờ xử lý'}
                                </span>
                            </div>
                            <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-gray-600">
                                <div>
                                    <p>Mã đơn hàng: #{order._id.slice(-6)}</p>
                                    <p>Ngày đặt: {formatDate(order.createAt)}</p>
                                    <p>Cập nhật lần cuối: {formatDate(order.updateAt)}</p>
                                </div>
                                <div>
                                    <p>Phương thức thanh toán: {
                                        order.paymentMethod === 'credit_card' ? 'Thẻ tín dụng' :
                                            order.paymentMethod === 'cash' ? 'Tiền mặt' :
                                                order.paymentMethod === 'momo' ? 'Ví MoMo' : 'Chuyển khoản'
                                    }</p>
                                    <button
                                        onClick={() => {
                                            // TODO: Implement reorder functionality
                                            alert('Chức năng đang được phát triển');
                                        }}
                                        className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                    >
                                        Mua lại
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="p-6">
                            <h2 className="text-lg font-medium text-gray-800 mb-4">Sản phẩm đã đặt</h2>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Sản phẩm
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Ảnh
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Loại
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Đơn giá
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Số lượng
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Thành tiền
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {order.OrderItems.map((item) => (
                                            <tr key={item._id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {item.product.name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {item.variant?.images?.[0]?.url ? (
                                                        <img 
                                                            src={item.variant.images[0].url} 
                                                            alt={item.product.name}
                                                            className="h-48 w-48 object-cover rounded"
                                                        />
                                                    ) : (
                                                        <div className="h-48 w-48 bg-gray-100 rounded flex items-center justify-center">
                                                            <span className="text-gray-400 text-sm">Không có ảnh</span>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {item.variant?.attributes?.find(attr => attr.parentId === null)?.value || 'Không có'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {formatCurrency(item.price)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {item.quantity}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {formatCurrency(item.totalPrice)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td colSpan={5} className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                                                Tổng cộng:
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {formatCurrency(order.total)}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                            <h2 className="text-lg font-medium text-gray-800 mb-4">Thông tin thanh toán</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                                <div>
                                    <p>Tổng tiền gốc: <span className="font-semibold text-gray-900">{formatCurrency(order.total)}</span></p>
                                    {order.voucherDiscount !== undefined && order.voucherDiscount > 0 && (
                                        <p>Giảm giá Voucher: <span className="font-semibold text-red-600">- {formatCurrency(order.voucherDiscount)}</span></p>
                                    )}
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-semibold text-gray-900">Tổng cộng: {formatCurrency(order.finalTotal !== undefined ? order.finalTotal : order.total)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default OrderDetailsPage;
