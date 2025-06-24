'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
        _id: string;
        productName: string;
        quantity: number;
        price: number;
        status: string;
        images: {
            url: string;
        }[];
        attributes: [
            string]


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
    const [cancelOrder, setCancelOrder] = useState<Order | null>(null);
    const [cancelReason, setCancelReason] = useState('');
    const [isChecked, setIsChecked] = useState(false);

    // State for return dialog
    const [returnOrder, setReturnOrder] = useState<Order | null>(null);
    const [returnReason, setReturnReason] = useState('');
    const [returnItems, setReturnItems] = useState<Map<string, number>>(new Map());

    const fetchOrders = useCallback(async () => {
        const token = sessionStorage.getItem('token');
        if (!token) {
            setShowLoginMessage(true);
            setLoading(false);
            setTimeout(() => {
                router.push('/login');
            }, 2000);
            return;
        }

        setLoading(true);
        try {
            const response = await axios.get('http://localhost:5000/api/users/orders', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data.success) {
                setOrders(response.data.data);
                console.log('Fetched orders:', response.data.data);
                setFilteredOrders(response.data.data);
            }
        } catch (err) {
            setError('Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.');
            console.error('Error fetching orders:', err);
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

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

    const handleCancelClick = (order: Order) => {
        setCancelOrder(order);
        console.log('aa',order)
    };

    const handleConfirmCancel = async () => {
        if (!cancelOrder) return;
        setLoading(true);
        const token = sessionStorage.getItem('token');

        try {
            const itemsToCancel = cancelOrder.items.map(item => ({
                orderItemId: item._id,
                cancelQuantity: item.quantity
            }));

            const requestBody = {
                reason: cancelReason,
                items: itemsToCancel,
            };

            const url = `http://localhost:5000/api/orders/${cancelOrder._id}/orderItem/cancelled`;

            await axios.put(url, requestBody, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            await fetchOrders();
        } catch (err) {
            setError('Không thể hủy đơn hàng. Vui lòng thử lại.');
            console.error('Error cancelling order:', err);
        } finally {
            setCancelOrder(null);
            setCancelReason('');
            setLoading(false);
        }
    };

    // Handlers for return functionality
    const handleReturnClick = (order: Order) => {
        setReturnOrder(order);
        setReturnItems(new Map());
        setReturnReason('');
    };

    const handleToggleReturnItem = (itemId: string) => {
        console.log(itemId);

        setReturnItems(prev => {
            const newMap = new Map(prev);
            if (newMap.has(itemId)) {
                newMap.delete(itemId);
            } else {
                newMap.set(itemId, 1); // Default to 1 when checked
            }
            return newMap;
        });
    };

    const handleReturnQuantityChange = (itemId: string, newQuantity: number, maxQuantity: number) => {
        if (newQuantity >= 1 && newQuantity <= maxQuantity) {
            setReturnItems(prev => {
                const newMap = new Map(prev);
                newMap.set(itemId, newQuantity);
                return newMap;
            });
        }
    };

    const handleConfirmReturn = async () => {
        if (!returnOrder || returnItems.size === 0) {
            alert("Vui lòng chọn ít nhất một sản phẩm để trả hàng.");
            return;
        }

        setLoading(true);
        const token = sessionStorage.getItem('token');

        const itemsToReturn = Array.from(returnItems.entries()).map(([itemId, quantity]) => ({
            orderItemId: itemId,
            returnQuantity: quantity,
        }));

        const requestBody = {
            reason: returnReason,
            items: itemsToReturn,
        };

        const url = `http://localhost:5000/api/orders/${returnOrder._id}/orderItem/request-return`;

        try {
            await axios.put(url, requestBody, { headers: { 'Authorization': `Bearer ${token}` } });
            await fetchOrders();
        } catch (err) {
            setError('Không thể gửi yêu cầu trả hàng. Vui lòng thử lại.');
            console.error('Error requesting return:', err);
        } finally {
            setReturnOrder(null);
            setLoading(false);
        }
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
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Hành động
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
                                                                order.status === 'processing' ? 'Đang xử lý' :
                                                                order.status ==='pending'? 'Chờ xử lý':
                                                                order.status === 'returned' ? 'Hoàn hàng' : "Đang chờ xử lý"}
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
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 space-y-2">
                                                    {order.items.every((o) => o.status === 'returned-requested') ? (
                                                        <p className="text-gray-400 text-xs">Đã yêu cầu trả hàng</p>
                                                    ) : order.items.every((o) => o.status === 'cancelled-requested') ? (
                                                        <p className="text-gray-400 text-xs">Đã yêu cầu hủy</p>
                                                    ) : order.status === 'completed' ? (
                                                        <button
                                                            onClick={() => handleReturnClick(order)}
                                                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                                                        >
                                                            Trả hàng
                                                        </button>
                                                    ) : order.status === 'pending' ? (
                                                        <button
                                                            onClick={() => handleCancelClick(order)}
                                                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                                        >
                                                            Hủy đơn
                                                        </button>
                                                    ) : null}
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
            {cancelOrder && (
                <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-50"   style={{ backgroundColor: "#00000061" }}
>
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Hủy đơn hàng</h2>
                        <p className="mb-4">Bạn có chắc chắn muốn hủy đơn hàng #{cancelOrder._id.slice(-6)}?</p>

                        <div className="border-t border-b py-4 my-4">
                            <h3 className="font-semibold mb-2">Sản phẩm trong đơn hàng:</h3>
                            <ul className="space-y-3">
                                {cancelOrder.items.map((item, index) => (
                                    <li key={index} className="flex items-center gap-4 text-sm">
                                        <img src={item.images[0]?.url || '/placeholder.svg'} alt={item.productName} className="w-12 h-12 object-cover rounded-md" />
                                        <span>{item.productName} (Số lượng: {item.quantity})</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="mb-4">
                            <label htmlFor="cancelReason" className="block text-sm font-medium text-gray-700 mb-1">
                                Lý do hủy
                            </label>
                            <textarea
                                id="cancelReason"
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                rows={3}
                                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Nhập lý do hủy đơn hàng..."
                            />
                        </div>

                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => setCancelOrder(null)}
                                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                            >
                                Đóng
                            </button>
                            <button
                                onClick={handleConfirmCancel}
                                className="px-4 py-2 border rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-400"
                                disabled={!cancelReason}                            >
                                Xác nhận hủy
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Return Order Dialog */}
            {returnOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"   style={{ backgroundColor: "#00000061" }}
>
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] flex flex-col">
                        <h2 className="text-xl font-bold mb-4">Yêu cầu trả hàng</h2>
                        <p className="mb-4 text-sm">Chọn sản phẩm bạn muốn trả cho đơn hàng #{returnOrder._id.slice(-6)}.</p>

                        <div className="border-t border-b py-4 my-4 flex-grow overflow-y-auto">
                            <h3 className="font-semibold mb-2">Chọn sản phẩm:</h3>
                            <ul className="space-y-3">
                                {returnOrder.items.map((item) => {
                                    console.log("Rendering item:", item, "Checked:", returnItems.has(item._id));

                                    return (
                                        <li key={item._id} className="flex items-start gap-4 text-sm p-2 rounded-lg hover:bg-gray-50">
                                            <input
                                                type="checkbox"
                                                className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                checked={returnItems.has(item._id)}
                                                onChange={() => handleToggleReturnItem(item._id)}
                                            />
                                            <img src={item.images[0]?.url || '/placeholder.svg'} alt={item.productName} className="w-16 h-16 object-cover rounded-md" />
                                            <div className='flex-grow'>
                                                <p className="font-medium">{item.productName}</p>
                                                <p className="text-sm text-gray-600">Giá: {formatCurrency(item.price)}</p>
                                                <p className="text-sm text-gray-600">Tổng: {formatCurrency(item.price * item.quantity)}</p>
                                                <p className="text-xs text-gray-500">Loại sản phẩm: {item.attributes.join(', ')}</p>
                                                <p className="text-xs text-gray-500">Số lượng trong đơn: {item.quantity}</p>
                                                {returnItems.has(item._id) && (
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <label className="text-xs">Số lượng trả:</label>
                                                        <button
                                                            onClick={() => handleReturnQuantityChange(item._id, (returnItems.get(item._id) || 1) - 1, item.quantity)}
                                                            className="px-2 py-0.5 border rounded-md"
                                                        >-</button>
                                                        <span>{returnItems.get(item._id)}</span>
                                                        <button
                                                            onClick={() => handleReturnQuantityChange(item._id, (returnItems.get(item._id) || 1) + 1, item.quantity)}
                                                            className="px-2 py-0.5 border rounded-md"
                                                        >+</button>
                                                    </div>
                                                )}
                                            </div>
                                        </li>
                                    )
                                }
                                )}
                            </ul>
                        </div>

                        <div className="mb-4">
                            <label htmlFor="returnReason" className="block text-sm font-medium text-gray-700 mb-1">
                                Lý do trả hàng (bắt buộc)
                            </label>
                            <textarea
                                id="returnReason"
                                value={returnReason}
                                onChange={(e) => setReturnReason(e.target.value)}
                                rows={3}
                                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Nhập lý do bạn muốn trả hàng..."
                            />
                        </div>

                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => setReturnOrder(null)}
                                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                            >
                                Đóng
                            </button>
                            <button
                                onClick={handleConfirmReturn}
                                className="px-4 py-2 border rounded-lg bg-orange-600 text-white hover:bg-orange-700 disabled:bg-gray-400"
                                disabled={returnItems.size === 0 || !returnReason}
                            >
                                Gửi yêu cầu
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyOrderPage;
