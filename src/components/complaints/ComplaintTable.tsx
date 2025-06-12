"use client";
import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Complaint, ComplaintStatus, ComplaintCategory } from '@/lib/definitions';
import { complaintCategories, complaintStatuses } from '@/lib/definitions';
import { Eye, Filter, CalendarDays, Building, ListFilter } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

interface ComplaintTableProps {
  complaints: Complaint[];
}

const statusStyles: Record<ComplaintStatus, string> = {
  Pending: "bg-yellow-500 hover:bg-yellow-600",
  Attended: "bg-blue-500 hover:bg-blue-600",
  Completed: "bg-green-500 hover:bg-green-600",
  "Not Completed": "bg-red-500 hover:bg-red-600",
  "Tenant Not Available": "bg-orange-500 hover:bg-orange-600",
};


export default function ComplaintTable({ complaints }: ComplaintTableProps) {
  const [filters, setFilters] = useState<{
    dateRange: { from?: Date; to?: Date };
    status: ComplaintStatus | 'all';
    building: string;
    category: ComplaintCategory | 'all';
  }>({
    dateRange: {},
    status: 'all',
    building: '',
    category: 'all',
  });

  const uniqueBuildings = useMemo(() => {
    const buildings = new Set(complaints.map(c => c.bldg_name));
    return ['all', ...Array.from(buildings)];
  }, [complaints]);

  const filteredComplaints = useMemo(() => {
    return complaints.filter(complaint => {
      const complaintDate = new Date(complaint.date_registered);
      const { from, to } = filters.dateRange;
      if (from && complaintDate < from) return false;
      if (to && complaintDate > new Date(to.getTime() + 86399999)) return false; // Include full 'to' day
      if (filters.status !== 'all' && complaint.status !== filters.status) return false;
      if (filters.building && filters.building !== 'all' && complaint.bldg_name !== filters.building) return false;
      if (filters.category !== 'all' && complaint.category !== filters.category) return false;
      return true;
    });
  }, [complaints, filters]);

  const handleFilterChange = (filterName: keyof typeof filters, value: any) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };
  
  const handleDateRangeChange = (date: { from?: Date; to?: Date }) => {
    setFilters(prev => ({ ...prev, dateRange: date }));
  };

  return (
    <div className="space-y-4">
      <div className="p-4 border rounded-lg bg-card shadow">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="dateRange">Date Range</Label>
             <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="dateRange"
                  variant={"outline"}
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarDays className="mr-2 h-4 w-4" />
                  {filters.dateRange?.from ? (
                    filters.dateRange.to ? (
                      <>
                        {format(filters.dateRange.from, "LLL dd, y")} -{" "}
                        {format(filters.dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(filters.dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={filters.dateRange?.from}
                  selected={filters.dateRange}
                  onSelect={(range) => handleDateRangeChange(range || {})}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <Label htmlFor="statusFilter">Status</Label>
            <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value as ComplaintStatus | 'all')}>
              <SelectTrigger id="statusFilter">
                <ListFilter className="mr-2 h-4 w-4" /> <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {complaintStatuses.map(status => (
                  <SelectItem key={status} value={status} className="capitalize">{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="buildingFilter">Building</Label>
             <Select value={filters.building} onValueChange={(value) => handleFilterChange('building', value)}>
              <SelectTrigger id="buildingFilter">
                <Building className="mr-2 h-4 w-4" /> <SelectValue placeholder="Filter by building" />
              </SelectTrigger>
              <SelectContent>
                {uniqueBuildings.map(bldg => (
                  <SelectItem key={bldg} value={bldg} className="capitalize">{bldg === 'all' ? 'All Buildings' : bldg}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="categoryFilter">Category</Label>
            <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value as ComplaintCategory | 'all')}>
              <SelectTrigger id="categoryFilter">
                <Filter className="mr-2 h-4 w-4" /> <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {complaintCategories.map(cat => (
                  <SelectItem key={cat} value={cat} className="capitalize">{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="rounded-lg border overflow-hidden bg-card shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Building</TableHead>
              <TableHead>Flat</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredComplaints.length > 0 ? filteredComplaints.map((complaint) => (
              <TableRow key={complaint.id}>
                <TableCell className="font-medium">{complaint.id}</TableCell>
                <TableCell>{new Date(complaint.date_registered).toLocaleDateString()}</TableCell>
                <TableCell>{complaint.bldg_name}</TableCell>
                <TableCell>{complaint.flat_no}</TableCell>
                <TableCell className="capitalize">{complaint.category}</TableCell>
                <TableCell>
                  <Badge className={`${statusStyles[complaint.status]} text-primary-foreground text-xs`}>
                    {complaint.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/admin/complaints/${complaint.id}`}>
                      <Eye className="mr-2 h-4 w-4" /> View
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No complaints match the current filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
       {filteredComplaints.length === 0 && complaints.length > 0 && (
          <p className="text-center text-muted-foreground mt-4">
            No complaints match your current filter selection. Try adjusting your filters.
          </p>
        )}
        {complaints.length === 0 && (
            <p className="text-center text-muted-foreground mt-4">
                There are no complaints in the system yet.
            </p>
        )}
    </div>
  );
}

// Minimal Label component if not globally available or for specific styling
const Label = (props: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label className="block text-sm font-medium text-muted-foreground mb-1" {...props} />
);
