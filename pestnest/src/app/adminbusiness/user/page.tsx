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
import { useLanguage } from '@/context/LanguageContext';
import pagesConfigEn from '../../../../utils/petPagesConfig.en';
import pagesConfigVi from '../../../../utils/petPagesConfig.vi';
import * as XLSX from "xlsx";


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
  const { lang } = useLanguage();
  const config = lang === 'en' ? pagesConfigEn.userstatistics : pagesConfigVi.userstatistics;
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
  const filteredVipCustomers = (dashboardData?.topCustomersByOrderCount || []).filter(
    (customer) =>
      customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Paginate VIP customers
  const vipStartIndex = (vipCurrentPage - 1) * vipItemsPerPage
  const vipEndIndex = vipStartIndex + vipItemsPerPage
  const paginatedVipCustomers = filteredVipCustomers.slice(vipStartIndex, vipEndIndex)

  // Paginate top buyers (by revenue)
  const topBuyersData = (dashboardData?.topCustomersByRevenue || []).sort((a, b) => b.orderCount - a.orderCount)
  const buyersStartIndex = (currentPage - 1) * itemsPerPage
  const buyersEndIndex = buyersStartIndex + itemsPerPage
  const paginatedTopBuyers = topBuyersData.slice(buyersStartIndex, buyersEndIndex)

  // Đã thay thế toàn bộ logic filter, paginate, render bằng filteredCancelUsers và paginatedCancelUsers
  // Đảm bảo hàm filter có kiểu cho user
  const filteredCancelUsers = (dashboardData?.topUsersByCancellations || []).filter((user: any) =>
    user.userName?.toLowerCase().includes(searchTerm.toLowerCase())
  )
  const cancelStartIndex = (cancelCurrentPage - 1) * cancelItemsPerPage
  const cancelEndIndex = cancelStartIndex + cancelItemsPerPage
  const paginatedCancelUsers = filteredCancelUsers.slice(cancelStartIndex, cancelEndIndex)

  const filteredPotentialCustomers = (dashboardData?.potentialCustomers || []).filter((customer) =>
    customer.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )
  const paginatedPotentialCustomers = filteredPotentialCustomers.slice(
    (potentialCurrentPage - 1) * potentialItemsPerPage,
    potentialCurrentPage * potentialItemsPerPage
  )

  const handleExportExcel = () => {
    if (!dashboardData) return;
    const wb = XLSX.utils.book_new();

    // Helper to add a sheet
    const addSheet = (data: any[], name: string) => {
      if (data && data.length > 0) {
        const ws = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, name);
      }
    };

    addSheet(dashboardData.topCustomersByOrderCount, "TopByOrderCount");
    addSheet(dashboardData.topCustomersByRevenue, "TopByRevenue");
    addSheet(dashboardData.topUsersByCancellations, "TopByCancellations");
    addSheet(dashboardData.potentialCustomers, "PotentialCustomers");
    addSheet(dashboardData.userRegistrationByMonth, "RegByMonth");
    addSheet(dashboardData.userRegistrationByYear, "RegByYear");

    XLSX.writeFile(wb, "dashboard-data.xlsx");
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="flex flex-col space-y-8 p-8">
        {/* Header */}
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{config.pageTitle}</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              {config.filter}
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportExcel}>
              <Download className="mr-2 h-4 w-4" />
              Export Excel
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{config.totalUsers}</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.totalUsers || 'null'}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{config.currentMonthUsers}</CardTitle>
              <Crown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.currentMonthUsers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{config.potentialCustomers}</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.potentialCustomers.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{config.loyalCustomers}</CardTitle>
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
                <CardTitle>{config.registrationStats.title}</CardTitle>
                <CardDescription>{config.registrationStats.description}</CardDescription>
              </div>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Chọn khoảng thời gian" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">{config.registrationStats.monthly}</SelectItem>
                  <SelectItem value="yearly">{config.registrationStats.yearly}</SelectItem>
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
            <TabsTrigger value="potential-customers">{config.tabs.potential}</TabsTrigger>
            <TabsTrigger value="top-buyers">{config.tabs.topBuyers}</TabsTrigger>
            <TabsTrigger value="cancellation-analysis">{config.tabs.cancellation}</TabsTrigger>
          </TabsList>

          <TabsContent value="potential-customers" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{config.tabs.potential}</CardTitle>
                    <CardDescription>{config.potentialCustomers}</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder={config.searchPlaceholder}
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
                      <TableHead>{config.table.customer}</TableHead>
                      <TableHead>{config.table.email}</TableHead>
                      <TableHead>{config.table.phone}</TableHead>
                      <TableHead>{config.table.createdAt}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedPotentialCustomers.map((customer: any, index: number) => (
                      <TableRow key={customer.id ?? customer.email ?? index}>
                        <TableCell className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src={customer.avatar || "/placeholder.svg"} />
                            <AvatarFallback>{customer.name?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{customer.name}</div>
                            <div className="text-sm text-muted-foreground">{customer.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>{customer.email}</TableCell>
                        <TableCell>{customer.phone}</TableCell>
                        <TableCell>{customer.createdAt ? new Date(customer.createdAt).toLocaleDateString("vi-VN") : ""}</TableCell>
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
                <CardTitle>{config.tabs.topBuyers}</CardTitle>
                <CardDescription>{config.loyalCustomers}</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{config.table.ranking}</TableHead>
                      <TableHead>{config.table.customer}</TableHead>
                      <TableHead>{config.table.orders}</TableHead>
                      <TableHead>{config.table.totalSpent}</TableHead>
                      <TableHead>{config.table.avgOrder}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dashboardData?.topCustomersByRevenue.map((customer, index) => (
                      <TableRow key={customer.id ?? customer.userEmail ?? index}>
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
            <Card>
              <CardHeader>
                <CardTitle>{config.details.cancellationTitle}</CardTitle>
                <CardDescription>{config.details.cancellationDesc}</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{config.table.customer}</TableHead>
                      <TableHead>{config.table.totalOrders}</TableHead>
                      <TableHead>{config.table.cancelledOrders}</TableHead>
                      <TableHead>{config.table.cancelRate}</TableHead>
                      <TableHead>{config.table.mainReason}</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedCancelUsers.map((user: any, index: number) => (
                      <TableRow key={user.id ?? user.userEmail ?? index}>
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
                    totalItems={filteredCancelUsers.length}
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
