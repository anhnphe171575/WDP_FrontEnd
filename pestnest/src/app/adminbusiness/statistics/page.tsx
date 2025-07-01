'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign, Package, BarChart3, Calendar } from "lucide-react";
import { api } from "../../../../utils/axios";

interface ProductStat {
  productId: string;
  productName: string;
  totalQuantity: number;
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  orderCount: number;
  profitMargin: number;
}

interface SummaryStats {
  totalRevenue: number;
  totalProfit: number;
  totalQuantity: number;
  averageProfitMargin: number;
}

interface RevenueTimeData {
  time: string;
  revenue: number;
}

export default function StatisticsPage() {
  const [productStats, setProductStats] = useState<ProductStat[]>([]);
  const [summaryStats, setSummaryStats] = useState<SummaryStats | null>(null);
  const [revenueTimeData, setRevenueTimeData] = useState<RevenueTimeData[]>([]);
  const [lowRevenueProducts, setLowRevenueProducts] = useState<ProductStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('revenue');
  
  // Filter states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('revenue');
  const [limit, setLimit] = useState('10');
  const [timePeriod, setTimePeriod] = useState('month');

  useEffect(() => {
    fetchStatistics();
  }, [startDate, endDate, sortBy, limit]);

  useEffect(() => {
    fetchRevenueByTime();
  }, [timePeriod, startDate, endDate]);

  useEffect(() => {
    fetchLowRevenueProducts();
  }, [limit]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        sortBy,
        limit
      });
      
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await api.get(`/statistics/product-revenue?${params}`);
      
      if (response.data.success) {
        setProductStats(response.data.data.products);
        setSummaryStats(response.data.data.summary);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRevenueByTime = async () => {
    try {
      const params = new URLSearchParams({ period: timePeriod });
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await api.get(`/statistics/revenue-by-time?${params}`);
      
      if (response.data.success) {
        setRevenueTimeData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching revenue by time:', error);
    }
  };

  const fetchLowRevenueProducts = async () => {
    try {
      const response = await api.get(`/statistics/low-revenue-products?limit=${limit}`);
      
      if (response.data.success) {
        setLowRevenueProducts(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching low revenue products:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  const getProfitColor = (profit: number) => {
    return profit >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getProfitIcon = (profit: number) => {
    return profit >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Thống kê Doanh thu & Lãi</h1>
          <p className="text-muted-foreground">Phân tích hiệu suất sản phẩm và doanh thu</p>
        </div>
      </div>

      {/* Filter Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="startDate">Từ ngày</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="endDate">Đến ngày</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="sortBy">Sắp xếp theo</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="revenue">Doanh thu</SelectItem>
                  <SelectItem value="profit">Lãi</SelectItem>
                  <SelectItem value="quantity">Số lượng</SelectItem>
                  <SelectItem value="profitMargin">Tỷ lệ lãi</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="limit">Số lượng hiển thị</Label>
              <Select value={limit} onValueChange={setLimit}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">Top 5</SelectItem>
                  <SelectItem value="10">Top 10</SelectItem>
                  <SelectItem value="20">Top 20</SelectItem>
                  <SelectItem value="50">Top 50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {summaryStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng Doanh thu</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(summaryStats.totalRevenue)}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng Lãi</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getProfitColor(summaryStats.totalProfit)}`}>{formatCurrency(summaryStats.totalProfit)}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng Số lượng</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(summaryStats.totalQuantity)}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex space-x-2">
        <Button
          variant={activeTab === 'revenue' ? 'default' : 'outline'}
          onClick={() => setActiveTab('revenue')}
        >
          Sản phẩm bán chạy
        </Button>
        <Button
          variant={activeTab === 'low' ? 'default' : 'outline'}
          onClick={() => setActiveTab('low')}
        >
          Sản phẩm bán chậm
        </Button>
        <Button
          variant={activeTab === 'time' ? 'default' : 'outline'}
          onClick={() => setActiveTab('time')}
        >
          Doanh thu theo thời gian
        </Button>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'revenue' && (
        <Card>
          <CardHeader>
            <CardTitle>Sản phẩm có doanh thu cao nhất</CardTitle>
            <CardDescription>
              Danh sách sản phẩm mang lại doanh thu và lãi cao nhất
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Đang tải dữ liệu...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sản phẩm</TableHead>
                    <TableHead>Số lượng bán</TableHead>
                    <TableHead>Doanh thu</TableHead>
                    <TableHead>Chi phí</TableHead>
                    <TableHead>Lãi</TableHead>
                    <TableHead>Tỷ lệ lãi</TableHead>
                    <TableHead>Số đơn hàng</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productStats.map((product) => (
                    <TableRow key={product.productId}>
                      <TableCell className="font-medium">{product.productName}</TableCell>
                      <TableCell>{formatNumber(product.totalQuantity)}</TableCell>
                      <TableCell>{formatCurrency(product.totalRevenue)}</TableCell>
                      <TableCell>{formatCurrency(product.totalCost)}</TableCell>
                      <TableCell className={getProfitColor(product.totalProfit)}>
                        <div className="flex items-center gap-1">
                          {getProfitIcon(product.totalProfit)}
                          {formatCurrency(product.totalProfit)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={product.profitMargin >= 20 ? 'default' : 'secondary'}>
                          {formatPercentage(product.profitMargin)}
                        </Badge>
                      </TableCell>
                      <TableCell>{product.orderCount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'low' && (
        <Card>
          <CardHeader>
            <CardTitle>Sản phẩm bán chậm</CardTitle>
            <CardDescription>
              Danh sách sản phẩm có doanh thu thấp nhất
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sản phẩm</TableHead>
                  <TableHead>Số lượng bán</TableHead>
                  <TableHead>Doanh thu</TableHead>
                  <TableHead>Chi phí</TableHead>
                  <TableHead>Lãi</TableHead>
                  <TableHead>Tỷ lệ lãi</TableHead>
                  <TableHead>Số đơn hàng</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lowRevenueProducts.map((product) => (
                  <TableRow key={product.productId}>
                    <TableCell className="font-medium">{product.productName}</TableCell>
                    <TableCell>{formatNumber(product.totalQuantity)}</TableCell>
                    <TableCell>{formatCurrency(product.totalRevenue)}</TableCell>
                    <TableCell>{formatCurrency(product.totalCost)}</TableCell>
                    <TableCell className={getProfitColor(product.totalProfit)}>
                      <div className="flex items-center gap-1">
                        {getProfitIcon(product.totalProfit)}
                        {formatCurrency(product.totalProfit)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={product.profitMargin >= 20 ? 'default' : 'secondary'}>
                        {formatPercentage(product.profitMargin)}
                      </Badge>
                    </TableCell>
                    <TableCell>{product.orderCount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {activeTab === 'time' && (
        <Card>
          <CardHeader>
            <CardTitle>Doanh thu theo thời gian</CardTitle>
            <CardDescription>
              Biểu đồ doanh thu theo thời gian
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Label htmlFor="timePeriod">Chu kỳ thời gian</Label>
              <Select value={timePeriod} onValueChange={setTimePeriod}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Theo ngày</SelectItem>
                  <SelectItem value="week">Theo tuần</SelectItem>
                  <SelectItem value="month">Theo tháng</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              {revenueTimeData.map((item) => (
                <div key={item.time} className="flex justify-between items-center p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{item.time}</span>
                  </div>
                  <div className="text-lg font-bold text-green-600">
                    {formatCurrency(item.revenue)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 