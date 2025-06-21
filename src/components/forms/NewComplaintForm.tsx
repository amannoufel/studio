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
  category: z.enum(["electrical", "plumbing", "aircond"], {required_error: "Category is required"}),
  description: z.string().min(10, "Description must be at least 10 characters").max(500, "Description must be less than 500 characters"),
  image: z.any().optional(), // Add image field
});

type NewComplaintFormData = z.infer<typeof formSchema>;

export default function NewComplaintForm() {
  const { toast } = useToast();
  const router = useRouter();
  const [uploading, setUploading] = React.useState(false);
  const form = useForm<NewComplaintFormData>({    resolver: zodResolver(formSchema),    defaultValues: {
      preferred_time: '',
      category: undefined,
      description: '',
      image: undefined,
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

      let imageUrl = undefined;
      if (values.image && values.image.length > 0) {
        setUploading(true);
        const file = values.image[0];
        const fileExt = file.name.split('.').pop();
        const filePath = `complaints/${tenantId}_${Date.now()}.${fileExt}`;
        const supabaseClient = (await import('@/lib/supabaseClient')).supabase;
        const { error } = await supabaseClient.storage.from('complaint-images').upload(filePath, file);
        if (error) throw new Error('Image upload failed: ' + error.message);
        // For public buckets, construct the URL directly
        imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/complaint-images/${filePath}`;
        setUploading(false);
      }

      const newComplaintData: Omit<Complaint, 'id' | 'jobs' | 'duplicate_generated' | 'status' | 'date_registered'> & {tenant_id?: string, image_url?: string} = {
        ...values,
        bldg_name: tenantBuilding,
        flat_no: tenantFlat,
        mobile_no: tenantMobile,
        tenant_id: tenantId,
        image_url: imageUrl,
      };
      // Remove image property if present
      if ('image' in newComplaintData) {
        // @ts-ignore
        delete newComplaintData.image;
      }
      const createdComplaint = await createComplaintAction(newComplaintData); // Call Server Action
      toast({
        title: "Complaint Submitted",
        description: `Your complaint (ID: ${createdComplaint.id}) has been successfully submitted.`,
      });
      form.reset({
        preferred_time: '',
        category: undefined,
        description: '',
        image: undefined,
      });
      router.push('/tenant/my-complaints');
    } catch (error) {
      let errorMessage = "There was an error submitting your complaint. Please try again.";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
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
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Upload Image (optional)</FormLabel>
                  <FormControl>
                    <input type="file" accept="image/*" onChange={e => field.onChange(e.target.files)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full md:w-auto" disabled={form.formState.isSubmitting || uploading}>
                {form.formState.isSubmitting || uploading ? "Submitting..." : "Submit Complaint"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
