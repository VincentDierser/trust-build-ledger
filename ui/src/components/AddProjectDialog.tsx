import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, Lock } from "lucide-react";
import { toast } from "sonner";

interface AddProjectDialogProps {
  onAddProject: (project: any) => void;
  isConnected: boolean;
}

export const AddProjectDialog = ({ onAddProject, isConnected }: AddProjectDialogProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [materials, setMaterials] = useState("");
  const [encrypted, setEncrypted] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!name || !budget || !startDate || !endDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    const newProject = {
      id: Date.now().toString(),
      name,
      description,
      budget: parseFloat(budget),
      startDate,
      endDate,
      materials: materials.split(',').map(m => m.trim()).filter(Boolean),
      status: 'planning' as const,
      progress: 0,
      encrypted,
    };

    onAddProject(newProject);
    toast.success("Project created successfully!");
    
    // Reset form
    setName("");
    setDescription("");
    setBudget("");
    setStartDate("");
    setEndDate("");
    setMaterials("");
    setEncrypted(true);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="bg-gradient-primary hover:opacity-90 transition-opacity">
          <Plus className="mr-2 h-5 w-5" />
          New Project
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Add a new construction project to the ledger. All data will be securely recorded.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Project Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Downtown Office Building"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief project description"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="budget">Budget (USD) *</Label>
            <Input
              id="budget"
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="e.g., 500000"
              required
              min="0"
              step="0.01"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date *</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="materials">Materials (comma-separated)</Label>
            <Input
              id="materials"
              value={materials}
              onChange={(e) => setMaterials(e.target.value)}
              placeholder="e.g., Concrete, Steel, Glass"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-accent-light rounded-lg">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-accent" />
              <div>
                <Label htmlFor="encrypted" className="cursor-pointer">
                  Encrypt Sensitive Data
                </Label>
                <p className="text-xs text-muted-foreground">
                  Encrypt budget and supplier information
                </p>
              </div>
            </div>
            <Switch
              id="encrypted"
              checked={encrypted}
              onCheckedChange={setEncrypted}
            />
          </div>

          {!isConnected && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
              Please connect your wallet to create a project
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isConnected}
              className="flex-1 bg-gradient-primary hover:opacity-90 transition-opacity"
            >
              Create Project
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
