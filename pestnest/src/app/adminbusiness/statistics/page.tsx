'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign, Package, Calendar } from "lucide-react";
import { api } from "../../../../utils/axios";
import { useLanguage } from '@/context/LanguageContext';
import pagesConfigEn from '../../../../utils/petPagesConfig.en';
import pagesConfigVi from '../../../../utils/petPagesConfig.vi';
import dynamic from 'next/dynamic';
const RevenueLineChart = dynamic(() => import('@/components/charts/RevenueLineChart'), { ssr: false });
const TopProductsBarChart = dynamic(() => import('@/components/charts/TopProductsBarChart'), { ssr: false });

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
  const { lang } = useLanguage();
  const config = lang === 'en' ? pagesConfigEn.statistics : pagesConfigVi.statistics;
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
  const [lowLimit, setLowLimit] = useState('5');

  useEffect(() => {
    fetchStatistics();
  }, [startDate, endDate, sortBy, limit]);

  useEffect(() => {
    fetchRevenueByTime();
  }, [timePeriod, startDate, endDate]);

  useEffect(() => {
    fetchLowRevenueProducts();
  }, [limit, lowLimit]);

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
      const response = await api.get(`/statistics/low-revenue-products?limit=${lowLimit}`);
      
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
          <h1 className="text-3xl font-bold">{config.pageTitle}</h1>
          <p className="text-muted-foreground">{config.pageDescription}</p>
        </div>
      </div>

      {/* Filter Controls */}
      <Card>
        <CardHeader>
          <CardTitle>{config.filter.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="startDate">{config.filter.fromDate}</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="endDate">{config.filter.toDate}</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="sortBy">{config.filter.sortBy}</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="revenue">{config.table.revenue}</SelectItem>
                  <SelectItem value="profit">{config.table.profit}</SelectItem>
                  <SelectItem value="quantity">{config.table.quantity}</SelectItem>
                  <SelectItem value="profitMargin">{config.table.profitMargin}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="limit">{config.filter.limit}</Label>
              <Select value={limit} onValueChange={setLimit}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">{config.filter.top5}</SelectItem>
                  <SelectItem value="10">{config.filter.top10}</SelectItem>
                  <SelectItem value="20">{config.filter.top20}</SelectItem>
                  <SelectItem value="50">{config.filter.top50}</SelectItem>
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
              <CardTitle className="text-sm font-medium">{config.summary.totalRevenue}</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(summaryStats.totalRevenue)}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{config.summary.totalProfit}</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getProfitColor(summaryStats.totalProfit)}`}>{formatCurrency(summaryStats.totalProfit)}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{config.summary.totalQuantity}</CardTitle>
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
          {config.tabs.bestSelling}
        </Button>
        <Button
          variant={activeTab === 'low' ? 'default' : 'outline'}
          onClick={() => setActiveTab('low')}
        >
          {config.tabs.slowSelling}
        </Button>
        <Button
          variant={activeTab === 'time' ? 'default' : 'outline'}
          onClick={() => setActiveTab('time')}
        >
          {config.tabs.revenueOverTime}
        </Button>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'revenue' && (
        <Card>
          <CardHeader>
            <CardTitle>{config.bestSelling.title}</CardTitle>
            <CardDescription>
              {config.bestSelling.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="my-6 flex justify-center">
              <div className="w-full max-w-md">
                <TopProductsBarChart data={productStats.slice(0, 10)} />
              </div>
            </div>
            {loading ? (
              <div className="text-center py-8">{config.loading}</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{config.table.product}</TableHead>
                    <TableHead>{config.table.quantity}</TableHead>
                    <TableHead>{config.table.revenue}</TableHead>
                    <TableHead>{config.table.cost}</TableHead>
                    <TableHead>{config.table.profit}</TableHead>
                    <TableHead>{config.table.profitMargin}</TableHead>
                    <TableHead>{config.table.orderCount}</TableHead>
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
            <CardTitle>{config.slowSelling.title}</CardTitle>
            <CardDescription>
              {config.slowSelling.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex items-center gap-4">
              <Label htmlFor="lowLimit">Số lượng sản phẩm hiển thị</Label>
              <Select value={lowLimit} onValueChange={setLowLimit}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">Top 5</SelectItem>
                  <SelectItem value="10">Top 10</SelectItem>
                  <SelectItem value="15">Top 15</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="my-6 flex justify-center">
              <div className="w-full max-w-md">
                <TopProductsBarChart data={lowRevenueProducts.slice(0, parseInt(lowLimit))} />
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{config.table.product}</TableHead>
                  <TableHead>{config.table.quantity}</TableHead>
                  <TableHead>{config.table.revenue}</TableHead>
                  <TableHead>{config.table.cost}</TableHead>
                  <TableHead>{config.table.profit}</TableHead>
                  <TableHead>{config.table.profitMargin}</TableHead>
                  <TableHead>{config.table.orderCount}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lowRevenueProducts.slice(0, parseInt(lowLimit)).map((product) => (
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
            <CardTitle>{config.revenueOverTime.title}</CardTitle>
            <CardDescription>
              {config.revenueOverTime.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Label htmlFor="timePeriod">{config.revenueOverTime.timePeriod}</Label>
              <Select value={timePeriod} onValueChange={setTimePeriod}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">{config.revenueOverTime.byDay}</SelectItem>
                  <SelectItem value="week">{config.revenueOverTime.byWeek}</SelectItem>
                  <SelectItem value="month">{config.revenueOverTime.byMonth}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="my-6 flex justify-center">
              <div className="w-full max-w-md">
                <RevenueLineChart data={revenueTimeData} />
              </div>
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