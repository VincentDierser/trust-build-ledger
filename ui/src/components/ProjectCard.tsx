import { Lock, Calendar, DollarSign, Package, CheckCircle2, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export interface Project {
  id: string;
  name: string;
  description: string;
  budget: number;
  startDate: string;
  endDate: string;
  materials: string[];
  status: 'planning' | 'in-progress' | 'completed';
  progress: number;
  encrypted: boolean;
}

interface ProjectCardProps {
  project: Project;
  onUpdate: (id: string) => void;
}

export const ProjectCard = ({ project, onUpdate }: ProjectCardProps) => {
  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-accent text-accent-foreground';
      case 'in-progress':
        return 'bg-secondary text-secondary-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: Project['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 animate-pulse" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300 border-border/50">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-xl flex items-center gap-2">
              {project.name}
              {project.encrypted && (
                <Lock className="h-4 w-4 text-accent" />
              )}
            </CardTitle>
            <CardDescription>{project.description}</CardDescription>
          </div>
          <Badge className={getStatusColor(project.status)}>
            <div className="flex items-center gap-1">
              {getStatusIcon(project.status)}
              <span className="capitalize">{project.status.replace('-', ' ')}</span>
            </div>
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-semibold text-foreground">{project.progress}%</span>
          </div>
          <Progress value={project.progress} className="h-2" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-center gap-2 p-3 bg-accent-light rounded-lg">
            <DollarSign className="h-4 w-4 text-accent shrink-0" />
            <div className="flex flex-col min-w-0">
              <span className="text-xs text-muted-foreground">Budget</span>
              <span className="font-semibold text-sm text-foreground truncate">
                ${project.budget.toLocaleString()}
              </span>
            </div>
            {project.encrypted && (
              <Lock className="h-3 w-3 text-accent ml-auto shrink-0" />
            )}
          </div>

          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <Calendar className="h-4 w-4 text-primary shrink-0" />
            <div className="flex flex-col min-w-0">
              <span className="text-xs text-muted-foreground">Timeline</span>
              <span className="font-semibold text-xs text-foreground">
                {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <div className="p-3 bg-accent-light rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Package className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium text-foreground">Materials</span>
            {project.encrypted && (
              <Lock className="h-3 w-3 text-accent ml-auto" />
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {project.materials.map((material, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {material}
              </Badge>
            ))}
          </div>
        </div>

        <Button 
          onClick={() => onUpdate(project.id)} 
          className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
        >
          Update Milestone
        </Button>
      </CardContent>
    </Card>
  );
};
