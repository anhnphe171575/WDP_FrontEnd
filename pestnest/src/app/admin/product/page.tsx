'use client';
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState, useRef } from "react";
import { useApi } from "../../../../utils/axios";
import { api } from "../../../../utils/axios";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Edit, Eye, Trash2, Package, Warehouse } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"


interface Product {
  _id: string;
  name: string;
  description: string;
  brand?: string;
  category: Array<{
    categoryId: string;
    name: string;
    description: string;
  }>;
}



interface CategorySet {
  level2: Array<{
    _id: string;
    name: string;
    description: string;
  }>;
  level3: Array<{
    _id: string;
    name: string;
    description: string;
  }>;
}

interface EditProductModalProps {
  product: Product;
  onSave: (product: Product) => void;
  onClose: () => void;
  isOpen: boolean;
}

function EditProductModal({ product, onSave, onClose, isOpen }: EditProductModalProps) {
  const [level1Categories, setLevel1Categories] = useState<Array<{ _id: string; name: string; description: string }>>([]);
  const [formData, setFormData] = useState({
    name: product.name,
    description: product.description,
    brand: product.brand || ''
  });
  const [selectedParentCategory, setSelectedParentCategory] = useState<string | null>(null);
  const [selectedChildCategory, setSelectedChildCategory] = useState<string | null>(null);
  const [selectedGrandChildCategory, setSelectedGrandChildCategory] = useState<string | null>(null);
  const [categorySets, setCategorySets] = useState<Record<string, CategorySet>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submitRef = useRef(false);
  const { request } = useApi();

  // Reset states when modal closes
  useEffect(() => {
    if (!isOpen) {
      submitRef.current = false;
      setError(null);
    }
  }, [isOpen]);

  // Fetch level 1 categories and product data when modal opens
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Starting to fetch data...');
        
        // Fetch level 1 categories
        const categoriesResponse = await request(() => api.get('/categories/parent'));
        console.log('Level 1 categories response:', categoriesResponse);
        
        if (categoriesResponse && categoriesResponse.success) {
          setLevel1Categories(categoriesResponse.data);
        } else {
          console.error('Failed to fetch categories:', categoriesResponse?.message || 'Unknown error');
          return;
        }

        // Fetch product details
        const productResponse = await request(() => api.get(`/products/productById/${product._id}`));
        console.log('Product details:', productResponse);

        if (productResponse.success) {
          const productData = productResponse.data;
          
          // Set form data
          setFormData({
            name: productData.name,
            description: productData.description,
            brand: productData.brand || ''
          });

          // Process categories
          if (productData.category && productData.category.length > 0) {
            // Get category IDs in order
            const categoryIds = productData.category.map((cat: { id?: string; _id: string }) => cat.id || cat._id);
            console.log('Category IDs:', categoryIds);

            if (categoryIds.length > 0) {
              // Set parent category
              setSelectedParentCategory(categoryIds[0]);
              
              // Fetch child categories for parent
              const childResponse = await request(() => api.get(`/categories/child-categories/${categoryIds[0]}`));
              if (childResponse.success) {
                setCategorySets({
                  [categoryIds[0]]: {
                    level2: childResponse.data || [],
                    level3: []
                  }
                });

                if (categoryIds.length > 1) {
                  // Set child category
                  setSelectedChildCategory(categoryIds[1]);
                  
                  // Fetch grandchild categories
                  const grandChildResponse = await request(() => api.get(`/categories/child-categories/${categoryIds[1]}`));
                  if (grandChildResponse.success) {
                    setCategorySets(prev => ({
                      [categoryIds[0]]: {
                        ...prev[categoryIds[0]],
                        level3: grandChildResponse.data || []
                      }
                    }));

                    if (categoryIds.length > 2) {
                      // Set grandchild category
                      setSelectedGrandChildCategory(categoryIds[2]);
                    }
                  }
                }
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    if (isOpen) {
      fetchData();
    }
  }, [isOpen, product._id]);

  const handleParentCategoryChange = async (categoryId: string) => {
    setSelectedParentCategory(categoryId);
    setSelectedChildCategory(null);
    setSelectedGrandChildCategory(null);
    
    try {
      // Fetch child categories for the selected parent
      const response = await request(() => api.get(`/categories/child-categories/${categoryId}`));
      console.log('Child categories response:', response);
      
      if (response && response.success) {
        setCategorySets({
          [categoryId]: {
            level2: response.data || [],
            level3: []
          }
        });
      }
    } catch (error) {
      console.error('Error fetching child categories:', error);
    }
  };

  const handleChildCategoryChange = async (categoryId: string) => {
    setSelectedChildCategory(categoryId);
    setSelectedGrandChildCategory(null);
    
    try {
      // Fetch grandchild categories
      const response = await request(() => api.get(`/categories/child-categories/${categoryId}`));
      console.log('Grandchild categories response:', response);
      
      if (response && response.success) {
        setCategorySets(prev => ({
          ...prev,
          [selectedParentCategory!]: {
            ...prev[selectedParentCategory!],
            level3: response.data || []
          }
        }));
      }
    } catch (error) {
      console.error('Error fetching grandchild categories:', error);
    }
  };

  const handleGrandChildCategoryChange = (categoryId: string) => {
    setSelectedGrandChildCategory(categoryId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Prevent multiple submissions
    if (submitRef.current) {
      return;
    }
    submitRef.current = true;
    setError(null);

    try {
      setIsSubmitting(true);

      // Validate required fields
      if (!formData.name || !formData.description) {
        throw new Error('Name and description are required');
      }

      if (!selectedParentCategory) {
        throw new Error('Please select a parent category');
      }

      // Create array of category IDs
      const categoryIds = [selectedParentCategory];
      if (selectedChildCategory) {
        categoryIds.push(selectedChildCategory);
      }
      if (selectedGrandChildCategory) {
        categoryIds.push(selectedGrandChildCategory);
      }

      const submitData = {
        name: formData.name,
        description: formData.description,
        brand: formData.brand,
        categories: categoryIds.map(categoryId => ({
          categoryId: categoryId
        }))
      };

      console.log('Sending data to update product:', submitData);
      
      const response = await request(() => api.put(`/products/${product._id}`, submitData));

      console.log('Response from server:', response);

      if (response.success) {
        onSave(response.data);
        onClose();
      } else {
        throw new Error(response.message || 'Failed to update product');
      }
    } catch (error: any) {
      console.error('Error updating product:', error);
      setError(error.message || 'Failed to update product');
    } finally {
      setIsSubmitting(false);
      submitRef.current = false;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto p-8">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold mb-2">Edit Product</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-md font-semibold text-center">
              {error}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-lg border">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="font-semibold">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="brand" className="font-semibold">Brand</Label>
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="description" className="font-semibold">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="mt-1 min-h-[100px]"
              />
            </div>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg border">
            <Label className="font-semibold mb-2 block">Categories <span className="text-red-500">*</span></Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label className="font-semibold">Parent Category</Label>
                <div className="space-y-2 mt-2">
                  {level1Categories.map((category) => (
                    <div key={`parent-${category._id}`} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id={`parent-${category._id}`}
                        name="parentCategory"
                        checked={selectedParentCategory === category._id}
                        onChange={() => handleParentCategoryChange(category._id)}
                        required
                      />
                      <Label htmlFor={`parent-${category._id}`}>{category.name}</Label>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <Label className="font-semibold">Child Category</Label>
                <div className="space-y-2 mt-2">
                  {selectedParentCategory && categorySets[selectedParentCategory]?.level2.map((category) => (
                    <div key={`child-${category._id}`} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id={`child-${category._id}`}
                        name="childCategory"
                        checked={selectedChildCategory === category._id}
                        onChange={() => handleChildCategoryChange(category._id)}
                      />
                      <Label htmlFor={`child-${category._id}`}>{category.name}</Label>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <Label className="font-semibold">Grandchild Category</Label>
                <div className="space-y-2 mt-2">
                  {selectedChildCategory && categorySets[selectedParentCategory!]?.level3.map((category) => (
                    <div key={`grandchild-${category._id}`} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id={`grandchild-${category._id}`}
                        name="grandchildCategory"
                        checked={selectedGrandChildCategory === category._id}
                        onChange={() => handleGrandChildCategoryChange(category._id)}
                      />
                      <Label htmlFor={`grandchild-${category._id}`}>{category.name}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-4 mt-6">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting} className="px-6 py-2">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="px-6 py-2 font-semibold">
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface ProductVariant {
  _id: string;
  product_id: string;
  images: Array<{ url: string }>;
  attribute: Array<{
    _id: string;
    value: string;
    description: string;
    parentId?: {
      _id: string;
      value: string;
    };
  }>;
  sellPrice: number;
  totalQuantity?: number;
}

interface Attribute {
  _id: string;
  value: string;
  description: string;
  parentId?: {
    _id: string;
    value: string;
  };
}

interface VariantManagementModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

function VariantManagementModal({ product, isOpen, onClose }: VariantManagementModalProps) {
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [variantToDelete, setVariantToDelete] = useState<string | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedVariantForImport, setSelectedVariantForImport] = useState<ProductVariant | null>(null);
  const [attributes, setAttributes] = useState<{
    parentAttributes: Attribute[];
    childAttributes: Attribute[];
  }>({ parentAttributes: [], childAttributes: [] });
  const [selectedParentAttribute, setSelectedParentAttribute] = useState<string | null>(null);
  const [selectedChildAttribute, setSelectedChildAttribute] = useState<string | null>(null);
  const [isAddVariantFormOpen, setIsAddVariantFormOpen] = useState(false);
  const [newVariant, setNewVariant] = useState({
    images: [{ file: null as File | null, url: '' }],
    attributes: [] as string[],
    sellPrice: 0
  });
  const [isAddingVariant, setIsAddingVariant] = useState(false); // Thêm state loading
  const { request } = useApi();

  useEffect(() => {
    const fetchVariants = async () => {
      try {
        const response = await request(() => api.get(`/products/product-variant/${product._id}`));
        if (response.success) {
          setVariants(response.data);
        } else {
          setError(response.message || 'Failed to fetch variants');
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchAttributes = async () => {
      try {
        const response = await request(() => api.get(`/products/child-attributes/${product._id}`));
        if (response.success) {
          setAttributes({
            parentAttributes: response.data.parentAttributes,
            childAttributes: response.data.childAttributes
          });
        }
      } catch (err: any) {
        console.error('Error fetching attributes:', err);
      }
    };

    if (isOpen) {
      fetchVariants();
      fetchAttributes();
    }
  }, [isOpen, product._id]);

  useEffect(() => {
    const fetchChildAttributes = async () => {
      if (selectedParentAttribute) {
        try {
          const response = await request(() => 
            api.get(`/products/child-attributes/parent/${selectedParentAttribute}`)
          );
          if (response.success) {
            setAttributes(prev => ({
              ...prev,
              childAttributes: response.data
            }));
          }
        } catch (err: any) {
          console.error('Error fetching child attributes:', err);
        }
      }
    };

    fetchChildAttributes();
  }, [selectedParentAttribute]);

  const handleParentAttributeChange = (attributeId: string) => {
    setSelectedParentAttribute(attributeId);
    setSelectedChildAttribute(null); // Reset child selection when parent changes
    // Reset attributes to only include the selected parent
    setNewVariant(prev => ({
      ...prev,
      attributes: [attributeId]
    }));
  };

  const handleChildAttributeChange = (attributeId: string) => {
    setSelectedChildAttribute(attributeId);
    // Update attributes to include both parent and selected child
    setNewVariant(prev => ({
      ...prev,
      attributes: selectedParentAttribute ? [selectedParentAttribute, attributeId] : [attributeId]
    }));
  };

  const handleAddImage = () => {
    setNewVariant(prev => ({
      ...prev,
      images: [...prev.images, { file: null, url: '' }]
    }));
  };

  const handleRemoveImage = (index: number) => {
    setNewVariant(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleImageChange = (index: number, file: File | null) => {
    setNewVariant(prev => ({
      ...prev,
      images: prev.images.map((img, i) => i === index ? { file, url: file ? URL.createObjectURL(file) : '' } : img)
    }));
  };

  const handleEditVariant = (variant: ProductVariant) => {
    setSelectedVariant(variant);
    setNewVariant({
      images: (variant.images ?? []).map((img: any) => ({ url: img?.url || '', file: null })),
      attributes: variant.attribute.map(attr => attr._id),
      sellPrice: variant.sellPrice
    });
    // Set selected attributes
    const parentAttr = variant.attribute.find(attr => !attr.parentId);
    const childAttr = variant.attribute.find(attr => attr.parentId);
    if (parentAttr) {
      setSelectedParentAttribute(parentAttr._id);
    }
    if (childAttr) {
      setSelectedChildAttribute(childAttr._id);
    }
    setIsEditFormOpen(true);
  };

  const handleAddVariant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAddingVariant) return; // Ngăn double submit
    // Validate required fields
    if (newVariant.images.length === 0 || newVariant.images.some(img => !img.file)) {
      setError('Please add at least one image');
      return;
    }
    if (!selectedParentAttribute) {
      setError('Please select a parent attribute');
      return;
    }
    if (!selectedChildAttribute) {
      setError('Please select a child attribute');
      return;
    }
    try {
      setIsAddingVariant(true);
      const formData = new FormData();
      newVariant.images.forEach((img) => {
        if (img.file) {
          formData.append('images', img.file);
        }
      });
      newVariant.attributes.forEach(attrId => {
        formData.append('attributes', attrId);
      });
      const response = await request(() =>
        api.post(`/products/${product._id}/variant`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      );
      if (response.success) {
        setVariants([...variants, { ...response.data, images: response.data.images.map((img: { url: string }) => ({ url: img.url, file: null })) }]);
        setIsAddFormOpen(false);
        setNewVariant({ images: [{ file: null, url: '' }], attributes: [], sellPrice: 0 });
        setSelectedParentAttribute(null);
        setSelectedChildAttribute(null);
        setError(null);
      } else {
        setError(response.message || 'Failed to add variant');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsAddingVariant(false);
    }
  };

  const handleUpdateVariant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVariant) return;
    if (newVariant.images.length === 0 || newVariant.images.every(img => !img.file && !img.url)) {
      setError('Please add at least one image');
      return;
    }
    if (!selectedParentAttribute) {
      setError('Please select a parent attribute');
      return;
    }
    if (!selectedChildAttribute) {
      setError('Please select a child attribute');
      return;
    }
    if (newVariant.sellPrice <= 0) {
      setError('Please enter a valid price');
      return;
    }
    try {
      const formData = new FormData();
      newVariant.images.forEach((img) => {
        if (img.file) {
          formData.append('images', img.file);
        } else if (img.url) {
          formData.append('existingImages', img.url); // gửi url ảnh cũ
        }
      });
      newVariant.attributes.forEach(attrId => {
        formData.append('attributes', attrId);
      });
      formData.append('sellPrice', String(newVariant.sellPrice));
      const response = await request(() =>
        api.put(`/products/variant/${selectedVariant._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      );
      if (response.success) {
        setVariants(variants.map(v => v._id === selectedVariant._id ? { ...response.data, images: response.data.images.map((img: { url: string }) => ({ url: img.url, file: null })) } : v));
        setIsEditFormOpen(false);
        setSelectedVariant(null);
        setNewVariant({ images: [{ file: null, url: '' }], attributes: [], sellPrice: 0 });
        setSelectedParentAttribute(null);
        setSelectedChildAttribute(null);
        setError(null);
      } else {
        setError(response.message || 'Failed to update variant');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteVariant = async (variantId: string) => {
    setVariantToDelete(variantId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteVariant = async () => {
    if (!variantToDelete) return;
    
    try {
      await request(() => api.delete(`/products/variant/${variantToDelete}`));
      setVariants(variants.filter(variant => variant._id !== variantToDelete));
      setIsDeleteDialogOpen(false);
      setVariantToDelete(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Manage Variants - {product.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 overflow-y-auto max-h-[calc(90vh-8rem)] pr-2">
          <div className="flex justify-between items-center">
            <Button 
              type="button" 
              onClick={() => setIsAddFormOpen(true)}
              className="mb-4"
            >
              Add New Variant
            </Button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-md">
              {error}
            </div>
          )}

          {isAddFormOpen && (
            <div className="border rounded-lg p-4 mb-4">
              <form onSubmit={handleAddVariant} className="space-y-4">
                <div>
                  <Label>Images <span className="text-red-500">*</span></Label>
                  <div className="space-y-2">
                    {newVariant.images.map((image, index) => (
                      <div key={`image-${index}`} className="flex gap-2 items-center">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={e => handleImageChange(index, e.target.files?.[0] || null)}
                          required={index === 0}
                          disabled={isAddingVariant}
                        />
                        {image.url && (
                          <img src={image.url} alt="Preview" className="w-12 h-12 object-cover rounded" />
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveImage(index)}
                          disabled={newVariant.images.length === 1 || isAddingVariant}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddImage}
                      disabled={isAddingVariant}
                    >
                      Add Image
                    </Button>
                  </div>
                </div>

                <div>
                  <Label>Attributes <span className="text-red-500">*</span></Label>
                  <div className="grid grid-cols-2 gap-4 max-h-60 overflow-y-auto pr-2">
                    <div>
                      <Label className="font-semibold">Parent Attributes</Label>
                      <div className="space-y-2 mt-2">
                        {attributes.parentAttributes.map((attr) => (
                          <div key={`parent-attr-${attr._id}`} className="flex items-center space-x-2">
                            <input
                              type="radio"
                              id={`parent-${attr._id}`}
                              name="parentAttribute"
                              checked={selectedParentAttribute === attr._id}
                              onChange={() => handleParentAttributeChange(attr._id)}
                              required
                              disabled={isAddingVariant}
                            />
                            <Label htmlFor={`parent-${attr._id}`}>{attr.value}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label className="font-semibold">Child Attributes</Label>
                      <div className="space-y-2 mt-2">
                        {selectedParentAttribute && attributes.childAttributes
                          .filter(attr => attr.parentId && attr.parentId._id === selectedParentAttribute)
                          .map((attr) => (
                            <div key={`child-attr-${attr._id}`} className="flex items-center space-x-2">
                              <input
                                type="radio"
                                id={`child-${attr._id}`}
                                name="childAttribute"
                                checked={selectedChildAttribute === attr._id}
                                onChange={() => handleChildAttributeChange(attr._id)}
                                disabled={!selectedParentAttribute || isAddingVariant}
                                required
                              />
                              <Label htmlFor={`child-${attr._id}`}>{attr.value}</Label>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* <div>
                  <Label htmlFor="price">Sell Price <span className="text-red-500">*</span></Label>
                  <Input
                    id="price"
                    type="number"
                    value={newVariant.sellPrice}
                    onChange={(e) => setNewVariant(prev => ({ ...prev, sellPrice: Number(e.target.value) }))}
                    min={0}
                    required
                  />
                </div> */}

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => {
                    setIsAddFormOpen(false);
                    setNewVariant({ images: [{ file: null, url: '' }], attributes: [], sellPrice: 0 });
                    setSelectedParentAttribute(null);
                    setSelectedChildAttribute(null);
                    setError(null);
                  }} disabled={isAddingVariant}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isAddingVariant}>
                    {isAddingVariant ? 'Adding...' : 'Add Variant'}
                  </Button>
                </div>
              </form>
            </div> 
          )}

          {isEditFormOpen && selectedVariant && (
            <div className="border rounded-lg p-6 bg-white shadow-md">
              <form onSubmit={handleUpdateVariant} className="space-y-6">
                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-md font-semibold text-center">
                    {error}
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <Label className="font-semibold">Images <span className="text-red-500">*</span></Label>
                    <div className="space-y-2">
                      {newVariant.images.map((image, index) => (
                        <div key={`edit-image-${index}`} className="flex gap-2 items-center">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={e => handleImageChange(index, e.target.files?.[0] || null)}
                            required={!image.url && !image.file} // Chỉ required nếu không có url và không có file
                            disabled={isAddingVariant}
                          />
                          {image.url && (
                            <img src={image.url} alt="Preview" className="w-16 h-16 object-cover rounded-lg border border-gray-200" />
                          )}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveImage(index)}
                            disabled={newVariant.images.length === 1 || isAddingVariant}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddImage}
                        disabled={isAddingVariant}
                      >
                        Add Image
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <Label className="font-semibold">Attributes <span className="text-red-500">*</span></Label>
                    <div className="grid grid-cols-2 gap-4 max-h-60 overflow-y-auto pr-2">
                      <div>
                        <Label className="font-semibold">Parent Attributes</Label>
                        <div className="space-y-2 mt-2">
                          {attributes.parentAttributes.map((attr) => (
                            <div key={`edit-parent-attr-${attr._id}`} className="flex items-center space-x-2">
                              <input
                                type="radio"
                                id={`edit-parent-${attr._id}`}
                                name="parentAttribute"
                                checked={selectedParentAttribute === attr._id}
                                onChange={() => handleParentAttributeChange(attr._id)}
                                required
                                disabled={isAddingVariant}
                              />
                              <Label htmlFor={`edit-parent-${attr._id}`}>{attr.value}</Label>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label className="font-semibold">Child Attributes</Label>
                        <div className="space-y-2 mt-2">
                          {selectedParentAttribute && attributes.childAttributes
                            .filter(attr => attr.parentId && attr.parentId._id === selectedParentAttribute)
                            .map((attr) => (
                              <div key={`edit-child-attr-${attr._id}`} className="flex items-center space-x-2">
                                <input
                                  type="radio"
                                  id={`edit-child-${attr._id}`}
                                  name="childAttribute"
                                  checked={selectedChildAttribute === attr._id}
                                  onChange={() => handleChildAttributeChange(attr._id)}
                                  disabled={!selectedParentAttribute || isAddingVariant}
                                  required
                                />
                                <Label htmlFor={`edit-child-${attr._id}`}>{attr.value}</Label>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="edit-price" className="font-semibold">Sell Price <span className="text-red-500">*</span></Label>
                      <Input id="edit-price" type="number" value={newVariant.sellPrice} onChange={(e) => setNewVariant(prev => ({ ...prev, sellPrice: Number(e.target.value) }))} min={0} required className="mt-1" />
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                      <Button type="button" variant="outline" onClick={() => {
                        setIsEditFormOpen(false);
                        setSelectedVariant(null);
                        setNewVariant({
                          images: [{ file: null, url: '' }],
                          attributes: [],
                          sellPrice: 0
                        });
                        setSelectedParentAttribute(null);
                        setSelectedChildAttribute(null);
                        setError(null);
                      }} disabled={isAddingVariant}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isAddingVariant}>
                        {isAddingVariant ? 'Updating...' : 'Update Variant'}
                      </Button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          )}

          {loading ? (
            <div>Loading variants...</div>
          ) : error ? (
            <div className="text-red-500">Error: {error}</div>
          ) : variants.length === 0 ? (
            <div className="text-center py-4">No variants found for this product</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">No.</TableHead>
                    <TableHead className="min-w-[200px]">Attributes</TableHead>
                    <TableHead className="w-[120px]">Sell Price</TableHead>
                    <TableHead className="w-[120px]">Total Quantity</TableHead>
                    <TableHead className="min-w-[150px]">Images</TableHead>
                    <TableHead className="w-[100px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {variants.map((variant, index) => (
                    <TableRow key={`variant-${variant._id}`}>
                      <TableCell className="w-[50px]">{index + 1}</TableCell>
                      <TableCell className="min-w-[200px]">
                        <div className="flex flex-wrap gap-1">
                          {variant.attribute.map((attr, i) => (
                            <Badge key={`variant-attr-${attr._id}`} variant="secondary">
                              {attr.parentId ? `${attr.parentId.value}: ` : ''}{attr.value}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="w-[120px]">
                        {variant.sellPrice}
                      </TableCell>
                      <TableCell className="w-[120px]">
                        {variant.totalQuantity || 0}
                      </TableCell>
                      <TableCell className="min-w-[150px]">
                        <div className="flex gap-2">
                          {variant.images.map((image, i) => (
                            <img
                              key={`variant-image-${i}`}
                              src={image.url}
                              alt={`Variant ${index + 1} image ${i + 1}`}
                              className="w-10 h-10 object-cover rounded"
                            />
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="w-[100px] text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            title="Manage Import"
                            onClick={() => {
                              setSelectedVariantForImport(variant);
                              setIsImportModalOpen(true);
                            }}
                          >
                            <Warehouse className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            title="Edit Variant"
                            onClick={() => handleEditVariant(variant)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Delete Variant"
                            onClick={() => handleDeleteVariant(variant._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          <div className="flex justify-end gap-2 sticky bottom-0 bg-white pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>

      {selectedVariantForImport && (
        <ImportManagementModal
          variant={selectedVariantForImport}
          product={product}
          isOpen={isImportModalOpen}
          onClose={() => {
            setIsImportModalOpen(false);
            setSelectedVariantForImport(null);
          }}
          onVariantUpdate={(updatedVariant) => {
            setVariants((prev) => prev.map(v => v._id === updatedVariant._id ? { ...v, sellPrice: updatedVariant.sellPrice } : v));
            // Also update selectedVariantForImport if open
            setSelectedVariantForImport((prev) => prev && prev._id === updatedVariant._id ? { ...prev, sellPrice: updatedVariant.sellPrice } : prev);
          }}
        />
      )}

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Variant</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete this variant? This action cannot be undone.</p>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setVariantToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmDeleteVariant}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}

interface AddProductModalProps {
  onSave: (product: Product) => void;
  onClose: () => void;
  isOpen: boolean;
}

function AddProductModal({ onSave, onClose, isOpen }: AddProductModalProps) {
  const [level1Categories, setLevel1Categories] = useState<Array<{ _id: string; name: string; description: string }>>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    brand: ''
  });
  const [selectedParentCategory, setSelectedParentCategory] = useState<string | null>(null);
  const [selectedChildCategory, setSelectedChildCategory] = useState<string | null>(null);
  const [selectedGrandChildCategory, setSelectedGrandChildCategory] = useState<string | null>(null);
  const [categorySets, setCategorySets] = useState<Record<string, CategorySet>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submitRef = useRef(false);
  const { request } = useApi();
  const [variants, setVariants] = useState<Array<{
    images: Array<{ url: string }>;
    attributes: string[];
    sellPrice: number;
  }>>([]);
  const [attributes, setAttributes] = useState<{ parentAttributes: Attribute[]; childAttributes: Attribute[] }>({ parentAttributes: [], childAttributes: [] });
  const [selectedParentAttribute, setSelectedParentAttribute] = useState<string | null>(null);
  const [selectedChildAttribute, setSelectedChildAttribute] = useState<string | null>(null);
  const [isAddVariantFormOpen, setIsAddVariantFormOpen] = useState(false);
  const [newVariant, setNewVariant] = useState({
    images: [{ file: null as File | null, url: '' }],
    attributes: [] as string[],
    sellPrice: 0
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAddingVariantAddProduct, setIsAddingVariantAddProduct] = useState(false); // Thêm state riêng cho modal này

  // Reset states when modal closes
  useEffect(() => {
    if (!isOpen) {
      submitRef.current = false;
      setError(null);
      setFormData({ name: '', description: '', brand: '' });
      setSelectedParentCategory(null);
      setSelectedChildCategory(null);
      setSelectedGrandChildCategory(null);
      setCategorySets({});
      setVariants([]);
      setAttributes({ parentAttributes: [], childAttributes: [] });
      setSelectedParentAttribute(null);
      setSelectedChildAttribute(null);
      setIsAddVariantFormOpen(false);
      setNewVariant({ images: [{ file: null, url: '' }], attributes: [], sellPrice: 0 });
      setSelectedFile(null);
      setImagePreview(null);
    }
  }, [isOpen]);

  // Fetch level 1 categories when modal opens
  useEffect(() => {
    const fetchLevel1Categories = async () => {
      try {
        const response = await request(() => api.get('/categories/parent'));
        if (response && response.success) {
          setLevel1Categories(response.data);
        }
      } catch (error) {
        console.error('Error fetching level 1 categories:', error);
        setError('Failed to fetch categories');
      }
    };

    if (isOpen) {
      fetchLevel1Categories();
    }
  }, [isOpen]);

  // Sửa useEffect fetch attribute:
  useEffect(() => {
    const fetchAttributes = async () => {
      if (selectedParentCategory) {
        try {
          const responseRaw = await request(() => api.get(`/categories/attributes/${selectedParentCategory}`));
          const attributesData = responseRaw?.attributes;
          if (responseRaw.success && attributesData) {
            const parentAttributes = attributesData.map((attr: any) => ({
              _id: attr._id,
              value: attr.value,
              description: attr.description
            }));
            const childAttributes: any[] = [];
            attributesData.forEach((attr: any) => {
              if (attr.children && attr.children.length > 0) {
                attr.children.forEach((child: any) => {
                  childAttributes.push({
                    _id: child._id,
                    value: child.value,
                    description: child.description,
                    parentId: { _id: attr._id, value: attr.value }
                  });
                });
              }
            });
            setAttributes({ parentAttributes, childAttributes });
          } else {
            setAttributes({ parentAttributes: [], childAttributes: [] });
          }
        } catch (err: any) {
          setAttributes({ parentAttributes: [], childAttributes: [] });
        }
      } else {
        setAttributes({ parentAttributes: [], childAttributes: [] });
      }
    };
    fetchAttributes();
  }, [selectedParentCategory]);

  // Khi chọn parent attribute, fetch child attribute động (nếu cần)
  useEffect(() => {
    if (!selectedParentAttribute) {
      setSelectedChildAttribute(null);
      return;
    }
    // Không cần fetch lại vì đã lấy hết child attribute ở trên
  }, [selectedParentAttribute]);

  const handleParentCategoryChange = async (categoryId: string) => {
    setSelectedParentCategory(categoryId);
    setSelectedChildCategory(null);
    setSelectedGrandChildCategory(null);
    
    try {
      // Fetch child categories for the selected parent
      const response = await request(() => api.get(`/categories/child-categories/${categoryId}`));
      if (response && response.success) {
        setCategorySets({
          [categoryId]: {
            level2: response.data || [],
            level3: []
          }
        });
      }
    } catch (error) {
      console.error('Error fetching child categories:', error);
      setError('Failed to fetch child categories');
    }
  };

  const handleChildCategoryChange = async (categoryId: string) => {
    setSelectedChildCategory(categoryId);
    setSelectedGrandChildCategory(null);
    
    try {
      // Fetch grandchild categories
      const response = await request(() => api.get(`/categories/child-categories/${categoryId}`));
      if (response && response.success) {
        setCategorySets(prev => ({
          ...prev,
          [selectedParentCategory!]: {
            ...prev[selectedParentCategory!],
            level3: response.data || []
          }
        }));
      }
    } catch (error) {
      console.error('Error fetching grandchild categories:', error);
      setError('Failed to fetch grandchild categories');
    }
  };

  const handleGrandChildCategoryChange = (categoryId: string) => {
    setSelectedGrandChildCategory(categoryId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Prevent multiple submissions
    if (submitRef.current || isSubmitting) {
      console.log('Preventing duplicate submission');
      return;
    }
    submitRef.current = true;
    setError(null);

    try {
      setIsSubmitting(true);

      // Validate required fields
      if (!formData.name || !formData.description) {
        throw new Error('Name and description are required');
      }

      if (!selectedParentCategory) {
        throw new Error('Please select a parent category');
      }

      // Create array of category IDs
      const categoryIds = [selectedParentCategory];
      if (selectedChildCategory) {
        categoryIds.push(selectedChildCategory);
      }
      if (selectedGrandChildCategory) {
        categoryIds.push(selectedGrandChildCategory);
      }

      const submitData = {
        name: formData.name,
        description: formData.description,
        brand: formData.brand,
        categories: categoryIds.map(categoryId => ({
          categoryId: categoryId
        }))
      };

      console.log('Sending data to create product:', submitData);
      const response = await request(() => api.post('/products', submitData));
      console.log('Response from server:', response);

      if (response.success) {
        const createdProduct = response.data;
        // Tạo các variant nếu có
        if (variants.length > 0) {
          for (const variant of variants) {
            try {
              const formData = new FormData();
              variant.images.forEach((img: any) => {
                if (img.file) {
                  formData.append('images', img.file);
                }
              });
              variant.attributes.forEach((attrId: string) => {
                formData.append('attributes', attrId);
              });
              formData.append('sellPrice', String(variant.sellPrice));
              await request(() => api.post(
                `/products/${createdProduct._id}/variant`,
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
              ));
            } catch (err) {
              // Có thể log lỗi từng variant nếu muốn
              console.error('Error creating variant:', err);
            }
          }
        }
        onSave(createdProduct);
        onClose();
      } else {
        throw new Error(response.message || 'Failed to create product');
      }
    } catch (error: any) {
      console.error('Error creating product:', error);
      setError(error.message || 'Failed to create product');
    } finally {
      setIsSubmitting(false);
      submitRef.current = false;
    }
  };

  const handleAddVariant = () => {
    if (isAddingVariantAddProduct) return;
    if (newVariant.images.length === 0 || newVariant.images.some(img => !img.file)) {
      setError('Please add at least one image');
      return;
    }
    if (!selectedParentAttribute) {
      setError('Please select a parent attribute');
      return;
    }
    if (!selectedChildAttribute) {
      setError('Please select a child attribute');
      return;
    }
    setIsAddingVariantAddProduct(true);
    setVariants([
      ...variants,
      { ...newVariant, images: newVariant.images.map(img => ({ file: img.file, url: img.url })) }
    ]);
    setIsAddVariantFormOpen(false);
    setNewVariant({ images: [{ file: null, url: '' }], attributes: [], sellPrice: 0 });
    setSelectedParentAttribute(null);
    setSelectedChildAttribute(null);
    setError(null);
    setTimeout(() => setIsAddingVariantAddProduct(false), 300); // reset sau khi thêm xong
  };

  const handleRemoveVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleAddImage = () => {
    setNewVariant(prev => ({ ...prev, images: [...prev.images, { file: null, url: '' }] }));
  };

  const handleRemoveImage = (index: number) => {
    setNewVariant(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const handleImageChange = (index: number, file: File | null) => {
    setNewVariant(prev => ({
      ...prev,
      images: prev.images.map((img, i) => i === index ? { file, url: file ? URL.createObjectURL(file) : '' } : img)
    }));
  };

  const handleParentAttributeChange = (attributeId: string) => {
    setSelectedParentAttribute(attributeId);
    setSelectedChildAttribute(null);
    setNewVariant(prev => ({ ...prev, attributes: [attributeId] }));
  };

  const handleChildAttributeChange = (attributeId: string) => {
    setSelectedChildAttribute(attributeId);
    setNewVariant(prev => ({ ...prev, attributes: selectedParentAttribute ? [selectedParentAttribute, attributeId] : [attributeId] }));
  };

  const handleVariantImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
      setNewVariant(prev => ({ ...prev, images: [{ file, url: '' }] })); // reset url, sẽ upload file
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto p-8">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold mb-2">Add New Product</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-md font-semibold text-center">
              {error}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-lg border">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="font-semibold">Name <span className="text-red-500">*</span></Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="brand" className="font-semibold">Brand</Label>
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="description" className="font-semibold">Description <span className="text-red-500">*</span></Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                required
                className="mt-1 min-h-[100px]"
              />
            </div>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg border">
            <Label className="font-semibold mb-2 block">Categories <span className="text-red-500">*</span></Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label className="font-semibold">Parent Category <span className="text-red-500">*</span></Label>
                <div className="space-y-2 mt-2">
                  {level1Categories.map((category) => (
                    <div key={`parent-${category._id}`} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id={`parent-${category._id}`}
                        name="parentCategory"
                        checked={selectedParentCategory === category._id}
                        onChange={() => handleParentCategoryChange(category._id)}
                        required
                      />
                      <Label htmlFor={`parent-${category._id}`}>{category.name}</Label>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <Label className="font-semibold">Child Category</Label>
                <div className="space-y-2 mt-2">
                  {selectedParentCategory && categorySets[selectedParentCategory]?.level2.map((category) => (
                    <div key={`child-${category._id}`} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id={`child-${category._id}`}
                        name="childCategory"
                        checked={selectedChildCategory === category._id}
                        onChange={() => handleChildCategoryChange(category._id)}
                      />
                      <Label htmlFor={`child-${category._id}`}>{category.name}</Label>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <Label className="font-semibold">Grandchild Category</Label>
                <div className="space-y-2 mt-2">
                  {selectedChildCategory && categorySets[selectedParentCategory!]?.level3.map((category) => (
                    <div key={`grandchild-${category._id}`} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id={`grandchild-${category._id}`}
                        name="grandchildCategory"
                        checked={selectedGrandChildCategory === category._id}
                        onChange={() => handleGrandChildCategoryChange(category._id)}
                      />
                      <Label htmlFor={`grandchild-${category._id}`}>{category.name}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg border">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-base text-gray-700">Product Variants</h3>
              <Button type="button" onClick={() => setIsAddVariantFormOpen(true)} disabled={!selectedGrandChildCategory}>Add Variant</Button>
            </div>
            {variants.length > 0 && (
              <div className="space-y-2 mb-4">
                <h4 className="text-sm font-medium">Added Variants ({variants.length})</h4>
                {variants.map((variant, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white rounded border">
                    <div className="flex items-center space-x-4">
                      <div className="text-sm"><span className="font-medium">Images:</span> {variant.images.length}</div>
                      <div className="text-sm"><span className="font-medium">Attributes:</span> {variant.attributes.length}</div>
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveVariant(index)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                ))}
              </div>
            )}
            {isAddVariantFormOpen && (
              <div className="border rounded-lg p-6 bg-white shadow-md space-y-6">
                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-md font-semibold text-center">
                    {error}
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <Label className="font-semibold">Images <span className="text-red-500">*</span></Label>
                    <div className="space-y-2">
                      {newVariant.images.map((image, index) => (
                        <div key={`image-${index}`} className="flex gap-2 items-center">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={e => handleImageChange(index, e.target.files?.[0] || null)}
                            required={index === 0}
                            disabled={isAddingVariantAddProduct}
                          />
                          {image.url && (
                            <img src={image.url} alt="Preview" className="w-16 h-16 object-cover rounded-lg border border-gray-200" />
                          )}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveImage(index)}
                            disabled={newVariant.images.length === 1 || isAddingVariantAddProduct}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddImage}
                        disabled={isAddingVariantAddProduct}
                      >
                        Add Image
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <Label className="font-semibold">Attributes <span className="text-red-500">*</span></Label>
                    <div className="grid grid-cols-2 gap-4 max-h-60 overflow-y-auto pr-2">
                      <div>
                        <Label className="font-semibold">Parent Attributes</Label>
                        <div className="space-y-2 mt-2">
                          {attributes.parentAttributes.map((attr) => (
                            <div key={`parent-attr-${attr._id}`} className="flex items-center space-x-2">
                              <input
                                type="radio"
                                id={`parent-${attr._id}`}
                                name="parentAttribute"
                                checked={selectedParentAttribute === attr._id}
                                onChange={() => handleParentAttributeChange(attr._id)}
                                required
                                disabled={isAddingVariantAddProduct}
                              />
                              <Label htmlFor={`parent-${attr._id}`}>{attr.value}</Label>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label className="font-semibold">Child Attributes</Label>
                        <div className="space-y-2 mt-2">
                          {selectedParentAttribute && attributes.childAttributes
                            .filter(attr => attr.parentId && attr.parentId._id === selectedParentAttribute)
                            .map((attr) => (
                              <div key={`child-attr-${attr._id}`} className="flex items-center space-x-2">
                                <input
                                  type="radio"
                                  id={`child-${attr._id}`}
                                  name="childAttribute"
                                  checked={selectedChildAttribute === attr._id}
                                  onChange={() => handleChildAttributeChange(attr._id)}
                                  disabled={!selectedParentAttribute || isAddingVariantAddProduct}
                                  required
                                />
                                <Label htmlFor={`child-${attr._id}`}>{attr.value}</Label>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                    {/* <div>
                      <Label htmlFor="price" className="font-semibold">Price <span className="text-red-500">*</span></Label>
                      <Input id="price" type="number" value={newVariant.sellPrice} onChange={(e) => setNewVariant(prev => ({ ...prev, sellPrice: Number(e.target.value) }))} min={0} required className="mt-1" />
                    </div> */}
                    <div className="flex justify-end gap-2 mt-4">
                      <Button type="button" variant="outline" onClick={() => {
                        setIsAddVariantFormOpen(false);
                        setNewVariant({ images: [{ file: null, url: '' }], attributes: [], sellPrice: 0 });
                        setSelectedParentAttribute(null);
                        setSelectedChildAttribute(null);
                        setError(null);
                      }} disabled={isAddingVariantAddProduct}>
                        Cancel
                      </Button>
                      <Button type="button" onClick={handleAddVariant} disabled={isAddingVariantAddProduct}>
                        {isAddingVariantAddProduct ? 'Adding...' : 'Add Variant'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-4 mt-6">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting} className="px-6 py-2">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="px-6 py-2 font-semibold">
              {isSubmitting ? 'Adding...' : 'Add Product'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface ImportBatch {
  _id: string;
  variantId: string;
  importDate: string;
  quantity: number;
  costPrice: number;
}

interface ImportManagementModalProps {
  variant: ProductVariant;
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onVariantUpdate?: (updatedVariant: ProductVariant) => void;
}

function ImportManagementModal({ variant, product, isOpen, onClose, onVariantUpdate }: ImportManagementModalProps) {
  const [importBatches, setImportBatches] = useState<ImportBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<ImportBatch | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [batchToDelete, setBatchToDelete] = useState<string | null>(null);
  const [newBatch, setNewBatch] = useState({
    importDate: new Date().toISOString().split('T')[0],
    quantity: 0,
    costPrice: 0
  });
  const [sellPrice, setSellPrice] = useState<number>(variant.sellPrice);
  const [isUpdatingSellPrice, setIsUpdatingSellPrice] = useState(false);
  const [sellPriceError, setSellPriceError] = useState<string | null>(null);
  const { request } = useApi();

  useEffect(() => {
    setSellPrice(variant.sellPrice);
  }, [variant.sellPrice, variant._id]);

  useEffect(() => {
    const fetchImportBatches = async () => {
      try {
        const response = await request(() => api.get(`/products/import-batches/${variant._id}`));
        if (response.success) {
          setImportBatches(response.data);
        } else {
          setError(response.message || 'Failed to fetch import batches');
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchImportBatches();
    }
  }, [isOpen, variant._id]);

  const handleAddBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (newBatch.quantity <= 0) {
      setError('Quantity must be greater than 0');
      return;
    }

    if (newBatch.costPrice <= 0) {
      setError('Cost price must be greater than 0');
      return;
    }

    try {
      const response = await request(() => 
        api.post(`/products/import-batches/${variant._id}`, newBatch)
      );
      if (response.success) {
        setImportBatches([...importBatches, response.data]);
        setIsAddFormOpen(false);
        setNewBatch({
          importDate: new Date().toISOString().split('T')[0],
          quantity: 0,
          costPrice: 0
        });
        setError(null);
      } else {
        setError(response.message || 'Failed to add import batch');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEditBatch = (batch: ImportBatch) => {
    setSelectedBatch(batch);
    setNewBatch({
      importDate: batch.importDate.split('T')[0],
      quantity: batch.quantity,
      costPrice: batch.costPrice
    });
    setIsEditFormOpen(true);
  };

  const handleUpdateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatch) return;

    // Validate required fields
    if (newBatch.quantity <= 0) {
      setError('Quantity must be greater than 0');
      return;
    }

    if (newBatch.costPrice <= 0) {
      setError('Cost price must be greater than 0');
      return;
    }

    try {
      const response = await request(() => 
        api.put(`/products/import-batches/${selectedBatch._id}`, newBatch)
      );
      if (response.success) {
        setImportBatches(importBatches.map(batch => 
          batch._id === selectedBatch._id ? response.data : batch
        ));
        setIsEditFormOpen(false);
        setSelectedBatch(null);
        setNewBatch({
          importDate: new Date().toISOString().split('T')[0],
          quantity: 0,
          costPrice: 0
        });
        setError(null);
      } else {
        setError(response.message || 'Failed to update import batch');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteBatch = async (batchId: string) => {
    setBatchToDelete(batchId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteBatch = async () => {
    if (!batchToDelete) return;
    
    try {
      await request(() => api.delete(`/products/import-batches/${batchToDelete}`));
      setImportBatches(importBatches.filter(batch => batch._id !== batchToDelete));
      setIsDeleteDialogOpen(false);
      setBatchToDelete(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const totalQuantity = importBatches.reduce((sum, batch) => sum + batch.quantity, 0);
  const averageCostPrice = importBatches.length > 0 
    ? importBatches.reduce((sum, batch) => sum + batch.costPrice, 0) / importBatches.length 
    : 0;
  const totalInventoryValue = importBatches.reduce((sum, batch) => sum + (batch.quantity * batch.costPrice), 0);

  // Format variant attributes for display
  const variantAttributes = variant.attribute.map(attr => 
    attr.parentId ? `${attr.parentId.value}: ${attr.value}` : attr.value
  ).join(', ');

  const handleSellPriceUpdate = async (newPrice: number) => {
    setIsUpdatingSellPrice(true);
    setSellPriceError(null);
    try {
      const formData = new FormData();
      formData.append('sellPrice', String(newPrice));
      const response = await request(() =>
        api.put(`/products/variant/${variant._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      );
      if (!response.success) {
        setSellPriceError(response.message || 'Failed to update sell price');
        setSellPrice(variant.sellPrice);
      } else {
        // Fetch latest variant data
        const variantRes = await request(() => api.get(`/products/product-variant/${variant.product_id}`));
        if (variantRes.success && Array.isArray(variantRes.data)) {
          const updated = variantRes.data.find((v: ProductVariant) => v._id === variant._id);
          if (updated) {
            setSellPrice(updated.sellPrice);
            if (onVariantUpdate) onVariantUpdate(updated);
          }
        }
      }
    } catch (err: any) {
      setSellPriceError(err.message || 'Failed to update sell price');
      setSellPrice(variant.sellPrice);
    } finally {
      setIsUpdatingSellPrice(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            Manage Import Batches - {product.name} ({variantAttributes})
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 overflow-y-auto max-h-[calc(90vh-8rem)] pr-2">
          {/* Variant Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-sm text-gray-700 mb-2">Variant Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Product:</span> {product.name}
              </div>
              <div>
                <span className="font-medium">Brand:</span> {product.brand || 'N/A'}
              </div>
              <div>
                <span className="font-medium">Attributes:</span> {variantAttributes}
              </div>
              <div>
                <span className="font-medium">Categories:</span> {product.category.map(cat => cat.name).join(', ')}
              </div>
              <div>
                <span className="font-medium">Images:</span> {variant.images.length}
              </div>
            </div>
          </div>

          {/* Sell Price Update */}
          <div className="bg-white p-4 rounded-lg border flex items-center gap-4 mb-2">
            <Label htmlFor="variant-sell-price" className="font-semibold">Sell Price:</Label>
            <Input
              id="variant-sell-price"
              type="number"
              value={sellPrice}
              min={0}
              step={0.01}
              className="w-32"
              disabled={isUpdatingSellPrice}
              onChange={e => setSellPrice(Number(e.target.value))}
              onBlur={async () => {
                if (sellPrice === variant.sellPrice) return;
                await handleSellPriceUpdate(sellPrice);
              }}
            />
            {isUpdatingSellPrice && <span className="text-sm text-gray-500">Saving...</span>}
            {sellPriceError && <span className="text-sm text-red-500">{sellPriceError}</span>}
          </div>

          <div className="flex justify-between items-center">
            <Button 
              type="button" 
              onClick={() => setIsAddFormOpen(true)}
              className="mb-4"
            >
              Add New Import Batch
            </Button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-4 gap-4 mb-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-sm font-medium text-gray-500">Total Quantity</div>
                <div className="text-2xl font-bold">{totalQuantity}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm font-medium text-gray-500">Average Cost Price</div>
                <div className="text-2xl font-bold">${averageCostPrice.toFixed(2)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm font-medium text-gray-500">Total Inventory Value</div>
                <div className="text-2xl font-bold text-blue-600">${totalInventoryValue.toFixed(2)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm font-medium text-gray-500">Profit Margin</div>
                <div className="text-2xl font-bold text-green-600">
                  {averageCostPrice > 0 ? `${((variant.sellPrice - averageCostPrice) / variant.sellPrice * 100).toFixed(1)}%` : '-'}
                </div>
              </CardContent>
            </Card>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-md">
              {error}
            </div>
          )}

          {isAddFormOpen && (
            <div className="border rounded-lg p-4 mb-4">
              <form onSubmit={handleAddBatch} className="space-y-4">
                <div>
                  <Label htmlFor="importDate">Import Date <span className="text-red-500">*</span></Label>
                  <Input
                    id="importDate"
                    type="date"
                    value={newBatch.importDate}
                    onChange={(e) => setNewBatch(prev => ({ ...prev, importDate: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="quantity">Quantity <span className="text-red-500">*</span></Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={newBatch.quantity}
                    onChange={(e) => setNewBatch(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                    min={1}
                    placeholder="Enter quantity"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="costPrice">Cost Price <span className="text-red-500">*</span></Label>
                  <Input
                    id="costPrice"
                    type="number"
                    value={newBatch.costPrice}
                    onChange={(e) => setNewBatch(prev => ({ ...prev, costPrice: Number(e.target.value) }))}
                    min={0.01}
                    step={0.01}
                    placeholder="Enter cost price"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => {
                    setIsAddFormOpen(false);
                    setNewBatch({
                      importDate: new Date().toISOString().split('T')[0],
                      quantity: 0,
                      costPrice: 0
                    });
                    setError(null);
                  }}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    Add Batch
                  </Button>
                </div>
              </form>
            </div>
          )}

          {isEditFormOpen && selectedBatch && (
            <div className="border rounded-lg p-4 mb-4">
              <form onSubmit={handleUpdateBatch} className="space-y-4">
                <div>
                  <Label htmlFor="editImportDate">Import Date <span className="text-red-500">*</span></Label>
                  <Input
                    id="editImportDate"
                    type="date"
                    value={newBatch.importDate}
                    onChange={(e) => setNewBatch(prev => ({ ...prev, importDate: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="editQuantity">Quantity <span className="text-red-500">*</span></Label>
                  <Input
                    id="editQuantity"
                    type="number"
                    value={newBatch.quantity}
                    onChange={(e) => setNewBatch(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                    min={1}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="editCostPrice">Cost Price <span className="text-red-500">*</span></Label>
                  <Input
                    id="editCostPrice"
                    type="number"
                    value={newBatch.costPrice}
                    onChange={(e) => setNewBatch(prev => ({ ...prev, costPrice: Number(e.target.value) }))}
                    min={0.01}
                    step={0.01}
                    required
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => {
                    setIsEditFormOpen(false);
                    setSelectedBatch(null);
                    setNewBatch({
                      importDate: new Date().toISOString().split('T')[0],
                      quantity: 0,
                      costPrice: 0
                    });
                    setError(null);
                  }}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    Update Batch
                  </Button>
                </div>
              </form>
            </div>
          )}

          {loading ? (
            <div>Loading import batches...</div>
          ) : error ? (
            <div className="text-red-500">Error: {error}</div>
          ) : importBatches.length === 0 ? (
            <div className="text-center py-4">No import batches found for this variant</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">No.</TableHead>
                    <TableHead className="w-[120px]">Import Date</TableHead>
                    <TableHead className="w-[100px]">Quantity</TableHead>
                    <TableHead className="w-[120px]">Cost Price</TableHead>
                    <TableHead className="w-[120px]">Total Value</TableHead>
                    <TableHead className="w-[100px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {importBatches.map((batch, index) => (
                    <TableRow key={`batch-${batch._id}`}>
                      <TableCell className="w-[50px]">{index + 1}</TableCell>
                      <TableCell className="w-[120px]">
                        {new Date(batch.importDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="w-[100px] font-medium">{batch.quantity}</TableCell>
                      <TableCell className="w-[120px]">${batch.costPrice.toFixed(2)}</TableCell>
                      <TableCell className="w-[120px] font-semibold text-green-600">
                        ${(batch.quantity * batch.costPrice).toFixed(2)}
                      </TableCell>
                      <TableCell className="w-[100px] text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            title="Edit Batch"
                            onClick={() => handleEditBatch(batch)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Delete Batch"
                            onClick={() => handleDeleteBatch(batch._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          <div className="flex justify-end gap-2 sticky bottom-0 bg-white pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Import Batch</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete this import batch? This action cannot be undone.</p>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setBatchToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmDeleteBatch}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}

// Đặt interface PaginationProps ở ngoài function ProductPage
interface PaginationProps {
  filteredProducts: Product[];
  itemsPerPage: number;
  currentPage: number;
  setItemsPerPage: (value: number) => void;
  setCurrentPage: (value: number) => void;
}

// Thêm hàm uploadImage ở đầu file (trước các component)
const uploadImage = async (file: File) => {
  const formData = new FormData();
  formData.append('image', file);
  const response = await api.post('/products/upload-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  if (response.data && response.data.url) {
    return response.data.url;
  }
  throw new Error('Upload image failed');
};

export default function ProductPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
  const [selectedProductForVariants, setSelectedProductForVariants] = useState<Product | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { request } = useApi();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  // Sorting state
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  // Sorting handler
  const handleSort = (key: string) => {
    setSortConfig(prev => {
      if (prev && prev.key === key) {
        // Toggle direction
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  // Sort products
  const sortedProducts = React.useMemo(() => {
    let sortable = [...products];
    if (sortConfig) {
      sortable.sort((a, b) => {
        let aValue: any = a[sortConfig.key as keyof Product];
        let bValue: any = b[sortConfig.key as keyof Product];
        // Special handling for category
        if (sortConfig.key === 'category') {
          aValue = a.category[0]?.name || '';
          bValue = b.category[0]?.name || '';
        }
        // Fallback to string comparison
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        return 0;
      });
    }
    return sortable;
  }, [products, sortConfig]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await request(() => api.get('/products'));
        setProducts(response.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = sortedProducts.filter(product =>
    product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.brand?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleEditProduct = async (updatedProduct: Product) => {
    try {
      const response = await request(() => 
        api.put(`/products/${updatedProduct._id}`, updatedProduct)
      );
      setProducts(products.map(p => p._id === updatedProduct._id ? response.data : p));
      setIsEditModalOpen(false);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteProduct = (id: string) => {
    if (!id) {
      console.error('No product ID provided for deletion');
      setError('Invalid product ID');
      return;
    }
    console.log('Setting product to delete:', id);
    setProductToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteProduct = async () => {
    if (!productToDelete) {
      console.error('No product ID available for deletion');
      setError('No product selected for deletion');
      return;
    }

    try {
      setIsDeleting(true);
      console.log('Deleting product with ID:', productToDelete);
      
      const response = await request(() => api.delete(`/products/${productToDelete}`));
      console.log('Delete response:', response);
      
      if (response.success) {
        // Remove the deleted product from the list
        setProducts(products.filter(product => product._id !== productToDelete));
        setError(null);
        setIsDeleteDialogOpen(false);
        setProductToDelete(null);
      } else {
        throw new Error(response.message || 'Failed to delete product');
      }
    } catch (err: any) {
      console.error('Error deleting product:', err);
      setError(err.response?.data?.message || err.message || 'Failed to delete product');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddProduct = async (newProduct: Product) => {
    try {
      setProducts([...products, newProduct]);
      setIsAddModalOpen(false);
      setError(null);
    } catch (err: any) {
      console.error('Error adding product:', err);
      setError(err.message);
    }
  };

  function Pagination({ filteredProducts, itemsPerPage, currentPage, setItemsPerPage, setCurrentPage }: PaginationProps) {
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    return (
      <div className="flex items-center justify-between px-2 py-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <div className="flex items-center gap-1">
            {[...Array(totalPages)].map((_, index) => (
              <Button
                key={index + 1}
                variant={currentPage === index + 1 ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(index + 1)}
              >
                {index + 1}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Product Management</CardTitle>
            <Button onClick={() => setIsAddModalOpen(true)}>Add New Product</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {loading ? (
            <div>Loading...</div>
          ) : error ? (
            <div className="text-red-500">Error: {error}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No.</TableHead>
                  <TableHead onClick={() => handleSort('name')} className="cursor-pointer select-none">
                    Name {sortConfig?.key === 'name' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                  </TableHead>
                  <TableHead onClick={() => handleSort('brand')} className="cursor-pointer select-none">
                    Brand {sortConfig?.key === 'brand' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                  </TableHead>
                  <TableHead onClick={() => handleSort('description')} className="cursor-pointer select-none">
                    Description {sortConfig?.key === 'description' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                  </TableHead>
                  <TableHead onClick={() => handleSort('category')} className="cursor-pointer select-none">
                    Categories {sortConfig?.key === 'category' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedProducts.map((product, index) => (
                  <TableRow key={product._id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.brand || '-'}</TableCell>
                    <TableCell>{product.description}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {product.category.map((cat, i) => (
                          <Badge key={i} variant="secondary">
                            {cat.name}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0" 
                          title="Manage Variants"
                          onClick={() => {
                            setSelectedProductForVariants(product);
                            setIsVariantModalOpen(true);
                          }}
                        >
                          <Package className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0" 
                          title="Edit Product" 
                          onClick={() => {
                            setSelectedProduct(product);
                            setIsEditModalOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          title="Delete Product"
                          onClick={() => handleDeleteProduct(product._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {selectedProduct && (
        <EditProductModal
          product={selectedProduct}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedProduct(null);
          }}
          onSave={handleEditProduct}
        />
      )}

      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setError(null);
        }}
        onSave={handleAddProduct}
      />

      {selectedProductForVariants && (
        <VariantManagementModal
          product={selectedProductForVariants}
          isOpen={isVariantModalOpen}
          onClose={() => {
            setIsVariantModalOpen(false);
            setSelectedProductForVariants(null);
          }}
        />
      )}

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete this product? This action will also delete all its variants and cannot be undone.</p>
            {error && (
              <div className="mt-2 text-sm text-red-600">
                {error}
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setProductToDelete(null);
                setError(null);
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmDeleteProduct}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Pagination
        filteredProducts={filteredProducts}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        setItemsPerPage={setItemsPerPage}
        setCurrentPage={setCurrentPage}
      />
    </div>
  );
}
