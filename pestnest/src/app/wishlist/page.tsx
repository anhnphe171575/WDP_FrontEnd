"use client"

import { useEffect, useState } from "react";
import { api } from "../../../utils/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Heart, Trash2 } from "lucide-react";
import Link from "next/link";
import { useLanguage } from '@/context/LanguageContext';
import viConfig from '../../../utils/petPagesConfig.vi';
import enConfig from '../../../utils/petPagesConfig.en';

interface Product {
  _id: string;
  name: string;
  description: string;
  variants: any[];
  image?: string;
  brand?: string;
}

export default function WishlistPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingItems, setRemovingItems] = useState<Record<string, boolean>>({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { lang } = useLanguage();
  const config = lang === 'vi' ? viConfig : enConfig;

  useEffect(() => {
    const token = typeof window !== "undefined" ? sessionStorage.getItem("token") : null;
    setIsLoggedIn(!!token);
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;
    const fetchWishlist = async () => {
      try {
        setLoading(true);
        const res = await api.get("/wishlist");
        if (res.data.success) {
          setProducts(res.data.products);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, [isLoggedIn]);

  const handleRemoveFromWishlist = async (productId: string) => {
    setRemovingItems(prev => ({ ...prev, [productId]: true }));
    try {
      await api.post('/wishlist/remove', { productId });
      setProducts(prev => prev.filter(product => product._id !== productId));
    } catch (err) {
      console.error('Error removing from wishlist:', err);
    } finally {
      setRemovingItems(prev => ({ ...prev, [productId]: false }));
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Heart className="h-8 w-8 text-red-500" />
          <h1 className="text-3xl font-bold text-gray-900">
            {lang === 'vi' ? 'Sản phẩm yêu thích' : 'Wishlist'}
          </h1>
          <span className="bg-red-100 text-red-800 text-sm font-medium px-3 py-1 rounded-full">
            {products.length} {lang === 'vi' ? 'sản phẩm' : 'items'}
          </span>
        </div>

        {!isLoggedIn ? (
          <div className="text-center py-16">
            <Heart className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              {lang === 'vi' ? 'Vui lòng đăng nhập để xem danh sách yêu thích' : 'Please log in to view your wishlist'}
            </h2>
            <Link href="/login">
              <Button className="bg-red-600 hover:bg-red-700">
                {lang === 'vi' ? 'Đăng nhập' : 'Log in'}
              </Button>
            </Link>
          </div>
        ) : (
          loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <Heart className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                {lang === 'vi' ? 'Chưa có sản phẩm yêu thích' : 'No wishlist items yet'}
              </h2>
              <p className="text-gray-600 mb-6">
                {lang === 'vi' 
                  ? 'Bạn chưa có sản phẩm yêu thích nào. Hãy khám phá và thêm sản phẩm vào danh sách yêu thích!'
                  : 'You haven\'t added any products to your wishlist yet. Explore and add products to your favorites!'
                }
              </p>
              <Link href="/products/best-selling">
                <Button className="bg-red-600 hover:bg-red-700">
                  {lang === 'vi' ? 'Khám phá sản phẩm' : 'Explore Products'}
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Card key={product._id} className="group hover:shadow-xl transition-all duration-300 border border-gray-200 bg-white">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2 group-hover:text-red-600 transition-colors">
                        {product.name}
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-red-500 hover:bg-red-50"
                        onClick={() => handleRemoveFromWishlist(product._id)}
                        disabled={removingItems[product._id]}
                      >
                        {removingItems[product._id] ? (
                          <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    {product.image && (
                      <div className="relative mb-4">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-48 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2 left-2">
                          <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                        </div>
                      </div>
                    )}
                    
                    {product.brand && (
                      <div className="mb-2 text-xs text-gray-500 font-semibold uppercase tracking-wide">
                        {product.brand}
                      </div>
                    )}
                    
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {product.description}
                    </p>
                    
                    {product.variants?.[0]?.sellPrice && (
                      <div className="text-xl font-bold text-red-600 mb-4">
                        {formatPrice(product.variants[0].sellPrice)}
                      </div>
                    )}
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      asChild
                    >
                      <Link href={`/product/${product._id}`}>
                        {lang === 'vi' ? 'Xem chi tiết' : 'View Details'}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
} 