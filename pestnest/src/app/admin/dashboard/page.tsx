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


const orderStatusData = [
  { name: "Delivered", value: 35, color: "#22c55e" },
  { name: "Processing", value: 25, color: "#3b82f6" },
  { name: "Pending", value: 20, color: "#f59e0b" },
  { name: "Cancelled", value: 10, color: "#ef4444" },
  { name: "Shipped", value: 10, color: "#06b6d4" }, // thêm dòng này
]

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatOrdersData(ordersData: any, year: number) {
  const yearData = ordersData.ordersByYear.find((y: any) => y.year === year);
  if (!yearData) return MONTHS.map((m) => ({ month: m, orders: 0 }));

  return yearData.months.map((m: any) => ({
    month: MONTHS[m.month - 1],
    orders: m.count,
  }));
}


// Extended sample data for different years and months
const allOrdersData = {
  2024: [
    { month: "Jan", orders: 1 },
    { month: "Feb", orders: 500 },
    { month: "Mar", orders: 237 },
    { month: "Apr", orders: 173 },
    { month: "May", orders: 209 },
    { month: "Jun", orders: 314 },
    { month: "Jul", orders: 278 },
    { month: "Aug", orders: 342 },
    { month: "Sep", orders: 295 },
    { month: "Oct", orders: 267 },
    { month: "Nov", orders: 389 },
    { month: "Dec", orders: 421 },
  ],
  2023: [
    { month: "Jan", orders: 156 },
    { month: "Feb", orders: 275 },
    { month: "Mar", orders: 207 },
    { month: "Apr", orders: 143 },
    { month: "May", orders: 189 },
    { month: "Jun", orders: 284 },
    { month: "Jul", orders: 248 },
    { month: "Aug", orders: 312 },
    { month: "Sep", orders: 265 },
    { month: "Oct", orders: 237 },
    { month: "Nov", orders: 359 },
    { month: "Dec", orders: 391 },
  ],
  2022: [
    { month: "Jan", orders: 126 },
    { month: "Feb", orders: 245 },
    { month: "Mar", orders: 177 },
    { month: "Apr", orders: 113 },
    { month: "May", orders: 159 },
    { month: "Jun", orders: 254 },
    { month: "Jul", orders: 218 },
    { month: "Aug", orders: 282 },
    { month: "Sep", orders: 235 },
    { month: "Oct", orders: 207 },
    { month: "Nov", orders: 329 },
    { month: "Dec", orders: 361 },
  ],
}

export default function Component() {
  const [selectedYear, setSelectedYear] = React.useState<string>("2024")
  const [selectedMonthRange, setSelectedMonthRange] = React.useState<string>("all")
  const [ordersData, setOrdersData] = React.useState()
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState<boolean>(true)
  const [year, setYear] = React.useState<number[]>([2024, 2025, 2022])

  React.useEffect(() => {
    fetchOrders()
  }, [])
  // Fetch orders data from API
   const fetchOrders = async () => {
      try {
        const data = await api.get('/orders/dashboard');
        setOrdersData(data.data);
        setYear(data.data.ordersByYear.map((y: any) => y.year))
        console.log(data.data);
        
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
  // Get filtered data based on selections
  const getFilteredData = () => {
    const yearData = allOrdersData[(selectedYear as unknown) as keyof typeof allOrdersData] || allOrdersData[2024]

    if (selectedMonthRange === "all") {
      return yearData
    } else if (selectedMonthRange === "q1") {
      return yearData.slice(0, 3) // Jan-Mar
    } else if (selectedMonthRange === "q2") {
      return yearData.slice(3, 6) // Apr-Jun
    } else if (selectedMonthRange === "q3") {
      return yearData.slice(6, 9) // Jul-Sep
    } else if (selectedMonthRange === "q4") {
      return yearData.slice(9, 12) // Oct-Dec
    } else if (selectedMonthRange === "h1") {
      return yearData.slice(0, 6) // Jan-Jun
    } else if (selectedMonthRange === "h2") {
      return yearData.slice(6, 12) // Jul-Dec
    }
    return yearData
  }

  const filteredOrdersData = React.useMemo(() => {
    if (!ordersData) return [];
    return formatOrdersData(ordersData, Number(selectedYear));
  }, [ordersData, selectedYear]);

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
                <div className="text-2xl font-bold">1,234</div>
                <p className="text-xs text-muted-foreground">+12% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$45,231</div>
                <p className="text-xs text-muted-foreground">+8% from last month</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$156</div>
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
                    <Select value={selectedMonthRange} onValueChange={setSelectedMonthRange}>
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Year</SelectItem>
                        <SelectItem value="q1">Q1 (Jan-Mar)</SelectItem>
                        <SelectItem value="q2">Q2 (Apr-Jun)</SelectItem>
                        <SelectItem value="q3">Q3 (Jul-Sep)</SelectItem>
                        <SelectItem value="q4">Q4 (Oct-Dec)</SelectItem>
                        <SelectItem value="h1">H1 (Jan-Jun)</SelectItem>
                        <SelectItem value="h2">H2 (Jul-Dec)</SelectItem>
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
                  <span>
                    Showing {selectedYear} -{" "}
                    {selectedMonthRange === "all" ? "Full Year" : selectedMonthRange.toUpperCase()}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Order Status Distribution Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Order Status Distribution</CardTitle>
                <CardDescription>Breakdown of order statuses</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    completed: { label: "Completed", color: "#22c55e" },
                    processing: { label: "Processing", color: "#3b82f6" },
                    pending: { label: "Pending", color: "#f59e0b" },
                    cancelled: { label: "Cancelled", color: "#ef4444" },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={orderStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {orderStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
                <div className="flex flex-wrap gap-4 mt-4">
                  {orderStatusData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm text-muted-foreground">
                        {item.name}: {item.value}%
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
  )
}
