'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState, useRef } from "react";
import { useApi } from "../../../../utils/axios";
import { api } from "../../../../utils/axios";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Edit, Eye, Trash2, Package } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Category {
  _id: string;
  name: string;
  description?: string;
  image?: string;
}

interface CategorySelection {
  level1: string;
  level2: string;
  level3: string;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  category: Array<{
    categoryId: string;
    name: string;
    description: string;
  }>;
}

interface CategoryWithLevel {
  _id: string;
  name: string;
  description: string;
  level: number;
  parentChain: Array<{
    _id: string;
    name: string;
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
    description: product.description
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
            description: productData.description
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
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-md">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>
          <div className="space-y-4">
            <div>
              <Label>Categories <span className="text-red-500">*</span></Label>
              <div className="grid grid-cols-3 gap-4 mt-2">
                <div>
                  <Label>Parent Category</Label>
                  <div className="space-y-2">
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
                  <Label>Child Category</Label>
                  <div className="space-y-2">
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
                  <Label>Grandchild Category</Label>
                  <div className="space-y-2">
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
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
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
  const [attributes, setAttributes] = useState<{
    parentAttributes: Attribute[];
    childAttributes: Attribute[];
  }>({ parentAttributes: [], childAttributes: [] });
  const [selectedParentAttribute, setSelectedParentAttribute] = useState<string | null>(null);
  const [selectedChildAttribute, setSelectedChildAttribute] = useState<string | null>(null);
  const [newVariant, setNewVariant] = useState({
    images: [{ url: '' }],
    attributes: [] as string[],
    sellPrice: 0
  });
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
      images: [...prev.images, { url: '' }]
    }));
  };

  const handleRemoveImage = (index: number) => {
    setNewVariant(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleImageChange = (index: number, url: string) => {
    setNewVariant(prev => ({
      ...prev,
      images: prev.images.map((img, i) => i === index ? { url } : img)
    }));
  };

  const handleEditVariant = (variant: ProductVariant) => {
    setSelectedVariant(variant);
    setNewVariant({
      images: variant.images,
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
    
    // Validate required fields
    if (newVariant.images.length === 0 || newVariant.images.some(img => !img.url.trim())) {
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
      const response = await request(() => 
        api.post(`/products/${product._id}/variant`, newVariant)
      );
      if (response.success) {
        setVariants([...variants, response.data]);
        setIsAddFormOpen(false);
        setNewVariant({
          images: [{ url: '' }],
          attributes: [],
          sellPrice: 0
        });
        setSelectedParentAttribute(null);
        setSelectedChildAttribute(null);
        setError(null);
      } else {
        setError(response.message || 'Failed to add variant');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleUpdateVariant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVariant) return;

    // Validate required fields
    if (newVariant.images.length === 0 || newVariant.images.some(img => !img.url.trim())) {
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
      const response = await request(() => 
        api.put(`/products/variant/${selectedVariant._id}`, newVariant)
      );
      if (response.success) {
        setVariants(variants.map(v => 
          v._id === selectedVariant._id ? response.data : v
        ));
        setIsEditFormOpen(false);
        setSelectedVariant(null);
        setNewVariant({
          images: [{ url: '' }],
          attributes: [],
          sellPrice: 0
        });
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
                      <div key={`image-${index}`} className="flex gap-2">
                        <Input
                          type="text"
                          value={image.url}
                          onChange={(e) => handleImageChange(index, e.target.value)}
                          placeholder="Image URL"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveImage(index)}
                          disabled={newVariant.images.length === 1}
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
                    >
                      Add Image
                    </Button>
                  </div>
                </div>

                <div>
                  <Label>Attributes <span className="text-red-500">*</span></Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Parent Attributes</Label>
                      <div className="space-y-2">
                        {attributes.parentAttributes.map((attr) => (
                          <div key={`parent-attr-${attr._id}`} className="flex items-center space-x-2">
                            <input
                              type="radio"
                              id={`parent-${attr._id}`}
                              name="parentAttribute"
                              checked={selectedParentAttribute === attr._id}
                              onChange={() => handleParentAttributeChange(attr._id)}
                              required
                            />
                            <Label htmlFor={`parent-${attr._id}`}>{attr.value}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label>Child Attributes</Label>
                      <div className="space-y-2">
                        {attributes.childAttributes.map((attr) => (
                          <div key={`child-attr-${attr._id}`} className="flex items-center space-x-2">
                            <input
                              type="radio"
                              id={`child-${attr._id}`}
                              name="childAttribute"
                              checked={selectedChildAttribute === attr._id}
                              onChange={() => handleChildAttributeChange(attr._id)}
                              disabled={!selectedParentAttribute}
                              required
                            />
                            <Label htmlFor={`child-${attr._id}`}>{attr.value}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="price">Price <span className="text-red-500">*</span></Label>
                  <Input
                    id="price"
                    type="number"
                    value={newVariant.sellPrice}
                    onChange={(e) => setNewVariant(prev => ({ ...prev, sellPrice: Number(e.target.value) }))}
                    min={0}
                    required
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => {
                    setIsAddFormOpen(false);
                    setNewVariant({
                      images: [{ url: '' }],
                      attributes: [],
                      sellPrice: 0
                    });
                    setSelectedParentAttribute(null);
                    setSelectedChildAttribute(null);
                    setError(null);
                  }}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    Add Variant
                  </Button>
                </div>
              </form>
            </div>
          )}

          {isEditFormOpen && selectedVariant && (
            <div className="border rounded-lg p-4 mb-4">
              <form onSubmit={handleUpdateVariant} className="space-y-4">
                <div>
                  <Label>Images <span className="text-red-500">*</span></Label>
                  <div className="space-y-2">
                    {newVariant.images.map((image, index) => (
                      <div key={`edit-image-${index}`} className="flex gap-2">
                        <Input
                          type="text"
                          value={image.url}
                          onChange={(e) => handleImageChange(index, e.target.value)}
                          placeholder="Image URL"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveImage(index)}
                          disabled={newVariant.images.length === 1}
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
                    >
                      Add Image
                    </Button>
                  </div>
                </div>

                <div>
                  <Label>Attributes <span className="text-red-500">*</span></Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Parent Attributes</Label>
                      <div className="space-y-2">
                        {attributes.parentAttributes.map((attr) => (
                          <div key={`edit-parent-attr-${attr._id}`} className="flex items-center space-x-2">
                            <input
                              type="radio"
                              id={`edit-parent-${attr._id}`}
                              name="parentAttribute"
                              checked={selectedParentAttribute === attr._id}
                              onChange={() => handleParentAttributeChange(attr._id)}
                              required
                            />
                            <Label htmlFor={`edit-parent-${attr._id}`}>{attr.value}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label>Child Attributes</Label>
                      <div className="space-y-2">
                        {attributes.childAttributes.map((attr) => (
                          <div key={`edit-child-attr-${attr._id}`} className="flex items-center space-x-2">
                            <input
                              type="radio"
                              id={`edit-child-${attr._id}`}
                              name="childAttribute"
                              checked={selectedChildAttribute === attr._id}
                              onChange={() => handleChildAttributeChange(attr._id)}
                              disabled={!selectedParentAttribute}
                              required
                            />
                            <Label htmlFor={`edit-child-${attr._id}`}>{attr.value}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="edit-price">Price <span className="text-red-500">*</span></Label>
                  <Input
                    id="edit-price"
                    type="number"
                    value={newVariant.sellPrice}
                    onChange={(e) => setNewVariant(prev => ({ ...prev, sellPrice: Number(e.target.value) }))}
                    min={0}
                    required
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => {
                    setIsEditFormOpen(false);
                    setSelectedVariant(null);
                    setNewVariant({
                      images: [{ url: '' }],
                      attributes: [],
                      sellPrice: 0
                    });
                    setSelectedParentAttribute(null);
                    setSelectedChildAttribute(null);
                    setError(null);
                  }}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    Update Variant
                  </Button>
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
                    <TableHead className="w-[120px]">Price</TableHead>
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
    description: ''
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
      setFormData({ name: '', description: '' });
      setSelectedParentCategory(null);
      setSelectedChildCategory(null);
      setSelectedGrandChildCategory(null);
      setCategorySets({});
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
        categories: categoryIds.map(categoryId => ({
          categoryId: categoryId
        }))
      };

      console.log('Sending data to create product:', submitData);
      
      const response = await request(() => api.post('/products', submitData));

      console.log('Response from server:', response);

      if (response.success) {
        onSave(response.data);
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-md">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="name">Name <span className="text-red-500">*</span></Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description <span className="text-red-500">*</span></Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-4">
            <div>
              <Label>Categories <span className="text-red-500">*</span></Label>
              <div className="grid grid-cols-3 gap-4 mt-2">
                <div>
                  <Label>Parent Category <span className="text-red-500">*</span></Label>
                  <div className="space-y-2">
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
                  <Label>Child Category <span className="text-red-500">*</span></Label>
                  <div className="space-y-2">
                    {selectedParentCategory && categorySets[selectedParentCategory]?.level2.map((category) => (
                      <div key={`child-${category._id}`} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id={`child-${category._id}`}
                          name="childCategory"
                          checked={selectedChildCategory === category._id}
                          onChange={() => handleChildCategoryChange(category._id)}
                          required
                        />
                        <Label htmlFor={`child-${category._id}`}>{category.name}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Grandchild Category <span className="text-red-500">*</span></Label>
                  <div className="space-y-2">
                    {selectedChildCategory && categorySets[selectedParentCategory!]?.level3.map((category) => (
                      <div key={`grandchild-${category._id}`} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id={`grandchild-${category._id}`}
                          name="grandchildCategory"
                          checked={selectedGrandChildCategory === category._id}
                          onChange={() => handleGrandChildCategoryChange(category._id)}
                          required
                        />
                        <Label htmlFor={`grandchild-${category._id}`}>{category.name}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Product'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

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

  const filteredProducts = products.filter(product =>
    product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchQuery.toLowerCase())
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
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Categories</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product, index) => (
                  <TableRow key={product._id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{product.name}</TableCell>
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
    </div>
  );
}
