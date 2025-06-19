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
import { api } from "../../../../utils/axios"
import { useParams, useRouter } from "next/navigation"
import Header from '@/components/layout/Header';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
    



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

export default function ProductsPage() {
  const params = useParams();
  const router = useRouter();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
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

  // Tạo danh sách brand động từ allProducts
  const brands = Array.from(new Set(allProducts.map(p => p.brand))).map(name => ({ name, count: allProducts.filter(p => p.brand === name).length }));

  const filteredBrands = brands.filter((brand) => brand.name.toLowerCase().includes(brandSearch.toLowerCase()))
  const displayedBrands = showMoreBrands ? filteredBrands : filteredBrands.slice(0, 7)

  const fetchFilteredProducts = async (filterParams: FilterParams) => {
    try {
      setLoading(true);
      
      
      // If we don't have all products yet, fetch them first
      if (allProducts.length === 0) {
        const response = await api.get(`/products/productDetailsByCategory/${params.id}`);
        if (response.data.success) {
          setAllProducts(response.data.data);
          console.log('Initial products loaded:', response.data.data.length);
        } else {
          throw new Error('Failed to fetch products');
        }
      }

      // Apply filters
      let filteredProducts = [...allProducts];

      // Filter by price range
      if (filterParams.priceRange && (filterParams.priceRange[0] || filterParams.priceRange[1])) {
        filteredProducts = filteredProducts.filter(product => {
          if (!product.variants || product.variants.length === 0) return false;
          const hasMatchingPrice = product.variants.some(variant => {
            const price = variant.sellPrice || 0;
            const min = filterParams.priceRange![0] ? Number(filterParams.priceRange![0]) : undefined;
            const max = filterParams.priceRange![1] ? Number(filterParams.priceRange![1]) : undefined;
            if (min !== undefined && max !== undefined) {
              return price >= min && price <= max;
            } else if (min !== undefined) {
              return price >= min;
            } else if (max !== undefined) {
              return price <= max;
            }
            return true;
          });
          return hasMatchingPrice;
        });
      }
          console.log(filterParams.attributes);
          console.log(filteredProducts);
      // Filter by attributes
      if (filterParams.attributes && Object.keys(filterParams.attributes).length > 0) {
    
        filteredProducts = filteredProducts.filter(product => {
          console.log(product.variants);
          console.log(categories?.attributes);
          if (!product.variants || product.variants.length === 0) return false;
          const matchesAttributes = Object.entries(filterParams.attributes!).every(([attributeId, childIds]) => {
            if (childIds.length === 0) return true;
            const hasMatchingAttribute = product.variants.some(variant => 
              variant.attribute.some(attr => {
                console.log(attr);
                const matchingChild = categories?.attributes
                  ?.find(a => a._id === attributeId)
                  ?.children.find(c => c._id === attr.toString());
                
                const matches = matchingChild && childIds.includes(attr.toString());
                return matches;
              })
            );
            return hasMatchingAttribute;
          });
          return matchesAttributes;
        });
      }

      // Filter by rating (if implemented in your backend)
      if (filterParams.rating) {
        // This would need to be implemented based on your rating system
        // For now, we'll skip this filter
      }

      // Sort products
      if (filterParams.sortBy) {
        console.log('Sorting by:', filterParams.sortBy);
        switch (filterParams.sortBy) {
          case 'price-low':
            filteredProducts.sort((a, b) => {
              const aMinPrice = Math.min(...a.variants.map(v => v.sellPrice || 0));
              const bMinPrice = Math.min(...b.variants.map(v => v.sellPrice || 0));
              return aMinPrice - bMinPrice;
            });
            break;
          case 'price-high':
            filteredProducts.sort((a, b) => {
              const aMaxPrice = Math.max(...a.variants.map(v => v.sellPrice || 0));
              const bMaxPrice = Math.max(...b.variants.map(v => v.sellPrice || 0));
              return bMaxPrice - aMaxPrice;
            });
            break;
          case 'newest':
            filteredProducts.sort((a, b) => {
              const aDate = new Date(a.createAt).getTime();
              const bDate = new Date(b.createAt).getTime();
              return bDate - aDate;
            });
            break;
        }
      }



      setProducts(filteredProducts);
    } catch (err) {
      console.error('Error filtering products:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while filtering products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [categoriesResponse, attributesResponse] = await Promise.all([
          api.get(`/categories/childCategories/${params.id}`),
          api.get(`/categories/attributes/${params.id}`)
        ]);

        if (categoriesResponse.data.success) {
          setCategories(prev => ({
            ...prev,
            ...categoriesResponse.data,
            attributes: attributesResponse.data.attributes
          }));
        }

        // Initial fetch of all products
        const productsResponse = await api.get(`/products/productDetailsByCategory/${params.id}`);
        if (productsResponse.data.success) {
          setAllProducts(productsResponse.data.data);
          setProducts(productsResponse.data.data);
        }

      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'An error occurred while fetching data');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchData();
    }
  }, [params.id]);

  // Add effect to refetch products when filters change
  useEffect(() => {
    if (params.id) {
      // Convert priceRange from [string, string] to [number, number]
      const parsedPriceRange: [number, number] = [
        priceRange[0] ? Number(priceRange[0]) : 0,
        priceRange[1] ? Number(priceRange[1]) : 0
      ];
      fetchFilteredProducts({
        categoryId: params.id as string,
        priceRange: (priceRange[0] || priceRange[1]) ? parsedPriceRange : undefined,
        attributes: selectedAttributes,
        rating: selectedRating || undefined,
        sortBy
      });
    }
  }, [priceRange, selectedAttributes, selectedRating, sortBy]);

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

  const handleCategoryClick = async (categoryId: string) => {
    try {
      setLoading(true);
      setCurrentPage(1);
      setSelectedAttributes({});
      setSelectedRating(null);
      setBrandSearch("");
      setPriceRange(["", ""]);
      setSortBy("relevance");

      // Update URL with new category ID
      router.push(`/category/${categoryId}`);

      // Fetch new products from backend for the selected category
      const response = await api.get(`/products/productDetailsByCategory/${categoryId}`);
      if (response.data.success) {
        setAllProducts(response.data.data);
        setProducts(response.data.data);
      } else {
        throw new Error('Failed to fetch products');
      }

      // Fetch new categories and attributes for the selected category
      const [categoriesResponse, attributesResponse] = await Promise.all([
        api.get(`/categories/childCategories/${categoryId}`),
        api.get(`/categories/attributes/${categoryId}`)
      ]);

      if (categoriesResponse.data.success) {
        setCategories(prev => ({
          ...prev,
          ...categoriesResponse.data,
          attributes: attributesResponse.data.attributes
        }));
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while fetching products');
    } finally {
      setLoading(false);
    }
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
          Previous
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
          Next
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

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
            <Header />

      {/* Breadcrumb */}
      <div className="bg-gray-50 py-3">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <button className="hover:text-blue-600">Home</button>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium">Products</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <div className="w-72 space-y-6">
            {/* Categories */}
            {categories?.children && categories.children.length > 0 && (
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h3 className="font-bold text-lg mb-4 text-gray-900">Category</h3>
                <div className="space-y-3">
                  {categories.children.map((category: Category) => (
                    <div key={category._id} className="flex items-center justify-between">
                      <button className="text-left hover:underline text-sm text-blue-600" onClick={() => handleCategoryClick(category._id)}>{category.name}</button>
                    </div>  
                  ))}
                </div>
              </div>
            )}

            {/* Price Range */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h3 className="font-bold text-lg mb-4 text-gray-900">Price</h3>
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
                    placeholder="Min"
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
                    placeholder="Max"
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
              <h3 className="font-bold text-lg mb-4 text-gray-900">Brand</h3>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Find a brand"
                  value={brandSearch}
                  onChange={(e) => setBrandSearch(e.target.value)}
                  className="pl-10 border-gray-300"
                />
              </div>
              <div className="space-y-3">
                {displayedBrands.map((brand) => (
                  <div key={brand.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox id={`brand-${brand.name}`} />
                      <label htmlFor={`brand-${brand.name}`} className="text-sm cursor-pointer text-gray-700">
                        {brand.name}
                      </label>
                    </div>
                    <span className="text-gray-500 text-sm">({brand.count})</span>
                  </div>
                ))}
              </div>

               {/* Customer Rating Filter */}
            

              <Button
                variant="link"
                className="text-blue-600 p-0 h-auto mt-3 text-sm"
                onClick={() => setShowMoreBrands(!showMoreBrands)}
              >
                {showMoreBrands ? (
                  <>
                    <ChevronUp className="w-4 h-4 mr-1" />
                    Show less
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 mr-1" />+ {filteredBrands.length - 7} more
                  </>
                )}
              </Button>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h3 className="font-bold text-lg mb-4 text-gray-900">Customer Rating</h3>
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

          {/* Product Grid */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-lg border border-gray-200">
              <p className="text-gray-700 font-medium">{products.length} Results</p>
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600 font-medium">Sort By</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48 border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Customer Rating</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="bestselling">Best Selling</SelectItem>
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
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute top-2 right-2 z-10 bg-white/80 hover:bg-white"
                            onClick={(e) => {
                              e.preventDefault();
                              // Add to wishlist logic here
                            }}
                          >
                            <Heart className="w-4 h-4" />
                          </Button>
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
                            <span className="font-bold text-lg text-red-600">{(product.variants?.[0]?.sellPrice || 0).toLocaleString()} ₫</span>
                          </div>
                          {product.variants?.[0]?.totalQuantity === 0 && (
                            <div className="text-xs text-white bg-red-500 rounded px-2 py-1 inline-block mt-2">Sản phẩm hết hàng</div>
                          )}
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
