'use client';

import { useEffect, useState } from 'react';
import { api } from '../../../../utils/axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Package, AlertTriangle } from 'lucide-react';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// --- Interfaces ---
interface CategoryData {
  categoryName: string;
  productCount: number;
  subCategories?: CategoryData[];
}

interface BrandData {
  brandName: string;
  count: number;
}

interface LowStockVariant {
  variantId: string;
  productName: string;
  totalQuantity: number;
  images: { url: string }[];
}

interface DashboardData {
  totalProducts: number;
  totalLowStock: number;
  productsByCategory: CategoryData[];
  productsByBrand: BrandData[];
  lowStockVariants: LowStockVariant[];
}

// --- Dynamic Imports for Charts ---
const ProductsByCategoryPieChart = dynamic(() => import('@/components/charts/ProductsByCategoryPieChart'), { 
  ssr: false,
  loading: () => <Skeleton className="h-[350px]" />
});
const ProductsByBrandBarChart = dynamic(() => import('@/components/charts/ProductsByBrandBarChart'), { 
  ssr: false,
  loading: () => <Skeleton className="h-[350px]" />
});

// --- Main Component ---
export default function ProductDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = {
          category: selectedCategory || undefined,
        };
        const response = await api.get('/products/dashboard', { params });
        if (response.data.success) {
          setData(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCategory]);

  const StatCard = ({ title, value, icon, description }: { title: string, value: string | number, icon: React.ReactNode, description?: string }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </CardContent>
    </Card>
  );

  const handleCategorySelect = (categoryName: string) => {
    setSelectedCategory(prev => prev === categoryName ? null : categoryName);
  };

  const filteredLowStockVariants = data?.lowStockVariants.filter(variant =>
    variant.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!data && loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Tổng Quan Sản Phẩm</h1>
        <p className="text-muted-foreground">Thống kê chi tiết về sản phẩm trong cửa hàng.</p>
      </div>

      {/* Active Filter Display */}
      {selectedCategory && (
        <Card>
          <CardContent className="p-3 flex items-center justify-between">
            <p className="text-sm">
              Đang lọc theo danh mục: <span className="font-semibold">{selectedCategory}</span>
            </p>
            <Button variant="ghost" size="sm" onClick={() => setSelectedCategory(null)}>
              Xóa bộ lọc
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <StatCard 
          title="Tổng Sản Phẩm" 
          value={data?.totalProducts || 0} 
          icon={<Package className="h-4 w-4 text-muted-foreground" />} 
          description="Tổng số sản phẩm đang có"
        />
        <StatCard 
          title="Sản Phẩm Sắp Hết Hàng" 
          value={data?.totalLowStock || 0} 
          icon={<AlertTriangle className="h-4 w-4 text-orange-500" />} 
          description="Số lượng biến thể có tồn kho <= 10"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sản Phẩm Theo Danh Mục</CardTitle>
            <p className="text-sm text-muted-foreground">Nhấp vào một danh mục để lọc toàn bộ trang.</p>
          </CardHeader>
          <CardContent>
            <ProductsByCategoryPieChart data={data?.productsByCategory || []} onCategorySelect={handleCategorySelect} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Sản Phẩm Theo Thương Hiệu</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductsByBrandBarChart data={data?.productsByBrand || []} />
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Table */}
      <Card>
        <CardHeader>
          <CardTitle>Sản Phẩm Tồn Kho Thấp</CardTitle>
          <div className="mt-2">
            <Input 
              placeholder="Tìm kiếm sản phẩm tồn kho thấp..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Hình Ảnh</TableHead>
                <TableHead>Tên Sản Phẩm</TableHead>
                <TableHead className="text-right">Số Lượng Còn Lại</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLowStockVariants?.map((variant) => (
                <TableRow key={variant.variantId}>
                  <TableCell>
                    <Image
                      src={variant.images[0]?.url || '/images/placeholder.png'}
                      alt={variant.productName}
                      width={50}
                      height={50}
                      className="rounded-md object-cover"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{variant.productName}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={variant.totalQuantity === 0 ? 'destructive' : 'secondary'}>
                      {variant.totalQuantity}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
} 