"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Search, Star, Heart, Truck, ChevronDown, ChevronUp, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { api } from "../../../../../utils/axios"
import { useParams, useRouter } from "next/navigation"
import Header from '@/components/layout/Header';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext'
import viConfig from '../../../../../utils/petPagesConfig.vi'
import enConfig from '../../../../../utils/petPagesConfig.en'
    



interface Review {
  _id: string;
  userId: any;
  productId: string;
  rating: number;
  comment: string;
  images: { url: string }[];
  createdAt: string;
  updatedAt: string;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  category: {
    _id: string;
    name: string;
    description: string;
  }[];
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
  reviews?: Review[];
}

interface Category {
  _id: string;
  name: string;
  description: string;
  image: string;
}

interface Attribute {
  _id: string;
  parentId: string | null;
  value: string;
  children: {
    _id: string;
    value: string;
    parentId: string;
    children: any[];
  }[];
}

interface CategoryResponse {
  parent: Category;
  children: Category[];
  attributes?: Attribute[];
}

interface FilterParams {
  categoryId: string;
  priceRange?: [number, number];
  attributes?: Record<string, string[]>;
  rating?: number;
  sortBy?: string;
}

// Add ProductSkeleton component before the main component
const ProductSkeleton = () => {
  return (
    <Card className="group hover:shadow-xl transition-all duration-300 border border-gray-200 bg-white animate-pulse">
      <CardContent className="p-4">
        <div className="relative mb-4">
          <div className="w-full h-48 bg-gray-200 rounded-lg" />
        </div>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded w-1/2 mb-2" />
          <div className="h-3 bg-gray-200 rounded w-2/3" />
        </div>
        <div className="h-8 bg-gray-200 rounded w-full mt-4" />
      </CardContent>
    </Card>
  );
};

// Helper to map best-selling API data to Product format
const mapBestSellingProduct = (item: any): Product => ({
  _id: item._id,
  name: item.name,
  description: item.description,
  brand: item.brand,
  category: item.category || [],
  createAt: item.createAt || '',
  updateAt: item.updateAt || '',
  variants: [
    {
      _id: item._id + '-variant',
      images: item.images || [],
      attribute: [],
      sellPrice: item.minSellPrice || 0,
      totalQuantity: item.totalQuantity || 0,
    },
  ],
});

// Helper: Tính điểm đánh giá trung bình
const getAverageRating = (product: Product): number => {
  if (!product.reviews || product.reviews.length === 0) return 0;
  const total = product.reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
  return total / product.reviews.length;
};

export default function ProductsPage() {
  const params = useParams();
  const router = useRouter();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [brandSearch, setBrandSearch] = useState("")
  const [showMoreBrands, setShowMoreBrands] = useState(false)
  const [priceRange, setPriceRange] = useState<[string, string]>(["", ""])
  const [sortBy, setSortBy] = useState("relevance")
  const [categories, setCategories] = useState<CategoryResponse | null>(null);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string[]>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  const { addToCart } = useCart();
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const paramId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [searchTerm, setSearchTerm] = useState<string>(paramId || "");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { lang } = useLanguage();
  const config = lang === 'vi' ? viConfig.searchPage : enConfig.searchPage;
  const [wishlistItems, setWishlistItems] = useState<string[]>([]);
  const [wishlistLoading, setWishlistLoading] = useState<Record<string, boolean>>({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = typeof window !== "undefined" ? sessionStorage.getItem("token") : null;
    setIsLoggedIn(!!token);
  }, []);

  const brands = Array.from(new Set(allProducts.map(p => p.brand))).map(name => ({ name, count: allProducts.filter(p => p.brand === name).length }));
  const filteredBrands = brands.filter((brand) => brand.name.toLowerCase().includes(brandSearch.toLowerCase()))
  const displayedBrands = showMoreBrands ? filteredBrands : filteredBrands.slice(0, 7)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);  
        const response = await api.get(`/products/search/${searchTerm}`);
        if (response.data.success) {
          // Sử dụng trực tiếp dữ liệu từ backend
          console.log(response.data.data);
          setAllProducts(response.data.data);
          setProducts(response.data.data);
          setCategories(null); 
        } else {
          throw new Error('Failed to fetch best-selling products');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchTerm]);

  // Tổng hợp category duy nhất từ allProducts
  useEffect(() => {
    if (allProducts.length > 0) {
      const allCategories = allProducts.flatMap(p => p.category);
      // Chỉ lấy category có parentCategory === null
      const rootCategories = allCategories.filter(cat => (cat as any).parentCategory === null);
      // Loại trùng và đảm bảo đủ field image (luôn là string)
      const uniqueCategories = Array.from(
        new Map(rootCategories.map(cat => [cat._id, { ...cat, image: typeof (cat as any).image === 'string' ? (cat as any).image : '' }])).values()
      );
      setCategories({
        parent: { _id: '', name: 'Tất cả', description: '', image: '' },
        children: uniqueCategories,
      });
    }
  }, [allProducts]);

  // Lọc sản phẩm khi thay đổi filter
  useEffect(() => {
    let filtered = allProducts;

    // Lọc theo category
    if (selectedCategory) {
      filtered = filtered.filter(p =>
        p.category.some(cat => cat._id === selectedCategory)
      );
    }

    // Lọc theo brand
    if (selectedBrands.length > 0) {
      filtered = filtered.filter(p => selectedBrands.includes(p.brand));
    }

    // Lọc theo giá
    const min = priceRange[0] ? parseInt(priceRange[0], 10) : null;
    const max = priceRange[1] ? parseInt(priceRange[1], 10) : null;
    if (min !== null) {
      filtered = filtered.filter(p => (p.variants?.[0]?.sellPrice || 0) >= min);
    }
    if (max !== null) {
      filtered = filtered.filter(p => (p.variants?.[0]?.sellPrice || 0) <= max);
    }

    // Lọc theo rating trung bình
    if (selectedRating !== null) {
      filtered = filtered.filter(p => {
        const avg = getAverageRating(p);
        return avg >= selectedRating && avg < selectedRating + 1;
      });
    }

    // Sắp xếp
    let sorted = [...filtered];
    switch (sortBy) {
      case 'price-low':
        sorted.sort((a, b) => (a.variants?.[0]?.sellPrice || 0) - (b.variants?.[0]?.sellPrice || 0));
        break;
      case 'price-high':
        sorted.sort((a, b) => (b.variants?.[0]?.sellPrice || 0) - (a.variants?.[0]?.sellPrice || 0));
        break;
      case 'rating':
        sorted.sort((a, b) => getAverageRating(b) - getAverageRating(a));
        break;
      case 'newest':
        sorted.sort((a, b) => new Date(b.createAt).getTime() - new Date(a.createAt).getTime());
        break;
      case 'bestselling':
        sorted.sort((a, b) => (b.variants?.[0]?.totalQuantity || 0) - (a.variants?.[0]?.totalQuantity || 0));
        break;
      default:
        break;
    }

    setProducts(sorted);
    setCurrentPage(1);
  }, [allProducts, selectedBrands, priceRange, sortBy, searchTerm, categories, selectedCategory, selectedRating]);

  const handleAttributeChange = (attributeId: string, childId: string) => {
    setSelectedAttributes(prev => {
      const currentValues = prev[attributeId] || [];
      const newValues = currentValues.includes(childId)
        ? currentValues.filter(v => v !== childId)
        : [...currentValues, childId];
      
      return {
        ...prev,
        [attributeId]: newValues
      };
    });
  };

  // Xử lý chọn/bỏ chọn brand
  const handleBrandChange = (brand: string) => {
    setSelectedBrands(prev =>
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  // Add pagination calculation
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = products.slice(startIndex, endIndex);

  // Add pagination controls component
  const PaginationControls = () => {
    return (
      <div className="flex items-center justify-center space-x-2 mt-8">
        <Button
          variant="outline"
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          {config.pagination.previous}
        </Button>
        
        <div className="flex items-center space-x-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              onClick={() => setCurrentPage(page)}
              className="w-10 h-10"
            >
              {page}
            </Button>
          ))}
        </div>

        <Button
          variant="outline"
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          {config.pagination.next}
        </Button>
      </div>
    );
  };

  const handleAddToCart = (product: Product) => {
    const variant = product.variants?.[0];
    if (!variant) return;

    addToCart({
      _id: product._id,
      name: product.name,
      price: variant.sellPrice,
      image: variant.images?.[0]?.url || "/placeholder.svg",
      variantId: variant._id
    });
  };

  // Khi user nhập search mới, cập nhật searchTerm và đẩy URL
  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    // Đẩy URL mới nếu khác với params.id
    if (e.target.value !== paramId) {
      router.push(`/products/search/${encodeURIComponent(e.target.value)}`);
    }
  };

  // Fetch wishlist items chỉ khi đã đăng nhập
  useEffect(() => {
    if (!isLoggedIn) return;
    const fetchWishlist = async () => {
      try {
        const res = await api.get('/wishlist')
        if (res.data.success && res.data.products) {
          setWishlistItems(res.data.products.map((p: any) => p._id))
        }
      } catch (err) {
        console.error('Error fetching wishlist:', err)
      }
    }
    fetchWishlist()
  }, [isLoggedIn])

  const handleToggleWishlist = async (e: React.MouseEvent, productId: string) => {
    e.preventDefault()
    e.stopPropagation()
    
    setWishlistLoading(prev => ({ ...prev, [productId]: true }))
    try {
      if (wishlistItems.includes(productId)) {
        await api.post('/wishlist/remove', { productId })
        setWishlistItems(prev => prev.filter(id => id !== productId))
      } else {
        await api.post('/wishlist/add', { productId })
        setWishlistItems(prev => [...prev, productId])
      }
    } catch (err) {
      console.error('Error toggling wishlist:', err)
    } finally {
      setWishlistLoading(prev => ({ ...prev, [productId]: false }))
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header initialSearchTerm={paramId || ""} />

      {/* Breadcrumb */}
      <div className="bg-gray-50 py-3">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <button className="hover:text-blue-600">{config.breadcrumb.home}</button>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium">{config.breadcrumb.products}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar Filters */}
          {params.id !== 'best-selling' && (
            <div className="w-72 space-y-6">
              {/* Categories */}
              {categories?.children && categories.children.length > 0 && (
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h3 className="font-bold text-lg mb-4 text-gray-900">{config.sidebar.category}</h3>
                  <div className="space-y-3">
                    {/* Nút Tất cả */}
                    <div className="flex items-center justify-between">
                      <button
                        className={`text-left hover:underline text-sm text-blue-600 ${selectedCategory === null ? 'font-bold' : ''}`}
                        onClick={() => setSelectedCategory(null)}
                      >
                        {config.sidebar.all}
                      </button>
                    </div>
                    {categories.children.map((category: Category) => (
                      <div key={category._id} className="flex items-center justify-between">
                        <button
                          className={`text-left hover:underline text-sm text-blue-600 ${selectedCategory === category._id ? 'font-bold' : ''}`}
                          onClick={() => setSelectedCategory(category._id)}
                        >
                          {category.name}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Range */}
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h3 className="font-bold text-lg mb-4 text-gray-900">{config.sidebar.price}</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      min={0}
                      value={priceRange[0]}
                      onChange={e => {
                        setPriceRange([e.target.value, priceRange[1]]);
                      }}
                      className="w-24"
                      placeholder={config.sidebar.min}
                    />
                    <span className="mx-2">-</span>
                    <Input
                      type="number"
                      min={0}
                      value={priceRange[1]}
                      onChange={e => {
                        setPriceRange([priceRange[0], e.target.value]);
                      }}
                      className="w-24"
                      placeholder={config.sidebar.max}
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{priceRange[0] ? Number(priceRange[0]).toLocaleString() + ' ₫' : ''}</span>
                    <span>{priceRange[1] ? Number(priceRange[1]).toLocaleString() + ' ₫+' : ''}</span>
                  </div>
                </div>
              </div>

              {/* Attributes */}
              {categories?.attributes?.map((attribute) => (
                <div key={attribute._id} className="bg-white p-4 rounded-lg border border-gray-200">
                  <h3 className="font-bold text-lg mb-4 text-gray-900 capitalize">
                    {attribute.value.replace(/_/g, ' ')}
                  </h3>
                  <div className="space-y-3">
                    {attribute.children.map((child) => (
                      <div key={child._id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`${attribute._id}-${child._id}`}
                          checked={selectedAttributes[attribute._id]?.includes(child._id) || false}
                          onChange={() => handleAttributeChange(attribute._id, child._id)}
                        />
                        <label
                          htmlFor={`${attribute._id}-${child._id}`}
                          className="text-sm cursor-pointer text-gray-700 capitalize"
                        >
                          {child.value}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Brand Filter */}
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h3 className="font-bold text-lg mb-4 text-gray-900">{config.sidebar.brand}</h3>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder={config.sidebar.findBrandPlaceholder}
                    value={brandSearch}
                    onChange={(e) => setBrandSearch(e.target.value)}
                    className="pl-10 border-gray-300"
                  />
                </div>
                <div className="space-y-3">
                  {displayedBrands.map((brand) => (
                    <div key={brand.name} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`brand-${brand.name}`}
                          checked={selectedBrands.includes(brand.name)}
                          onChange={() => handleBrandChange(brand.name)}
                        />
                        <label htmlFor={`brand-${brand.name}`} className="text-sm cursor-pointer text-gray-700">
                          {brand.name}
                        </label>
                      </div>
                      <span className="text-gray-500 text-sm">({brand.count})</span>
                    </div>
                  ))}
                </div>

                <Button
                  variant="link"
                  className="text-blue-600 p-0 h-auto mt-3 text-sm"
                  onClick={() => setShowMoreBrands(!showMoreBrands)}
                >
                  {showMoreBrands ? (
                    <>
                      <ChevronUp className="w-4 h-4 mr-1" />
                      {config.sidebar.showLess}
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4 mr-1" />
                      {config.sidebar.showMore.replace('{count}', (filteredBrands.length - 7).toString())}
                    </>
                  )}
                </Button>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h3 className="font-bold text-lg mb-4 text-gray-900">{config.sidebar.customerRating}</h3>
                <div className="space-y-3">
                  {[4, 3, 2, 1].map((rating) => (
                    <div key={`rating-${rating}`} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={selectedRating === rating}
                          onChange={(e) => setSelectedRating(e.target.checked ? rating : null)}
                          id={`rating-${rating}`}
                        />
                        <label htmlFor={`rating-${rating}`} className="flex items-center cursor-pointer">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={`star-${rating}-${star}`}
                              className={`w-5 h-5 ${star <= rating ? "text-orange-400 fill-orange-400" : "text-gray-300"}`}
                              fill={star <= rating ? "#f59e42" : "none"}
                            />
                          ))}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Product Grid */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center gap-3">
                <p className="text-gray-700 font-medium">{config.sort.results.replace('{count}', products.length.toString())}</p>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600 font-medium">{config.sort.sortBy}</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48 border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">{config.sort.relevance}</SelectItem>
                    <SelectItem value="price-low">{config.sort.priceLow}</SelectItem>
                    <SelectItem value="price-high">{config.sort.priceHigh}</SelectItem>
                    <SelectItem value="rating">{config.sort.rating}</SelectItem>
                    <SelectItem value="newest">{config.sort.newest}</SelectItem>
                    <SelectItem value="bestselling">{config.sort.bestselling}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                // Show skeleton loading when loading
                Array.from({ length: itemsPerPage }).map((_, index) => (
                  <ProductSkeleton key={index} />
                ))
              ) : (
                // Show actual products when loaded
                currentProducts.map((product) => (
                  <Link href={`/product/${product._id}`} key={product._id}>
                    <Card
                      className="group hover:shadow-xl transition-all duration-300 border border-gray-200 bg-white cursor-pointer"
                    >
                      <CardContent className="p-4">
                        <div className="relative mb-4">
                          {isLoggedIn && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className={`absolute top-2 right-2 z-10 bg-white/80 hover:bg-white transition-all duration-200 ${wishlistItems.includes(product._id) ? 'text-red-500' : 'text-gray-600'}`}
                              onClick={(e) => handleToggleWishlist(e, product._id)}
                              disabled={wishlistLoading[product._id]}
                            >
                              {wishlistLoading[product._id] ? (
                                <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Heart className={`w-4 h-4 ${wishlistItems.includes(product._id) ? 'fill-red-500' : ''}`} />
                              )}
                            </Button>
                          )}
                          <Image
                            src={product.variants?.[0]?.images?.[0]?.url || "/placeholder.svg"}
                            alt={product.name}
                            width={300}
                            height={300}
                            className="w-full h-48 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        {/* Hiển thị brand */}
                        <div className="mb-1 text-xs text-gray-500 font-semibold uppercase tracking-wide">{product.brand}</div>
                        <h3 className="font-medium text-sm mb-3 line-clamp-3 group-hover:text-blue-600 leading-relaxed">
                          {product.name}
                        </h3>

                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {product.description}
                        </p>

                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-lg text-red-600">
                              {config.product.price.replace('{price}', (product.variants?.[0]?.sellPrice || 0).toLocaleString())}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))
              )}
            </div>

            {/* Add pagination controls */}
            <PaginationControls />
          </div>
        </div>
      </div>
    </div>
  )
}
