"use client"

import { useEffect, useState } from "react";
import { api } from "../../../utils/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Product {
  _id: string;
  name: string;
  description: string;
  variants: any[];
  image?: string;
  // Thêm các trường khác nếu cần
}

export default function WishlistPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Sản phẩm yêu thích</h1>
        {loading ? (
          <div>Đang tải...</div>
        ) : products.length === 0 ? (
          <div>Bạn chưa có sản phẩm yêu thích nào.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product._id}>
                <CardHeader>
                  <CardTitle>{product.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  {product.image && (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-40 object-cover mb-2 rounded"
                    />
                  )}
                  <p>{product.description}</p>
                  <Link href={`/product/${product._id}`}>
                    <Button className="mt-2">Xem chi tiết</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 