"use client";

import React, { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { useApi } from "../../../../utils/axios";
import { api } from "../../../../utils/axios";
import { Checkbox } from "@/components/ui/checkbox";

interface Attribute {
  _id: string;
  value: string;
  description?: string;
  parentId?: string | null;
  categories?: string[];
  children?: Attribute[];
}

interface Category {
  _id: string;
  name: string;
}

interface AttributeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (attr: Attribute) => void;
  attribute?: Attribute | null;
  categories: Category[];
  parentOptions: Attribute[];
}

function AttributeModal({ isOpen, onClose, onSave, attribute, categories, parentOptions }: AttributeModalProps) {
  const [formData, setFormData] = useState({
    value: attribute?.value || "",
    description: attribute?.description || "",
    parentId: attribute?.parentId || "",
    categories: attribute?.categories || [],
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitRef = useRef(false);
  const { request } = useApi();

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        value: attribute?.value || "",
        description: attribute?.description || "",
        parentId: attribute?.parentId || "",
        categories: attribute?.categories || [],
      });
      setError(null);
      setIsSubmitting(false);
      submitRef.current = false;
    }
  }, [isOpen, attribute]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitRef.current) return;
    submitRef.current = true;
    setError(null);
    setIsSubmitting(true);
    try {
      if (!formData.value) throw new Error("Value is required");
      const payload = {
        value: formData.value,
        description: formData.description,
        parentId: formData.parentId || null,
        categories: formData.categories,
      };
      let response;
      if (attribute?._id) {
        response = await request(() => api.put(`/attributes/${attribute._id}`, payload));
      } else {
        response = await request(() => api.post(`/attributes`, payload));
      }
      if (response.success) {
        onSave(response.data);
        onClose();
      } else {
        throw new Error(response.message || "Failed to save attribute");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
      submitRef.current = false;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{attribute ? "Edit Attribute" : "Add Attribute"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-md">{error}</div>}
          <div className="space-y-2">
            <Label htmlFor="value">Value <span className="text-red-500">*</span></Label>
            <Input id="value" value={formData.value} onChange={e => setFormData(f => ({ ...f, value: e.target.value }))} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={formData.description} onChange={e => setFormData(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="parentId">Parent Attribute</Label>
            <Select value={formData.parentId || "none"} onValueChange={val => setFormData(f => ({ ...f, parentId: val === "none" ? "" : val }))}>
              <SelectTrigger>
                <SelectValue placeholder="No parent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No parent</SelectItem>
                {parentOptions.filter(opt => !attribute || opt._id !== attribute._id).map(opt => (
                  <SelectItem key={opt._id} value={opt._id}>{opt.value}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Categories</Label>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <label key={cat._id} className="flex items-center gap-2">
                  <Checkbox
                    checked={formData.categories.includes(cat._id)}
                    onChange={e => {
                      const checked = e.target.checked;
                      setFormData(f => {
                        if (checked) {
                          return { ...f, categories: [...f.categories, cat._id] };
                        } else {
                          return { ...f, categories: f.categories.filter(id => id !== cat._id) };
                        }
                      });
                    }}
                  />
                  <span>{cat.name}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function AttributePage() {
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAttribute, setSelectedAttribute] = useState<Attribute | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [attributeToDelete, setAttributeToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const { request } = useApi();

  // Fetch categories and attributes tree
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [catRes, attrRes] = await Promise.all([
          request(() => api.get("/categories/parent")),
          request(() => api.get("/attributes/tree")),
        ]);
        if (catRes.success) setCategories(catRes.data);
        if (attrRes.success) setAttributes(attrRes.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const refreshAttributes = async () => {
    const attrRes = await request(() => api.get("/attributes/tree"));
    if (attrRes.success) setAttributes(attrRes.data);
  };

  const handleEdit = (attr: Attribute) => {
    setSelectedAttribute(attr);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedAttribute(null);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    await refreshAttributes();
    setIsModalOpen(false);
    setSelectedAttribute(null);
    setError(null);
  };

  const handleDelete = (id: string) => {
    setAttributeToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!attributeToDelete) return;
    setIsDeleting(true);
    try {
      const res = await request(() => api.delete(`/attributes/${attributeToDelete}`));
      if (res.success) {
        await refreshAttributes();
        setIsDeleteDialogOpen(false);
        setAttributeToDelete(null);
        setError(null);
      } else {
        throw new Error(res.message || "Failed to delete attribute");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  // Flatten all attributes for parent select
  const flattenAttributes = (attrs: Attribute[], arr: Attribute[] = []) => {
    for (const attr of attrs) {
      arr.push(attr);
      if (attr.children && attr.children.length > 0) flattenAttributes(attr.children, arr);
    }
    return arr;
  };

  // Filtered attributes
  const filterAttributes = (attrs: Attribute[]): Attribute[] => {
    return attrs.filter(attr =>
      attr.value.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (attr.description || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  // Toggle expand/collapse for attribute tree
  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Render tree row
  const renderAttributeRow = (attr: Attribute, level: number = 0): React.ReactElement => {
    const hasChildren = attr.children && attr.children.length > 0;
    const expanded = expandedIds.has(attr._id);
    return (
      <React.Fragment key={attr._id}>
        <TableRow>
          <TableCell>
            <div className="flex items-center gap-2" style={{ paddingLeft: `${level * 20}px` }}>
              {hasChildren && (
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => toggleExpand(attr._id)}>
                  {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
              )}
              {attr.value}
            </div>
          </TableCell>
          <TableCell>{attr.description}</TableCell>
          <TableCell>{attr.categories?.map(cid => categories.find(c => c._id === cid)?.name).filter(Boolean).join(", ")}</TableCell>
          <TableCell className="text-right">
            <div className="flex items-center justify-end space-x-2">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Edit" onClick={() => handleEdit(attr)}><Edit className="h-4 w-4" /></Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50" title="Delete" onClick={() => handleDelete(attr._id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </TableCell>
        </TableRow>
        {expanded && hasChildren && attr.children!.map(child => renderAttributeRow(child, level + 1))}
      </React.Fragment>
    );
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Attribute Management</CardTitle>
            <Button onClick={handleAdd}>Add Attribute</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <Input placeholder="Search attributes..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="max-w-sm" />
          </div>
          {loading ? (
            <div>Loading...</div>
          ) : error ? (
            <div className="text-red-500">Error: {error}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Value</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Categories</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filterAttributes(attributes).map(attr => renderAttributeRow(attr))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      <AttributeModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedAttribute(null); setError(null); }}
        onSave={handleSave}
        attribute={selectedAttribute}
        categories={categories}
        parentOptions={flattenAttributes(attributes)}
      />
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Attribute</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete this attribute? This action cannot be undone.</p>
            {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => { setIsDeleteDialogOpen(false); setAttributeToDelete(null); setError(null); }} disabled={isDeleting}>Cancel</Button>
            <Button type="button" variant="destructive" onClick={confirmDelete} disabled={isDeleting}>{isDeleting ? "Deleting..." : "Delete"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 