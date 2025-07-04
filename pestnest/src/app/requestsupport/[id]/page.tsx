"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "../../../../utils/axios"
import Header from "@/components/layout/Header";

interface User {
  _id: string;
  name: string;
  email: string;
}
interface Handler {
  _id: string;
  name: string;
  email: string;
}
interface Product {
  _id: string;
  name: string;
}
interface Order {
  _id: string;
  total: number;
  status: string;
}
interface Ticket {
  _id: string;
  userId: User;
  category: string;
  type: string;
  status: string;
  title?: string;
  content: string;
  productId?: string | Product | null;
  orderId?: string | Order | null;
  priority: string;
  response?: string;
  internalNote?: string;
  handlerId?: string | Handler | null;
  createdAt: string;
  updatedAt: string;
}

const TicketDetailPage = () => {
  const { id } = useParams();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTicket = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get(`/tickets/${id}`);
        setTicket(res.data);
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } };
        const message = error?.response?.data?.message || "Đã xảy ra lỗi khi tải ticket.";
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchTicket();
  }, [id]);

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!ticket) return <div>Không tìm thấy ticket.</div>;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-10 px-2">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl border border-blue-100 p-8 md:p-10">
          <h1 className="text-3xl font-extrabold text-blue-700 mb-6 text-center tracking-tight">Chi tiết Yêu cầu</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <div className="text-gray-500 text-sm mb-1 font-medium">Tiêu đề</div>
              <div className="text-lg font-semibold">{ticket.title || <span className="italic text-gray-400">(Không có)</span>}</div>
            </div>
            <div>
              <div className="text-gray-500 text-sm mb-1 font-medium">Trạng thái</div>
              <span className={
                ticket.status === 'new' ? 'bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-semibold' :
                ticket.status === 'processing' ? 'bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-semibold' :
                ticket.status === 'resolved' ? 'bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold' :
                ticket.status === 'rejected' ? 'bg-red-100 text-red-700 px-3 py-1 rounded-full font-semibold' :
                'bg-gray-100 text-gray-700 px-3 py-1 rounded-full font-semibold'
              }>
                {ticket.status === 'new' ? 'Mới' :
                  ticket.status === 'processing' ? 'Đang xử lý' :
                  ticket.status === 'resolved' ? 'Đã xử lý' :
                  ticket.status === 'rejected' ? 'Từ chối' :
                  ticket.status || '(Không có)'}
              </span>
            </div>
            <div className="md:col-span-2">
              <div className="text-gray-500 text-sm mb-1 font-medium">Nội dung</div>
              <div className="bg-gray-50 rounded-lg p-4 min-h-[60px] text-base">{ticket.content || <span className="italic text-gray-400">(Không có)</span>}</div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="text-gray-500 text-sm mb-1 font-medium">Ngày tạo</div>
              <div className="text-base">{ticket.createdAt ? new Date(ticket.createdAt).toLocaleString() : <span className="italic text-gray-400">(Không có)</span>}</div>
            </div>
            <div>
              <div className="text-gray-500 text-sm mb-1 font-medium">Người tạo</div>
              <div className="text-base font-medium">{ticket.userId?.name} <span className="text-gray-400">({ticket.userId?.email})</span></div>
            </div>
            <div>
              <div className="text-gray-500 text-sm mb-1 font-medium">Người xử lý</div>
              <div className="text-base">
                {ticket.handlerId
                  ? (typeof ticket.handlerId === "object"
                      ? `${ticket.handlerId.name} (${ticket.handlerId.email})`
                      : ticket.handlerId)
                  : <span className="italic text-gray-400">Chưa có</span>}
              </div>
            </div>
            <div>
              <div className="text-gray-500 text-sm mb-1 font-medium">Sản phẩm liên quan</div>
              <div className="text-base">
                {ticket.productId
                  ? (typeof ticket.productId === "object"
                      ? ticket.productId.name
                      : ticket.productId)
                  : <span className="italic text-gray-400">(Không có)</span>}
              </div>
            </div>
            <div>
              <div className="text-gray-500 text-sm mb-1 font-medium">Đơn hàng liên quan</div>
              <div className="text-base">
                {ticket.orderId
                  ? (typeof ticket.orderId === "object"
                      ? `Tổng: ${ticket.orderId.total} - Trạng thái: ${ticket.orderId.status}`
                      : ticket.orderId)
                  : <span className="italic text-gray-400">(Không có)</span>}
              </div>
            </div>
            <div>
              <div className="text-gray-500 text-sm mb-1 font-medium">Mức độ ưu tiên</div>
              <span className={
                ticket.priority === 'urgent' ? 'bg-red-100 text-red-700 px-3 py-1 rounded-full font-semibold' :
                ticket.priority === 'high' ? 'bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-semibold' :
                'bg-gray-100 text-gray-700 px-3 py-1 rounded-full font-semibold'
              }>
                {ticket.priority === 'urgent' ? 'Khẩn cấp' : ticket.priority === 'high' ? 'Cao' : 'Bình thường'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TicketDetailPage;
