import { Shield, FileText } from "lucide-react";

export const Logo = () => {
  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <FileText className="h-8 w-8 text-primary" strokeWidth={1.5} />
        <Shield className="h-4 w-4 text-accent absolute -bottom-0.5 -right-0.5" strokeWidth={2.5} />
      </div>
      <div className="flex flex-col">
        <span className="text-xl font-bold text-foreground leading-none">Secure Construction</span>
        <span className="text-xs text-muted-foreground leading-none mt-0.5">Ledger</span>
      </div>
    </div>
  );
};
