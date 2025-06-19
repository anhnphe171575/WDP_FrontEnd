'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react";
import { api } from "../../../../utils/axios";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Edit, Eye, Trash2 } from "lucide-react";
import NextImage from "next/image";

interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
  status:string
}

interface Order {
  _id?: string;
  userId: {
    name:string,
    email:string
  };
  OrderItems: {
    productId: {
        name:string,
        image:string,
    };
    productVariant: {
        images: {
            url: string;
        }[];
        attribute: [{
            value: string;
        }]
    }
    quantity: number;
    price: number;
    status:string
}[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled';
  paymentMethod: string;
  voucher?: string[];
  createAt?: Date;
  updatedAt?: Date;
  userName?: string;
  totalAmount?: number;
  items?: {
    productName: string;
    quantity: number;
    price: number;
    image?: string;
  }[];
  address?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

const ORDER_STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
} as const;


interface OrderFormProps {
  order?: Order;
  onSubmit: (data: Omit<Order, '_id'>) => void;
  isOpen: boolean;
  onClose: () => void;
}

function OrderForm({ order, onSubmit, isOpen, onClose }: OrderFormProps) {
  const [formData, setFormData] = useState<{
    status: Order['status'];
  }>({
    status: 'pending',
  });

  useEffect(() => {
    if (order) {
      setFormData({
        status: order.status,
      });
    }
  }, [order]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const orderData: Omit<Order, '_id'> = {
        ...order!,
        ...formData,
      };
      await onSubmit(orderData);
      onClose();
    } catch (error) {
      console.error('Error saving order:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Update Order Status</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Order Status </Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value as Order['status'] })}
            >
              <SelectTrigger>
                <SelectValue>
                  {formData.status.charAt(0).toUpperCase() + formData.status.slice(1)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {formData.status === 'pending' && (
                  <>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                  </>
                )}
                {formData.status === 'processing' && (
                  <>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                  </>
                )}
                {formData.status === 'shipped' && (
                  <>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </>
                )}
                {formData.status === 'completed' && (
                  <>
                    <SelectItem value="completed">Completed</SelectItem>
                  </>
                )}
                {formData.status === 'cancelled' && (
                  <>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function OrderPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [isReturnDialogOpen, setIsReturnDialogOpen] = useState(false);
  const [selectedReturnItem, setSelectedReturnItem] = useState<any>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await api.get('/orders');
      setOrders(data.data);
      console.log(data.data);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrder = async (data: Omit<Order, '_id'>) => {
    if (!selectedOrder) return;
    try {
      const response = await api.put(`/orders/${selectedOrder._id}`, data);
      setOrders(orders.map(order =>
        order._id === selectedOrder._id ? response.data : order
      ));
      fetchOrders();
      setIsFormOpen(false);
      setSelectedOrder(undefined);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const handleDeleteOrder = async (id: string) => {
    try {
      await api.delete(`/orders/${id}`);
      setOrders(orders.filter(order => order._id !== id));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleViewDetail = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.userId.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order._id?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = selectedStatus === "all" || order.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Order Management</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <Input
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
            <Select
              value={selectedStatus}
              onValueChange={setSelectedStatus}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {Object.entries(ORDER_STATUS).map(([key, value]) => (
                  <SelectItem key={value} value={value}>
                    {key.charAt(0) + key.slice(1).toLowerCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div>Loading...</div>
          ) : error ? (
            <div className="text-red-500">Error: {error}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No</TableHead>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedOrders.map((order, index) => (
                  <TableRow key={order._id}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell className="font-medium">{order._id}</TableCell>
                    <TableCell>{order.userId.name}</TableCell>
                    <TableCell>{order.total?.toFixed(2) || 'N/A'}VND</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge className={ORDER_STATUS_COLORS[order.status]}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                        {order.OrderItems && order.OrderItems.some(item => item.status === 'returned-requested') && (
                          <span
                            className="flex items-center text-yellow-600 text-xs gap-1 cursor-pointer underline"
                            onClick={() => {
                              const returnItem = order.OrderItems.find(item => item.status === 'returned-requested');
                              setSelectedReturnItem(returnItem);
                              setIsReturnDialogOpen(true);
                            }}
                          >
                            <span role="img" aria-label="Returned">⚠️</span> Có yêu cầu trả hàng
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {order.createAt ? new Date(order.createAt).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          title="View Details"
                          onClick={() => handleViewDetail(order)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          title="Edit Order"
                          onClick={() => {
                            setSelectedOrder(order);
                            setIsFormOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          title="Delete Order"
                          onClick={() => handleDeleteOrder(order._id!)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <OrderForm
        order={selectedOrder}
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedOrder(undefined);
        }}
        onSubmit={handleUpdateOrder}
      />

      <Dialog open={isDetailOpen} onOpenChange={() => setIsDetailOpen(false)}>
      <DialogContent className="max-w-xl w-full max-h-screen overflow-y-auto">
      <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                
                <div className="space-y-2">
                  <Label>Customer Name</Label>
                  <p className="text-lg font-medium">{selectedOrder.userId.name}</p>
                </div>
                <div className="space-y-2">
                  <Label>Order Status</Label>
                  <Badge className={ORDER_STATUS_COLORS[selectedOrder.status]}>
                    {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <p className="text-lg font-medium">{selectedOrder.paymentMethod}</p>
                </div>
                <div className="space-y-2">
                  <Label>Total Amount</Label>
                  <p className="text-lg font-medium">${selectedOrder.total?.toFixed(2) || 'N/A'}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Order Items</Label>
                <div className="space-y-4">
                  {selectedOrder.OrderItems?.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                      {item.productId.name && (
                        <div className="relative w-16 h-16">
                          <NextImage
                            src={item.productVariant.images[0].url}
                            alt={item.productId.name}
                            fill
                            className="object-cover rounded-md"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-medium">{item.productId.name}</p>
                        <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                        <p className="text-sm text-gray-500">Price: ${item.price.toFixed(2)}</p>
                        <p className="text-sm text-gray-500">Size: {item.productVariant.attribute.map((attr) => attr.value).join(', ')}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${(item.quantity * item.price).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Shipping Address</Label>
                <div className="p-4 border rounded-lg">
                  <p>{selectedOrder.address?.street}</p>
                  <p>{selectedOrder.address?.city}, {selectedOrder.address?.state}</p>
                  <p>{selectedOrder.address?.postalCode}</p>
                  <p>{selectedOrder.address?.country}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Order Information</Label>
                <p><strong>Created At:</strong> {selectedOrder.createAt ? new Date(selectedOrder.createAt).toLocaleString() : 'N/A'}</p>
                <p><strong>Last Updated:</strong> {selectedOrder.updatedAt ? new Date(selectedOrder.updatedAt).toLocaleString() : 'N/A'}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="flex items-center justify-between px-2 py-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <div className="flex items-center gap-1">
            {[...Array(Math.ceil(filteredOrders.length / itemsPerPage))].map((_, index) => (
              <Button
                key={index + 1}
                variant={currentPage === index + 1 ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(index + 1)}
              >
                {index + 1}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(currentPage + 1, Math.ceil(filteredOrders.length / itemsPerPage)))}
            disabled={currentPage === Math.ceil(filteredOrders.length / itemsPerPage)}
          >
            Next
          </Button>
        </div>
      </div>

      <Dialog open={isReturnDialogOpen} onOpenChange={setIsReturnDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chi tiết yêu cầu trả hàng</DialogTitle>
          </DialogHeader>
          {selectedReturnItem && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                {selectedReturnItem.productVariant?.images?.[0]?.url && (
                  <div className="relative w-20 h-20">
                    <NextImage
                      src={selectedReturnItem.productVariant.images[0].url}
                      alt={selectedReturnItem.productId?.name || 'Product'}
                      fill
                      className="object-cover rounded-md"
                    />
                  </div>
                )}
                <div>
                  <div><b>Sản phẩm:</b> {selectedReturnItem.productId?.name}</div>
                  <div><b>Số lượng:</b> {selectedReturnItem.quantity}</div>
                  <div><b>Lý do:</b> {selectedReturnItem.reason || 'Không có lý do'}</div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsReturnDialogOpen(false)}>
                  Từ chối
                </Button>
                <Button
                  onClick={async () => {
                    try {
                      await api.put(`/orders/${selectedOrder?._id}/orderItem/${selectedReturnItem._id}/returned`, {
                        quantity: selectedReturnItem.quantity,
                      });
                      setIsReturnDialogOpen(false);
                      fetchOrders();
                    } catch (err) {
                      alert('Có lỗi xảy ra khi xác nhận trả hàng!');
                    }
                  }}
                >
                  Chấp nhận
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
