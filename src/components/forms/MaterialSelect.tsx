"use client";
import { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getMaterials } from '@/lib/actions';
import type { MaterialMaster } from '@/lib/definitions';

interface MaterialSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function MaterialSelect({
  value,
  onValueChange,
  placeholder = "Select material",
  disabled = false
}: MaterialSelectProps) {
  const [materials, setMaterials] = useState<MaterialMaster[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMaterials() {
      const data = await getMaterials();
      setMaterials(data);
      setLoading(false);
    }
    loadMaterials();
  }, []);

  if (loading) {
    return (
      <Select disabled value={value} onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue placeholder="Loading materials..." />
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
        {materials.map((material) => (
          <SelectItem key={material.code} value={material.code}>
            {material.name} ({material.code})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
