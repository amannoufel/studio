
"use client";
import React, { useState, useEffect } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import type { Job, MaterialMaster, ComplaintStatus, MaterialUsed } from '@/lib/definitions';
import { complaintStatuses } from '@/lib/definitions';
import { useToast } from "@/hooks/use-toast";
import { updateJobAction, getMaterialMasterAction } from '@/lib/actions'; 
import { PlusCircle, Trash2, Save } from 'lucide-react';
// No longer need useRouter here if parent handles refresh
// import { useRouter } from 'next/navigation'; 

import { StaffSelect } from './StaffSelect';

const materialUsedSchema = z.object({
  code: z.string().min(1, "Material code is required"),
  name: z.string().optional(), 
  qty: z.coerce.number().min(1, "Quantity must be at least 1"),
});

const formSchema = z.object({
  date_attended: z.string().min(1, "Date attended is required"), 
  time_attended: z.string().min(1, "Time attended is required"), 
  staff_attended: z.array(z.string().min(1, "Staff name cannot be empty")).min(1, "At least one staff member is required"),
  job_card_no: z.string().min(1, "Job card number is required"),
  store: z.string().min(1, "Store is required"),
  materials_used: z.array(materialUsedSchema),
  status_update: z.enum(complaintStatuses.filter(s => s !== "Pending") as [ComplaintStatus, ...ComplaintStatus[]]), 
  time_completed: z.string().optional(),
  reason_not_completed: z.string().optional(),
}).refine(data => {
    if (data.status_update === "Completed" && !data.time_completed) {
        return false;
    }
    return true;
}, {
    message: "Time completed is required if status is 'Completed'",
    path: ["time_completed"],
}).refine(data => {
    if ((data.status_update === "Not Completed" || data.status_update === "Tenant Not Available") && !data.reason_not_completed) {
        return false;
    }
    return true;
}, {
    message: "Reason is required if status is 'Not Completed' or 'Tenant Not Available'",
    path: ["reason_not_completed"],
});


type UpdateJobFormData = z.infer<typeof formSchema>;

interface UpdateJobFormProps {
  complaintId: string;
  onJobUpdated: () => void; 
}

export default function UpdateJobForm({ complaintId, onJobUpdated }: UpdateJobFormProps) {
  const { toast } = useToast();
  const [materialsMaster, setMaterialsMaster] = useState<MaterialMaster[]>([]);
  // const router = useRouter(); // Not needed if parent handles refresh

  const form = useForm<UpdateJobFormData>({
    resolver: zodResolver(formSchema),    defaultValues: {
      date_attended: new Date().toISOString().split('T')[0],
      time_attended: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      staff_attended: [''],
      job_card_no: '',
      store: 'Main Store',
      materials_used: [],
      status_update: 'Attended',
      time_completed: '',
      reason_not_completed: '',
    },
  });

  const { fields: staffFields, append: appendStaff, remove: removeStaff } = useFieldArray({
    control: form.control,
    name: "staff_attended"
  });

  const { fields: materialFields, append: appendMaterial, remove: removeMaterial } = useFieldArray({
    control: form.control,
    name: "materials_used"
  });
  
  const watchedStatusUpdate = form.watch("status_update");
  useEffect(() => {
    async function fetchMaterials() {
      try {
        const materials = await getMaterialMasterAction();
        setMaterialsMaster(materials || []);
        // If we have empty materials list
        if (!materials || materials.length === 0) {
          toast({
            title: "Warning",
            description: "No materials found in the system.",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load materials list.",
          variant: "destructive",
        });
      }
    }
    fetchMaterials();
  }, [toast]);

  const handleMaterialCodeChange = (index: number, code: string) => {
    const material = materialsMaster.find(m => m.code === code);
    if (material) {
      form.setValue(`materials_used.${index}.name`, material.name);
    }
  };


  async function onSubmit(values: UpdateJobFormData) {
    const jobData: Omit<Job, 'id'> = {
      complaint_id: complaintId,
      date_attended: values.date_attended,
      time_attended: values.time_attended,
      staff_attended: values.staff_attended,
      job_card_no: values.job_card_no,
      materials_used: values.materials_used.map(m => ({...m, name: materialsMaster.find(ms => ms.code === m.code)?.name || '' })),
      time_completed: values.status_update === 'Completed' ? values.time_completed : null,
      reason_not_completed: (values.status_update === 'Not Completed' || values.status_update === 'Tenant Not Available') ? values.reason_not_completed : null,
    };

    try {
      await updateJobAction(jobData, values.status_update, values.reason_not_completed);
      toast({
        title: "Job Updated",
        description: `Job details for complaint ${complaintId} have been updated.`,
      });
      form.reset();
      onJobUpdated(); // Call the handler passed from the parent page
      // router.refresh(); // Removed, parent page will handle router.refresh and its own state update
    } catch (error) {
        let errorMessage = "There was an error updating the job. Please try again.";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        toast({
            title: "Update Failed",
            description: errorMessage,
            variant: "destructive",
        });
    }
  }

  return (
    <Card className="w-full shadow-lg mt-6">
      <CardHeader>
        <CardTitle className="font-headline text-xl">Update Job Details</CardTitle>
        <CardDescription>Log the work done for this complaint.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField control={form.control} name="date_attended" render={({ field }) => (
                <FormItem>
                  <FormLabel>Date Attended</FormLabel>
                  <FormControl><Input type="date" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="time_attended" render={({ field }) => (
                <FormItem>
                  <FormLabel>Time Attended</FormLabel>
                  <FormControl><Input type="time" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="job_card_no" render={({ field }) => (
              <FormItem>
                <FormLabel>Job Card Number</FormLabel>
                <FormControl><Input placeholder="e.g., JC-12345" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            
            <div>              <FormLabel>Staff Attended</FormLabel>
              {staffFields.map((field, index) => (
                <FormField
                  key={field.id}
                  control={form.control}
                  name={`staff_attended.${index}`}
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2 mt-1">                      <FormControl>
                        <StaffSelect
                          value={field.value}
                          onValueChange={field.onChange}
                          placeholder="Select staff member"
                        />
                      </FormControl>
                      {staffFields.length > 1 && (
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeStaff(index)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                      <FormMessage>{form.formState.errors.staff_attended?.[index]?.message}</FormMessage>
                    </FormItem>
                  )}
                />
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => appendStaff('')} className="mt-2">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Staff
              </Button>
              <FormMessage>{form.formState.errors.staff_attended?.root?.message || form.formState.errors.staff_attended?.message}</FormMessage>
            </div>
              <FormField control={form.control} name="store" render={({ field }) => (
              <FormItem>
                <FormLabel>Store</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select store" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Main Store">Main Store</SelectItem>
                    <SelectItem value="Store 1">Store 1</SelectItem>
                    <SelectItem value="Store 2">Store 2</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <div>
              <FormLabel>Materials Used</FormLabel>
              {materialFields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-[1fr_auto_auto] md:grid-cols-[2fr_1fr_auto] gap-2 items-end mt-2 p-3 border rounded-md">
                  <FormField control={form.control} name={`materials_used.${index}.code`} render={({ field: selectField }) => (
                    <FormItem>
                       {index === 0 && <FormLabel className="text-xs">Material</FormLabel>}
                      <Select 
                        onValueChange={(value) => {
                           selectField.onChange(value);
                           handleMaterialCodeChange(index, value);
                        }} 
                        defaultValue={selectField.value}
                      >
                        <FormControl><SelectTrigger><SelectValue placeholder="Select Material" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {materialsMaster.map(m => <SelectItem key={m.code} value={m.code}>{m.name} ({m.code})</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name={`materials_used.${index}.qty`} render={({ field: qtyField }) => (
                    <FormItem>
                      {index === 0 && <FormLabel className="text-xs">Quantity</FormLabel>}
                      <FormControl><Input type="number" placeholder="Qty" {...qtyField} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeMaterial(index)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={() => appendMaterial({ code: '', name: '', qty: 1 })} 
                className="mt-2"
                disabled={materialsMaster.length === 0}
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Add Material
              </Button>
              {materialsMaster.length === 0 && (
                <p className="text-sm text-muted-foreground mt-2">Loading materials...</p>
              )}
            </div>

            <FormField control={form.control} name="status_update" render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Job Outcome Status</FormLabel>
                <FormControl>
                  <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
                    {complaintStatuses.filter(s => s !== "Pending").map(status => (
                       <FormItem key={status} className="flex items-center space-x-3 space-y-0">
                         <FormControl><RadioGroupItem value={status} /></FormControl>
                         <FormLabel className="font-normal capitalize">{status}</FormLabel>
                       </FormItem>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {watchedStatusUpdate === 'Completed' && (
              <FormField control={form.control} name="time_completed" render={({ field }) => (
                <FormItem>
                  <FormLabel>Time Completed</FormLabel>
                  <FormControl><Input type="time" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            )}

            {(watchedStatusUpdate === 'Not Completed' || watchedStatusUpdate === 'Tenant Not Available') && (
              <FormField control={form.control} name="reason_not_completed" render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason for Status</FormLabel>
                  <FormControl><Textarea placeholder="Explain why the job was not completed or tenant was unavailable..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            )}
            
            <Button type="submit" className="w-full md:w-auto" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Updating..." : <><Save className="mr-2 h-4 w-4" /> Update Job</>}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
