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
import { Checkbox } from "@/components/ui/checkbox";
import { se } from "date-fns/locale";
import { useLanguage } from "@/context/LanguageContext";
import viConfig from '../../../../utils/petPagesConfig.vi';
import enConfig from '../../../../utils/petPagesConfig.en';

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
  reasonRejectCancel?: string;
}

const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
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

function OrderForm({ order, onSubmit, isOpen, onClose, config }: OrderFormProps & { config: any }) {
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
          <DialogTitle>{config.updateOrderStatus}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>{config.orderStatus }</Label>
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
                    <SelectItem value="pending">{config.pending}</SelectItem>
                    <SelectItem value="processing">{config.processing}</SelectItem>
                  </>
                )}
                {formData.status === 'processing' && (
                  <>
                    <SelectItem value="processing">{config.processing}</SelectItem>
                  </>
                )}
                {formData.status === 'shipped' && (
                  <>
                    <SelectItem value="shipped">{config.shipped}</SelectItem>
                  </>
                )}
                {formData.status === 'completed' && (
                  <>
                    <SelectItem value="completed">{config.completed}</SelectItem>
                  </>
                )}
                {formData.status === 'cancelled' && (
                  <>
                    <SelectItem value="cancelled">{config.cancelled}</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              {config.cancel}
            </Button>
            <Button type="submit">
              {config.saveChanges}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function OrderPage() {
  const { lang } = useLanguage();
  const pagesConfig = lang === 'vi' ? viConfig : enConfig;
  const config = pagesConfig.orderManagement;
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
  const [selectedReturnItem, setSelectedReturnItem] = useState<any[]>([]);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  const [bulkStatus, setBulkStatus] = useState<string>("")
  const [isRejectReasonDialogOpen, setIsRejectReasonDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [itemToProcess, setItemToProcess] = useState<any | null>(null);
  const [isViewReasonDialogOpen, setIsViewReasonDialogOpen] = useState(false);


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
  
  const handleRejectReturn = async () => {
    if (!selectedOrder || !itemToProcess || !rejectionReason) {
      alert("Lý do từ chối không được để trống.");
      return;
    }
    try {
      await api.put(`/orders/${selectedOrder._id}/reject-return`, {
        itemId: itemToProcess._id,
        reason: rejectionReason,
      });
      setIsRejectReasonDialogOpen(false);
      setRejectionReason("");
      setItemToProcess(null);
      fetchOrders();
    } catch (err: any) {
      setError(err.response?.data?.message || "Có lỗi xảy ra khi từ chối yêu cầu.");
    }
  };

  const handleViewDetail = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };
   // Handle select all checkbox
   const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // Select all orders on current page
      setSelectedOrders(paginatedOrders.map((order) => order._id).filter((id): id is string => !!id));
    } else {
      // Deselect all orders
      setSelectedOrders([])
    }
  }

  // Handle individual order selection
  const handleSelectOrder = (orderId: string, checked: boolean) => {
    if (checked) {
      setSelectedOrders((prev) => [...prev, orderId])
    } else {
      setSelectedOrders((prev) => prev.filter((id) => id !== orderId))
    }
  }

  // Determine header checkbox state
  const getHeaderCheckboxState = () => {
    const currentPageOrderIds = paginatedOrders.map((order) => order._id)
    const selectedOnCurrentPage = selectedOrders.filter((id) => currentPageOrderIds.includes(id))

    if (selectedOnCurrentPage.length === 0) {
      return false
    } else if (selectedOnCurrentPage.length === currentPageOrderIds.length) {
      return true
    } else {
      return "indeterminate"
    }
  }

  const handleBulkUpdate = async () => {
    if (selectedOrders.length === 0 || !bulkStatus) {
      return;
    }
    try {
      await api.put('/orders/bulk-update-status', {
        orderIds: selectedOrders,
        status: bulkStatus,
      });
      await fetchOrders();
      setSelectedOrders([]);
      setBulkStatus("");
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const handleEditOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsFormOpen(true);
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

  function getDialogTitle(dialogConfig: any) {
    if (selectedOrder?.status === 'cancelled' || (Array.isArray(selectedReturnItem) && selectedReturnItem.some(i => i.status === 'cancelled' || i.status === 'cancelled-requested'))) {
      return dialogConfig.cancelDetail;
    }
    if (Array.isArray(selectedReturnItem) && selectedReturnItem.some(i => i.status === 'returned')) {
      return dialogConfig.returnDetail;
    }
    if (Array.isArray(selectedReturnItem) && selectedReturnItem.some(i => i.status === 'returned-requested')) {
      return dialogConfig.returnRequestDetail;
    }
    if (Array.isArray(selectedReturnItem) && selectedReturnItem.some(i => i.status === 'cancelled-requested')) {
      return dialogConfig.cancelRequestDetail;
    }
    return dialogConfig.orderDetail;
  }

  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);

    try {
      await api.post('/orders/import-csv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fetchOrders(); // Refresh user list
      alert('Import thành công!');
    } catch (err: any) {
      alert('Import thất bại: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{config.title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <Input
              placeholder={config.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
            <Select
              value={selectedStatus}
              onValueChange={setSelectedStatus}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={config.allStatus} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{config.allStatus}</SelectItem>
                {Object.entries(ORDER_STATUS).map(([key, value]) => (
                  <SelectItem key={value} value={value}>
                    {key.charAt(0) + key.slice(1).toLowerCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedOrders.length > 0 && (
              <div className="flex items-center gap-2">
                <Select value={bulkStatus} onValueChange={setBulkStatus}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={config.updateStatus} />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ORDER_STATUS).map(([key, value]) => (
                      <SelectItem key={value} value={value}>
                        {key.charAt(0) + key.slice(1).toLowerCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleBulkUpdate}>{config.updateSelected}</Button>
              </div>
            )}
            <Button
              variant="outline"
              onClick={() => document.getElementById('csv-upload-input')?.click()}
            >
              {config.importCSV}
            </Button>
            <input
              id="csv-upload-input"
              type="file"
              accept=".csv"
              style={{ display: 'none' }}
              onChange={handleImportCSV}
            />
          </div>

          {loading ? (
            <div>Loading...</div>
          ) : error ? (
            <div className="text-red-500">Error: {error}</div>
          ) : (
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Checkbox
                    ref={(el) => {
                      if (el) {
                        el.indeterminate = getHeaderCheckboxState() === "indeterminate";
                      }
                    }}
                    checked={getHeaderCheckboxState() === true}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </TableHead>
                <TableHead>{config.table.no}</TableHead>
                <TableHead>{config.table.orderId}</TableHead>
                <TableHead>{config.table.customer}</TableHead>
                <TableHead>{config.table.totalAmount}</TableHead>
                <TableHead>{config.table.status}</TableHead>
                <TableHead>{config.table.date}</TableHead>
                <TableHead className="text-right">{config.table.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedOrders.map((order, index) => (
                <TableRow key={order._id}>
                  <TableCell>
                    <Checkbox
                      checked={!!order._id && selectedOrders.includes(order._id)}
                      onChange={(e) => {
                        if (order._id) {
                          handleSelectOrder(order._id, e.target.checked)
                        }
                      }}
                      disabled={!order._id}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell className="font-medium">{order._id}</TableCell>
                  <TableCell>{order.userId.name}</TableCell>
                  <TableCell>{order.total?.toFixed(2) || "N/A"} VND</TableCell>
                  <TableCell>
                    
                    <div className="flex items-center gap-2">
                        <Badge className={ORDER_STATUS_COLORS[order.status]}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                        {order.OrderItems && order.OrderItems.some(item => item.status === 'returned-requested') && (
                          <span
                            className="flex items-center text-yellow-600 text-xs gap-1 cursor-pointer underline"
                            onClick={() => {
                              setSelectedReturnItem(order.OrderItems.filter(item => item.status === 'returned-requested'));
                              setSelectedOrder(order);
                              setIsReturnDialogOpen(true);
                            }}
                          >
                            <span role="img" aria-label="Returned">⚠️</span> {config.dialog.returnRequestDetail}
                          </span>
                        )}
                        {order.OrderItems && order.OrderItems.some(item => item.status === 'returned') && (
                          <span
                            className="flex items-center text-green-600 text-xs gap-1 cursor-pointer underline"
                            onClick={() => {
                              setSelectedReturnItem(order.OrderItems.filter(item => item.status === 'returned'));
                              setSelectedOrder(order);
                              setIsReturnDialogOpen(true);
                            }}
                          >
                            <span role="img" aria-label="Returned">✅</span> {config.dialog.returnDetail}
                          </span>
                        )}
                        {order.OrderItems && order.OrderItems.some(item => item.status === 'cancelled' || item.status === 'cancelled-requested') && (
                          <span
                            className="flex items-center text-red-600 text-xs gap-1 cursor-pointer underline"
                            onClick={() => {
                              setSelectedReturnItem(order.OrderItems.filter(item => item.status === 'cancelled' || item.status === 'cancelled-requested'));
                              setSelectedOrder(order);
                              setIsReturnDialogOpen(true);
                            }}
                          >
                            <span role="img" aria-label="Cancelled">❌</span> {config.dialog.cancelDetail}
                          </span>
                        )}
                         
                      </div>
                  </TableCell>
                  <TableCell>{order.createAt ? new Date(order.createAt).toLocaleDateString() : "N/A"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        title={config.table.viewDetails}
                        onClick={() => handleViewDetail(order)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        title={config.table.editOrder}
                        onClick={() => handleEditOrder(order)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {/* <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        title="Delete Order"
                        onClick={() => {
                          if (order._id) {
                            handleDeleteOrder(order._id)
                          }
                        }}
                        disabled={!order._id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button> */}
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
        config={config.form}
      />

      <Dialog open={isDetailOpen} onOpenChange={() => setIsDetailOpen(false)}>
      <DialogContent className="max-w-xl w-full max-h-screen overflow-y-auto">
      <DialogHeader>
            <DialogTitle>{getDialogTitle(config.dialog)}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                
                <div className="space-y-2">
                  <Label>Customer Name</Label>
                  <p className="text-lg font-medium">{selectedOrder.userId.name}</p>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
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
                <Label>{config.detail.orderItems}</Label>
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
                <Label>{config.detail.shippingAddress}</Label>
                <div className="p-4 border rounded-lg">
                  <p>{selectedOrder.address?.street}</p>
                  <p>{selectedOrder.address?.city}, {selectedOrder.address?.state}</p>
                  <p>{selectedOrder.address?.postalCode}</p>
                  <p>{selectedOrder.address?.country}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{config.detail.orderInformation}</Label>
                <p><strong>{config.detail.createdAt}:</strong> {selectedOrder.createAt ? new Date(selectedOrder.createAt).toLocaleString() : 'N/A'}</p>
                <p><strong>{config.detail.lastUpdated}:</strong> {selectedOrder.updatedAt ? new Date(selectedOrder.updatedAt).toLocaleString() : 'N/A'}</p>
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
            {config.pagination.previous}
          </Button>
          <div className="flex items-center gap-1">
            {(() => {
              const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
              const pages = [];
              if (totalPages <= 5) {
                for (let i = 1; i <= totalPages; i++) {
                  pages.push(
                    <Button
                      key={i}
                      variant={currentPage === i ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(i)}
                    >
                      {i}
                    </Button>
                  );
                }
              } else {
                // Always show first and last page
                if (currentPage <= 3) {
                  // Show first 3, ... , last
                  for (let i = 1; i <= 3; i++) {
                    pages.push(
                      <Button
                        key={i}
                        variant={currentPage === i ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(i)}
                      >
                        {i}
                      </Button>
                    );
                  }
                  pages.push(<span key="start-ellipsis">...</span>);
                  pages.push(
                    <Button
                      key={totalPages}
                      variant={currentPage === totalPages ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(totalPages)}
                    >
                      {totalPages}
                    </Button>
                  );
                } else if (currentPage >= totalPages - 2) {
                  // Show first, ... , last 3
                  pages.push(
                    <Button
                      key={1}
                      variant={currentPage === 1 ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(1)}
                    >
                      1
                    </Button>
                  );
                  pages.push(<span key="end-ellipsis">...</span>);
                  for (let i = totalPages - 2; i <= totalPages; i++) {
                    pages.push(
                      <Button
                        key={i}
                        variant={currentPage === i ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(i)}
                      >
                        {i}
                      </Button>
                    );
                  }
                } else {
                  // Show first, ... , current-1, current, current+1, ... , last
                  pages.push(
                    <Button
                      key={1}
                      variant={currentPage === 1 ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(1)}
                    >
                      1
                    </Button>
                  );
                  pages.push(<span key="mid-ellipsis-1">...</span>);
                  for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                    pages.push(
                      <Button
                        key={i}
                        variant={currentPage === i ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(i)}
                      >
                        {i}
                      </Button>
                    );
                  }
                  pages.push(<span key="mid-ellipsis-2">...</span>);
                  pages.push(
                    <Button
                      key={totalPages}
                      variant={currentPage === totalPages ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(totalPages)}
                    >
                      {totalPages}
                    </Button>
                  );
                }
              }
              return pages;
            })()}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(currentPage + 1, Math.ceil(filteredOrders.length / itemsPerPage)))}
            disabled={currentPage === Math.ceil(filteredOrders.length / itemsPerPage)}
          >
            {config.pagination.next}
          </Button>
        </div>
      </div>

      <Dialog open={isReturnDialogOpen} onOpenChange={setIsReturnDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{getDialogTitle(config.dialog)}</DialogTitle>
          </DialogHeader>
          {selectedReturnItem && selectedReturnItem.map((item, index) => (
            <div className="space-y-4" key={item._id || index}>
              <div className="flex items-center gap-4">
                {item.productVariant?.images?.[0]?.url && (
                  <div className="relative w-20 h-20">
                    <NextImage
                      src={item.productVariant.images[0].url}
                      alt={item.productId?.name || 'Product'}
                      fill
                      className="object-cover rounded-md"
                    />
                  </div>
                )}
                <div>
                  <div><b>{config.return.product}</b> {item.productId?.name}</div>
                  <div><b>{config.return.quantity}</b> {item.returnQuantity}</div>
                  <div><b>{config.return.reason}</b> {item.reason || config.return.noReason}</div>
                </div>
              </div>
              {item.status === 'returned-requested' ? (
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => {
                    setItemToProcess(item);
                    setIsReturnDialogOpen(false);
                    setIsRejectReasonDialogOpen(true);
                  }}>
                    {config.return.reject}
                  </Button>
                  <Button
                    onClick={async () => {
                      try {
                        await api.put(`/orders/${selectedOrder?._id}/orderItem/${item._id}`, {
                          quantity: item.returnQuantity,
                        });
                        setIsReturnDialogOpen(false);
                        fetchOrders();
                      } catch (err) {
                        alert('Có lỗi xảy ra khi xác nhận trả hàng!');
                      }
                    }}
                  >
                    {config.return.accept}
                  </Button>
                </div>
              ) : item.status === 'returned' ? (
                <div className="text-green-600">{config.return.returnedSuccess}</div>
              ) : item.status === 'cancelled' ? (
                <div className="text-red-600">{config.return.cancelled}</div>
              ) : null}
            </div>
          ))}
        </DialogContent>
      </Dialog>
       <Dialog open={isRejectReasonDialogOpen} onOpenChange={setIsRejectReasonDialogOpen}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>{config.rejectReason.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                  <Label htmlFor="rejectionReason">{config.rejectReason.inputLabel}</Label>
                  <textarea
                      id="rejectionReason"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="w-full p-2 border rounded-md"
                      rows={4}
                  />
                  <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsRejectReasonDialogOpen(false)}>
                          {config.form.cancel}
                      </Button>
                      <Button onClick={handleRejectReturn}>
                          {config.rejectReason.confirm}
                      </Button>
                  </div>
              </div>
          </DialogContent>
      </Dialog>

      <Dialog open={isViewReasonDialogOpen} onOpenChange={setIsViewReasonDialogOpen}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>{config.rejectReason.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                  <p className="text-sm text-gray-500">
                      {config.rejectReason.reasonForOrder}{selectedOrder?._id?.slice(-6)}:
                  </p>
                  <div className="p-4 bg-gray-100 rounded-md">
                      <p>{selectedOrder?.reasonRejectCancel || config.rejectReason.noReasonProvided}</p>
                  </div>
                  <div className="flex justify-end">
                      <Button variant="outline" onClick={() => setIsViewReasonDialogOpen(false)}>
                          {config.rejectReason.close}
                      </Button>
                  </div>
              </div>
          </DialogContent>
      </Dialog>
    </div>
  );
}
