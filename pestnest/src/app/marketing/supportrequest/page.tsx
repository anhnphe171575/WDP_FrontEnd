'use client';
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Eye, Check } from 'lucide-react';
import { api } from "../../../../utils/axios";
import { io, type Socket } from "socket.io-client";
import toast from "react-hot-toast";


interface SupportRequest {
  _id: string;
  userId: string;
  category: string;
  type: string;
  status: string;
  title?: string;
  content: string;
  productId?: string | null;
  orderId?: string | null;
  priority: string;
  response?: string;
  internalNote?: string;
  handlerId?: string | null;
  createdAt: string;
  updatedAt: string;
}

const STATUS_OPTIONS = [
  { value: 'new', label: 'Mới' },
  { value: 'processing', label: 'Đang xử lý' },
  { value: 'resolved', label: 'Đã xử lý' },
  { value: 'rejected', label: 'Từ chối' },
];
const PAGE_SIZE = 5;
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";
let socket: Socket | null = null;

function SupportRequestDetail({ request, isOpen, onClose, reload }: { request: SupportRequest; isOpen: boolean; onClose: () => void; reload: () => void }) {
  const [editStatus, setEditStatus] = useState(false);
  const [status, setStatus] = useState(request.status);
  const [loading, setLoading] = useState(false);
  const selectRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setStatus(request.status);
    setEditStatus(false);
  }, [request]);

  useEffect(() => {
    if (editStatus && selectRef.current) {
      selectRef.current.focus();
    }
  }, [editStatus]);

  const handleUpdateStatus = async () => {
    setLoading(true);
    try {
      await api.patch(`/tickets/${request._id}`, { status });
      setEditStatus(false);
      onClose();
      reload();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      alert(error?.response?.data?.message || error?.message || 'Cập nhật trạng thái thất bại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Chi tiết Yêu cầu hỗ trợ</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Tiêu đề</Label>
            <p className="text-base font-semibold text-gray-800">{request.title || <span className="italic text-gray-400">(Không có)</span>}</p>
          </div>
          <div className="space-y-2">
            <Label>Nội dung</Label>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{request.content}</p>
          </div>
          <div className="space-y-2">
            <Label>Trạng thái</Label>
            {editStatus ? (
              <div className="flex items-center gap-2">
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger ref={selectRef} className="w-[160px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button size="sm" onClick={handleUpdateStatus} disabled={loading} className="bg-green-600 text-white hover:bg-green-700">
                  <Check className="w-4 h-4 mr-1" />Lưu
                </Button>
                <Button size="sm" variant="outline" onClick={() => { setEditStatus(false); setStatus(request.status); }}>Huỷ</Button>
              </div>
            ) : (
              <Badge
                variant={
                  request.status === 'resolved' ? 'default' :
                  request.status === 'processing' ? 'secondary' :
                  request.status === 'new' ? 'outline' : 'secondary'
                }
                className="cursor-pointer"
                onClick={() => setEditStatus(true)}
                title="Cập nhật trạng thái"
                tabIndex={0}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setEditStatus(true); }}
              >
                {request.status === 'new' ? 'Mới' :
                  request.status === 'processing' ? 'Đang xử lý' :
                  request.status === 'resolved' ? 'Đã xử lý' :
                  request.status}
              </Badge>
            )}
          </div>
          <div className="space-y-2">
            <Label>Mức độ ưu tiên</Label>
            <Badge variant={
              request.priority === 'urgent' ? 'destructive' :
              request.priority === 'high' ? 'secondary' : 'outline'
            }>
              {request.priority === 'urgent' ? 'Khẩn cấp' : request.priority === 'high' ? 'Cao' : 'Bình thường'}
            </Badge>
          </div>
          <div className="space-y-2">
            <Label>Người xử lý</Label>
            <p className="text-sm text-gray-700">{request.handlerId || <span className="italic text-gray-400">(Chưa có)</span>}</p>
          </div>
          <div className="space-y-2">
            <Label>Ngày tạo</Label>
            <p className="text-sm text-gray-700">{new Date(request.createdAt).toLocaleString()}</p>
          </div>
          <div className="space-y-2">
            <Label>Ngày cập nhật</Label>
            <p className="text-sm text-gray-700">{new Date(request.updatedAt).toLocaleString()}</p>
          </div>
          {request.response && (
            <div className="space-y-2">
              <Label>Phản hồi</Label>
              <p className="text-sm text-green-700 whitespace-pre-wrap">{request.response}</p>
            </div>
          )}
          {request.internalNote && (
            <div className="space-y-2">
              <Label>Ghi chú nội bộ</Label>
              <p className="text-sm text-gray-500 whitespace-pre-wrap">{request.internalNote}</p>
            </div>
          )}
          <div className="flex justify-end">
            <Button variant="outline" onClick={onClose}>Đóng</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Pagination({ total, page, setPage }: { total: number; page: number; setPage: (p: number) => void }) {
  const totalPages = Math.ceil(total / PAGE_SIZE);
  return (
    <div className="flex items-center justify-between px-2 py-4">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => setPage(Math.max(page - 1, 1))} disabled={page === 1}>Trước</Button>
        <div className="flex items-center gap-1">
          {[...Array(totalPages)].map((_, idx) => (
            <Button key={idx + 1} variant={page === idx + 1 ? 'default' : 'outline'} size="sm" onClick={() => setPage(idx + 1)}>{idx + 1}</Button>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={() => setPage(Math.min(page + 1, totalPages))} disabled={page === totalPages}>Sau</Button>
      </div>
    </div>
  );
}

// Thêm component StatusBadge để đổi trạng thái trực tiếp trong bảng
function StatusBadge({ request, reload }: { request: SupportRequest, reload: () => void }) {
  const [edit, setEdit] = useState(false);
  const [status, setStatus] = useState(request.status);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setStatus(request.status);
    setEdit(false);
  }, [request]);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await api.patch(`/tickets/${request._id}`, { status });
      setEdit(false);
      reload();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      alert(error?.response?.data?.message || error?.message || 'Cập nhật trạng thái thất bại!');
    } finally {
      setLoading(false);
    }
  };

  if (edit) {
    return (
      <div className="flex items-center gap-2">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button size="sm" onClick={handleUpdate} disabled={loading} className="bg-green-600 text-white hover:bg-green-700">Lưu</Button>
        <Button size="sm" variant="outline" onClick={() => { setEdit(false); setStatus(request.status); }}>Huỷ</Button>
      </div>
    );
  }

  return (
    <Badge
      variant={
        request.status === 'resolved' ? 'default' :
        request.status === 'processing' ? 'secondary' :
        request.status === 'new' ? 'outline' : 'secondary'
      }
      className="cursor-pointer"
      onClick={() => setEdit(true)}
      title="Cập nhật trạng thái"
      tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setEdit(true); }}
    >
      {request.status === 'new' ? 'Mới' :
        request.status === 'processing' ? 'Đang xử lý' :
        request.status === 'resolved' ? 'Đã xử lý' :
        request.status}
    </Badge>
  );
}

export default function SupportRequestPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('Tất cả');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<SupportRequest | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [tickets, setTickets] = useState<SupportRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const id = sessionStorage.getItem("userId") || "";
      setUserId(id);
    }
  }, []);

  useEffect(() => {
    if (!userId) return;
    if (socket) {
      socket.disconnect();
    }
    socket = io(SOCKET_URL, {
      auth: {
        token: sessionStorage.getItem("token"),
      },
      transports: ["websocket", "polling"],
    });
    socket.on("connect", () => {
      socket?.emit("join", userId);
    });
    socket.on("notification", (notification) => {
      toast.success(notification.title + ': ' + notification.description);
    });
    return () => {
      if (socket) {
        socket.disconnect();
        socket = null;
      }
    };
  }, [userId]);

  useEffect(() => {
    setLoading(true);
    api.get(`tickets/handler/all?page=${page}&limit=${PAGE_SIZE}`)
      .then((res: unknown) => {
        const response = res as { data: { tickets: SupportRequest[]; total: number } };
        setTickets(response.data.tickets);
        setTotal(response.data.total);
      })
      .catch((err: unknown) => {
        const error = err as { response?: { data?: { message?: string } }; message?: string };
        setTickets([]);
        setTotal(0);
        alert('Lỗi khi lấy dữ liệu: ' + (error?.response?.data?.message || error?.message));
      })
      .finally(() => setLoading(false));
  }, [page]);

  // Lọc client theo search và status
  const filtered = tickets.filter(req => {
    const matchSearch = req.title?.toLowerCase().includes(search.toLowerCase()) || req.content.toLowerCase().includes(search.toLowerCase());
    const matchStatus = status === 'Tất cả' || req.status === status;
    return matchSearch && matchStatus;
  });

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Danh sách yêu cầu Hỗ trợ</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <Input
              placeholder="Tìm kiếm theo tiêu đề, mô tả..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="max-w-sm"
            />
            <Select value={status} onValueChange={v => { setStatus(v); setPage(1); }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {loading ? (
            <div className="text-center py-8">Đang tải dữ liệu...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>STT</TableHead>
                  <TableHead>Tiêu đề</TableHead>
                  <TableHead>Mô tả</TableHead>
                  <TableHead>Ngày giao</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">Không có request nào phù hợp.</TableCell>
                  </TableRow>
                ) : filtered.map((req, idx) => (
                  <TableRow key={req._id}>
                    <TableCell>{(page - 1) * PAGE_SIZE + idx + 1}</TableCell>
                    <TableCell>{req.title || <span className="italic text-gray-400">(Không có)</span>}</TableCell>
                    <TableCell>{req.content}</TableCell>
                    <TableCell>{new Date(req.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <StatusBadge request={req} reload={() => window.location.reload()} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Xem chi tiết" onClick={() => { setSelected(req); setDetailOpen(true); }}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          <Pagination total={total} page={page} setPage={setPage} />
        </CardContent>
      </Card>
      {selected && (
        <SupportRequestDetail request={selected} isOpen={detailOpen} onClose={() => { setDetailOpen(false); setSelected(null); }} reload={() => window.location.reload()} />
      )}
    </div>
  );
}
