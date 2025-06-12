
"use client";
import React, { useEffect } from 'react'; // Added useEffect
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { complaintCategories, preferredTimeSlots, buildingNames } from '@/lib/definitions'; // Added buildingNames
import type { Complaint, ComplaintCategory, BuildingName } from '@/lib/definitions'; // Added BuildingName
import { useToast } from "@/hooks/use-toast";
import { addComplaint } from '@/lib/placeholder-data';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
  bldg_name: z.enum(buildingNames, {required_error: "Building name is required"}),
  flat_no: z.string().min(1, "Flat number is required"),
  mobile_no: z.string().min(1, "Mobile number is required").regex(/^\d{3}-\d{3}-\d{4}$/, "Invalid phone format (e.g., 555-123-4567)"),
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
    defaultValues: {
      bldg_name: undefined,
      flat_no: '',
      mobile_no: '',
      preferred_time: '',
      category: undefined,
      description: '',
    },
  });

  useEffect(() => {
    // Pre-fill from localStorage if available
    const tenantMobile = localStorage.getItem('tenantMobile');
    const tenantBuilding = localStorage.getItem('tenantBuilding') as BuildingName | null;
    const tenantFlat = localStorage.getItem('tenantFlat');

    if (tenantMobile) form.setValue('mobile_no', tenantMobile);
    if (tenantBuilding && buildingNames.includes(tenantBuilding)) {
      form.setValue('bldg_name', tenantBuilding);
    }
    if (tenantFlat) form.setValue('flat_no', tenantFlat);
  }, [form]);


  async function onSubmit(values: NewComplaintFormData) {
    try {
      const tenantId = localStorage.getItem('tenantId');
      const newComplaintData: Omit<Complaint, 'id' | 'jobs' | 'duplicate_generated' | 'status' | 'date_registered'> & {tenant_id?: string} = {
        ...values,
        bldg_name: values.bldg_name, // Already correct type from schema
        tenant_id: tenantId || undefined, 
      };
      
      const createdComplaint = await addComplaint(newComplaintData); 
      
      toast({
        title: "Complaint Submitted",
        description: `Your complaint (ID: ${createdComplaint.id}) has been successfully submitted.`,
      });
      form.reset( { // Reset with potentially new localStorage values if they signed up & logged in
        mobile_no: localStorage.getItem('tenantMobile') || '',
        bldg_name: (localStorage.getItem('tenantBuilding') as BuildingName) || undefined,
        flat_no: localStorage.getItem('tenantFlat') || '',
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
        <CardDescription>Please fill in the details of your maintenance request.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="bldg_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Building Name</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select building" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {buildingNames.map(name => (
                          <SelectItem key={name} value={name}>{name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="flat_no"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Flat Number</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 101" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="mobile_no"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mobile Number</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 555-123-4567" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
