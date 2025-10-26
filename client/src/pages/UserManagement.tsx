import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Loader2, Shield, User, TestTube } from "lucide-react";
import { toast } from "sonner";

export default function UserManagement() {
  const { user } = useAuth();
  const utils = trpc.useUtils();

  // Only admins can access this page
  if (user?.role !== "admin") {
    return (
      <div className="container max-w-4xl py-12">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You don't have permission to access this page.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const { data: users, isLoading } = trpc.users.getAllUsers.useQuery();
  const updateRole = trpc.users.updateUserRole.useMutation({
    onSuccess: () => {
      toast.success("User role updated successfully");
      utils.users.getAllUsers.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update user role");
    },
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Shield className="h-4 w-4" />;
      case "tester":
        return <TestTube className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "tester":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  return (
    <div className="container max-w-6xl py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage user roles and access levels
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>
              Assign roles to users. Testers get full Pro access without requiring a subscription.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users?.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{u.name || "Unnamed User"}</p>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(
                          u.role
                        )}`}
                      >
                        {getRoleIcon(u.role)}
                        {u.role}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{u.email}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Last signed in: {new Date(u.lastSignedIn).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <Select
                      value={u.role}
                      onValueChange={(newRole) => {
                        updateRole.mutate({
                          userId: u.id,
                          role: newRole as "user" | "admin" | "tester",
                        });
                      }}
                      disabled={updateRole.isPending || u.id === user?.id}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="tester">Tester</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}

              {!users || users.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No users found
                </p>
              ) : null}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Role Descriptions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center gap-2 font-medium mb-1">
              <User className="h-4 w-4" />
              User
            </div>
            <p className="text-sm text-muted-foreground">
              Regular user. Requires Essentials or Pro subscription to access features.
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 font-medium mb-1">
              <TestTube className="h-4 w-4 text-blue-600" />
              Tester
            </div>
            <p className="text-sm text-muted-foreground">
              UAT tester with full Pro access. No subscription required. Use this for testing before launch.
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 font-medium mb-1">
              <Shield className="h-4 w-4 text-red-600" />
              Admin
            </div>
            <p className="text-sm text-muted-foreground">
              Full system access including user management and all features.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

