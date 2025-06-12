import MainLayout from '@/components/layout/MainLayout';
import NewComplaintForm from '@/components/forms/NewComplaintForm';

export default function NewComplaintPage() {
  return (
    <MainLayout initialUserRole="tenant">
      <NewComplaintForm />
    </MainLayout>
  );
}
