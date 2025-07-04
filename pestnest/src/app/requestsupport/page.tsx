"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import axiosInstance from "../../../utils/axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import Header from "@/components/layout/Header";
import Link from "next/link";

const CATEGORY_OPTIONS = [
  { value: "report", label: "Báo cáo" },
  { value: "support", label: "Hỗ trợ" },
];
const TYPE_OPTIONS = [
  { value: "product", label: "Sản phẩm" },
  { value: "order", label: "Đơn hàng" },
  { value: "account", label: "Tài khoản" },
  { value: "other", label: "Khác" },
];
const PRIORITY_OPTIONS = [
  { value: "normal", label: "Bình thường" },
  { value: "high", label: "Cao" },
  { value: "urgent", label: "Khẩn cấp" },
];

export default function RequestSupportPage() {
  const [form, setForm] = useState({
    category: "",
    type: "",
    title: "",
    content: "",
    productId: "",
    orderId: "",
    priority: "normal",
  });
  const [loading, setLoading] = useState(false);
  type Ticket = {
    _id: string;
    userId: string;
    category: string;
    type: string;
    status: string;
    title?: string;
    content: string;
    productId?: string;
    orderId?: string;
    priority: string;
    response?: string;
    internalNote?: string;
    handlerId?: string | null;
    createdAt: string;
    updatedAt: string;
  };
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [fetching, setFetching] = useState(true);
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);

  const fetchTickets = async (pageNum = page) => {
    setFetching(true);
    try {
      const res = await axiosInstance.get(`/tickets/user?page=${pageNum}&limit=${limit}`);
      setTickets(res.data.data || res.data.tickets || []);
      setTotal(res.data.total || 0);
    } catch {
      toast.error("Không thể tải danh sách hỗ trợ.");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchTickets(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.category || !form.type || !form.content) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc.");
      return;
    }
    if (form.category === "report" && !form.title) {
      toast.error("Báo cáo cần tiêu đề.");
      return;
    }
    if (!["report", "support"].includes(form.category)) {
      toast.error("Danh mục không hợp lệ.");
      return;
    }
    if (!["normal", "high", "urgent"].includes(form.priority)) {
      toast.error("Mức độ ưu tiên không hợp lệ.");
      return;
    }
    setLoading(true);
    try {
      await axiosInstance.post("/tickets", form);
      toast.success("Gửi yêu cầu hỗ trợ thành công!");
      setForm({
        category: "",
        type: "",
        title: "",
        content: "",
        productId: "",
        orderId: "",
        priority: "normal",
      });
      setOpen(false);
      fetchTickets(1);
      setPage(1);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error?.response?.data?.message || "Gửi yêu cầu thất bại.");
    } finally {
      setLoading(false);
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "new": return "outline";
      case "processing": return "secondary";
      case "resolved": return "default";
      case "rejected": return "destructive";
      default: return "outline";
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <main className="min-h-screen bg-background">
      <Header/>
      <div className="max-w-3xl mx-auto py-10 px-2 md:px-0">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h2 className="text-3xl font-bold text-center md:text-left w-full">Yêu cầu hỗ trợ của bạn</h2>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-white font-semibold px-6 py-2 rounded-lg shadow hover:bg-primary/90 transition">Tạo hỗ trợ</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg w-full rounded-xl border shadow-lg p-6 bg-white dark:bg-background">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold mb-2">Tạo yêu cầu hỗ trợ mới</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
                <div>
                  <Label>Danh mục <span className="text-red-500">*</span></Label>
                  <Select value={form.category} onValueChange={v => handleChange("category", v)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Chọn danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORY_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Loại <span className="text-red-500">*</span></Label>
                  <Select value={form.type} onValueChange={v => handleChange("type", v)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Chọn loại" />
                    </SelectTrigger>
                    <SelectContent>
                      {TYPE_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Tiêu đề <span className="text-red-500">*</span></Label>
                  <Input value={form.title} onChange={e => handleChange("title", e.target.value)} placeholder="Nhập tiêu đề" />
                </div>
                <div>
                  <Label>Nội dung <span className="text-red-500">*</span></Label>
                  <Textarea value={form.content} onChange={e => handleChange("content", e.target.value)} placeholder="Nhập nội dung hỗ trợ..." rows={5} />
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                  {form.type === "product" && (
                    <div className="flex-1">
                      <Label>Sản phẩm liên quan</Label>
                      <Input value={form.productId} onChange={e => handleChange("productId", e.target.value)} placeholder="ID sản phẩm" />
                    </div>
                  )}
                  {form.type === "order" && (
                    <div className="flex-1">
                      <Label>Đơn hàng liên quan</Label>
                      <Input value={form.orderId} onChange={e => handleChange("orderId", e.target.value)} placeholder="ID đơn hàng" />
                    </div>
                  )}
                </div>
                <div>
                  <Label>Mức độ ưu tiên</Label>
                  <Select value={form.priority} onValueChange={v => handleChange("priority", v)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Chọn mức độ" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITY_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" disabled={loading} className="w-full mt-2 bg-primary text-white font-semibold rounded-lg shadow hover:bg-primary/90 transition">
                  {loading ? "Đang gửi..." : "Gửi hỗ trợ"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        {fetching ? (
          <div className="text-center py-10">Đang tải dữ liệu...</div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">Bạn chưa có yêu cầu hỗ trợ nào.</div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-xl border shadow bg-white dark:bg-background">
              <Table>
                <TableHeader>
                  <TableRow className="bg-primary/10">
                    <TableHead className="font-semibold">Tiêu đề</TableHead>
                    <TableHead className="font-semibold">Loại</TableHead>
                    <TableHead className="font-semibold">Trạng thái</TableHead>
                    <TableHead className="font-semibold">Ưu tiên</TableHead>
                    <TableHead className="font-semibold">Ngày tạo</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tickets.map(ticket => (
                    <TableRow key={ticket._id} className="hover:bg-primary/5 transition-colors">
                      <TableCell>{ticket.title || <span className="italic text-muted-foreground">(Không có tiêu đề)</span>}</TableCell>
                      <TableCell>{ticket.type}</TableCell>
                      <TableCell>
                        <Badge variant={statusColor(ticket.status)} className={
                          ticket.status === 'new' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                          ticket.status === 'processing' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                          ticket.status === 'resolved' ? 'bg-green-100 text-green-700 border-green-200' :
                          'bg-red-100 text-red-700 border-red-200'
                        }>
                          {ticket.status === 'new' ? 'Mới' : ticket.status === 'processing' ? 'Đang xử lý' : ticket.status === 'resolved' ? 'Đã xử lý' : 'Từ chối'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={
                          ticket.priority === 'normal' ? 'bg-gray-100 text-gray-700 border-gray-200' :
                          ticket.priority === 'high' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                          'bg-red-100 text-red-700 border-red-200'
                        }>
                          {ticket.priority === 'normal' ? 'Bình thường' : ticket.priority === 'high' ? 'Cao' : 'Khẩn cấp'}
                        </Badge>
                      </TableCell>
                      <TableCell>{format(new Date(ticket.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}</TableCell>
                      <TableCell>
                        <Link href={`/requestsupport/${ticket._id}`}>
                          <Button size="sm" variant="outline" className="text-primary border-primary hover:bg-primary/10">
                            Xem chi tiết
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6">
                <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage(page - 1)}>
                  Trước
                </Button>
                <span className="px-2 text-sm">Trang {page} / {totalPages}</span>
                <Button size="sm" variant="outline" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
                  Tiếp
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
