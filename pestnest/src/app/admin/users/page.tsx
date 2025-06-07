'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react";
import { api } from "../../../../utils/axios";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Edit, Eye, Trash2 } from "lucide-react";
import NextImage from "next/image";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@radix-ui/react-separator";

export interface Address {
  _id?: string; // MongoDB sẽ tự tạo nếu không chỉ định
  street: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
}

export interface User {
  _id?: string;
  name: string;
  address: Address[];
  email: string;
  password: string;
  phone?: string;
  dob?: Date;
  role: number; // sử dụng bitmask roles như đã nói
  verified: boolean;
  verificationToken?: string;
  verificationTokenExpires?: Date;
  googleId?: string;
  avatar?: string;
  createdAt?: Date;
  updatedAt?: Date;
}


const getRoleBadge = (role: number) => {
  const colors = {
    1: "bg-red-100 text-red-800",
    2: "bg-blue-100 text-blue-800",
    4: "bg-green-100 text-green-800",
    8: "bg-yellow-100 text-yellow-800",
    16: "bg-purple-100 text-purple-800",
    32: "bg-orange-100 text-orange-800",
    64: "bg-pink-100 text-pink-800",
    128: "bg-gray-100 text-gray-800",
  } as const

  return <Badge className={colors[role as keyof typeof colors] || "bg-gray-100 text-gray-800"}>{role === 1 ? 'Customer' : role === 2 ? 'Order Manager' : role === 4 ? 'Marketing Manager' : role === 8 ? 'Warehouse Staff' : role === 16 ? 'Customer Service' : 'Admin Developer'}</Badge>
}
interface UserFormProps {
  user?: User;
  onSubmit: (data: Omit<User, '_id'>) => void;
  isOpen: boolean;
  onClose: () => void;
}

function UserForm({ user, onSubmit, isOpen, onClose }: UserFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    dob: '',
    role: 0,
    verified: false,
    address: [{
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: ''
    }]
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: user.password || '',
        phone: user.phone || '',
        dob: user.dob ? new Date(user.dob).toISOString().split('T')[0] : '',
        role: user.role || 0,
        verified: user.verified || false,
        address: user.address.map(addr => ({
          street: addr.street || '',
          city: addr.city || '',
          state: addr.state || '',
          postalCode: addr.postalCode || '',
          country: addr.country || ''
        }))
      });
    }
  }, [user]);

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      phone: '',
      dob: '',
      role: 0,
      verified: false,
      address: [{
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: ''
      }]
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userData: Omit<User, '_id'> = {
        ...formData,
        dob: formData.dob ? new Date(formData.dob) : undefined
      };
      await onSubmit(userData);
      onClose();
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="xl:max-w-[1000px] w-full max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{user ? 'Edit User' : 'Add New User'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name <span className="text-red-500">*</span></Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          </div>

          {!user && (
            <div className="space-y-2">
              <Label htmlFor="password">Password <span className="text-red-500">*</span></Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required={!user}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth</Label>
              <Input
                id="dob"
                type="date"
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role <span className="text-red-500">*</span></Label>
            <Select
              value={formData.role.toString()}
              onValueChange={(value) => setFormData({ ...formData, role: parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Admin Developer</SelectItem>
                <SelectItem value="1">Customer</SelectItem>
                <SelectItem value="2">Order Manager</SelectItem>
                <SelectItem value="3">Marketing Manager</SelectItem>
                <SelectItem value="4">Warehouse Staff</SelectItem>
                <SelectItem value="8">Customer Service</SelectItem>
                <SelectItem value="16">Admin Business</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Address</Label>
            {formData.address.map((address, index) => (
              <div key={index} className="relative grid grid-cols-2 gap-4 p-4 border rounded-lg">
                {/* Remove button on top-right corner */}
                <button
                  type="button"
                  onClick={() => {
                    const updatedAddress = [...formData.address];
                    updatedAddress.splice(index, 1); // remove 1 item at index
                    setFormData({ ...formData, address: updatedAddress });
                  }}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-sm"
                >
                  ✕
                </button>

                <div className="space-y-2">
                  <Label>Street</Label>
                  <Input
                    value={address.street}
                    onChange={(e) => {
                      const newAddress = [...formData.address];
                      newAddress[index] = { ...address, street: e.target.value };
                      setFormData({ ...formData, address: newAddress });
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input
                    value={address.city}
                    onChange={(e) => {
                      const newAddress = [...formData.address];
                      newAddress[index] = { ...address, city: e.target.value };
                      setFormData({ ...formData, address: newAddress });
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label>State</Label>
                  <Input
                    value={address.state}
                    onChange={(e) => {
                      const newAddress = [...formData.address];
                      newAddress[index] = { ...address, state: e.target.value };
                      setFormData({ ...formData, address: newAddress });
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Postal Code</Label>
                  <Input
                    value={address.postalCode}
                    onChange={(e) => {
                      const newAddress = [...formData.address];
                      newAddress[index] = { ...address, postalCode: e.target.value };
                      setFormData({ ...formData, address: newAddress });
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Country</Label>
                  <Input
                    value={address.country}
                    onChange={(e) => {
                      const newAddress = [...formData.address];
                      newAddress[index] = { ...address, country: e.target.value };
                      setFormData({ ...formData, address: newAddress });
                    }}
                  />
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={() => setFormData({
                ...formData,
                address: [...formData.address, {
                  street: '',
                  city: '',
                  state: '',
                  postalCode: '',
                  country: ''
                }]
              })}
            >
              Add Another Address
            </Button>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">
              {user ? 'Save Changes' : 'Add User'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Component chính
export default function UserPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await api.get('/users');
      console.log(data.data);
      setUsers(data.data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (data: Omit<User, '_id'>) => {
    try {
      const response = await api.post('/users', data);
      if (response.data && response.data.data) {
        setUsers([...users, response.data.data]);
      } else {
        setUsers([...users, response.data]);
      }
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const handleEditUser = async (data: Omit<User, '_id'>) => {
    if (!selectedUser) return;
    try {
      const response = await api.put(`/users/${selectedUser._id}`, data);
      setUsers(users.map(user =>
        user._id === selectedUser._id ? response.data.data : user
      ));
      fetchUsers();
      setIsFormOpen(false);
      setSelectedUser(undefined);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      await api.delete(`/users/${id}`);
      setUsers(users.filter(user => user._id !== id));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleViewDetail = (user: User) => {
    setSelectedUser(user);
    setIsDetailOpen(true);
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>User Management</CardTitle>
            <Button onClick={() => {
              setSelectedUser(undefined);
              setIsFormOpen(true);
            }}>Add New User</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <Input
              placeholder="Search users..."
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
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedUsers.map((user, index) => (
                  <TableRow key={user._id}>
                    <TableCell>{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>

                    <TableCell>
                      <Badge variant={user.verified ? 'default' : 'secondary'}>
                        {user.verified ? 'Verified' : 'Unverified'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          title="View Details"
                          onClick={() => handleViewDetail(user)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          title="Edit User"
                          onClick={() => {
                            setSelectedUser(user);
                            setIsFormOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          title="Delete User"
                          onClick={() => handleDeleteUser(user._id!)}
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

      <UserForm
        user={selectedUser}
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedUser(undefined);
        }}
        onSubmit={selectedUser ? handleEditUser : handleAddUser}
      />

      <Dialog open={isDetailOpen} onOpenChange={() => setIsDetailOpen(false)}>
        <DialogContent className="xl:max-w-[1000px] w-full max-h-screen overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 mb-6">
                <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200">
                  {selectedUser.avatar ? (
                    <NextImage
                      src={selectedUser.avatar}
                      alt={selectedUser.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-2xl font-bold text-gray-400">
                      {selectedUser.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-2xl font-bold">{selectedUser.name}</h3>
                  <p className="text-gray-500">{selectedUser.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <p className="text-lg font-medium">{selectedUser.phone || 'N/A'}</p>
                </div>
                <div className="space-y-2">
                  <Label>Date of Birth</Label>
                  <p className="text-lg font-medium">
                    {selectedUser.dob ? new Date(selectedUser.dob).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <div>{getRoleBadge(selectedUser.role)}</div>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Badge variant={selectedUser.verified ? 'default' : 'secondary'}>
                    {selectedUser.verified ? 'Verified' : 'Unverified'}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Addresses</Label>
                {selectedUser.address.map((addr, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-2">
                    <p><strong>Street:</strong> {addr.street}</p>
                    <p><strong>City:</strong> {addr.city}</p>
                    <p><strong>State:</strong> {addr.state || 'N/A'}</p>
                    <p><strong>Postal Code:</strong> {addr.postalCode}</p>
                    <p><strong>Country:</strong> {addr.country}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Label>Account Information</Label>
                <p><strong>Created At:</strong> {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleString() : 'N/A'}</p>
                <p><strong>Last Updated:</strong> {selectedUser.updatedAt ? new Date(selectedUser.updatedAt).toLocaleString() : 'N/A'}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <Pagination 
        filteredUsers={filteredUsers}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        setItemsPerPage={setItemsPerPage}
        setCurrentPage={setCurrentPage}
      />
    </div>
  );
}
interface PaginationProps {
  filteredUsers: User[];
  itemsPerPage: number;
  currentPage: number;
  setItemsPerPage: (value: number) => void;
  setCurrentPage: (value: number) => void;
}
function Pagination({ filteredUsers, itemsPerPage, currentPage, setItemsPerPage, setCurrentPage }: PaginationProps) {
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

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