'use client';

import React from 'react';
import { Card, Typography, Table, Tag, Space } from 'antd';
import { format } from 'date-fns';
import Header from '@/components/layout/Header';

const { Title } = Typography;

interface Order {
    id: string;
    orderNumber: string;
    date: Date;
    status: 'pending' | 'processing' | 'completed' | 'cancelled';
    total: number;
}

const MyOrderPage = () => {
    // Mock data - sau này sẽ được thay thế bằng data từ API
    const orders: Order[] = [
        {
            id: '1',
            orderNumber: 'ORD-001',
            date: new Date('2024-03-15'),
            status: 'completed',
            total: 1500000,
        },
        {
            id: '2',
            orderNumber: 'ORD-002',
            date: new Date('2024-03-14'),
            status: 'processing',
            total: 2000000,
        },
    ];

    const columns = [
        {
            title: 'Mã đơn hàng',
            dataIndex: 'orderNumber',
            key: 'orderNumber',
        },
        {
            title: 'Ngày đặt',
            dataIndex: 'date',
            key: 'date',
            render: (date: Date) => format(date, 'dd/MM/yyyy'),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => {
                const statusConfig = {
                    pending: { color: 'warning', text: 'Chờ xử lý' },
                    processing: { color: 'processing', text: 'Đang xử lý' },
                    completed: { color: 'success', text: 'Hoàn thành' },
                    cancelled: { color: 'error', text: 'Đã hủy' },
                };
                const config = statusConfig[status as keyof typeof statusConfig];
                return <Tag color={config.color}>{config.text}</Tag>;
            },
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'total',
            key: 'total',
            render: (total: number) => `${total.toLocaleString('vi-VN')} VNĐ`,
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_: unknown, record: Order) => (
                <Space size="middle">
                    <a href={`/myorder/${record.id}`}>Chi tiết</a>
                </Space>
            ),
        },
    ];

    return (
        <>
            <Header/>
            <div className="container mx-auto px-4 py-8">
                <Title level={2}>Đơn hàng của tôi</Title>
                <Card>
                    <Table
                        columns={columns}
                        dataSource={orders}
                        rowKey="id"
                        pagination={{ pageSize: 10 }}
                    />
                </Card>
            </div>
        </>
    );
};

export default MyOrderPage;
