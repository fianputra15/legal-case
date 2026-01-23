import { MainLayout } from "@/widgets/layout";
import { Button } from "@/shared/ui";

export default function MessagesPage() {
  return (
    <MainLayout
      headerTitle="Messages"
      headerActions={
        <Button className="bg-legal-primary hover:bg-legal-primary/90 text-white">
          Compose Message
        </Button>
      }
    >
      <div className="p-4 bg-white flex justify-center">
        <p>Message will be displayed here.</p>
      </div>
    </MainLayout>
  );
}
