import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Briefcase, 
  Lightbulb, 
  ActivitySquare,
  Building2,
  LogOut
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AppLayoutProps {
  children: ReactNode;
}

const navItems = [
  { href: "/", label: "Command Center", icon: LayoutDashboard },
  { href: "/deals", label: "Pipeline", icon: Briefcase },
  { href: "/ai-insights", label: "AI Insights", icon: Lightbulb },
  { href: "/activity", label: "Activity Feed", icon: ActivitySquare },
];

export function AppLayout({ children }: AppLayoutProps) {
  const [location] = useLocation();

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden selection:bg-primary/30">
      {/* Sidebar */}
      <aside className="w-[240px] flex-shrink-0 flex flex-col border-r border-border bg-sidebar sidebar-glow relative z-10">
        <div className="p-6 flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center glow-accent">
            <Building2 className="w-5 h-5 text-primary" />
          </div>
          <span className="font-bold text-lg tracking-wide text-foreground">
            DealBridge <span className="text-primary font-bold">AI</span>
          </span>
        </div>

        <nav className="flex-1 px-4 py-6 flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive = location === item.href || 
                             (item.href !== "/" && location.startsWith(item.href));
            
            return (
              <Link key={item.href} href={item.href}>
                <div className={`nav-item ${isActive ? "active" : ""}`}>
                  <item.icon className={`w-5 h-5 ${isActive ? "text-primary glow-accent-text" : "text-muted-foreground"}`} />
                  <span>{item.label}</span>
                  {isActive && (
                    <div className="absolute left-0 w-1 h-8 bg-primary rounded-r-full glow-pulse" />
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border/50">
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group">
            <Avatar className="h-9 w-9 border border-primary/20">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback className="bg-primary/10 text-primary">SC</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">Sarah Chen</p>
              <p className="text-xs text-muted-foreground truncate">VP of Sales</p>
            </div>
            <LogOut className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative overflow-hidden bg-background">
        <div className="absolute top-0 right-0 w-[50vw] h-[50vh] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-[20%] w-[40vw] h-[40vh] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="h-full w-full overflow-y-auto overflow-x-hidden p-8 relative z-10 custom-scrollbar">
          {children}
        </div>
      </main>
    </div>
  );
}
