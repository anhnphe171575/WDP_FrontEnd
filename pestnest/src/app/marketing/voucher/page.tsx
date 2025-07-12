'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Toaster } from 'react-hot-toast';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Edit, Trash2, Plus } from "lucide-react";

interface Voucher {
  _id: string;
  code: string;
  discountAmount?: number;
  discountPercent?: number;
  validFrom: string;
  validTo: string;
  usageLimit: number;
  usedCount: number;
}

interface PaginationProps {
  filteredVouchers: Voucher[];
  itemsPerPage: number;
  currentPage: number;
  setCurrentPage: (value: number) => void;
}

function Pagination({ filteredVouchers, itemsPerPage, currentPage, setCurrentPage }: PaginationProps) {
  const totalPages = Math.ceil(filteredVouchers.length / itemsPerPage);

  return (
    <div className="flex items-center justify-end mt-4">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Trước
        </Button>
        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </Button>
          ))}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Sau
        </Button>
      </div>
    </div>
  );
}

export default function VoucherPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [formData, setFormData] = useState({
    code: '',
    discountAmount: '',
    discountPercent: '',
    validFrom: '',
    validTo: '',
    usageLimit: '',
  });

  // Lấy danh sách voucher
  const fetchVouchers = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/vouchers');
      const data = await response.json();
      setVouchers(data);
    } catch {
      setError('Lỗi khi tải danh sách voucher');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const filteredVouchers = vouchers.filter(voucher =>
    voucher.code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Tạo voucher mới
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    // Kiểm tra mã voucher trùng lặp
    const isCodeExists = vouchers.some(voucher => voucher.code === formData.code);
    if (isCodeExists) {
      setError('Mã voucher đã tồn tại');
      return;
    }

    // Kiểm tra thời gian bắt đầu
    const startDate = new Date(formData.validFrom);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Đặt giờ về 00:00:00

    if (startDate < today) {
      setError('Thời gian bắt đầu phải từ ngày hôm nay trở đi');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/vouchers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccessMessage('Tạo voucher thành công');
        setIsCreateDialogOpen(false);
        fetchVouchers();
        resetForm();
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      } else {
        const error = await response.json();
        setError(error.message || 'Lỗi khi tạo voucher');
      }
    } catch {
      setError('Lỗi khi tạo voucher');
    }
  };

  // Cập nhật voucher
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVoucher) return;

    // Kiểm tra chỉ được nhập một loại giảm giá
    if (formData.discountAmount && formData.discountPercent) {
      setError('Chỉ được nhập một loại giảm giá');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/vouchers/${selectedVoucher._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          ...formData,
          discountAmount: formData.discountAmount ? Number(formData.discountAmount) : 0,
          discountPercent: formData.discountPercent ? Number(formData.discountPercent) : 0,
        }),
      });

      if (response.ok) {
        setSuccessMessage('Cập nhật voucher thành công');
        setIsEditDialogOpen(false);
        fetchVouchers();
        resetForm();
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      } else {
        const error = await response.json();
        setError(error.message || 'Lỗi khi cập nhật voucher');
      }
    } catch {
      setError('Lỗi khi cập nhật voucher');
    }
  };

  // Xóa voucher
  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa voucher này?')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/vouchers/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        setSuccessMessage('Xóa voucher thành công');
        fetchVouchers();
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      } else {
        const error = await response.json();
        setError(error.message || 'Lỗi khi xóa voucher');
      }
    } catch {
      setError('Lỗi khi xóa voucher');
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      code: '',
      discountAmount: '',
      discountPercent: '',
      validFrom: '',
      validTo: '',
      usageLimit: '',
    });
  };

  // Mở dialog chỉnh sửa
  const openEditDialog = (voucher: Voucher) => {
    setSelectedVoucher(voucher);
    setFormData({
      code: voucher.code,
      discountAmount: voucher.discountAmount ? voucher.discountAmount.toString() : '',
      discountPercent: voucher.discountPercent ? voucher.discountPercent.toString() : '',
      validFrom: format(new Date(voucher.validFrom), 'yyyy-MM-dd\'T\'HH:mm'),
      validTo: format(new Date(voucher.validTo), 'yyyy-MM-dd\'T\'HH:mm'),
      usageLimit: voucher.usageLimit.toString(),
    });
    setIsEditDialogOpen(true);
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <Toaster position="top-right" />
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Quản lý Voucher</CardTitle>
            <Button onClick={() => {
              resetForm();
              setIsCreateDialogOpen(true);
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Tạo Voucher Mới
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-md">
              {error}
            </div>
          )}
          {successMessage && (
            <div className="mb-4 p-4 bg-green-50 text-green-600 rounded-md">
              {successMessage}
            </div>
          )}
          <div className="flex items-center gap-4 mb-4">
            <Input
              placeholder="Tìm kiếm voucher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-bold">STT</TableHead>
                    <TableHead className="font-bold">Mã Voucher</TableHead>
                    <TableHead className="font-bold">Giảm giá</TableHead>
                    <TableHead className="font-bold">Thời gian hiệu lực</TableHead>
                    <TableHead className="font-bold">Số lần sử dụng</TableHead>
                    <TableHead className="text-right font-bold">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVouchers
                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                    .map((voucher, index) => (
                    <TableRow key={voucher._id}>
                      <TableCell>{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{voucher.code}</Badge>
                      </TableCell>
                      <TableCell>
                        {voucher.discountAmount 
                          ? `${voucher.discountAmount.toLocaleString('vi-VN')}đ`
                          : `${voucher.discountPercent}%`}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>Từ: {format(new Date(voucher.validFrom), 'dd/MM/yyyy HH:mm', { locale: vi })}</div>
                          <div>Đến: {format(new Date(voucher.validTo), 'dd/MM/yyyy HH:mm', { locale: vi })}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={voucher.usedCount >= voucher.usageLimit ? "destructive" : "default"}>
                          {voucher.usedCount}/{voucher.usageLimit}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0" 
                            title="Chỉnh sửa"
                            onClick={() => openEditDialog(voucher)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Xóa"
                            onClick={() => handleDelete(voucher._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Pagination
                filteredVouchers={filteredVouchers}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
              />
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
        setIsCreateDialogOpen(open);
        if (open) {
          resetForm();
        }
      }}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold mb-4">Tạo Voucher Mới</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code" className="text-base">Mã Voucher <span className="text-red-500">*</span></Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                required
                className="h-10 text-base"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="discountAmount" className="text-base">Số tiền giảm giá</Label>
                <Input
                  id="discountAmount"
                  type="number"
                  value={formData.discountAmount}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData({ 
                      ...formData, 
                      discountAmount: value,
                      discountPercent: value ? '' : formData.discountPercent 
                    });
                  }}
                  className="h-10 text-base"
                  disabled={!!formData.discountPercent}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discountPercent" className="text-base">Phần trăm giảm giá</Label>
                <Input
                  id="discountPercent"
                  type="number"
                  value={formData.discountPercent}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData({ 
                      ...formData, 
                      discountPercent: value,
                      discountAmount: value ? '' : formData.discountAmount 
                    });
                  }}
                  className="h-10 text-base"
                  disabled={!!formData.discountAmount}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="validFrom" className="text-base">Thời gian bắt đầu <span className="text-red-500">*</span></Label>
                <Input
                  id="validFrom"
                  type="datetime-local"
                  value={formData.validFrom}
                  onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                  required
                  className="h-10 text-base"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="validTo" className="text-base">Thời gian kết thúc <span className="text-red-500">*</span></Label>
                <Input
                  id="validTo"
                  type="datetime-local"
                  value={formData.validTo}
                  onChange={(e) => setFormData({ ...formData, validTo: e.target.value })}
                  required
                  className="h-10 text-base"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="usageLimit" className="text-base">Số lần sử dụng tối đa <span className="text-red-500">*</span></Label>
              <Input
                id="usageLimit"
                type="number"
                value={formData.usageLimit}
                onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                required
                className="h-10 text-base"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" className="h-10 text-base">Tạo Voucher</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold mb-4">Chỉnh sửa Voucher</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-code" className="text-base">Mã Voucher <span className="text-red-500">*</span></Label>
              <Input
                id="edit-code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                required
                className="h-10 text-base"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-discountAmount" className="text-base">Số tiền giảm giá</Label>
                <Input
                  id="edit-discountAmount"
                  type="number"
                  value={formData.discountAmount}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData({ 
                      ...formData, 
                      discountAmount: value,
                      discountPercent: value ? '' : formData.discountPercent 
                    });
                  }}
                  className="h-10 text-base"
                  disabled={!!formData.discountPercent}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-discountPercent" className="text-base">Phần trăm giảm giá</Label>
                <Input
                  id="edit-discountPercent"
                  type="number"
                  value={formData.discountPercent}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData({ 
                      ...formData, 
                      discountPercent: value,
                      discountAmount: value ? '' : formData.discountAmount 
                    });
                  }}
                  className="h-10 text-base"
                  disabled={!!formData.discountAmount}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-validFrom" className="text-base">Thời gian bắt đầu <span className="text-red-500">*</span></Label>
                <Input
                  id="edit-validFrom"
                  type="datetime-local"
                  value={formData.validFrom}
                  onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                  required
                  className="h-10 text-base"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-validTo" className="text-base">Thời gian kết thúc <span className="text-red-500">*</span></Label>
                <Input
                  id="edit-validTo"
                  type="datetime-local"
                  value={formData.validTo}
                  onChange={(e) => setFormData({ ...formData, validTo: e.target.value })}
                  required
                  className="h-10 text-base"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-usageLimit" className="text-base">Số lần sử dụng tối đa <span className="text-red-500">*</span></Label>
              <Input
                id="edit-usageLimit"
                type="number"
                value={formData.usageLimit}
                onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                required
                className="h-10 text-base"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" className="h-10 text-base">Cập nhật Voucher</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 