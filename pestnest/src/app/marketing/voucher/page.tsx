'use client';

import { useState, useEffect } from 'react';
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import toast, { Toaster } from 'react-hot-toast';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

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

export default function VoucherPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
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
      const response = await fetch('http://localhost:5000/api/vouchers');
      const data = await response.json();
      setVouchers(data);
    } catch {
      toast.error('Lỗi khi tải danh sách voucher');
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  // Tạo voucher mới
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    // Kiểm tra mã voucher trùng lặp
    const isCodeExists = vouchers.some(voucher => voucher.code === formData.code);
    if (isCodeExists) {
      toast.error('Mã voucher đã tồn tại');
      return;
    }

    // Kiểm tra thời gian bắt đầu
    const startDate = new Date(formData.validFrom);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Đặt giờ về 00:00:00

    if (startDate < today) {
      toast.error('Thời gian bắt đầu phải từ ngày hôm nay trở đi');
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
        toast.success('Tạo voucher thành công');
        setIsCreateDialogOpen(false);
        fetchVouchers();
        resetForm();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Lỗi khi tạo voucher');
      }
    } catch {
      toast.error('Lỗi khi tạo voucher');
    }
  };

  // Cập nhật voucher
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVoucher) return;

    // Kiểm tra chỉ được nhập một loại giảm giá
    if (formData.discountAmount && formData.discountPercent) {
      toast.error('Chỉ được nhập một loại giảm giá');
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
        toast.success('Cập nhật voucher thành công');
        setIsEditDialogOpen(false);
        fetchVouchers();
        resetForm();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Lỗi khi cập nhật voucher');
      }
    } catch {
      toast.error('Lỗi khi cập nhật voucher');
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
        toast.success('Xóa voucher thành công');
        fetchVouchers();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Lỗi khi xóa voucher');
      }
    } catch {
      toast.error('Lỗi khi xóa voucher');
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
    <div className="p-6">
      <Toaster position="top-right" />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý Voucher</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
          if (open) {
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button>Tạo Voucher Mới</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold mb-4">Tạo Voucher Mới</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code" className="text-base">Mã Voucher</Label>
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
                  <Label htmlFor="validFrom" className="text-base">Thời gian bắt đầu</Label>
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
                  <Label htmlFor="validTo" className="text-base">Thời gian kết thúc</Label>
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
                <Label htmlFor="usageLimit" className="text-base">Số lần sử dụng tối đa</Label>
                <Input
                  id="usageLimit"
                  type="number"
                  value={formData.usageLimit}
                  onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                  required
                  className="h-10 text-base"
                />
              </div>
              <Button type="submit" className="w-full h-10 text-base">Tạo Voucher</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mã Voucher</TableHead>
            <TableHead>Giảm giá</TableHead>
            <TableHead>Thời gian hiệu lực</TableHead>
            <TableHead>Số lần sử dụng</TableHead>
            <TableHead>Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vouchers.map((voucher) => (
            <TableRow key={voucher._id}>
              <TableCell>{voucher.code}</TableCell>
              <TableCell>
                {voucher.discountAmount 
                  ? `${voucher.discountAmount.toLocaleString('vi-VN')}đ`
                  : `${voucher.discountPercent}%`}
              </TableCell>
              <TableCell>
                {format(new Date(voucher.validFrom), 'dd/MM/yyyy HH:mm', { locale: vi })} - 
                {format(new Date(voucher.validTo), 'dd/MM/yyyy HH:mm', { locale: vi })}
              </TableCell>
              <TableCell>
                {voucher.usedCount}/{voucher.usageLimit}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => openEditDialog(voucher)}
                  >
                    Sửa
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(voucher._id)}
                  >
                    Xóa
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold mb-4">Chỉnh sửa Voucher</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-code" className="text-base">Mã Voucher</Label>
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
                <Label htmlFor="edit-validFrom" className="text-base">Thời gian bắt đầu</Label>
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
                <Label htmlFor="edit-validTo" className="text-base">Thời gian kết thúc</Label>
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
              <Label htmlFor="edit-usageLimit" className="text-base">Số lần sử dụng tối đa</Label>
              <Input
                id="edit-usageLimit"
                type="number"
                value={formData.usageLimit}
                onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                required
                className="h-10 text-base"
              />
            </div>
            <Button type="submit" className="w-full h-10 text-base">Cập nhật Voucher</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 