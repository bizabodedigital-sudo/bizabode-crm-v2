"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { 
  Search, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Calendar,
  User,
  FileText,
  Loader2,
  Filter
} from "lucide-react";

interface LeaveRequest {
  _id: string;
  employeeId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  leaveType: 'sick' | 'vacation' | 'personal' | 'maternity' | 'paternity' | 'bereavement' | 'other';
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  approvedAt?: string;
  rejectionReason?: string;
  createdAt: string;
}

export default function LeaveApprovalsPage() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [leaveTypeFilter, setLeaveTypeFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const fetchLeaveRequests = async () => {
    try {
      setIsLoading(true);
      const companyId = localStorage.getItem('companyId') || '68f5bc2cf855b93078938f4e';
      const response = await fetch(`/api/hr/leave-requests?companyId=${companyId}&limit=1000`);
      const data = await response.json();
      
      if (data.success) {
        setLeaveRequests(data.data.leaveRequests || []);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch leave requests",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Failed to fetch leave requests:', error);
      toast({
        title: "Error",
        description: "Failed to fetch leave requests",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproval = async (requestId: string, action: 'approve' | 'reject') => {
    try {
      setIsProcessing(true);
      const approvedBy = localStorage.getItem('userId') || '68f5bc2cf855b93078938f4e';
      
      const response = await fetch(`/api/hr/leave-requests/${requestId}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          approvedBy,
          rejectionReason: action === 'reject' ? rejectionReason : undefined,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Success",
          description: `Leave request ${action}d successfully`,
        });
        fetchLeaveRequests();
        setIsApprovalDialogOpen(false);
        setSelectedRequest(null);
        setRejectionReason("");
      } else {
        toast({
          title: "Error",
          description: data.error || `Failed to ${action} leave request`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(`Failed to ${action} leave request:`, error);
      toast({
        title: "Error",
        description: `Failed to ${action} leave request`,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredRequests = leaveRequests.filter(request => {
    const matchesSearch = 
      (request.employeeId?.firstName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (request.employeeId?.lastName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (request.reason || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || request.status === statusFilter;
    const matchesType = leaveTypeFilter === "all" || request.leaveType === leaveTypeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
      approved: { color: "bg-green-100 text-green-800", icon: CheckCircle },
      rejected: { color: "bg-red-100 text-red-800", icon: XCircle },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getLeaveTypeColor = (type: string) => {
    const colors = {
      sick: "bg-red-100 text-red-800",
      vacation: "bg-blue-100 text-blue-800",
      personal: "bg-purple-100 text-purple-800",
      maternity: "bg-pink-100 text-pink-800",
      paternity: "bg-indigo-100 text-indigo-800",
      bereavement: "bg-gray-100 text-gray-800",
      other: "bg-orange-100 text-orange-800",
    };
    return colors[type as keyof typeof colors] || colors.other;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading leave requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Leave Request Approvals</h1>
        <p className="text-muted-foreground">
          Review and approve employee leave requests
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {leaveRequests.filter(r => r.status === 'pending').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Approved This Month</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {leaveRequests.filter(r => r.status === 'approved').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leaveRequests.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by employee name or reason..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Select value={leaveTypeFilter} onValueChange={setLeaveTypeFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="sick">Sick Leave</SelectItem>
            <SelectItem value="vacation">Vacation</SelectItem>
            <SelectItem value="personal">Personal</SelectItem>
            <SelectItem value="maternity">Maternity</SelectItem>
            <SelectItem value="paternity">Paternity</SelectItem>
            <SelectItem value="bereavement">Bereavement</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Leave Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Leave Requests</CardTitle>
          <CardDescription>
            Review and approve employee leave requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Leave Type</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No leave requests found
                  </TableCell>
                </TableRow>
              ) : (
                filteredRequests.map((request) => (
                  <TableRow key={request._id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {request.employeeId?.firstName || 'Unknown'} {request.employeeId?.lastName || 'Employee'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {request.employeeId?.email || 'No email'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getLeaveTypeColor(request.leaveType)}>
                        {request.leaveType.charAt(0).toUpperCase() + request.leaveType.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {format(new Date(request.startDate), 'MMM dd, yyyy')} - {format(new Date(request.endDate), 'MMM dd, yyyy')}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {request.totalDays} day{request.totalDays !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="truncate" title={request.reason}>
                        {request.reason}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell>
                      {request.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedRequest(request);
                              setIsApprovalDialogOpen(true);
                            }}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Review
                          </Button>
                        </div>
                      )}
                      {request.status !== 'pending' && (
                        <div className="text-sm text-muted-foreground">
                          {request.approvedBy && (
                            <div>By: {request.approvedBy.firstName} {request.approvedBy.lastName}</div>
                          )}
                          {request.approvedAt && (
                            <div>{format(new Date(request.approvedAt), 'MMM dd, yyyy')}</div>
                          )}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Approval Dialog */}
      <Dialog open={isApprovalDialogOpen} onOpenChange={setIsApprovalDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Leave Request</DialogTitle>
            <DialogDescription>
              Review the leave request details and approve or reject
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-6">
              {/* Request Details */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium">Employee</h4>
                  <p className="text-sm text-gray-600">
                    {selectedRequest.employeeId?.firstName || 'Unknown'} {selectedRequest.employeeId?.lastName || 'Employee'}
                  </p>
                  <p className="text-sm text-gray-600">{selectedRequest.employeeId?.email || 'No email'}</p>
                </div>
                <div>
                  <h4 className="font-medium">Leave Type</h4>
                  <Badge className={getLeaveTypeColor(selectedRequest.leaveType)}>
                    {selectedRequest.leaveType.charAt(0).toUpperCase() + selectedRequest.leaveType.slice(1)}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-medium">Duration</h4>
                  <p className="text-sm text-gray-600">
                    {format(new Date(selectedRequest.startDate), 'MMM dd, yyyy')} - {format(new Date(selectedRequest.endDate), 'MMM dd, yyyy')}
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedRequest.totalDays} day{selectedRequest.totalDays !== 1 ? 's' : ''}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">Requested</h4>
                  <p className="text-sm text-gray-600">
                    {format(new Date(selectedRequest.createdAt), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>

              {/* Reason */}
              <div>
                <h4 className="font-medium mb-2">Reason</h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                  {selectedRequest.reason}
                </p>
              </div>

              {/* Rejection Reason */}
              <div>
                <Label htmlFor="rejectionReason">Rejection Reason (if rejecting)</Label>
                <Textarea
                  id="rejectionReason"
                  placeholder="Enter reason for rejection..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsApprovalDialogOpen(false);
                    setSelectedRequest(null);
                    setRejectionReason("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleApproval(selectedRequest._id, 'reject')}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <XCircle className="h-4 w-4 mr-2" />
                  )}
                  Reject
                </Button>
                <Button
                  onClick={() => handleApproval(selectedRequest._id, 'approve')}
                  disabled={isProcessing}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Approve
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
