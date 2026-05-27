import { usePersona } from '@/lib/PersonaContext';
import { useRole } from '@/lib/roleContext';
import { Link } from '@tanstack/react-router';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  FileText, BarChart2, Globe, Brain, Target, TrendingUp, Users, Shield, Zap, Layers, BookOpen, Star,
  Presentation, Sparkles, Settings2
} from 'lucide-react';
import { toast } from 'sonner';

const PERSONA_ICONS: Record<string, any> = {
  FileText,
  BarChart2,
  Globe,
  Brain,
  Target,
  TrendingUp,
  Users,
  Shield,
  Zap,
  Layers,
  BookOpen,
  Star,
  Presentation,
};

export function PersonaSwitcher() {
  const { activePersona, setActivePersona, personas } = usePersona();
  const { can } = useRole();

  const handleSelect = (id: string, name: string) => {
    setActivePersona(id);
    toast.success('Persona switched', {
      description: `Switched workspace profile to: ${name}.`,
    });
  };

  const ActiveIcon = PERSONA_ICONS[activePersona.icon] || Sparkles;
  const showManageLink = can('configure_llm');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-xs font-bold text-primary hover:bg-primary/15 transition-all cursor-pointer shadow-sm">
          <ActiveIcon className="w-3.5 h-3.5" />
          <span>Profile: {activePersona.name}</span>
        </button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="z-50 w-56 bg-popover border border-border p-1.5 rounded-xl shadow-xl text-xs" align="end">
        <div className="px-2.5 py-1 font-bold text-muted-foreground uppercase text-[9px] border-b border-border/50 mb-1.5">
          Switch Workspace Profile
        </div>
        
        {personas.map((p) => {
          const Icon = PERSONA_ICONS[p.icon] || Sparkles;
          const isSelected = p.id === activePersona.id;
          return (
            <DropdownMenuItem
              key={p.id}
              onClick={() => handleSelect(p.id, p.name)}
              className={`flex items-center justify-between px-2.5 py-2 rounded-lg cursor-pointer transition-colors ${
                isSelected ? 'bg-primary/5 text-primary font-bold' : 'hover:bg-muted text-foreground'
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 shrink-0" />
                <span>{p.name}</span>
              </div>
              <span className="text-[9px] font-bold bg-muted px-1.5 py-0.2 rounded text-muted-foreground border border-border/20 shrink-0">
                {p.agents.length} agent{p.agents.length > 1 ? 's' : ''}
              </span>
            </DropdownMenuItem>
          );
        })}

        {showManageLink && (
          <>
            <DropdownMenuSeparator className="my-1.5 border-t border-border/50" />
            <DropdownMenuItem asChild className="p-0">
              <Link
                to="/settings/personas"
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-primary hover:bg-primary/5 font-bold cursor-pointer transition-colors"
              >
                <Settings2 className="w-4 h-4 shrink-0" />
                Manage Personas
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
