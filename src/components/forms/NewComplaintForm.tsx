"use client";
import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { complaintCategories, preferredTimeSlots } from '@/lib/definitions';
import type { Complaint } from '@/lib/definitions';
import { useToast } from "@/hooks/use-toast";
import { addComplaint } from '@/lib/placeholder-data'; // Simulated action
import { useRouter } from 'next/navigation';

const formSchema = z.object({
  bldg_name: z.string().min(1, "Building name is required"),
  flat_no: z.string().min(1, "Flat number is required"),
  mobile_no: z.string().min(1, "Mobile number is required").regex(/^\d{3}-\d{3}-\d{4}$/, "Invalid phone format (e.g., 555-123-4567)"),
  preferred_time: z.string().min(1, "Preferred time slot is required"),
  category: z.enum(complaintCategories),
  description: z.string().min(10, "Description must be at least 10 characters").max(500, "Description must be less than 500 characters"),
});

type NewComplaintFormData = z.infer<typeof formSchema>;

export default function NewComplaintForm() {
  const { toast } = useToast();
  const router = useRouter();
  const form = useForm<NewComplaintFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bldg_name: '',
      flat_no: '',
      mobile_no: '',
      preferred_time: '',
      category: 'electrical',
      description: '',
    },
  });

  async function onSubmit(values: NewComplaintFormData) {
    try {
      // In a real app, this would be a server action or API call
      // For now, using placeholder data function
      const newComplaintData: Omit<Complaint, 'id' | 'jobs' | 'duplicate_generated' | 'status' | 'date_registered'> = {
        ...values,
        // tenant_id would be set based on logged-in user
      };
      // @ts-ignore // date_registered will be set by addComplaint
      const createdComplaint = await addComplaint(newComplaintData); 
      
      toast({
        title: "Complaint Submitted",
        description: `Your complaint (ID: ${createdComplaint.id}) has been successfully submitted.`,
      });
      form.reset();
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
                    <FormControl>
                      <Input placeholder="e.g., Tower A" {...field} />
                    </FormControl>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
