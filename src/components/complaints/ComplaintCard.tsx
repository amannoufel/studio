import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Complaint, ComplaintStatus } from '@/lib/definitions';
import { AlertTriangle, CheckCircle2, Clock, Wrench, XCircle } from 'lucide-react';

interface ComplaintCardProps {
  complaint: Complaint;
  isAdminView?: boolean;
}

const statusStyles: Record<ComplaintStatus, string> = {
  Pending: "bg-yellow-500 hover:bg-yellow-600",
  Attended: "bg-blue-500 hover:bg-blue-600",
  Completed: "bg-green-500 hover:bg-green-600",
  "Not Completed": "bg-red-500 hover:bg-red-600",
  "Tenant Not Available": "bg-orange-500 hover:bg-orange-600",
};

const statusIcons: Record<ComplaintStatus, React.ElementType> = {
  Pending: Clock,
  Attended: Wrench,
  Completed: CheckCircle2,
  "Not Completed": XCircle,
  "Tenant Not Available": AlertTriangle,
};

export default function ComplaintCard({ complaint, isAdminView = false }: ComplaintCardProps) {
  const StatusIcon = statusIcons[complaint.status] || Wrench;
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="font-headline text-xl capitalize">{complaint.category} Issue</CardTitle>
            <CardDescription>
              {complaint.bldg_name}, Flat {complaint.flat_no} - Submitted: {new Date(complaint.date_registered).toLocaleDateString()}
            </CardDescription>
          </div>
          <Badge className={`${statusStyles[complaint.status]} text-primary-foreground text-xs`}>
            <StatusIcon className="mr-1 h-3 w-3" />
            {complaint.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-3">{complaint.description}</p>
      </CardContent>
      {isAdminView && (
         <CardFooter>
            <Link href={`/admin/complaints/${complaint.id}`} className="text-sm text-primary hover:underline">
                View Details &rarr;
            </Link>
         </CardFooter>
      )}
    </Card>
  );
}
