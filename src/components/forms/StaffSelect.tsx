"use client";
import { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getStaffAction } from '@/lib/actions';
import type { Staff } from '@/lib/definitions';

interface StaffSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function StaffSelect({
  value,
  onValueChange,
  placeholder = "Select staff member",
  disabled = false
}: StaffSelectProps) {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStaff() {
      const data = await getStaffAction();
      setStaff(data);
      setLoading(false);
    }
    loadStaff();
  }, []);

  if (loading) {
    return (
      <Select disabled value={value} onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue placeholder="Loading staff..." />
        </SelectTrigger>
      </Select>
    );
  }

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {staff.map((member) => (
          <SelectItem key={member.id} value={member.id}>
            {member.name} - {member.designation}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
