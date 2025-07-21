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
import { useLanguage } from '@/context/LanguageContext';
import viConfig from '../../../../utils/petPagesConfig.vi';
import enConfig from '../../../../utils/petPagesConfig.en';

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

function AttributeModal({ isOpen, onClose, onSave, attribute, categories, parentOptions, config }: AttributeModalProps & { config: any }) {
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
          <DialogTitle>{attribute ? config.editTitle : config.form.add}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-md">{error}</div>}
          <div className="space-y-2">
            <Label htmlFor="value">{config.form.value} <span className="text-red-500">*</span></Label>
            <Input id="value" value={formData.value} onChange={e => setFormData(f => ({ ...f, value: e.target.value }))} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">{config.form.description}</Label>
            <Textarea id="description" value={formData.description} onChange={e => setFormData(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="parentId">{config.form.parent}</Label>
            <Select value={formData.parentId || "none"} onValueChange={val => setFormData(f => ({ ...f, parentId: val === "none" ? "" : val }))}>
              <SelectTrigger>
                <SelectValue placeholder={config.form.noParent} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{config.form.noParent}</SelectItem>
                {parentOptions.filter(opt => !attribute || opt._id !== attribute._id).map(opt => (
                  <SelectItem key={opt._id} value={opt._id}>{opt.value}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{config.form.categories}</Label>
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
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>{config.form.cancel}</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? config.form.saving : config.form.save}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface AddAttributeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (attr: Attribute) => void;
  parentId?: string | null;
  categories: Category[];
  parentOptions: Attribute[];
}

function AddAttributeModal({ isOpen, onClose, onSave, parentId, categories, parentOptions, config }: AddAttributeModalProps & { config: any }) {
  const [formData, setFormData] = useState({
    value: '',
    description: '',
    parentId: parentId || '',
    categories: [] as string[],
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitRef = useRef(false);
  const { request } = useApi();

  useEffect(() => {
    if (!isOpen) {
      setFormData({ value: '', description: '', parentId: parentId || '', categories: [] });
      setError(null);
      setIsSubmitting(false);
      submitRef.current = false;
    }
  }, [isOpen, parentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitRef.current) return;
    submitRef.current = true;
    setError(null);
    setIsSubmitting(true);
    try {
      if (!formData.value) throw new Error('Value is required');
      const payload = {
        value: formData.value,
        description: formData.description,
        parentId: formData.parentId || null,
        categories: formData.categories,
      };
      const response = await request(() => api.post(`/attributes`, payload));
      if (response.success) {
        onSave(response.data);
        onClose();
      } else {
        throw new Error(response.message || 'Failed to save attribute');
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
          <DialogTitle>{config.form.add}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-md">{error}</div>}
          <div className="space-y-2">
            <Label htmlFor="value">{config.form.value} <span className="text-red-500">*</span></Label>
            <Input id="value" value={formData.value} onChange={e => setFormData(f => ({ ...f, value: e.target.value }))} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">{config.form.description}</Label>
            <Textarea id="description" value={formData.description} onChange={e => setFormData(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="parentId">{config.form.parent}</Label>
            <Select value={formData.parentId || 'none'} onValueChange={val => setFormData(f => ({ ...f, parentId: val === 'none' ? '' : val }))}>
              <SelectTrigger>
                <SelectValue placeholder={config.form.noParent} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{config.form.noParent}</SelectItem>
                {parentOptions.map(opt => (
                  <SelectItem key={opt._id} value={opt._id}>{opt.value}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{config.form.categories}</Label>
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
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>{config.form.cancel}</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? config.form.saving : config.form.add}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface EditAttributeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (attr: Attribute) => void;
  attribute: Attribute;
  categories: Category[];
  parentOptions: Attribute[];
}

function EditAttributeModal({ isOpen, onClose, onSave, attribute, categories, parentOptions, config }: EditAttributeModalProps & { config: any }) {
  const [formData, setFormData] = useState({
    value: attribute?.value || '',
    description: attribute?.description || '',
    parentId: attribute?.parentId || '',
    categories: attribute?.categories || [],
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitRef = useRef(false);
  const { request } = useApi();

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        value: attribute?.value || '',
        description: attribute?.description || '',
        parentId: attribute?.parentId || '',
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
      if (!formData.value) throw new Error('Value is required');
      const payload = {
        value: formData.value,
        description: formData.description,
        parentId: formData.parentId || null,
        categories: formData.categories,
      };
      const response = await request(() => api.put(`/attributes/${attribute._id}`, payload));
      if (response.success) {
        onSave(response.data);
        onClose();
      } else {
        throw new Error(response.message || 'Failed to save attribute');
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
          <DialogTitle>{config.editTitle}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-md">{error}</div>}
          <div className="space-y-2">
            <Label htmlFor="value">{config.form.value} <span className="text-red-500">*</span></Label>
            <Input id="value" value={formData.value} onChange={e => setFormData(f => ({ ...f, value: e.target.value }))} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">{config.form.description}</Label>
            <Textarea id="description" value={formData.description} onChange={e => setFormData(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="parentId">{config.form.parent}</Label>
            <Select value={formData.parentId || 'none'} onValueChange={val => setFormData(f => ({ ...f, parentId: val === 'none' ? '' : val }))}>
              <SelectTrigger>
                <SelectValue placeholder={config.form.noParent} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{config.form.noParent}</SelectItem>
                {parentOptions.filter(opt => opt._id !== attribute._id).map(opt => (
                  <SelectItem key={opt._id} value={opt._id}>{opt.value}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{config.form.categories}</Label>
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
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>{config.form.cancel}</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? config.form.saving : config.form.save}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface ChildAttributeModalProps {
  parent: Attribute;
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  parentOptions: Attribute[];
  config: any;
}

function ChildAttributeModal({ parent, isOpen, onClose, categories, parentOptions, config }: ChildAttributeModalProps) {
  const [children, setChildren] = useState<Attribute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAttribute, setSelectedAttribute] = useState<Attribute | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [attributeToDelete, setAttributeToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { request } = useApi();

  const fetchChildren = async () => {
    setLoading(true);
    try {
      const res = await request(() => api.get(`/attributes?parentId=${parent._id}`));
      if (res.success) setChildren(res.data);
      else throw new Error(res.message || 'Failed to fetch child attributes');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) fetchChildren();
  }, [isOpen, parent._id]);

  const handleAdd = () => {
    setIsAddModalOpen(true);
  };
  const handleEdit = (attr: Attribute) => {
    setSelectedAttribute(attr);
    setIsEditModalOpen(true);
  };
  const handleSave = async () => {
    await fetchChildren();
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
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
        await fetchChildren();
        setIsDeleteDialogOpen(false);
        setAttributeToDelete(null);
        setError(null);
      } else {
        throw new Error(res.message || 'Failed to delete attribute');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Child Attributes of: {parent.value}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 overflow-y-auto max-h-[calc(90vh-8rem)] pr-2">
          <div className="flex justify-between items-center">
            <Button type="button" onClick={handleAdd} className="mb-4">{config.child.addChildButton}</Button>
          </div>
          {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-md">{error}</div>}
          {loading ? (
            <div>{config.child.loading}</div>
          ) : children.length === 0 ? (
            <div className="text-center py-4">{config.child.noChild}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{config.table.headers.value}</TableHead>
                  <TableHead>{config.table.headers.description}</TableHead>
                  <TableHead>{config.table.headers.categories}</TableHead>
                  <TableHead className="text-right">{config.table.headers.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {children.map(attr => (
                  <TableRow key={attr._id}>
                    <TableCell>{attr.value}</TableCell>
                    <TableCell>{attr.description}</TableCell>
                    <TableCell>{attr.categories?.map(cid => categories.find(c => c._id === cid)?.name).filter(Boolean).join(', ')}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title={config.child.add} onClick={() => handleEdit(attr)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50" title={config.deleteTitle} onClick={() => handleDelete(attr._id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          <div className="flex justify-end gap-2 sticky bottom-0 bg-white pt-2">
            <Button type="button" variant="outline" onClick={onClose}>{config.close}</Button>
          </div>
        </div>
        <AddAttributeModal
          isOpen={isAddModalOpen}
          onClose={() => { setIsAddModalOpen(false); setError(null); }}
          onSave={handleSave}
          parentId={parent._id}
          categories={categories}
          parentOptions={parentOptions}
          config={config}
        />
        {selectedAttribute && (
          <EditAttributeModal
            isOpen={isEditModalOpen}
            onClose={() => { setIsEditModalOpen(false); setSelectedAttribute(null); setError(null); }}
            onSave={handleSave}
            attribute={selectedAttribute}
            categories={categories}
            parentOptions={parentOptions}
            config={config}
          />
        )}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{config.deleteTitle}</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p>{config.deleteConfirm}</p>
              {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => { setIsDeleteDialogOpen(false); setAttributeToDelete(null); setError(null); }} disabled={isDeleting}>{config.form.cancel}</Button>
              <Button type="button" variant="destructive" onClick={confirmDelete} disabled={isDeleting}>{isDeleting ? config.deleting : config.delete}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}

export default function AttributePage() {
  const { lang } = useLanguage();
  const config = lang === 'vi' ? viConfig.manageAttribute : enConfig.manageAttribute;
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAttribute, setSelectedAttribute] = useState<Attribute | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [attributeToDelete, setAttributeToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isChildModalOpen, setIsChildModalOpen] = useState(false);
  const [parentForChildModal, setParentForChildModal] = useState<Attribute | null>(null);
  const { request } = useApi();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [catRes, attrRes] = await Promise.all([
          request(() => api.get("/categories/parent")),
          request(() => api.get("/attributes?parentId=null")),
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
    const attrRes = await request(() => api.get("/attributes?parentId=null"));
    if (attrRes.success) setAttributes(attrRes.data);
  };

  const handleAdd = () => {
    setIsAddModalOpen(true);
  };
  const handleEdit = (attr: Attribute) => {
    setSelectedAttribute(attr);
    setIsEditModalOpen(true);
  };
  const handleSave = async () => {
    await refreshAttributes();
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
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
  const handleShowChildren = (attr: Attribute) => {
    setParentForChildModal(attr);
    setIsChildModalOpen(true);
  };

  // Filtered attributes (only cha)
  const filteredAttributes = attributes.filter(attr =>
    attr.value.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (attr.description || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Flatten all attributes for parent select
  const flattenAttributes = (attrs: Attribute[], arr: Attribute[] = []) => {
    for (const attr of attrs) {
      arr.push(attr);
    }
    return arr;
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{config.title}</CardTitle>
            <Button onClick={handleAdd}>{config.addNewButton}</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <Input placeholder={config.search.placeholder} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="max-w-sm" />
          </div>
          {loading ? (
            <div>Loading...</div>
          ) : error ? (
            <div className="text-red-500">Error: {error}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{config.table.headers.value}</TableHead>
                  <TableHead>{config.table.headers.description}</TableHead>
                  <TableHead>{config.table.headers.categories}</TableHead>
                  <TableHead className="text-right">{config.table.headers.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAttributes.map(attr => (
                  <TableRow key={attr._id}>
                    <TableCell>{attr.value}</TableCell>
                    <TableCell>{attr.description}</TableCell>
                    <TableCell>{attr.categories?.map(cid => categories.find(c => c._id === cid)?.name).filter(Boolean).join(", ")}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title={config.child.add} onClick={() => handleShowChildren(attr)}><ChevronRight className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title={config.editTitle} onClick={() => handleEdit(attr)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50" title={config.deleteTitle} onClick={() => handleDelete(attr._id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      <AddAttributeModal
        isOpen={isAddModalOpen}
        onClose={() => { setIsAddModalOpen(false); setError(null); }}
        onSave={handleSave}
        categories={categories}
        parentOptions={flattenAttributes(attributes)}
        config={config}
      />
      {selectedAttribute && (
        <EditAttributeModal
          isOpen={isEditModalOpen}
          onClose={() => { setIsEditModalOpen(false); setSelectedAttribute(null); setError(null); }}
          onSave={handleSave}
          attribute={selectedAttribute}
          categories={categories}
          parentOptions={flattenAttributes(attributes)}
          config={config}
        />
      )}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{config.deleteTitle}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>{config.deleteConfirm}</p>
            {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => { setIsDeleteDialogOpen(false); setAttributeToDelete(null); setError(null); }} disabled={isDeleting}>{config.form.cancel}</Button>
            <Button type="button" variant="destructive" onClick={confirmDelete} disabled={isDeleting}>{isDeleting ? config.deleting : config.delete}</Button>
          </div>
        </DialogContent>
      </Dialog>
      {parentForChildModal && (
        <ChildAttributeModal
          parent={parentForChildModal}
          isOpen={isChildModalOpen}
          onClose={() => { setIsChildModalOpen(false); setParentForChildModal(null); }}
          categories={categories}
          parentOptions={flattenAttributes(attributes)}
          config={config}
        />
      )}
    </div>
  );
};