import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, ExternalLink } from "lucide-react";
import { AIDocumentUpload } from "@/components/AIDocumentUpload";
import { useState } from "react";
import { toast } from "sonner";

interface PlatformFormData {
  platform: string;
  useCase: string;
  website: string;
  costOwner: "Client" | "GTM Planetary" | "Both";
  status: "Active" | "Inactive" | "Cancelled";
  billingType?: "Monthly" | "Yearly" | "OneTime" | "Usage" | "Free Plan" | "Pay as you go";
  licenses: string;
  monthlyAmount: number;
  yearlyAmount: number;
  oneTimeAmount: number;
  balanceUsage: number;
  renewalDate: string;
  renewalDay: number;
  isMyToolbelt: boolean;
  isInternalBusiness: boolean;
  isSolutionPartner: boolean;
  notesForManus: string;
  notesForStaff: string;
}

const initialFormData: PlatformFormData = {
  platform: "",
  useCase: "",
  website: "",
  costOwner: "GTM Planetary",
  status: "Active",
  billingType: undefined,
  licenses: "",
  monthlyAmount: 0,
  yearlyAmount: 0,
  oneTimeAmount: 0,
  balanceUsage: 0,
  renewalDate: "",
  renewalDay: 0,
  isMyToolbelt: false,
  isInternalBusiness: false,
  isSolutionPartner: false,
  notesForManus: "",
  notesForStaff: "",
};

export default function Platforms() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<PlatformFormData>(initialFormData);
  const [searchQuery, setSearchQuery] = useState("");

  const utils = trpc.useUtils();
  const { data: platforms, isLoading } = trpc.platforms.list.useQuery();
  const createMutation = trpc.platforms.create.useMutation({
    onSuccess: () => {
      utils.platforms.list.invalidate();
      utils.platforms.stats.invalidate();
      setDialogOpen(false);
      setFormData(initialFormData);
      toast.success("Platform created successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create platform");
    },
  });
  const updateMutation = trpc.platforms.update.useMutation({
    onSuccess: () => {
      utils.platforms.list.invalidate();
      utils.platforms.stats.invalidate();
      setDialogOpen(false);
      setEditingId(null);
      setFormData(initialFormData);
      toast.success("Platform updated successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update platform");
    },
  });
  const deleteMutation = trpc.platforms.delete.useMutation({
    onSuccess: () => {
      utils.platforms.list.invalidate();
      utils.platforms.stats.invalidate();
      toast.success("Platform deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete platform");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = {
      ...formData,
      monthlyAmount: Math.round(formData.monthlyAmount * 100),
      yearlyAmount: Math.round(formData.yearlyAmount * 100),
      oneTimeAmount: Math.round(formData.oneTimeAmount * 100),
      balanceUsage: Math.round(formData.balanceUsage * 100),
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (platform: any) => {
    setEditingId(platform.id);
    setFormData({
      platform: platform.platform,
      useCase: platform.useCase || "",
      website: platform.website || "",
      costOwner: platform.costOwner,
      status: platform.status,
      billingType: platform.billingType || undefined,
      licenses: platform.licenses || "",
      monthlyAmount: (platform.monthlyAmount || 0) / 100,
      yearlyAmount: (platform.yearlyAmount || 0) / 100,
      oneTimeAmount: (platform.oneTimeAmount || 0) / 100,
      balanceUsage: (platform.balanceUsage || 0) / 100,
      renewalDate: platform.renewalDate ? new Date(platform.renewalDate).toISOString().split('T')[0] : "",
      renewalDay: platform.renewalDay || 0,
      isMyToolbelt: platform.isMyToolbelt || false,
      isInternalBusiness: platform.isInternalBusiness || false,
      isSolutionPartner: platform.isSolutionPartner || false,
      notesForManus: platform.notesForManus || "",
      notesForStaff: platform.notesForStaff || "",
    });
    setDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this platform?")) {
      deleteMutation.mutate({ id });
    }
  };

  const filteredPlatforms = platforms?.filter((p) =>
    p.platform.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.useCase?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Platforms</h1>
          <p className="text-muted-foreground">
            Manage your technology stack and subscriptions
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditingId(null);
            setFormData(initialFormData);
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Platform
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Edit Platform" : "Add New Platform"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="platform">Platform Name *</Label>
                  <Input
                    id="platform"
                    value={formData.platform}
                    onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                    required
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="useCase">Use Case</Label>
                  <Textarea
                    id="useCase"
                    value={formData.useCase}
                    onChange={(e) => setFormData({ ...formData, useCase: e.target.value })}
                    rows={2}
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="website">Website URL</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://example.com"
                  />
                </div>

                <div>
                  <Label htmlFor="costOwner">Cost Owner *</Label>
                  <Select
                    value={formData.costOwner}
                    onValueChange={(value: any) => setFormData({ ...formData, costOwner: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Client">Client</SelectItem>
                      <SelectItem value="GTM Planetary">GTM Planetary</SelectItem>
                      <SelectItem value="Both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status">Status *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="billingType">Billing Type</Label>
                  <Select
                    value={formData.billingType}
                    onValueChange={(value: any) => setFormData({ ...formData, billingType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select billing type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Monthly">Monthly</SelectItem>
                      <SelectItem value="Yearly">Yearly</SelectItem>
                      <SelectItem value="OneTime">One Time</SelectItem>
                      <SelectItem value="Usage">Usage</SelectItem>
                      <SelectItem value="Free Plan">Free Plan</SelectItem>
                      <SelectItem value="Pay as you go">Pay as you go</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="licenses">Licenses / User Seats</Label>
                  <Input
                    id="licenses"
                    value={formData.licenses}
                    onChange={(e) => setFormData({ ...formData, licenses: e.target.value })}
                    placeholder="e.g., 5 users"
                  />
                </div>

                <div>
                  <Label htmlFor="monthlyAmount">Monthly Amount ($)</Label>
                  <Input
                    id="monthlyAmount"
                    type="number"
                    step="0.01"
                    value={formData.monthlyAmount}
                    onChange={(e) => setFormData({ ...formData, monthlyAmount: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <div>
                  <Label htmlFor="yearlyAmount">Yearly Amount ($)</Label>
                  <Input
                    id="yearlyAmount"
                    type="number"
                    step="0.01"
                    value={formData.yearlyAmount}
                    onChange={(e) => setFormData({ ...formData, yearlyAmount: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <div>
                  <Label htmlFor="oneTimeAmount">One-Time Amount ($)</Label>
                  <Input
                    id="oneTimeAmount"
                    type="number"
                    step="0.01"
                    value={formData.oneTimeAmount}
                    onChange={(e) => setFormData({ ...formData, oneTimeAmount: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <div>
                  <Label htmlFor="balanceUsage">Balance / Usage ($)</Label>
                  <Input
                    id="balanceUsage"
                    type="number"
                    step="0.01"
                    value={formData.balanceUsage}
                    onChange={(e) => setFormData({ ...formData, balanceUsage: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <div>
                  <Label htmlFor="renewalDate">Renewal Date</Label>
                  <Input
                    id="renewalDate"
                    type="date"
                    value={formData.renewalDate}
                    onChange={(e) => setFormData({ ...formData, renewalDate: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="renewalDay">Renewal Day of Month</Label>
                  <Input
                    id="renewalDay"
                    type="number"
                    min="1"
                    max="31"
                    value={formData.renewalDay || ""}
                    onChange={(e) => setFormData({ ...formData, renewalDay: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div className="col-span-2 space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isMyToolbelt"
                      checked={formData.isMyToolbelt}
                      onChange={(e) => setFormData({ ...formData, isMyToolbelt: e.target.checked })}
                      className="rounded"
                    />
                    <Label htmlFor="isMyToolbelt" className="font-normal cursor-pointer">
                      My Toolbelt
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isInternalBusiness"
                      checked={formData.isInternalBusiness}
                      onChange={(e) => setFormData({ ...formData, isInternalBusiness: e.target.checked })}
                      className="rounded"
                    />
                    <Label htmlFor="isInternalBusiness" className="font-normal cursor-pointer">
                      Internal Business Platform
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isSolutionPartner"
                      checked={formData.isSolutionPartner}
                      onChange={(e) => setFormData({ ...formData, isSolutionPartner: e.target.checked })}
                      className="rounded"
                    />
                    <Label htmlFor="isSolutionPartner" className="font-normal cursor-pointer">
                      Solution Partner
                    </Label>
                  </div>
                </div>

                <div className="col-span-2">
                  <Label htmlFor="notesForManus">Notes for Manus</Label>
                  <Textarea
                    id="notesForManus"
                    value={formData.notesForManus}
                    onChange={(e) => setFormData({ ...formData, notesForManus: e.target.value })}
                    rows={2}
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="notesForStaff">Notes for GTM Planetary Staff</Label>
                  <Textarea
                    id="notesForStaff"
                    value={formData.notesForStaff}
                    onChange={(e) => setFormData({ ...formData, notesForStaff: e.target.value })}
                    rows={2}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setDialogOpen(false);
                    setEditingId(null);
                    setFormData(initialFormData);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingId ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* AI Document Upload */}
      <AIDocumentUpload />

      {/* Search */}
      <div className="max-w-md">
        <Input
          placeholder="Search platforms..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Platforms Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-muted rounded animate-pulse"></div>
          ))}
        </div>
      ) : filteredPlatforms.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">No platforms found</p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Platform
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredPlatforms.map((platform) => (
            <Card key={platform.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="truncate flex items-center gap-2">
                      {platform.platform}
                      {platform.website && (
                        <a
                          href={platform.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {platform.useCase || "No description"}
                    </p>
                  </div>
                  <span
                    className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium shrink-0 ${
                      platform.status === "Active"
                        ? "bg-green-100 text-green-800"
                        : platform.status === "Cancelled"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {platform.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Owner:</span>
                  <span className="font-medium">{platform.costOwner}</span>
                </div>
                {platform.billingType && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Billing:</span>
                    <span className="font-medium">{platform.billingType}</span>
                  </div>
                )}
                {platform.licenses && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Licenses:</span>
                    <span className="font-medium">{platform.licenses}</span>
                  </div>
                )}
                {(platform.monthlyAmount || platform.yearlyAmount) ? (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Cost:</span>
                    <span className="font-semibold text-primary">
                      {platform.monthlyAmount ? `$${(platform.monthlyAmount / 100).toFixed(2)}/mo` : ""}
                      {platform.monthlyAmount && platform.yearlyAmount ? " / " : ""}
                      {platform.yearlyAmount ? `$${(platform.yearlyAmount / 100).toFixed(2)}/yr` : ""}
                    </span>
                  </div>
                ) : null}
                {platform.renewalDate && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Renewal:</span>
                    <span className="font-medium">
                      {new Date(platform.renewalDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEdit(platform)}
                  >
                    <Pencil className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(platform.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

