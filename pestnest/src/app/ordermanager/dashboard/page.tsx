"use client"

import * as React from "react"

import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import {
  ArrowDownIcon,
  ArrowUpIcon,
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
  shipping: "#06b6d4",
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

// Add Recommendation interface for recommendation data
interface Recommendation {
  productId: string;
  variantId: string;
  img: string;
  productName: string;
  currentStock: number;
  averageMonthlySales: number;
  shouldImport: boolean;
  suggestedQuantity: number;
  category: string;
  brand: string;
  attributeNames:string;
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
function ProductRecommendationCard({ product }: { product: Recommendation }) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <img
              src={product.img || "/placeholder.svg"}
              alt={product.productName}
              className="w-20 h-20 rounded-lg object-cover border"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900 truncate">{product.productName}</h3>
              <div className="flex items-center space-x-1">
                {product.shouldImport ? (
                  <ArrowUpIcon className="h-4 w-4 text-green-500" />
                ) : (
                  <ArrowDownIcon className="h-4 w-4 text-red-500" />
                )}
                <span className={`text-sm font-medium ${product.shouldImport ? 'text-green-600' : 'text-red-600'}`}>
                  {product.shouldImport ? 'Import' : 'No Import'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <p className="text-sm text-gray-500">Current Stock</p>
                <p className="font-semibold text-red-600">{product.currentStock} units</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Monthly Sales</p>
                <p className="font-semibold">{product.averageMonthlySales} units</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Brand</p>
                <p className="font-semibold text-blue-600">{product.brand}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Suggest Quantity </p>
                <p className="font-semibold text-purple-600">{product.suggestedQuantity}</p>
              </div>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg mb-3">
              
              <p className="text-xs text-gray-500">
              <strong>Import Type: </strong> {product.attributeNames} 
              </p>
            </div>

            <div className="bg-yellow-50 p-3 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>Why:</strong> {product.shouldImport ? 'Low stock with high demand - recommended to import' : 'Stock levels are adequate'}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
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
  const [recommendProducts, setRecommendProducts] = React.useState<Recommendation[]>([])
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
      const [best, worst, revenue, recommend] = await Promise.all([
        api.get('/products/best-selling'),
        api.get('/products/worst-selling'),
        api.get('/orders/revenue'),
        api.get('/orders/recommend-imports')
      ])
      setBestSelling(best.data.data?.slice(0, 5) || [])
      setWorstSelling(worst.data.data?.slice(0, 5) || [])
      setRecommendProducts(recommend.data.recommendations || [])
      setRevenueData(revenue.data)
      console.log(recommend.data.recommendations);
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
              <p className="text-xs text-muted-foreground">
                {(() => {
                  const currentMonth = new Date().getMonth() + 1;
                  const currentYear = new Date().getFullYear();
                  const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
                  const lastYear = currentMonth === 1 ? currentYear - 1 : currentYear;
                  
                  const currentMonthData = ordersData?.ordersByYear
                    ?.find((y: any) => y.year === currentYear)
                    ?.months?.find((m: any) => m.month === currentMonth);
                  
                  const lastMonthData = ordersData?.ordersByYear
                    ?.find((y: any) => y.year === lastYear)
                    ?.months?.find((m: any) => m.month === lastMonth);
                  
                  const currentCount = currentMonthData?.count || 0;
                  const lastCount = lastMonthData?.count || 0;
                  
                  if (lastCount === 0) return "No data from last month";
                  
                  const percentageChange = ((currentCount - lastCount) / lastCount * 100);
                  const sign = percentageChange >= 0 ? "+" : "";
                  return `${sign}${percentageChange.toFixed(1)}% from last month`;
                })()}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold"> {revenueData?.totalRevenue || 'null'} VND</div>
              <p className="text-xs text-muted-foreground">total revenue order completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue Current Month</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{revenueData?.currentMonthRevenue || '0'} VND</div>
              <p className="text-xs text-muted-foreground">{revenueData?.monthlyGrowthPercentage === 0 ? 'No revenue current month' : `${revenueData?.monthlyGrowthPercentage} % from last month`} </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue Current Years</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{revenueData?.revenueByYear.find((r: any) => r._id === new Date().getFullYear())?.yearlyRevenue || 0} VND</div>
              <p className="text-xs text-muted-foreground">
                {(() => {
                  const currentYear = new Date().getFullYear();
                  const lastYear = currentYear - 1;
                  const currentRevenue = revenueData?.revenueByYear.find((r: any) => r._id === currentYear)?.yearlyRevenue || 0;
                  const lastYearRevenue = revenueData?.revenueByYear.find((r: any) => r._id === lastYear)?.yearlyRevenue || 0;
                  
                  if (lastYearRevenue === 0) return "No data from last year";
                  
                  const percentageChange = ((currentRevenue - lastYearRevenue) / lastYearRevenue * 100);
                  const sign = percentageChange >= 0 ? "+" : "";
                  return `${sign}${percentageChange.toFixed(1)}% from last year`;
                })()}
              </p>
            </CardContent>
          </Card>
        </div>
        {/* Product Recommendation Section */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl text-blue-900">
                  🤔 Nên nhập sản phẩm nào? / Which products should we import?
                </CardTitle>
                <CardDescription className="text-blue-700">
                  AI-powered recommendations based on sales data, stock levels, and market trends
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
              {recommendProducts.map((product) => (
                <ProductRecommendationCard key={product.productId} product={product} />
              ))}
            </div>

          </CardContent>
        </Card>

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
