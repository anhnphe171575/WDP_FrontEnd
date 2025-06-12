"use client"

import { useState } from "react"
import Image from "next/image"
import { Search, Star, Heart, Truck, ChevronDown, ChevronUp, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

const categories = [
  { name: "Dry Food", count: 4858, color: "text-blue-600" },
  { name: "Wet Food", count: 2525, color: "text-gray-700" },
  { name: "Shop by Natural Ingredients", count: 1508, color: "text-blue-600" },
  { name: "Fresh Food & Toppers", count: 1401, color: "text-gray-700" },
  { name: "Shop by Health Condition", count: 1262, color: "text-purple-600" },
  { name: "Veterinary Diets", count: 413, color: "text-gray-700" },
]

const brands = [
  { name: "By Chewy", count: 181 },
  { name: "360 Pet Nutrition", count: 4 },
  { name: "A Better Treat", count: 6 },
  { name: "ACANA", count: 93 },
  { name: "Addiction", count: 26 },
  { name: "Against the Grain", count: 4 },
  { name: "Almo Nature", count: 20 },
  { name: "American Journey", count: 156 },
  { name: "Blue Buffalo", count: 312 },
  { name: "Hill's Science Diet", count: 89 },
]

const products = [
  {
    id: 1,
    title: "The Honest Kitchen Gourmet Grains Chicken & Duck Recipe Dehydrated Dog Food, 10-lb box",
    brand: "The Honest Kitchen",
    rating: 4.4,
    reviews: 77,
    originalPrice: 99.99,
    salePrice: 97.99,
    autoshipPrice: 93.09,
    image: "/placeholder.svg?height=300&width=300",
    deal: true,
    sponsored: true,
  },
  {
    id: 2,
    title: "Merrick Grain-Free Dry Dog Food Healthy Weight Recipe, 22-lb bag",
    brand: "Merrick",
    rating: 4.5,
    reviews: 714,
    originalPrice: 72.98,
    salePrice: 69.33,
    autoshipPrice: 65.86,
    image: "/placeholder.svg?height=300&width=300",
    deal: true,
    sponsored: true,
  },
  {
    id: 3,
    title: "Blue Buffalo Life Protection Formula Healthy Weight Adult Chicken & Brown Rice Recipe Dry Dog Food",
    brand: "Blue Buffalo",
    rating: 4.6,
    reviews: 4273,
    originalPrice: 41.99,
    salePrice: 37.64,
    autoshipPrice: 35.76,
    image: "/placeholder.svg?height=300&width=300",
    deal: true,
    sponsored: true,
  },
  {
    id: 4,
    title: "Royal Canin Size Health Nutrition Small Adult Dry Dog Food, 14-lb bag",
    brand: "Royal Canin",
    rating: 4.7,
    reviews: 2932,
    originalPrice: 59.99,
    salePrice: 56.99,
    autoshipPrice: 54.14,
    image: "/placeholder.svg?height=300&width=300",
    deal: true,
    sponsored: true,
  },
  {
    id: 5,
    title: "Hill's Science Diet Adult Perfect Weight Chicken Recipe Dry Dog Food",
    brand: "Hill's Science Diet",
    rating: 4.3,
    reviews: 1205,
    originalPrice: 54.99,
    salePrice: 49.99,
    autoshipPrice: 47.49,
    image: "/placeholder.svg?height=300&width=300",
    deal: true,
    sponsored: false,
  },
  {
    id: 6,
    title: "Purina Pro Plan Focus Adult Weight Management Formula Dry Dog Food",
    brand: "Purina Pro Plan",
    rating: 4.5,
    reviews: 892,
    originalPrice: 67.98,
    salePrice: 61.99,
    autoshipPrice: 58.89,
    image: "/placeholder.svg?height=300&width=300",
    deal: true,
    sponsored: false,
  },
]

export default function ChewyFoodPage() {
  const [brandSearch, setBrandSearch] = useState("")
  const [showMoreBrands, setShowMoreBrands] = useState(false)
  const [priceRange, setPriceRange] = useState([0, 200])
  const [sortBy, setSortBy] = useState("relevance")

  const filteredBrands = brands.filter((brand) => brand.name.toLowerCase().includes(brandSearch.toLowerCase()))
  const displayedBrands = showMoreBrands ? filteredBrands : filteredBrands.slice(0, 7)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-gray-50 py-3">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <button className="hover:text-blue-600">Home</button>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium">Food</span>
          </div>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between">
            <div className="flex-1 pr-8">
              <h1 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight">Supports long, healthy lives</h1>
              <p className="text-xl mb-6 text-blue-100">
                Precise nutrition for lifelong health from{" "}
                <span className="font-semibold text-white">Hill's Science Diet.</span>
              </p>
              <Button
                size="lg"
                className="bg-white text-blue-900 hover:bg-gray-100 font-semibold px-8 py-3 rounded-full text-lg"
              >
                Shop now
              </Button>
            </div>

            <div className="hidden lg:block flex-shrink-0">
              <div className="relative">
                <Image
                  src="/placeholder.svg?height=300&width=500"
                  alt="Dogs with Hill's Science Diet products"
                  width={500}
                  height={300}
                  className="rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <div className="w-72 space-y-6">
            {/* Autoship */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center space-x-3 mb-2">
                <Checkbox id="autoship" />
                <div className="flex items-center space-x-2">
                  <Truck className="w-5 h-5 text-orange-500" />
                  <label htmlFor="autoship" className="font-semibold text-gray-900">
                    Autoship
                  </label>
                </div>
              </div>
              <p className="text-sm text-gray-600 ml-8">Save 5% on repeat deliveries</p>
            </div>

            {/* Categories */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h3 className="font-bold text-lg mb-4 text-gray-900">Category</h3>
              <div className="space-y-3">
                {categories.map((category, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <button className={`text-left hover:underline text-sm ${category.color}`}>{category.name}</button>
                    <span className="text-gray-500 text-sm">({category.count})</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h3 className="font-bold text-lg mb-4 text-gray-900">Price</h3>
              <div className="space-y-4">
                <Slider value={priceRange} onValueChange={setPriceRange} max={200} step={5} className="w-full" />
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>${priceRange[0]}</span>
                  <span>${priceRange[1]}+</span>
                </div>
              </div>
            </div>

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
                {displayedBrands.map((brand, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox id={`brand-${index}`} />
                      <label htmlFor={`brand-${index}`} className="text-sm cursor-pointer text-gray-700">
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
                    Show less
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 mr-1" />+ {filteredBrands.length - 7} more
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-lg border border-gray-200">
              <p className="text-gray-700 font-medium">1 - 36 of 4858 Results</p>
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
              {products.map((product) => (
                <Card
                  key={product.id}
                  className="group hover:shadow-xl transition-all duration-300 border border-gray-200 bg-white"
                >
                  <CardContent className="p-4">
                    <div className="relative mb-4">
                      {product.deal && (
                        <Badge className="absolute top-2 left-2 bg-red-600 hover:bg-red-700 z-10 text-white font-semibold">
                          Deal
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 z-10 bg-white/80 hover:bg-white"
                      >
                        <Heart className="w-4 h-4" />
                      </Button>
                      <Image
                        src={product.image || "/placeholder.svg"}
                        alt={product.title}
                        width={300}
                        height={300}
                        className="w-full h-48 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {product.sponsored && (
                      <Badge variant="outline" className="mb-2 text-xs border-gray-300 text-gray-600">
                        Sponsored
                      </Badge>
                    )}

                    <h3 className="font-medium text-sm mb-3 line-clamp-3 group-hover:text-blue-600 leading-relaxed">
                      {product.title}
                    </h3>

                    <div className="flex items-center mb-3">
                      <div className="flex items-center">
                        <span className="font-semibold text-sm mr-2">{product.rating}</span>
                        <div className="flex mr-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">({product.reviews})</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-lg text-red-600">${product.salePrice}</span>
                        {product.originalPrice > product.salePrice && (
                          <span className="text-sm text-gray-500 line-through">${product.originalPrice}</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Truck className="w-4 h-4 text-orange-500" />
                        <span className="text-blue-600 font-semibold">${product.autoshipPrice}</span>
                        <span className="text-gray-600">Autoship</span>
                      </div>
                    </div>

                    <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                      Add to Cart
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Load More */}
            <div className="text-center mt-8">
              <Button variant="outline" size="lg" className="px-8 py-3 border-gray-300 text-gray-700 hover:bg-gray-50">
                Load More Products
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
