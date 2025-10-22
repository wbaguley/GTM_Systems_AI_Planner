import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Settings, ArrowRight } from "lucide-react";
import { useEffect } from "react";
import { Link, useLocation } from "wouter";

export default function ModuleBuilder() {
  const { isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();

  const { data: modules = [] } = trpc.modules.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const createMutation = trpc.modules.create.useMutation();
  const migrateMutation = trpc.modules.migratePlatforms.useMutation();

  // Auto-run migration if no modules exist
  useEffect(() => {
    if (isAuthenticated && modules.length === 0 && !migrateMutation.isPending && !createMutation.isPending) {
      migrateMutation.mutate();
    }
  }, [isAuthenticated, modules.length, migrateMutation, createMutation]);

  // Auto-redirect to form designer if module exists
  useEffect(() => {
    if (modules.length > 0) {
      const platformsModule = modules.find(m => m.name === "Platforms");
      if (platformsModule) {
        setLocation(`/module-builder/${platformsModule.id}/design`);
      }
    }
  }, [modules, setLocation]);

  if (loading || createMutation.isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading Module Builder...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8 max-w-md">
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="text-muted-foreground mb-4">Please log in to access the module builder.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Platform Form Customization</h1>
          <p className="text-muted-foreground mt-2">
            Customize the fields and layout of your platform tracking form
          </p>
        </div>

        <Card className="p-8">
          <div className="flex items-start gap-6">
            <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Settings className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-semibold mb-2">Platforms Module</h2>
              <p className="text-muted-foreground mb-6">
                Design your platform tracking form by adding, removing, and organizing fields. 
                Changes will be reflected immediately in the "Add Platform" and "Edit Platform" dialogs.
              </p>
              <Link href={`/module-builder/${modules[0]?.id}/design`}>
                <Button size="lg">
                  <Settings className="h-5 w-5 mr-2" />
                  Customize Platform Form
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        <div className="mt-8 p-6 bg-muted/50 rounded-lg">
          <h3 className="font-semibold mb-3">What you can customize:</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Add new fields like dropdowns, checkboxes, text areas, and more</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Reorder fields by dragging them into your preferred layout</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Set field labels, placeholders, and help text</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Mark fields as required or unique</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Configure dropdown options and validation rules</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

