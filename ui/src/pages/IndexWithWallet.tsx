import { useState } from "react";
import { Logo } from "@/components/Logo";
import { ProjectCard, Project } from "@/components/ProjectCard";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lock, TrendingUp, Plus } from "lucide-react";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

const IndexWithWallet = () => {
  const { isConnected } = useAccount();
  
  const [projects, setProjects] = useState<Project[]>([
    {
      id: "1",
      name: "Harbor Bridge Renovation",
      description: "Major infrastructure upgrade for the city's main bridge connecting the harbor district",
      budget: 2500000,
      startDate: "2024-01-15",
      endDate: "2024-12-20",
      materials: ["Steel Beams", "Concrete Mix", "Safety Barriers", "LED Lighting"],
      status: "in-progress",
      progress: 45,
      encrypted: true,
    },
    {
      id: "2",
      name: "Downtown Office Complex",
      description: "15-story commercial building with modern amenities and sustainable design",
      budget: 8500000,
      startDate: "2024-03-01",
      endDate: "2025-06-30",
      materials: ["Glass Panels", "Steel Framework", "Elevator Systems", "HVAC Units"],
      status: "in-progress",
      progress: 23,
      encrypted: true,
    },
    {
      id: "3",
      name: "Riverside Park Development",
      description: "Complete renovation of 50-acre public park with new facilities and landscaping",
      budget: 1200000,
      startDate: "2023-09-01",
      endDate: "2024-02-28",
      materials: ["Landscaping Materials", "Playground Equipment", "Lighting", "Irrigation Systems"],
      status: "completed",
      progress: 100,
      encrypted: true,
    },
  ]);

  // Add project dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [materials, setMaterials] = useState("");
  const [encrypted, setEncrypted] = useState(true);

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!name || !budget || !startDate || !endDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    const newProject: Project = {
      id: Date.now().toString(),
      name,
      description,
      budget: parseFloat(budget),
      startDate,
      endDate,
      materials: materials.split(',').map(m => m.trim()).filter(Boolean),
      status: 'planning',
      progress: 0,
      encrypted,
    };

    setProjects([...projects, newProject]);
    toast.success("Project created successfully!");
    
    // Reset form
    setName("");
    setDescription("");
    setBudget("");
    setStartDate("");
    setEndDate("");
    setMaterials("");
    setEncrypted(true);
    setDialogOpen(false);
  };

  const handleUpdateProject = (id: string) => {
    if (!isConnected) {
      toast.error("Please connect your wallet to update projects");
      return;
    }
    
    toast.success("Milestone update recorded on blockchain", {
      description: "Transaction pending confirmation",
    });
  };

  const filterProjects = (status?: Project['status']) => {
    if (!status) return projects;
    return projects.filter(p => p.status === status);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Logo />
            <div className="flex items-center gap-6">
              <div className="hidden md:block text-sm font-medium text-muted-foreground">
                Build with Trust, Secure Every Record.
              </div>
              <ConnectButton 
                chainStatus="icon"
                showBalance={false}
                accountStatus={{
                  smallScreen: 'avatar',
                  largeScreen: 'full',
                }}
              />
            </div>
          </div>
          <div className="md:hidden text-xs text-muted-foreground mt-2 text-center">
            Build with Trust, Secure Every Record.
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        {!isConnected && (
          <div className="mb-6 p-4 bg-accent-light border-l-4 border-accent rounded-lg flex items-start gap-3">
            <Lock className="h-5 w-5 text-accent shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-foreground">Wallet Connection Required</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Connect your Rainbow Wallet to create projects and record milestone updates on the blockchain.
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Project Ledger</h1>
            <p className="text-muted-foreground">
              Manage construction projects with blockchain-secured transparency
            </p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
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
              <form onSubmit={handleAddProject} className="space-y-4">
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
                    onClick={() => setDialogOpen(false)}
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
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="all" className="gap-2">
              All <span className="hidden sm:inline">Projects</span>
              <span className="text-xs bg-muted px-1.5 py-0.5 rounded">{projects.length}</span>
            </TabsTrigger>
            <TabsTrigger value="planning" className="gap-2">
              Planning
              <span className="text-xs bg-muted px-1.5 py-0.5 rounded">
                {filterProjects('planning').length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="in-progress" className="gap-2">
              <TrendingUp className="h-3 w-3" />
              Active
              <span className="text-xs bg-muted px-1.5 py-0.5 rounded">
                {filterProjects('in-progress').length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="completed" className="gap-2">
              Done
              <span className="text-xs bg-muted px-1.5 py-0.5 rounded">
                {filterProjects('completed').length}
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {projects.length === 0 ? (
              <div className="text-center py-12 bg-card rounded-lg border border-dashed border-border">
                <p className="text-muted-foreground">No projects yet. Create your first project to get started.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {projects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onUpdate={handleUpdateProject}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="planning" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filterProjects('planning').map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onUpdate={handleUpdateProject}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="in-progress" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filterProjects('in-progress').map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onUpdate={handleUpdateProject}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filterProjects('completed').map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onUpdate={handleUpdateProject}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default IndexWithWallet;
