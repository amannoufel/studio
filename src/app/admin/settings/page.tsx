import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings } from 'lucide-react';

export default function AdminSettingsPage() {
  return (
    <MainLayout initialUserRole="admin">
      <div className="space-y-8">
        <h1 className="text-3xl font-headline font-semibold flex items-center">
            <Settings className="mr-3 h-8 w-8 text-primary" />
            Admin Settings
        </h1>
        <Card>
          <CardHeader>
            <CardTitle>Settings Panel</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">This is a placeholder for admin settings. Future configurations for the Tenant Tracker application will be managed here.</p>
            {/* Example settings items can be added here */}
            <div className="mt-6 space-y-4">
                <div>
                    <h3 className="font-medium">Notification Preferences</h3>
                    <p className="text-sm text-muted-foreground">Configure email or push notifications for new complaints and job updates.</p>
                </div>
                <div>
                    <h3 className="font-medium">User Management</h3>
                    <p className="text-sm text-muted-foreground">Add, remove, or modify admin and staff accounts.</p>
                </div>
                <div>
                    <h3 className="font-medium">Material Codes</h3>
                    <p className="text-sm text-muted-foreground">Manage the list of available materials and their codes.</p>
                </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
