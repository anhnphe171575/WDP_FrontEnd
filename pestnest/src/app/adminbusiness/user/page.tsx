"use client"

import { useState } from "react"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import {
  Users,
  TrendingUp,
  Crown,
  XCircle,
  Filter,
  Download,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Ban,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { api } from "../../../../utils/axios";
import { da } from "date-fns/locale"


// Mock data for VIP customers
const vipCustomers = [
  {
    id: 1,
    name: "Nguyễn Văn An",
    email: "an.nguyen@email.com",
    totalSpent: 25000000,
    orders: 45,
    joinDate: "2023-01-15",
    tier: "Diamond",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 2,
    name: "Trần Thị Bình",
    email: "binh.tran@email.com",
    totalSpent: 18000000,
    orders: 32,
    joinDate: "2023-03-20",
    tier: "Gold",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 3,
    name: "Lê Minh Cường",
    email: "cuong.le@email.com",
    totalSpent: 22000000,
    orders: 38,
    joinDate: "2023-02-10",
    tier: "Platinum",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 4,
    name: "Phạm Thu Dung",
    email: "dung.pham@email.com",
    totalSpent: 15000000,
    orders: 28,
    joinDate: "2023-04-05",
    tier: "Gold",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 5,
    name: "Hoàng Văn Em",
    email: "em.hoang@email.com",
    totalSpent: 30000000,
    orders: 52,
    joinDate: "2022-12-01",
    tier: "Diamond",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 6,
    name: "Hoàng Văn Em",
    email: "em.hoang@email.com",
    totalSpent: 30000000,
    orders: 52,
    joinDate: "2022-12-01",
    tier: "Diamond",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 7,
    name: "Hoàng Văn Em",
    email: "em.hoang@email.com",
    totalSpent: 30000000,
    orders: 52,
    joinDate: "2022-12-01",
    tier: "Diamond",
    avatar: "/placeholder.svg?height=40&width=40",
  },
]

// Mock data for customers with most cancellations
const topCancelUsers = [
  {
    id: 1,
    name: "Đỗ Văn Phúc",
    email: "phuc.do@email.com",
    totalOrders: 25,
    cancelledOrders: 12,
    cancelRate: 48,
    lastCancel: "2024-01-15",
    reason: "Thay đổi ý định",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 2,
    name: "Vũ Thị Giang",
    email: "giang.vu@email.com",
    totalOrders: 30,
    cancelledOrders: 11,
    cancelRate: 37,
    lastCancel: "2024-01-10",
    reason: "Sản phẩm không phù hợp",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 3,
    name: "Bùi Minh Hải",
    email: "hai.bui@email.com",
    totalOrders: 22,
    cancelledOrders: 9,
    cancelRate: 41,
    lastCancel: "2024-01-08",
    reason: "Giao hàng chậm",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 4,
    name: "Ngô Thu Hương",
    email: "huong.ngo@email.com",
    totalOrders: 28,
    cancelledOrders: 10,
    cancelRate: 36,
    lastCancel: "2024-01-12",
    reason: "Giá cả không hợp lý",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 5,
    name: "Đinh Văn Khoa",
    email: "khoa.dinh@email.com",
    totalOrders: 20,
    cancelledOrders: 8,
    cancelRate: 40,
    lastCancel: "2024-01-14",
    reason: "Thay đổi ý định",
    avatar: "/placeholder.svg?height=40&width=40",
  },
]

// Mock data for cancellation reasons
const cancellationReasons = [
  { name: "Thay đổi ý định", value: 35, color: "#8884d8" },
  { name: "Sản phẩm không phù hợp", value: 25, color: "#82ca9d" },
  { name: "Giao hàng chậm", value: 20, color: "#ffc658" },
  { name: "Giá cả không hợp lý", value: 15, color: "#ff7300" },
  { name: "Khác", value: 5, color: "#00ff00" },
]


const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount)
}

const Pagination = ({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
}: {
  currentPage: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  onItemsPerPageChange: (items: number) => void
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  return (
    <div className="flex items-center justify-between px-2">
      <div className="flex items-center space-x-2">
        <p className="text-sm font-medium">Hiển thị</p>
        <Select
          value={itemsPerPage.toString()}
          onValueChange={(value) => {
            onItemsPerPageChange(Number(value))
            onPageChange(1)
          }}
        >
          <SelectTrigger className="h-8 w-[70px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent side="top">
            {[5, 10, 20, 30, 50].map((pageSize) => (
              <SelectItem key={pageSize} value={pageSize.toString()}>
                {pageSize}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm font-medium">
          {startItem}-{endItem} của {totalItems} kết quả
        </p>
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          className="hidden h-8 w-8 p-0 lg:flex bg-transparent"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          className="h-8 w-8 p-0 bg-transparent"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center space-x-1">
          <p className="text-sm font-medium">
            Trang {currentPage} / {totalPages}
          </p>
        </div>
        <Button
          variant="outline"
          className="h-8 w-8 p-0 bg-transparent"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          className="hidden h-8 w-8 p-0 lg:flex bg-transparent"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export default function UserManagementDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [vipCurrentPage, setVipCurrentPage] = useState(1)
  const [vipItemsPerPage, setVipItemsPerPage] = useState(5)
  const [cancelCurrentPage, setCancelCurrentPage] = useState(1)
  const [cancelItemsPerPage, setCancelItemsPerPage] = useState(5)
  const [potentialCurrentPage, setPotentialCurrentPage] = useState(1)
  const [potentialItemsPerPage, setPotentialItemsPerPage] = useState(5)
  type DashboardData = {
    totalUsers: number,

    currentMonthUsers: number,
    topCustomersByOrderCount: Array<{
      id: number
      name: string
      email: string
      totalSpent: number
      orders: number
      joinDate: string
      tier: string
      avatar?: string
    }>,

    topCustomersByRevenue: Array<{
      id: number
      userEmail: string
      totalRevenue: number
      orderCount: number
      averageOrderValue: number
      userName: string
      avatar?: string
    }>,
    topUsersByCancellations: Array<{
      id: number
      userName: string
      userEmail: string
      cancelledOrderCount: number
      totalCancelledValue: number
      cancelRate: number
      reasons: string[]
      avatar?: string
    }>,
    userRegistrationByMonth: Array<{
      month: string,
      count: number
    }>,
    userRegistrationByYear: Array<{
      _id: string,
      count: number
    }>,
    potentialCustomers: Array<{
      id: number
      name: string
      email: string
      phone: string
      createdAt: string
      score: number
      cartValue: number
      pageViews: number
      source: string
      lastActivity: string
      avatar?: string
    }>
    // add other properties as needed
  }
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedPeriod, setSelectedPeriod] = useState("monthly")

  const fetchDataDashboard = async () => {
    try {
      const data = await api.get('/users/dashboard');
      setDashboardData(data.data.data);
      setLoading(true);
      setError(null);
      console.log("Dashboard data fetched successfully:", data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  // Fetch dashboard data on component mount
  useState(() => {
    fetchDataDashboard();
  },)


  // Filter VIP customers based on search term
  const filteredVipCustomers = vipCustomers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Paginate VIP customers
  const vipStartIndex = (vipCurrentPage - 1) * vipItemsPerPage
  const vipEndIndex = vipStartIndex + vipItemsPerPage
  const paginatedVipCustomers = filteredVipCustomers.slice(vipStartIndex, vipEndIndex)

  // Paginate top buyers
  const topBuyersData = vipCustomers.sort((a, b) => b.orders - a.orders)
  const buyersStartIndex = (currentPage - 1) * itemsPerPage
  const buyersEndIndex = buyersStartIndex + itemsPerPage
  const paginatedTopBuyers = topBuyersData.slice(buyersStartIndex, buyersEndIndex)

  // Paginate cancellation users
  const cancelStartIndex = (cancelCurrentPage - 1) * cancelItemsPerPage
  const cancelEndIndex = cancelStartIndex + cancelItemsPerPage
  const paginatedCancelUsers = topCancelUsers.slice(cancelStartIndex, cancelEndIndex)

  const filteredPotentialCustomers =
    dashboardData?.potentialCustomers.filter((customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || []

  const paginatedPotentialCustomers = filteredPotentialCustomers.slice(
    (potentialCurrentPage - 1) * potentialItemsPerPage,
    potentialCurrentPage * potentialItemsPerPage
  )

  const filteredCancelUsers = topCancelUsers.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="flex flex-col space-y-8 p-8">
        {/* Header */}
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard Quản Lý Người Dùng</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Bộ lọc
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Xuất báo cáo
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng khách hàng</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.totalUsers || 'null'}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Khách hàng tháng này</CardTitle>
              <Crown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.currentMonthUsers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Khách hàng tiềm năng</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.potentialCustomers.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Khách hàng thân quen</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.topCustomersByOrderCount.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Registration Analytics */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Thống Kê Đăng Ký Người Dùng</CardTitle>
                <CardDescription>Theo dõi số lượng người dùng đăng ký theo thời gian</CardDescription>
              </div>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Chọn khoảng thời gian" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Theo tháng</SelectItem>
                  <SelectItem value="yearly">Theo năm</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                {selectedPeriod === "monthly" ? (
                  <BarChart data={dashboardData?.userRegistrationByMonth?.map(item => ({
                    ...item,
                    month: `Tháng ${item.month}`
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                ) : (
                  <LineChart data={dashboardData?.userRegistrationByYear}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="_id" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Customer Analysis Tabs */}
        <Tabs defaultValue="potential-customers" className="space-y-4">
          <TabsList>
            <TabsTrigger value="potential-customers">Khách Hàng Tiềm Năng</TabsTrigger>
            <TabsTrigger value="top-buyers">Mua Hàng Nhiều Nhất</TabsTrigger>
            <TabsTrigger value="cancellation-analysis">Phân Tích Hủy Đơn</TabsTrigger>
          </TabsList>


          <TabsContent value="potential-customers" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Khách Hàng Tiềm Năng</CardTitle>
                    <CardDescription>Danh sách khách hàng có khả năng chuyển đổi cao</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Tìm kiếm khách hàng..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 w-[300px]"
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Khách hàng</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Điện Thoại</TableHead>
                      <TableHead>Ngày đăng ký tài khoản</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dashboardData?.potentialCustomers.map((customer: any) => (
                      <TableRow key={customer.id}>
                        <TableCell className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src={customer.avatar || "/placeholder.svg"} />
                            <AvatarFallback>{customer.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{customer.name}</div>
                            <div className="text-sm text-muted-foreground">{customer.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>{customer.email}</TableCell>
                        <TableCell>{customer.phone}</TableCell>
                        <TableCell>{new Date(customer.createdAt).toLocaleDateString("vi-VN")}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="mt-4">
                  <Pagination
                    currentPage={potentialCurrentPage}
                    totalItems={filteredPotentialCustomers.length}
                    itemsPerPage={potentialItemsPerPage}
                    onPageChange={setPotentialCurrentPage}
                    onItemsPerPageChange={setPotentialItemsPerPage}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="top-buyers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Top Khách Hàng Mua Nhiều Nhất</CardTitle>
                <CardDescription>Xếp hạng theo số lượng đơn hàng và giá trị mua</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Xếp hạng</TableHead>
                      <TableHead>Khách hàng</TableHead>
                      <TableHead>Số đơn hàng</TableHead>
                      <TableHead>Tổng chi tiêu</TableHead>
                      <TableHead>Trung bình/đơn</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dashboardData?.topCustomersByRevenue.map((customer, index) => (
                      <TableRow key={customer.id}>
                        <TableCell>
                          <div className="flex items-center">
                            <span className="font-bold text-lg">#{buyersStartIndex + index + 1}</span>
                            {index === 0 && <Crown className="ml-2 h-4 w-4 text-yellow-500" />}
                          </div>
                        </TableCell>
                        <TableCell className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src={customer.avatar || "/placeholder.svg"} />
                            <AvatarFallback>{customer.userName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{customer.userName}</div>
                            <div className="text-sm text-muted-foreground">{customer.userEmail}</div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{customer.orderCount}</TableCell>
                        <TableCell>{formatCurrency(customer.totalRevenue)}</TableCell>
                        <TableCell>{formatCurrency(customer.averageOrderValue)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="mt-4">
                  <Pagination
                    currentPage={currentPage}
                    totalItems={topBuyersData.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                    onItemsPerPageChange={setItemsPerPage}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cancellation-analysis" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Lý Do Hủy Đơn Hàng</CardTitle>
                  <CardDescription>Phân tích các lý do chính khiến khách hàng hủy đơn</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={cancellationReasons}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {cancellationReasons.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Khách Hàng Hủy Đơn Nhiều Nhất</CardTitle>
                  <CardDescription>Danh sách khách hàng có tỷ lệ hủy đơn cao</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topCancelUsers.slice(0, 5).map((user, index) => (
                      <div key={user.id} className="flex items-center space-x-4">
                        <div className="flex items-center space-x-3 flex-1">
                          <Avatar>
                            <AvatarImage src={user.avatar || "/placeholder.svg"} />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {user.cancelledOrders}/{user.totalOrders} đơn hủy
                            </div>
                          </div>
                        </div>
                        <Badge variant={user.cancelRate > 40 ? "destructive" : "secondary"}>{user.cancelRate}%</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Chi Tiết Khách Hàng Hủy Đơn</CardTitle>
                <CardDescription>Thông tin chi tiết về các khách hàng có tỷ lệ hủy đơn cao</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Khách hàng</TableHead>
                      <TableHead>Tổng đơn</TableHead>
                      <TableHead>Đơn hủy</TableHead>
                      <TableHead>Tỷ lệ hủy</TableHead>
                      <TableHead>Lý do chính</TableHead>
                      <TableHead></TableHead>

                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dashboardData?.topUsersByCancellations.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src={user.avatar || "/placeholder.svg"} />
                            <AvatarFallback>{user.userName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{user.userName}</div>
                            <div className="text-sm text-muted-foreground">{user.userEmail}</div>
                          </div>
                        </TableCell>
                        <TableCell>{user.totalCancelledValue}</TableCell>
                        <TableCell className="text-red-600 font-medium">{user.cancelledOrderCount}</TableCell>
                        <TableCell>
                          <Badge variant={user.cancelRate > 40 ? "destructive" : "secondary"}>{user.cancelRate}%</Badge>
                        </TableCell>
                        <TableCell className="text-sm">{user.reasons?.[0] || ""}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="icon" className="bg-red-500 text-white" >
                            <Ban className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="mt-4">
                  <Pagination
                    currentPage={cancelCurrentPage}
                    totalItems={topCancelUsers.length}
                    itemsPerPage={cancelItemsPerPage}
                    onPageChange={setCancelCurrentPage}
                    onItemsPerPageChange={setCancelItemsPerPage}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
