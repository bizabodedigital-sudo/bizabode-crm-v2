"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";
import { 
  Search, 
  Calendar,
  Clock,
  User,
  Download,
  Filter,
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle
} from "lucide-react";

interface AttendanceRecord {
  _id: string;
  employeeId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    department: string;
  };
  date: string;
  timeIn?: string;
  timeOut?: string;
  status: 'present' | 'absent' | 'late' | 'sick' | 'vacation';
  hoursWorked?: number;
  notes?: string;
}

interface AttendanceSummary {
  employeeId: string;
  employeeName: string;
  department: string;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  sickDays: number;
  vacationDays: number;
  totalHours: number;
  averageHoursPerDay: number;
}

export default function AttendanceSummaryPage() {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [attendanceSummary, setAttendanceSummary] = useState<AttendanceSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [dateRange, setDateRange] = useState("current-month");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'summary' | 'calendar' | 'detailed'>('summary');
  const { toast } = useToast();

  useEffect(() => {
    fetchAttendanceData();
  }, [dateRange, selectedDate]);

  const fetchAttendanceData = async () => {
    try {
      setIsLoading(true);
      const companyId = localStorage.getItem('companyId') || '68f5bc2cf855b93078938f4e';
      
      // Calculate date range
      let startDate, endDate;
      if (dateRange === 'current-month') {
        startDate = startOfMonth(new Date());
        endDate = endOfMonth(new Date());
      } else if (dateRange === 'last-month') {
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        startDate = startOfMonth(lastMonth);
        endDate = endOfMonth(lastMonth);
      } else {
        // Custom date range - for now, use current month
        startDate = startOfMonth(selectedDate);
        endDate = endOfMonth(selectedDate);
      }

      const response = await fetch(
        `/api/hr/attendance?companyId=${companyId}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&limit=1000`
      );
      const data = await response.json();
      
      if (data.success) {
        const records = data.data.attendance || [];
        setAttendanceRecords(records);
        
        // Calculate summary
        const summary = calculateAttendanceSummary(records);
        setAttendanceSummary(summary);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch attendance data",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Failed to fetch attendance data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch attendance data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateAttendanceSummary = (records: AttendanceRecord[]): AttendanceSummary[] => {
    const employeeMap = new Map<string, AttendanceSummary>();

    records.forEach(record => {
      const employeeId = record.employeeId._id;
      
      if (!employeeMap.has(employeeId)) {
        employeeMap.set(employeeId, {
          employeeId,
          employeeName: `${record.employeeId.firstName} ${record.employeeId.lastName}`,
          department: record.employeeId.department,
          totalDays: 0,
          presentDays: 0,
          absentDays: 0,
          lateDays: 0,
          sickDays: 0,
          vacationDays: 0,
          totalHours: 0,
          averageHoursPerDay: 0,
        });
      }

      const summary = employeeMap.get(employeeId)!;
      summary.totalDays++;
      summary.totalHours += record.hoursWorked || 0;

      switch (record.status) {
        case 'present':
          summary.presentDays++;
          break;
        case 'absent':
          summary.absentDays++;
          break;
        case 'late':
          summary.lateDays++;
          break;
        case 'sick':
          summary.sickDays++;
          break;
        case 'vacation':
          summary.vacationDays++;
          break;
      }
    });

    // Calculate averages
    Array.from(employeeMap.values()).forEach(summary => {
      summary.averageHoursPerDay = summary.totalDays > 0 ? summary.totalHours / summary.totalDays : 0;
    });

    return Array.from(employeeMap.values());
  };

  const filteredSummary = attendanceSummary.filter(summary => {
    const matchesSearch = 
      summary.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      summary.department.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDepartment = departmentFilter === "all" || summary.department === departmentFilter;
    
    return matchesSearch && matchesDepartment;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      present: { color: "bg-green-100 text-green-800", icon: CheckCircle },
      absent: { color: "bg-red-100 text-red-800", icon: XCircle },
      late: { color: "bg-yellow-100 text-yellow-800", icon: AlertTriangle },
      sick: { color: "bg-blue-100 text-blue-800", icon: User },
      vacation: { color: "bg-purple-100 text-purple-800", icon: Calendar },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.present;
    const Icon = config.icon;
    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Employee Name', 'Department', 'Total Days', 'Present Days', 'Absent Days', 'Late Days', 'Sick Days', 'Vacation Days', 'Total Hours', 'Avg Hours/Day'],
      ...filteredSummary.map(summary => [
        summary.employeeName,
        summary.department,
        summary.totalDays.toString(),
        summary.presentDays.toString(),
        summary.absentDays.toString(),
        summary.lateDays.toString(),
        summary.sickDays.toString(),
        summary.vacationDays.toString(),
        summary.totalHours.toFixed(2),
        summary.averageHoursPerDay.toFixed(2),
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-summary-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading attendance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Attendance Summary</h1>
        <p className="text-muted-foreground">
          View and analyze employee attendance patterns
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by employee name or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            <SelectItem value="Sales">Sales</SelectItem>
            <SelectItem value="Operations">Operations</SelectItem>
            <SelectItem value="Human Resources">Human Resources</SelectItem>
            <SelectItem value="IT">IT</SelectItem>
          </SelectContent>
        </Select>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Select date range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="current-month">Current Month</SelectItem>
            <SelectItem value="last-month">Last Month</SelectItem>
            <SelectItem value="custom">Custom Range</SelectItem>
          </SelectContent>
        </Select>
        <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="View mode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="summary">Summary View</SelectItem>
            <SelectItem value="calendar">Calendar View</SelectItem>
            <SelectItem value="detailed">Detailed View</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={exportToCSV} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendanceSummary.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Attendance</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {attendanceSummary.length > 0 
                ? Math.round((attendanceSummary.reduce((sum, s) => sum + s.presentDays, 0) / 
                            attendanceSummary.reduce((sum, s) => sum + s.totalDays, 0)) * 100)
                : 0}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {attendanceSummary.reduce((sum, s) => sum + s.totalHours, 0).toFixed(0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Absent Today</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {attendanceRecords.filter(r => 
                isSameDay(new Date(r.date), new Date()) && r.status === 'absent'
              ).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Summary Table */}
      {viewMode === 'summary' && (
        <Card>
          <CardHeader>
            <CardTitle>Employee Attendance Summary</CardTitle>
            <CardDescription>
              Overview of attendance for all employees
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Total Days</TableHead>
                  <TableHead>Present</TableHead>
                  <TableHead>Absent</TableHead>
                  <TableHead>Late</TableHead>
                  <TableHead>Sick</TableHead>
                  <TableHead>Vacation</TableHead>
                  <TableHead>Total Hours</TableHead>
                  <TableHead>Avg Hours/Day</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSummary.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                      No attendance data found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSummary.map((summary) => (
                    <TableRow key={summary.employeeId}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{summary.employeeName}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{summary.department}</Badge>
                      </TableCell>
                      <TableCell className="text-center">{summary.totalDays}</TableCell>
                      <TableCell className="text-center text-green-600 font-medium">
                        {summary.presentDays}
                      </TableCell>
                      <TableCell className="text-center text-red-600 font-medium">
                        {summary.absentDays}
                      </TableCell>
                      <TableCell className="text-center text-yellow-600 font-medium">
                        {summary.lateDays}
                      </TableCell>
                      <TableCell className="text-center text-blue-600 font-medium">
                        {summary.sickDays}
                      </TableCell>
                      <TableCell className="text-center text-purple-600 font-medium">
                        {summary.vacationDays}
                      </TableCell>
                      <TableCell className="text-center font-mono">
                        {summary.totalHours.toFixed(1)}h
                      </TableCell>
                      <TableCell className="text-center font-mono">
                        {summary.averageHoursPerDay.toFixed(1)}h
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Detailed View */}
      {viewMode === 'detailed' && (
        <Card>
          <CardHeader>
            <CardTitle>Detailed Attendance Records</CardTitle>
            <CardDescription>
              Individual attendance records for all employees
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time In</TableHead>
                  <TableHead>Time Out</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendanceRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No attendance records found
                    </TableCell>
                  </TableRow>
                ) : (
                  attendanceRecords.map((record) => (
                    <TableRow key={record._id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {record.employeeId.firstName} {record.employeeId.lastName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {record.employeeId.department}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(record.date), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        {record.timeIn ? format(new Date(record.timeIn), 'HH:mm') : '-'}
                      </TableCell>
                      <TableCell>
                        {record.timeOut ? format(new Date(record.timeOut), 'HH:mm') : '-'}
                      </TableCell>
                      <TableCell>{getStatusBadge(record.status)}</TableCell>
                      <TableCell className="font-mono">
                        {record.hoursWorked ? `${record.hoursWorked.toFixed(1)}h` : '-'}
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate" title={record.notes}>
                          {record.notes || '-'}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
