'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, Typography, Descriptions, Tag, Space, Divider, Button } from 'antd';
import { ClockCircleOutlined, EnvironmentOutlined, PhoneOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import Header from '@/components/layout/Header';

const { Title, Text } = Typography;

interface OrderDetails {
  id: string;
  orderNumber: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  createdAt: string;
  totalAmount: number;
  customerName: string;
  address: string;
  phone: string;
  items: {
    id: string;
    name: string;
    quantity: number;
    price: number;
  }[];
}

// Mock data
const mockOrderDetails: OrderDetails = {
  id: '1',
  orderNumber: 'ORD-001',
  status: 'completed',
  createdAt: '2024-03-15T10:30:00',
  totalAmount: 1500000,
  customerName: 'Nguyễn Văn A',
  address: '123 Đường ABC, Phường XYZ, Quận 1, TP.HCM',
  phone: '0123456789',
  items: [
    {
      id: '1',
      name: 'Dịch vụ diệt mối tận gốc',
      quantity: 1,
      price: 800000,
    },
    {
      id: '2',
      name: 'Dịch vụ phun thuốc diệt côn trùng',
      quantity: 1,
      price: 700000,
    }
  ]
};

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call with mock data
    const fetchOrderDetails = async () => {
      try {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setOrderDetails(mockOrderDetails);
      } catch (error) {
        console.error('Error fetching order details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [params.id]);

  const getStatusConfig = (status: string) => {
    const statusConfig = {
      pending: { color: 'warning', text: 'Chờ xử lý' },
      processing: { color: 'processing', text: 'Đang xử lý' },
      completed: { color: 'success', text: 'Hoàn thành' },
      cancelled: { color: 'error', text: 'Đã hủy' },
    };
    return statusConfig[status as keyof typeof statusConfig] || { color: 'default', text: status };
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div>Đang tải...</div>
        </div>
      </>
    );
  }

  if (!orderDetails) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div>Không tìm thấy đơn hàng</div>
        </div>
      </>
    );
  }

  const statusConfig = getStatusConfig(orderDetails.status);

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => router.push('/myorder')}
          className="mb-4"
        >
          Quay lại
        </Button>
        
        <Card>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div className="flex justify-between items-center">
              <Title level={3}>Đơn hàng #{orderDetails.orderNumber}</Title>
              <Tag color={statusConfig.color}>
                {statusConfig.text}
              </Tag>
            </div>

            <Descriptions bordered>
              <Descriptions.Item label="Ngày đặt hàng" span={3}>
                <Space>
                  <ClockCircleOutlined />
                  {new Date(orderDetails.createdAt).toLocaleDateString('vi-VN')}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Tên khách hàng" span={3}>
                {orderDetails.customerName}
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ giao hàng" span={3}>
                <Space>
                  <EnvironmentOutlined />
                  {orderDetails.address}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại" span={3}>
                <Space>
                  <PhoneOutlined />
                  {orderDetails.phone}
                </Space>
              </Descriptions.Item>
            </Descriptions>

            <Divider>Chi tiết sản phẩm</Divider>

            <div className="space-y-4">
              {orderDetails.items.map((item) => (
                <Card key={item.id} size="small">
                  <div className="flex justify-between items-center">
                    <div>
                      <Text strong>{item.name}</Text>
                      <br />
                      <Text type="secondary">Số lượng: {item.quantity}</Text>
                    </div>
                    <Text>{(item.price * item.quantity).toLocaleString('vi-VN')} VNĐ</Text>
                  </div>
                </Card>
              ))}
            </div>

            <Divider />

            <div className="flex justify-end">
              <Space direction="vertical" align="end">
                <Text>Tổng tiền: {orderDetails.totalAmount.toLocaleString('vi-VN')} VNĐ</Text>
              </Space>
            </div>
          </Space>
        </Card>
      </div>
    </>
  );
}
