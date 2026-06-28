import { useListActivity } from "@workspace/api-client-react";
import { Link } from "wouter";
import { 
  ActivitySquare,
  Building2,
  DollarSign,
  AlertTriangle,
  BrainCircuit,
  ArrowUpRight,
  MessageSquare,
  Clock
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Activity() {
  const { data: activities, isLoading } = useListActivity({ limit: 50 });

  return (
    <div className="flex flex-col gap-8 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
          <ActivitySquare className="w-8 h-8 text-primary" />
          System Activity
        </h1>
        <p className="text-muted-foreground mt-2">
          Real-time event ledger across all pipeline operations.
        </p>
      </div>

      <div className="glass-card p-8 min-h-[600px] relative animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        {isLoading ? (
          <div className="space-y-8 relative pl-8">
            <div className="absolute left-[15px] top-4 bottom-4 w-px bg-border" />
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="relative">
                <div className="absolute -left-[35px] top-1 w-6 h-6 rounded-full bg-secondary border border-border" />
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            ))}
          </div>
        ) : (
          <div className="relative pl-8 border-l border-border/50 ml-4 space-y-8">
            {activities?.map((activity, i) => {
              let icon = <ActivitySquare className="w-4 h-4" />;
              let colorClass = "text-muted-foreground bg-secondary border-border";
              
              if (activity.type === 'deal_won') {
                icon = <DollarSign className="w-4 h-4" />;
                colorClass = "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
              } else if (activity.type === 'deal_lost') {
                icon = <AlertTriangle className="w-4 h-4" />;
                colorClass = "text-rose-400 bg-rose-400/10 border-rose-400/20";
              } else if (activity.type === 'ai_scored') {
                icon = <BrainCircuit className="w-4 h-4" />;
                colorClass = "text-purple-400 bg-purple-400/10 border-purple-400/20 glow-accent";
              } else if (activity.type === 'deal_stage_changed') {
                icon = <ArrowUpRight className="w-4 h-4" />;
                colorClass = "text-primary bg-primary/10 border-primary/20";
              } else if (activity.type === 'deal_created') {
                icon = <Building2 className="w-4 h-4" />;
                colorClass = "text-blue-400 bg-blue-400/10 border-blue-400/20";
              } else if (activity.type === 'note_added') {
                icon = <MessageSquare className="w-4 h-4" />;
                colorClass = "text-amber-400 bg-amber-400/10 border-amber-400/20";
              }

              const date = new Date(activity.createdAt);
              const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const dateString = date.toLocaleDateString([], { month: 'short', day: 'numeric' });

              return (
                <div 
                  key={activity.id} 
                  className="relative animate-slide-in-left group"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className={`absolute -left-[45px] top-0 w-8 h-8 rounded-full flex items-center justify-center border z-10 ${colorClass} transition-transform group-hover:scale-110`}>
                    {icon}
                  </div>
                  
                  <div className="bg-background/40 border border-border/50 rounded-xl p-4 hover:border-primary/30 hover:bg-background/60 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <p className="text-sm font-medium text-foreground">
                        {activity.description}
                      </p>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0 bg-background/50 px-2 py-1 rounded-md">
                        <Clock className="w-3 h-3" />
                        {dateString} • {timeString}
                      </div>
                    </div>
                    
                    {activity.dealId && (
                      <Link href={`/deals/${activity.dealId}`}>
                        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors bg-primary/5 px-2 py-1 rounded border border-primary/10 cursor-pointer">
                          <Building2 className="w-3 h-3" />
                          {activity.dealTitle || "View Deal"}
                        </div>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
            
            {activities?.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No system activity recorded yet.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
