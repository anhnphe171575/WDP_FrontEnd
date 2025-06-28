"use client"

import * as React from "react"

import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import {
  Package,
  ShoppingCart,
  TrendingUp,
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { api } from "../../../../utils/axios"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table"


const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const statusColors = {
  pending: "#f59e0b",
  processing: "#3b82f6",
  shipped: "#06b6d4",
  cancelled: "#ef4444",
  completed: "#22c55e",
  returned: "#f97316"
};

// Add Product interface for product tables
interface Product {
  _id: string;
  name: string;
  description: string;
  category: string[];
  createAt: string;
  updateAt: string;
  variants: {
    _id: string;
    images: {
      url: string;
    }[];
    attribute: {
      Attribute_id: string;
      value: string;
    }[];
    sellPrice: number;
    totalQuantity: number;
  }[];
  brand: string;
  minSellPrice?: number;
  totalQuantity?: number;
}

function formatOrderStatusData(data: any, year: number, month: number) {
  if (!data?.ordersStatusByYearMonth) return [];

  // Find the data for selected year
  const yearData = data.ordersStatusByYearMonth.find((y: any) => y.year === Number(year));
  if (!yearData) return [];

  // Find the data for selected month
  const monthData = yearData.months.find((m: any) => m.month === Number(month));
  if (!monthData) return [];

  // Map the statuses to the format needed for the pie chart
  return monthData.statuses.map((s: any) => ({
    name: s.status.charAt(0).toUpperCase() + s.status.slice(1),
    value: s.count,
    color: statusColors[s.status as keyof typeof statusColors]
  }));
}

function formatOrdersData(ordersData: any, year: number) {
  const yearData = ordersData.ordersByYear.find((y: any) => y.year === year);
  if (!yearData) return MONTHS.map((m) => ({ month: m, orders: 0 }));

  return yearData.months.map((m: any) => ({
    month: MONTHS[m.month - 1],
    orders: m.count,
  }));
}


export default function Component() {
  const [selectedYear, setSelectedYear] = React.useState<string>("2025")
  const [selectedMonth, setSelectedMonth] = React.useState<string>(String(new Date().getMonth() + 1)) // Default to this month
  const [ordersData, setOrdersData] = React.useState<any>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [year, setYear] = React.useState<number[]>([2024, 2025, 2022])
  const [bestSelling, setBestSelling] = React.useState<Product[]>([])
  const [worstSelling, setWorstSelling] = React.useState<Product[]>([])
  const [loadingProducts, setLoadingProducts] = React.useState(true)
  const [errorProducts, setErrorProducts] = React.useState<string | null>(null)
  const [revenueData, setRevenueData] = React.useState<any>(null)
  

  React.useEffect(() => {
    fetchOrders()
    fetchProductTables()
  }, [])
  // Fetch orders data from API
  const fetchOrders = async () => {
    try {
      const data = await api.get('/orders/dashboard');
      setOrdersData(data.data);
      setYear(data.data.ordersByYear.map((y: any) => y.year))
      console.log(data.data.ordersStatusByYearMonth[0].months[0].statuses);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch best-selling and worst-selling products
  const fetchProductTables = async () => {
    setLoadingProducts(true)
    setErrorProducts(null)
    try {
      const [best, worst, revenue] = await Promise.all([
        api.get('/products/best-selling'),
        api.get('/products/worst-selling'),
        api.get('/orders/revenue')
      ])
      setBestSelling(best.data.data?.slice(0, 5) || [])
      setWorstSelling(worst.data.data?.slice(0, 5) || [])
      setRevenueData(revenue.data)
      console.log(revenue.data);
    } catch (err: any) {
      setErrorProducts(err?.message || 'Error fetching product tables')
    } finally {
      setLoadingProducts(false)
    }
  }

  const filteredOrdersData = React.useMemo(() => {
    if (!ordersData) return [];
    return formatOrdersData(ordersData, Number(selectedYear));
  }, [ordersData, selectedYear]);


  const filteredOrderStatusData = React.useMemo(() => {
    if (!ordersData) return [];
    return formatOrderStatusData(ordersData, Number(selectedYear), Number(selectedMonth));
  }, [ordersData, selectedYear, selectedMonth]);

  return (


    <div className="flex flex-col flex-1">


      {/* Dashboard Content */}
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ordersData?.totalOrders || 'null'} </div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold"> {revenueData?.totalRevenue || 'null'} VND</div>
              <p className="text-xs text-muted-foreground">+8% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{revenueData?.currentMonthRevenue || 'null'} VND</div>
              <p className="text-xs text-muted-foreground">+3% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1000 VND</div>
              <p className="text-xs text-muted-foreground">+3% from last month</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-4 md:gap-8 lg:grid-cols-2">
          {/* Monthly Orders Chart */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Monthly Orders</CardTitle>
                  <CardDescription>Order volume by month</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="w-[100px]">
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {year.map((y) => (
                        <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  orders: {
                    label: "Orders",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="h-[300px]"
              >
                <BarChart data={filteredOrdersData}>
                  <XAxis dataKey="month" />
                  <YAxis allowDecimals={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="orders" fill="var(--color-orders)" radius={2} />
                </BarChart>
              </ChartContainer>
              <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
              </div>
            </CardContent>
          </Card>

          {/* Order Status Distribution Chart */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Order Status Distribution</CardTitle>
                <div className="flex gap-4">
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="w-[100px]">
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {year.map((y) => (
                        <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Month" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">January</SelectItem>
                      <SelectItem value="2">February</SelectItem>
                      <SelectItem value="3">March</SelectItem>
                      <SelectItem value="4">April</SelectItem>
                      <SelectItem value="5">May</SelectItem>
                      <SelectItem value="6">June</SelectItem>
                      <SelectItem value="7">July</SelectItem>
                      <SelectItem value="8">August</SelectItem>
                      <SelectItem value="9">September</SelectItem>
                      <SelectItem value="10">October</SelectItem>
                      <SelectItem value="11">November</SelectItem>
                      <SelectItem value="12">December</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={filteredOrderStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {filteredOrderStatusData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white p-2 border rounded shadow">
                              <p>{data.name}: {data.value} orders</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mt-4">
                {filteredOrderStatusData.map((item: any) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-muted-foreground">
                      {item.name}: {item.value} 
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          {/* Best selling  */}
          
        </div>

        <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Top 5 Best-Selling Products</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingProducts ? (
                  <div>Loading...</div>
                ) : errorProducts ? (
                  <div className="text-red-600">{errorProducts}</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Brand</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Sold</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bestSelling.map((product) => (
                        <TableRow key={product._id}>
                          <TableCell>{product.name}</TableCell>
                          <TableCell>{product.brand}</TableCell>
                          <TableCell>{product.minSellPrice?.toLocaleString() || 0}</TableCell>
                          <TableCell>{product.totalQuantity || 0}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
            {/* Worst selling  */}
            <Card>
              <CardHeader>
                <CardTitle>Top 5 Worst-Selling Products</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingProducts ? (
                  <div>Loading...</div>
                ) : errorProducts ? (
                  <div className="text-red-600">{errorProducts}</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Brand</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Sold</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {worstSelling.map((product) => (
                        <TableRow key={product._id}>
                          <TableCell>{product.name}</TableCell>
                          <TableCell>{product.brand}</TableCell>
                          <TableCell>{product.minSellPrice?.toLocaleString() || 0}</TableCell>
                          <TableCell>{product.totalQuantity || 0}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      </main>
    </div>
  )
}
