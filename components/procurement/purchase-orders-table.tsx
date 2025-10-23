"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-context';
import { api, endpoints } from '@/lib/api-client-config';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import { getStatusColor } from '@/lib/utils/status-colors';
import SearchInput from '@/components/shared/SearchInput';
import Loading from '@/components/shared/Loading';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { 
  Search, 
  Eye, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Package,
  Loader2,
  ExternalLink,
  Edit,
  MoreHorizontal
} from 'lucide-react';

interface PurchaseOrder {
  _id: string;
  number: string;
  status: 'draft' | 'approved' | 'sent' | 'received' | 'completed' | 'cancelled';
  supplierId: {
    _id: string;
    name: string;
    email: string;
  };
  total: number;
  expectedDate?: string;
  receivedDate?: string;
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    receivedQuantity?: number;
  }>;
  notes?: string;
  createdAt: string;
}

interface PurchaseOrdersTableProps {
  companyId: string;
}


const statusIcons = {
  draft: Clock,
  approved: CheckCircle,
  sent: ExternalLink,
  received: Package,
  completed: CheckCircle,
  cancelled: XCircle,
};

export default function PurchaseOrdersTable() {
  const { company } = useAuth();
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isReceiving, setIsReceiving] = useState(false);
  const [isStatusUpdateOpen, setIsStatusUpdateOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<string>('');
  const [statusNotes, setStatusNotes] = useState<string>('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (company?.id) {
      fetchPurchaseOrders();
    }
  }, [company?.id]);

  const fetchPurchaseOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get(endpoints.procurement.purchaseOrders, {
        companyId: company?.id || '',
        limit: 1000
      });
      
      if (response.success) {
        setPurchaseOrders(response.data.purchaseOrders || []);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch purchase orders",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Failed to fetch purchase orders:', error);
      toast({
        title: "Error",
        description: "Failed to fetch purchase orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReceivePO = async (poId: string) => {
    try {
      setIsReceiving(true);
      const response = await api.post(`${endpoints.procurement.purchaseOrders}/${poId}/receive`, {
        performedBy: company?.id || 'system',
      });
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Purchase order marked as received successfully",
        });
        fetchPurchaseOrders(); // Refresh the list
        setIsDetailsOpen(false);
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to receive purchase order",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Failed to receive purchase order:', error);
      toast({
        title: "Error",
        description: "Failed to receive purchase order",
        variant: "destructive",
      });
    } finally {
      setIsReceiving(false);
    }
  };

  const handleStatusUpdate = async (poId: string) => {
    if (!newStatus) {
      toast({
        title: "Error",
        description: "Please select a status",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUpdatingStatus(true);
      const response = await api.put(`${endpoints.procurement.purchaseOrders}/${poId}/status`, {
        status: newStatus,
        notes: statusNotes,
      });
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Purchase order status updated successfully",
        });
        fetchPurchaseOrders(); // Refresh the list
        setIsStatusUpdateOpen(false);
        setNewStatus('');
        setStatusNotes('');
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to update purchase order status",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Failed to update purchase order status:', error);
      toast({
        title: "Error",
        description: "Failed to update purchase order status",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const openStatusUpdateDialog = (po: PurchaseOrder) => {
    setSelectedPO(po);
    setNewStatus(po.status);
    setStatusNotes(po.notes || '');
    setIsStatusUpdateOpen(true);
  };

  const filteredPOs = purchaseOrders.filter(po =>
    po.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    po.supplierId.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    po.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getStatusBadge = (status: string) => {
    const StatusIcon = statusIcons[status as keyof typeof statusIcons];
    return (
      <Badge className={getStatusColor(status)}>
        <StatusIcon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <SearchInput
          placeholder="Search purchase orders..."
          value={searchQuery}
          onChange={setSearchQuery}
        />
      </div>

      {/* Purchase Orders Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>PO Number</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Expected Date</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPOs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No purchase orders found
                </TableCell>
              </TableRow>
            ) : (
              filteredPOs.map((po) => (
                <TableRow key={po._id}>
                  <TableCell className="font-medium">
                    {po.number}
                  </TableCell>
                  <TableCell>{po.supplierId.name}</TableCell>
                  <TableCell>{getStatusBadge(po.status)}</TableCell>
                  <TableCell className="text-right font-mono">
{formatCurrency(po.total, 'JMD')}
                  </TableCell>
                  <TableCell>
                    {po.expectedDate ? format(new Date(po.expectedDate), 'MMM dd, yyyy') : '-'}
                  </TableCell>
                  <TableCell>
                    {format(new Date(po.createdAt), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => openStatusUpdateDialog(po)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Update Status
                      </Button>
                      <Dialog open={isDetailsOpen && selectedPO?._id === po._id} onOpenChange={(open) => {
                        setIsDetailsOpen(open);
                        if (open) setSelectedPO(po);
                        else setSelectedPO(null);
                      }}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Purchase Order Details</DialogTitle>
                            <DialogDescription>
                              {po.number} - {po.supplierId.name}
                            </DialogDescription>
                          </DialogHeader>
                          
                          {selectedPO && (
                            <div className="space-y-6">
                              {/* PO Header Info */}
                              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                                <div>
                                  <h4 className="font-medium">PO Information</h4>
                                  <p className="text-sm text-gray-600">Number: {selectedPO.number}</p>
                                  <p className="text-sm text-gray-600">Status: {selectedPO.status}</p>
                                  <p className="text-sm text-gray-600">Total: {formatCurrency(selectedPO.total, 'JMD')}</p>
                                </div>
                                <div>
                                  <h4 className="font-medium">Supplier</h4>
                                  <p className="text-sm text-gray-600">{selectedPO.supplierId.name}</p>
                                  <p className="text-sm text-gray-600">{selectedPO.supplierId.email}</p>
                                </div>
                              </div>

                              {/* Items Table */}
                              <div>
                                <h4 className="font-medium mb-3">Items</h4>
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Item</TableHead>
                                      <TableHead>Quantity</TableHead>
                                      <TableHead>Unit Price</TableHead>
                                      <TableHead>Total</TableHead>
                                      <TableHead>Received</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {selectedPO.items.map((item, index) => (
                                      <TableRow key={index}>
                                        <TableCell className="font-medium">{item.name}</TableCell>
                                        <TableCell>{item.quantity}</TableCell>
                                        <TableCell className="font-mono">${item.unitPrice.toFixed(2)}</TableCell>
                                        <TableCell className="font-mono">${item.lineTotal.toFixed(2)}</TableCell>
                                        <TableCell>
                                          {item.receivedQuantity || 0} / {item.quantity}
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>

                              {/* Notes */}
                              {selectedPO.notes && (
                                <div>
                                  <h4 className="font-medium mb-2">Notes</h4>
                                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                                    {selectedPO.notes}
                                  </p>
                                </div>
                              )}

                              {/* Actions */}
                              <div className="flex justify-end space-x-2">
                                {(selectedPO.status === 'sent' || selectedPO.status === 'approved') && (
                                  <Button
                                    onClick={() => handleReceivePO(selectedPO._id)}
                                    disabled={isReceiving}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    {isReceiving ? (
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                    )}
                                    Mark as Received
                                  </Button>
                                )}
                                <Button
                                  variant="outline"
                                  onClick={() => setIsDetailsOpen(false)}
                                >
                                  Close
                                </Button>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Status Update Dialog */}
      <Dialog open={isStatusUpdateOpen} onOpenChange={setIsStatusUpdateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Purchase Order Status</DialogTitle>
            <DialogDescription>
              Update the status for {selectedPO?.number}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="received">Received</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any notes about this status change..."
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsStatusUpdateOpen(false);
                setNewStatus('');
                setStatusNotes('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => selectedPO && handleStatusUpdate(selectedPO._id)}
              disabled={isUpdatingStatus || !newStatus}
            >
              {isUpdatingStatus ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Edit className="h-4 w-4 mr-2" />
              )}
              Update Status
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
