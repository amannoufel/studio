"use client";
import React from 'react'; 
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { complaintCategories, preferredTimeSlots, staffMembers, storeLocations } from '@/lib/definitions'; 
import type { Complaint, ComplaintCategory, BuildingName } from '@/lib/definitions'; 
import { useToast } from "@/hooks/use-toast";
import { createComplaintAction } from '@/lib/actions';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
  preferred_time: z.string().min(1, "Preferred time slot is required"),
  category: z.enum(complaintCategories, {required_error: "Category is required"}),
  description: z.string().min(10, "Description must be at least 10 characters").max(500, "Description must be less than 500 characters"),
  staff: z.string().min(1, "Staff member selection is required"),
  store: z.string().min(1, "Store selection is required"),
});

type NewComplaintFormData = z.infer<typeof formSchema>;

export default function NewComplaintForm() {
  const { toast } = useToast();
  const router = useRouter();
  const form = useForm<NewComplaintFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      preferred_time: '',
      category: undefined,
      description: '',
      staff: '',
      store: 'Main Store', // Set default store
    },
  });

  async function onSubmit(values: NewComplaintFormData) {
    try {
      const tenantId = localStorage.getItem('tenantId');
      const tenantMobile = localStorage.getItem('tenantMobile');
      const tenantBuilding = localStorage.getItem('tenantBuilding') as BuildingName | null;
      const tenantFlat = localStorage.getItem('tenantFlat');

      if (!tenantMobile || !tenantBuilding || !tenantFlat || !tenantId) {
        toast({
          title: "Submission Failed",
          description: "Tenant details not found. Please log in again.",
          variant: "destructive",
        });
        return;
      }

      const newComplaintData: Omit<Complaint, 'id' | 'jobs' | 'duplicate_generated' | 'status' | 'date_registered'> & {tenant_id?: string} = {
        ...values, 
        bldg_name: tenantBuilding, 
        flat_no: tenantFlat,       
        mobile_no: tenantMobile,   
        tenant_id: tenantId, 
      };
      
      const createdComplaint = await createComplaintAction(newComplaintData); // Call Server Action
      
      toast({
        title: "Complaint Submitted",
        description: `Your complaint (ID: ${createdComplaint.id}) has been successfully submitted.`,
      });
      form.reset({
        preferred_time: '',
        category: undefined,
        description: '',
        staff: '',
        store: 'Main Store',
      });
      router.push('/tenant/my-complaints');
    } catch (error) {
        let errorMessage = "There was an error submitting your complaint. Please try again.";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        toast({
            title: "Submission Failed",
            description: errorMessage,
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="store"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Store</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a store" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {storeLocations.map(store => (
                          <SelectItem key={store} value={store}>{store}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="staff"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Staff Member</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select staff member" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {staffMembers.map(staff => (
                          <SelectItem key={staff} value={staff}>{staff}</SelectItem>
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
            <Button type="submit" className="w-full md:w-auto" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Submitting..." : "Submit Complaint"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
