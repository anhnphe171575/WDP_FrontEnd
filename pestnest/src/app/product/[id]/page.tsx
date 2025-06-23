"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Heart, Star, ThumbsUp, ShoppingCart, Truck, Shield, RotateCcw } from "lucide-react"
import { useParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Header from "@/components/layout/Header"
import { api } from "../../../../utils/axios"
import { useLanguage } from '@/context/LanguageContext'
import viConfig from '../../../../utils/petPagesConfig.vi'
import enConfig from '../../../../utils/petPagesConfig.en'

interface Product {
  _id: string;
  name: string;
  description: string;
  category: {
    id: string;
    name: string;
  }[];
  createAt: string;
  updateAt: string;
  variants: {
    _id: string;
    product_id: string;
    images: {
      url: string;
    }[];
    attributes: {
      _id: string;
      value: string;
      parentId: string | null;
      categories?: string[];
    }[];
    sellPrice: number;
    importBatches: {
      _id: string;
      variantId: string;
      importDate: string;
      quantity: number;
      costPrice: number;
    }[];
    totalQuantity: number;
  }[];
  categoryInfo: {
    _id: string;
    name: string;
    description: string;
    parentCategory: string | null;
    createAt: string;
    updateAt: string;
    image: string;
  }[];
  reviews: any[];
  reviewUsers: any[];
  averageRating: number | null;
  totalReviews: number;
}

export default function ProductPage() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addToCartError, setAddToCartError] = useState<string | null>(null);
  const { lang } = useLanguage();
  const config = lang === 'vi' ? viConfig.productDetail : enConfig.productDetail;
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/products/productById/${params.id}`);
        if (response.data.success) {
          setProduct(response.data.data);
        } else {
          throw new Error('Failed to fetch product');
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(err instanceof Error ? err.message : 'An error occurred while fetching product');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProduct();
    }
  }, [params.id]);

  // Kiểm tra sản phẩm đã trong wishlist chưa
  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const res = await api.get('/wishlist');
        if (res.data.success && res.data.products) {
          setIsWishlisted(res.data.products.some((p: any) => p._id === product?._id));
        }
      } catch {}
    };
    if (product?._id) fetchWishlist();
  }, [product?._id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="animate-pulse">
            <div className="grid lg:grid-cols-2 gap-12 mb-16">
              <div className="space-y-6">
                <div className="aspect-square rounded-xl bg-muted" />
                <div className="grid grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="aspect-square rounded-lg bg-muted" />
                  ))}
                </div>
              </div>
              <div className="space-y-8">
                <div className="h-8 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-1/2" />
                <div className="h-6 bg-muted rounded w-1/4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center text-red-600">
            {error || config.productNotFound}
          </div>
        </div>
      </div>
    );
  }

  const variant = product.variants[selectedVariant] || {};
  const discount = variant?.importBatches && variant.importBatches.length > 0 && variant.importBatches[0]?.costPrice 
    ? Math.round((1 - variant.sellPrice / variant.importBatches[0].costPrice) * 100)
    : 0;

  // Lấy tất cả các attribute cha (parentId: null)
  const parentAttributes = product.variants
    .flatMap(v => v.attributes || [])
    .filter(attr => attr.parentId === null)
    .reduce((acc, attr) => {
      acc[attr._id] = attr.value;
      return acc;
    }, {} as Record<string, string>);

  // Nhóm các attribute con theo parentId
  const attributeOptions: Record<string, { value: string, variantIndex: number }[]> = {};
  product.variants.forEach((variant, idx) => {
    (variant.attributes || []).forEach(attr => {
      if (attr.parentId && parentAttributes[attr.parentId]) {
        if (!attributeOptions[attr.parentId]) attributeOptions[attr.parentId] = [];
        // Tránh trùng lặp value
        if (!attributeOptions[attr.parentId].some(opt => opt.value === attr.value)) {
          attributeOptions[attr.parentId].push({ value: attr.value, variantIndex: idx });
        }
      }
    });
  });

  const handleAddToCart = async () => {
    if (!product) {
      setAddToCartError(config.productNotFound);
      return;
    }

    if (!product.variants[selectedVariant]) {
      setAddToCartError(config.selectedVariantNotFound);
      return;
    }

    if (quantity <= 0) {
      setAddToCartError(config.quantityGreaterThanZero);
      return;
    }
    
    try {
      setAddingToCart(true);
      setAddToCartError(null);
      const response = await api.post('/cart/addtocart', {
        productId: product._id,
        productVariantId: product.variants[selectedVariant]._id,
        quantity: quantity
      });

      if (response.data.success) {
        // Show success message
        alert(config.addToCartSuccess);
      } else {
        throw new Error(response.data.message || config.addToCartFail);
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
      setAddToCartError(err instanceof Error ? err.message : config.addToCartFail);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (!product) return;
    setWishlistLoading(true);
    try {
      if (isWishlisted) {
        await api.post('/wishlist/remove', { productId: product._id });
        setIsWishlisted(false);
      } else {
        await api.post('/wishlist/add', { productId: product._id });
        setIsWishlisted(true);
      }
    } catch {}
    setWishlistLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-12">
        {/* Product Section */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Product Images */}
          <div className="space-y-6">
            <div className="aspect-square rounded-xl overflow-hidden bg-muted shadow-lg">
              <Image
                src={variant?.images?.[0]?.url || "/placeholder.svg"}
                alt={product.name || 'Product image'}
                width={600}
                height={600}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {variant?.images?.map((image, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-lg overflow-hidden bg-muted cursor-pointer hover:opacity-80 transition-all duration-300 hover:shadow-md"
                >
                  <Image
                    src={image?.url || "/placeholder.svg"}
                    alt={`${product.name} - Image ${i + 1}`}
                    width={150}
                    height={150}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-8">
            <div>
              <Badge variant="secondary" className="mb-3 text-sm px-3 py-1">
                {product.category?.[0]?.name || config.uncategorized}
              </Badge>
              <h1 className="text-4xl font-bold mb-3">{product.name}</h1>
              {Object.entries(attributeOptions).map(([parentId, options]) => (
                <div key={parentId} className="mb-4">
                  <div className="font-semibold mb-2">
                    {parentAttributes[parentId][0].toUpperCase() + parentAttributes[parentId].slice(1)}:
                    <span className="font-bold ml-2">
                      {options.find(opt => opt.variantIndex === selectedVariant)?.value}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {options.map(opt => (
                      <Button
                        key={opt.value}
                        variant={selectedVariant === opt.variantIndex ? "outline" : "ghost"}
                        className={selectedVariant === opt.variantIndex ? "border-primary text-primary" : ""}
                        onClick={() => setSelectedVariant(opt.variantIndex)}
                      >
                        {opt.value}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-4 mb-6">
                <span className="text-4xl font-bold text-primary">{variant.sellPrice}đ</span>
                {variant.totalQuantity === 0 ? (
                  <span className="text-base text-red-500 ml-4 font-semibold">{config.outOfStock}</span>
                ) : (
                  <span className="text-base text-muted-foreground ml-4">{config.left} <b>{variant.totalQuantity}</b></span>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <p className="text-muted-foreground text-lg leading-relaxed">
                {product.description}
              </p>

              {/* Quantity */}
              {variant.totalQuantity > 0 && (
                <div className="space-y-3">
                  <Label className="text-base font-medium">{config.quantity}</Label>
                  <Select value={quantity.toString()} onValueChange={(value) => setQuantity(parseInt(value))}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6">
                <Button 
                  size="lg" 
                  className="flex-1 h-12 text-lg font-medium shadow-lg hover:shadow-xl transition-shadow"
                  onClick={handleAddToCart}
                  disabled={addingToCart || variant.totalQuantity === 0}
                >
                  {addingToCart ? (
                    <div className="flex items-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      {config.adding}
                    </div>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      {config.addToCart}
                    </>
                  )}
                </Button>
                {addToCartError && (
                  <div className="text-sm text-red-500 mt-2">
                    {addToCartError}
                  </div>
                )}
                <Button size="lg" variant={isWishlisted ? "default" : "outline"} className="h-12 w-12 shadow-md hover:shadow-lg transition-shadow flex items-center justify-center" onClick={handleToggleWishlist} disabled={wishlistLoading} aria-label="Yêu thích">
                  <Heart className={"w-5 h-5 " + (isWishlisted ? "fill-red-500 text-red-500" : "")}/>
                </Button>
              </div>

              {/* Features */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t">
                <div className="flex items-center gap-3 text-sm bg-muted/50 p-4 rounded-lg">
                  <Truck className="w-5 h-5 text-primary" />
                  <span className="font-medium">{config.freeShipping}</span>
                </div>
                <div className="flex items-center gap-3 text-sm bg-muted/50 p-4 rounded-lg">
                  <Shield className="w-5 h-5 text-primary" />
                  <span className="font-medium">{config.warranty}</span>
                </div>
                <div className="flex items-center gap-3 text-sm bg-muted/50 p-4 rounded-lg">
                  <RotateCcw className="w-5 h-5 text-primary" />
                  <span className="font-medium">{config.returns}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        {product.reviews.length > 0 && (
          <div className="space-y-10">
            <h2 className="text-3xl font-bold">{config.customerReviews}</h2>

            <div className="grid lg:grid-cols-3 gap-10">
              {/* Rating Overview */}
              <div className="lg:col-span-1">
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-xl">{config.ratingOverview}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="text-center">
                      <div className="text-5xl font-bold mb-3">{product.averageRating}</div>
                      <div className="flex justify-center mb-3">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-6 h-6 ${
                              product.averageRating && star <= Math.floor(product.averageRating)
                                ? "fill-yellow-400 text-yellow-400"
                                : product.averageRating && star === Math.ceil(product.averageRating)
                                  ? "fill-yellow-400/50 text-yellow-400"
                                  : "fill-muted text-muted-foreground"
                            }`}
                          />
                        ))}
                      </div>
                      <div className="text-sm text-muted-foreground">{config.basedOnReviews.replace('{n}', String(product.totalReviews))}</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Reviews List */}
              <div className="lg:col-span-2 space-y-6">
                {product.reviews.map((review, index) => (
                  <Card key={index} className="shadow-md hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={"/placeholder.svg"} alt={review.user?.name || config.userFallback} />
                          <AvatarFallback>
                            {review.user?.name
                              ?.split(" ")
                              .map((n: string) => n[0])
                              .join("") || config.avatarFallback}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-lg">{review.user?.name}</span>
                                <Badge variant="secondary" className="text-xs">
                                  {config.verifiedPurchase}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-3 mt-2">
                                <div className="flex">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={`w-4 h-4 ${
                                        star <= review.rating
                                          ? "fill-yellow-400 text-yellow-400"
                                          : "fill-muted text-muted-foreground"
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-sm text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                          <div>
                            {review.title && <h4 className="font-medium text-lg mb-2">{review.title}</h4>}
                            <p className="text-muted-foreground leading-relaxed">{review.comment}</p>
                          </div>
                          {review.images && review.images.length > 0 && (
                            <div className="flex gap-3">
                              {review.images.map((img: any, idx: any) => (
                                <div key={idx} className="w-20 h-20 rounded-lg overflow-hidden bg-muted shadow-sm hover:shadow-md transition-shadow">
                                  <Image
                                    src={img.url || "/placeholder.svg"}
                                    alt={`${config.reviewImageAlt} ${idx + 1}`}
                                    width={80}
                                    height={80}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                         
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
