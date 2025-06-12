import type { Job } from '@/lib/definitions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Briefcase, CalendarDays, Clock, Users, ListOrdered, Tool } from 'lucide-react';

interface JobHistoryItemProps {
  job: Job;
}

export default function JobHistoryItem({ job }: JobHistoryItemProps) {
  return (
    <Card className="mb-4 shadow">
      <CardHeader>
        <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-semibold flex items-center">
                <Briefcase className="mr-2 h-5 w-5 text-primary" /> Job ID: {job.job_card_no || job.id}
            </CardTitle>
            {job.time_completed ? (
                 <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-primary-foreground">Completed</Badge>
            ) : (
                 <Badge variant="secondary">In Progress / Attended</Badge>
            )}
        </div>
        <CardDescription className="text-xs text-muted-foreground">
          <CalendarDays className="inline mr-1 h-3 w-3" /> Attended: {new Date(job.date_attended).toLocaleDateString()} at {job.time_attended}
          {job.time_completed && <><Clock className="inline ml-2 mr-1 h-3 w-3" /> Completed: {job.time_completed}</>}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <h4 className="font-medium text-sm flex items-center"><Users className="mr-2 h-4 w-4 text-muted-foreground" />Staff Attended:</h4>
          <ul className="list-disc list-inside ml-2 text-sm">
            {job.staff_attended.map((staff, index) => <li key={index}>{staff}</li>)}
          </ul>
        </div>
        {job.materials_used && job.materials_used.length > 0 && (
          <div>
            <h4 className="font-medium text-sm flex items-center"><ListOrdered className="mr-2 h-4 w-4 text-muted-foreground" />Materials Used:</h4>
            <ul className="list-disc list-inside ml-2 text-sm">
              {job.materials_used.map((material, index) => (
                <li key={index}>{material.name} ({material.code}) - Qty: {material.qty}</li>
              ))}
            </ul>
          </div>
        )}
        {job.reason_not_completed && (
          <div>
            <h4 className="font-medium text-sm flex items-center"><Tool className="mr-2 h-4 w-4 text-muted-foreground" />Reason Not Completed:</h4>
            <p className="text-sm italic">{job.reason_not_completed}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
