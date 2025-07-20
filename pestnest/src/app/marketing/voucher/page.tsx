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
import { useLanguage } from '@/context/LanguageContext';
import pagesConfigEn from '../../../../utils/petPagesConfig.en';
import pagesConfigVi from '../../../../utils/petPagesConfig.vi';
import { api } from '../../../../utils/axios';

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
  const { lang } = useLanguage();
  const config = lang === 'en' ? pagesConfigEn.voucherManagement : pagesConfigVi.voucherManagement;
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
      const response = await api.get('/vouchers');
      setVouchers(Array.isArray(response.data) ? response.data : (Array.isArray(response.data.data) ? response.data.data : []));
    } catch {
      setError(config.error.fetch);
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
      setError(config.error.duplicateCode);
      return;
    }

    // Kiểm tra thời gian bắt đầu
    const startDate = new Date(formData.validFrom);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Đặt giờ về 00:00:00

    if (startDate < today) {
      setError(config.error.invalidStartDate);
      return;
    }

    try {
      await api.post('/vouchers', formData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setSuccessMessage(config.success.create);
      setIsCreateDialogOpen(false);
      fetchVouchers();
      resetForm();
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error: unknown) {
      let message = config.error.create;
      if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response && error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data) {
        message = (error.response.data as { message?: string }).message || message;
      }
      setError(message);
    }
  };

  // Cập nhật voucher
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVoucher) return;

    // Kiểm tra chỉ được nhập một loại giảm giá
    if (formData.discountAmount && formData.discountPercent) {
      setError(config.error.discountType);
      return;
    }

    try {
      await api.put(`/vouchers/${selectedVoucher._id}`, {
        ...formData,
        discountAmount: formData.discountAmount ? Number(formData.discountAmount) : 0,
        discountPercent: formData.discountPercent ? Number(formData.discountPercent) : 0,
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setSuccessMessage(config.success.update);
      setIsEditDialogOpen(false);
      fetchVouchers();
      resetForm();
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error: unknown) {
      let message = config.error.update;
      if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response && error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data) {
        message = (error.response.data as { message?: string }).message || message;
      }
      setError(message);
    }
  };

  // Xóa voucher
  const handleDelete = async (id: string) => {
    if (!confirm(config.confirm.delete)) return;

    try {
      await api.delete(`/vouchers/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setSuccessMessage(config.success.delete);
      fetchVouchers();
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error: unknown) {
      let message = config.error.delete;
      if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response && error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data) {
        message = (error.response.data as { message?: string }).message || message;
      }
      setError(message);
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
            <CardTitle>{config.title}</CardTitle>
            <Button onClick={() => {
              resetForm();
              setIsCreateDialogOpen(true);
            }}>
              <Plus className="h-4 w-4 mr-2" />
              {config.addNewButton}
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
              placeholder={config.search.placeholder}
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
                    <TableHead className="font-bold">{config.table.headers.no}</TableHead>
                    <TableHead className="font-bold">{config.table.headers.code}</TableHead>
                    <TableHead className="font-bold">{config.table.headers.discount}</TableHead>
                    <TableHead className="font-bold">{config.table.headers.validTime}</TableHead>
                    <TableHead className="font-bold">{config.table.headers.usage}</TableHead>
                    <TableHead className="text-right font-bold">{config.table.headers.actions}</TableHead>
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
                          <div>{config.table.validFrom} {format(new Date(voucher.validFrom), 'dd/MM/yyyy HH:mm', { locale: vi })}</div>
                          <div>{config.table.validTo} {format(new Date(voucher.validTo), 'dd/MM/yyyy HH:mm', { locale: vi })}</div>
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
                            title={config.table.edit}
                            onClick={() => openEditDialog(voucher)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            title={config.table.delete}
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
            <DialogTitle className="text-2xl font-bold mb-4">{config.form.addTitle}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code" className="text-base">{config.form.fields.code} <span className="text-red-500">*</span></Label>
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
                <Label htmlFor="discountAmount" className="text-base">{config.form.fields.discountAmount}</Label>
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
                <Label htmlFor="discountPercent" className="text-base">{config.form.fields.discountPercent}</Label>
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
                <Label htmlFor="validFrom" className="text-base">{config.form.fields.validFrom} <span className="text-red-500">*</span></Label>
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
                <Label htmlFor="validTo" className="text-base">{config.form.fields.validTo} <span className="text-red-500">*</span></Label>
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
              <Label htmlFor="usageLimit" className="text-base">{config.form.fields.usageLimit} <span className="text-red-500">*</span></Label>
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
                {config.form.buttons.cancel}
              </Button>
              <Button type="submit" className="h-10 text-base">{config.form.buttons.add}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold mb-4">{config.form.editTitle}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-code" className="text-base">{config.form.fields.code} <span className="text-red-500">*</span></Label>
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
                <Label htmlFor="edit-discountAmount" className="text-base">{config.form.fields.discountAmount}</Label>
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
                <Label htmlFor="edit-discountPercent" className="text-base">{config.form.fields.discountPercent}</Label>
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
                <Label htmlFor="edit-validFrom" className="text-base">{config.form.fields.validFrom} <span className="text-red-500">*</span></Label>
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
                <Label htmlFor="edit-validTo" className="text-base">{config.form.fields.validTo} <span className="text-red-500">*</span></Label>
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
              <Label htmlFor="edit-usageLimit" className="text-base">{config.form.fields.usageLimit} <span className="text-red-500">*</span></Label>
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
                {config.form.buttons.cancel}
              </Button>
              <Button type="submit" className="h-10 text-base">{config.form.buttons.save}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 