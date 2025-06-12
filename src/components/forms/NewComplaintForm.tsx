
"use client";
import React from 'react'; // Removed useEffect as it's no longer needed for pre-filling
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'; // Input might be removable if no other inputs use it. Keeping for now.
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { complaintCategories, preferredTimeSlots } from '@/lib/definitions'; // Removed buildingNames
import type { Complaint, ComplaintCategory, BuildingName } from '@/lib/definitions'; // BuildingName type is still used
import { useToast } from "@/hooks/use-toast";
import { addComplaint } from '@/lib/placeholder-data';
import { useRouter } from 'next/navigation';

// Updated formSchema: removed bldg_name, flat_no, mobile_no
const formSchema = z.object({
  preferred_time: z.string().min(1, "Preferred time slot is required"),
  category: z.enum(complaintCategories, {required_error: "Category is required"}),
  description: z.string().min(10, "Description must be at least 10 characters").max(500, "Description must be less than 500 characters"),
});

type NewComplaintFormData = z.infer<typeof formSchema>;

export default function NewComplaintForm() {
  const { toast } = useToast();
  const router = useRouter();
  const form = useForm<NewComplaintFormData>({
    resolver: zodResolver(formSchema),
    // Updated defaultValues
    defaultValues: {
      preferred_time: '',
      category: undefined,
      description: '',
    },
  });

  // Removed useEffect for pre-filling bldg_name, flat_no, mobile_no as these fields are gone from the form

  async function onSubmit(values: NewComplaintFormData) {
    try {
      const tenantId = localStorage.getItem('tenantId');
      const tenantMobile = localStorage.getItem('tenantMobile');
      const tenantBuilding = localStorage.getItem('tenantBuilding') as BuildingName | null;
      const tenantFlat = localStorage.getItem('tenantFlat');

      if (!tenantMobile || !tenantBuilding || !tenantFlat) {
        toast({
          title: "Submission Failed",
          description: "Tenant details not found. Please log in again.",
          variant: "destructive",
        });
        // Optionally, redirect to login or handle error more gracefully
        // router.push('/login');
        return;
      }

      const newComplaintData: Omit<Complaint, 'id' | 'jobs' | 'duplicate_generated' | 'status' | 'date_registered'> & {tenant_id?: string} = {
        ...values, // Contains preferred_time, category, description
        bldg_name: tenantBuilding, // Get from localStorage
        flat_no: tenantFlat,       // Get from localStorage
        mobile_no: tenantMobile,   // Get from localStorage
        tenant_id: tenantId || undefined, 
      };
      
      const createdComplaint = await addComplaint(newComplaintData); 
      
      toast({
        title: "Complaint Submitted",
        description: `Your complaint (ID: ${createdComplaint.id}) has been successfully submitted.`,
      });
      // Updated form.reset
      form.reset({
        preferred_time: '',
        category: undefined,
        description: '',
      });
      router.push('/tenant/my-complaints');
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your complaint. Please try again.",
        variant: "destructive",
      });
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Submit New Complaint</CardTitle>
        <CardDescription>Please fill in the details of your maintenance request. Your building, flat, and mobile number are automatically included.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Removed FormFields for bldg_name, flat_no, and mobile_no */}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="preferred_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Time Slot</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a time slot" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {preferredTimeSlots.map(slot => (
                          <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {complaintCategories.map(cat => (
                          <SelectItem key={cat} value={cat} className="capitalize">{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description of Issue</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Please describe the issue in detail..."
                      className="resize-none"
                      rows={5}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full md:w-auto">Submit Complaint</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
