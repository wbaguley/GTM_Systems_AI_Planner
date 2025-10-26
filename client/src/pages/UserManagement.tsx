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
import { Loader2, Shield, User, TestTube, UserX, UserCheck, Crown } from "lucide-react";
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

  const deactivateUser = trpc.users.deactivateUser.useMutation({
    onSuccess: () => {
      toast.success("User deactivated successfully");
      utils.users.getAllUsers.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to deactivate user");
    },
  });

  const reactivateUser = trpc.users.reactivateUser.useMutation({
    onSuccess: () => {
      toast.success("User reactivated successfully");
      utils.users.getAllUsers.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to reactivate user");
    },
  });

  const transferGlobalAdmin = trpc.users.transferGlobalAdmin.useMutation({
    onSuccess: () => {
      toast.success("Global admin role transferred successfully");
      utils.users.getAllUsers.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to transfer global admin role");
    },
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Shield className="h-4 w-4" />;
      case "standard":
        return <User className="h-4 w-4" />;
      default:
        return <TestTube className="h-4 w-4" />; // viewer
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "standard":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      default: // viewer
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
              Assign roles to users. Admins have full access, Standard users can view and add, Viewers are read-only.
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
                      {u.isGlobalAdmin && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                          <Crown className="h-3 w-3" />
                          Global Admin
                        </span>
                      )}
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(
                          u.role
                        )}`}
                      >
                        {getRoleIcon(u.role)}
                        {u.role}
                      </span>
                      {!u.isActive && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{u.email}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Last signed in: {new Date(u.lastSignedIn).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Select
                      value={u.role}
                      onValueChange={(newRole) => {
                        updateRole.mutate({
                          userId: u.id,
                          role: newRole as "viewer" | "standard" | "admin",
                        });
                      }}
                      disabled={updateRole.isPending || u.id === user?.id || !u.isActive}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="viewer">Viewer</SelectItem>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>

                    {u.isGlobalAdmin && user?.isGlobalAdmin && u.id !== user?.id && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (confirm(`Transfer global admin role to ${u.name}? You will lose global admin privileges.`)) {
                            transferGlobalAdmin.mutate({ newGlobalAdminId: u.id });
                          }
                        }}
                        disabled={transferGlobalAdmin.isPending}
                      >
                        <Crown className="h-4 w-4 mr-1" />
                        Transfer Admin
                      </Button>
                    )}

                    {!u.isGlobalAdmin && u.id !== user?.id && (
                      u.isActive ? (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            if (confirm(`Deactivate ${u.name}? They will lose access to the system.`)) {
                              deactivateUser.mutate({ userId: u.id });
                            }
                          }}
                          disabled={deactivateUser.isPending}
                        >
                          <UserX className="h-4 w-4 mr-1" />
                          Deactivate
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            reactivateUser.mutate({ userId: u.id });
                          }}
                          disabled={reactivateUser.isPending}
                        >
                          <UserCheck className="h-4 w-4 mr-1" />
                          Reactivate
                        </Button>
                      )
                    )}
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
              <TestTube className="h-4 w-4" />
              Viewer
            </div>
            <p className="text-sm text-muted-foreground">
              Read-only access. Can view all content but cannot add, edit, or delete anything.
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 font-medium mb-1">
              <User className="h-4 w-4 text-blue-600" />
              Standard
            </div>
            <p className="text-sm text-muted-foreground">
              Can view and add new items, but cannot edit or delete existing content.
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 font-medium mb-1">
              <Shield className="h-4 w-4 text-red-600" />
              Admin
            </div>
            <p className="text-sm text-muted-foreground">
              Full system access including view, add, edit, delete, and user management.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

