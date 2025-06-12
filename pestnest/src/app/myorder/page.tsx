'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '@/components/layout/Header';
import { Package, Eye, Search, Filter, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Order {
    _id: string;
    total: number;
    finalTotal?: number;
    voucherDiscount?: number;
    status: string;
    paymentMethod: string;
    createAt: string;
    items: {
        productName: string;
        quantity: number;
        price: number;
    }[];
}

interface FilterState {
    status: string;
    paymentMethod: string;
    minPrice: string;
    maxPrice: string;
    startDate: string;
    endDate: string;
}

const MyOrderPage = () => {
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showLoginMessage, setShowLoginMessage] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState<FilterState>({
        status: '',
        paymentMethod: '',
        minPrice: '',
        maxPrice: '',
        startDate: '',
        endDate: ''
    });

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

        const fetchOrders = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/users/orders', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.data.success) {
                    setOrders(response.data.data);
                    setFilteredOrders(response.data.data);
                }
            } catch (err) {
                setError('Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.');
                console.error('Error fetching orders:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [router]);

    useEffect(() => {
        let result = [...orders];

        // Tìm kiếm theo mã đơn hàng
        if (searchTerm) {
            result = result.filter(order =>
                order.items.some(item =>
                    item.productName.toLowerCase().includes(searchTerm.toLowerCase())
                )
            );
        }

        // Lọc theo trạng thái
        if (filters.status) {
            result = result.filter(order => order.status === filters.status);
        }

        // Lọc theo phương thức thanh toán
        if (filters.paymentMethod) {
            result = result.filter(order => order.paymentMethod === filters.paymentMethod);
        }

        // Lọc theo khoảng giá
        if (filters.minPrice) {
            result = result.filter(order => order.total >= Number(filters.minPrice));
        }
        if (filters.maxPrice) {
            result = result.filter(order => order.total <= Number(filters.maxPrice));
        }

        // Lọc theo khoảng thời gian
        if (filters.startDate) {
            result = result.filter(order => new Date(order.createAt) >= new Date(filters.startDate));
        }
        if (filters.endDate) {
            result = result.filter(order => new Date(order.createAt) <= new Date(filters.endDate));
        }

        setFilteredOrders(result);
    }, [orders, searchTerm, filters]);

    const handleFilterChange = (name: string, value: string) => {
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const resetFilters = () => {
        setFilters({
            status: '',
            paymentMethod: '',
            minPrice: '',
            maxPrice: '',
            startDate: '',
            endDate: ''
        });
        setSearchTerm('');
    };

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
        const date = new Date(dateString);
        const timePart = date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        const datePart = date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        return ` ${datePart} ${timePart} `;
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
                        <div className="text-yellow-500 text-xl font-medium mb-4">⚠️ Bạn cần đăng nhập để xem đơn hàng</div>
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
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                        >
                            Thử lại
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <main className="container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto">
                    <div className="bg-white rounded-lg shadow-sm">
                        <div className="p-4 border-b">
                            <h1 className="text-xl font-semibold text-gray-800 mb-4">Đơn hàng của tôi</h1>

                            {/* Thanh tìm kiếm và nút lọc */}
                            <div className="flex gap-4 mb-4">
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        placeholder="Tìm kiếm theo tên sản phẩm..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                </div>
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="flex items-center px-4 py-2 border rounded-lg hover:bg-gray-50"
                                >
                                    <Filter className="h-5 w-5 mr-2" />
                                    Bộ lọc
                                </button>
                            </div>

                            {/* Bộ lọc */}
                            {showFilters && (
                                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                                            <select
                                                value={filters.status}
                                                onChange={(e) => handleFilterChange('status', e.target.value)}
                                                className="w-full border rounded-lg px-3 py-2"
                                            >
                                                <option value="">Tất cả</option>
                                                <option value="pending">Chờ xử lý</option>
                                                <option value="processing">Đang xử lý</option>
                                                <option value="completed">Hoàn thành</option>
                                                <option value="cancelled">Đã hủy</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Phương thức thanh toán</label>
                                            <select
                                                value={filters.paymentMethod}
                                                onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
                                                className="w-full border rounded-lg px-3 py-2"
                                            >
                                                <option value="">Tất cả</option>
                                                <option value="credit_card">Thẻ tín dụng</option>
                                                <option value="cash">Tiền mặt</option>
                                                <option value="momo">Ví MoMo</option>
                                                <option value="bank_transfer">Chuyển khoản</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Khoảng giá</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="number"
                                                    placeholder="Từ"
                                                    value={filters.minPrice}
                                                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                                                    className="w-full border rounded-lg px-3 py-2"
                                                />
                                                <input
                                                    type="number"
                                                    placeholder="Đến"
                                                    value={filters.maxPrice}
                                                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                                                    className="w-full border rounded-lg px-3 py-2"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Ngày đặt hàng</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="date"
                                                    value={filters.startDate}
                                                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                                                    className="w-full border rounded-lg px-3 py-2"
                                                />
                                                <input
                                                    type="date"
                                                    value={filters.endDate}
                                                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                                                    className="w-full border rounded-lg px-3 py-2"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex justify-end">
                                        <button
                                            onClick={resetFilters}
                                            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800"
                                        >
                                            <X className="h-5 w-5 mr-2" />
                                            Xóa bộ lọc
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {filteredOrders.length === 0 ? (
                            <div className="p-8 text-center">
                                <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-500">Không tìm thấy đơn hàng nào</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                STT
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Mã đơn hàng
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-64">
                                                Sản phẩm
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Ngày đặt
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Tổng tiền
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Trạng thái
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Phương thức thanh toán
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Thao tác
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredOrders.map((order, index) => (
                                            <tr key={order._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {index + 1}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    #{order._id.slice(-6)}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500 w-64">
                                                    <div className="space-y-1">
                                                        {order.items.map((item, idx) => (
                                                            <div key={idx}>
                                                                {item.productName}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {formatDate(order.createAt)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {formatCurrency(order.finalTotal !== undefined ? order.finalTotal : order.total)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                                        {order.status === 'cancelled' ? 'Đã hủy' :
                                                            order.status === 'completed' ? 'Hoàn thành' :
                                                                order.status === 'processing' ? 'Đang xử lý' : 'Chờ xử lý'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {order.paymentMethod === 'credit_card' ? 'Thẻ tín dụng' :
                                                        order.paymentMethod === 'cash' ? 'Tiền mặt' :
                                                            order.paymentMethod === 'momo' ? 'Ví MoMo' : 'Chuyển khoản'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <button
                                                        onClick={() => window.location.href = `/myorder/${order._id}`}
                                                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                    >
                                                        <Eye className="w-4 h-4 mr-1" />
                                                        Xem chi tiết
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default MyOrderPage;
