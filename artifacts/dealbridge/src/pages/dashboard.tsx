import { useState, useEffect } from "react";
import { Link } from "wouter";
import { 
  useGetDashboardStats, 
  useListActivity, 
  useListDeals, 
  useGetPipelineStats,
  useGetAiInsights
} from "@workspace/api-client-react";
import { 
  Activity, 
  TrendingUp, 
  DollarSign, 
  Percent, 
  BrainCircuit, 
  ChevronRight,
  ArrowUpRight,
  AlertTriangle,
  Lightbulb,
  Briefcase
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

// Formatter utils
const formatCurrency = (val: number) => 
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

const formatCompactCurrency = (val: number) => {
  if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
  if (val >= 1000) return `$${(val / 1000).toFixed(1)}K`;
  return `$${val}`;
};

function AnimatedNumber({ value, formatter = (v) => v.toString() }: { value: number, formatter?: (v: number) => string }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = 1000;
    
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // ease out expo
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setDisplayValue(value * easeProgress);
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    
    window.requestAnimationFrame(step);
  }, [value]);

  return <span>{formatter(displayValue)}</span>;
}

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: pipeline, isLoading: pipelineLoading } = useGetPipelineStats();
  const { data: activities, isLoading: activityLoading } = useListActivity({ limit: 5 });
  const { data: deals, isLoading: dealsLoading } = useListDeals({ limit: 5 });
  const { data: insights, isLoading: insightsLoading } = useGetAiInsights();

  const getScoreBadgeClass = (score: number) => {
    if (score >= 80) return "score-high";
    if (score >= 50) return "score-medium";
    return "score-low";
  };

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Header */}
      <div className="flex items-end justify-between animate-fade-in-up" style={{ animationDelay: "0ms" }}>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Command Center</h1>
          <p className="text-muted-foreground mt-1">Real-time pipeline analysis and deal intelligence.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
          <div className="w-2 h-2 rounded-full bg-primary glow-pulse" />
          System Online
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
        <div className="metric-card group">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Pipeline Value</p>
              <h3 className="text-3xl font-bold text-foreground">
                {statsLoading ? <Skeleton className="h-9 w-32" /> : <AnimatedNumber value={stats?.totalValue || 0} formatter={formatCurrency} />}
              </h3>
            </div>
            <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
          </div>
          <div className="flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-emerald-400 mr-1" />
            <span className="text-emerald-400 font-medium">+{stats?.valueThisMonth ? formatCompactCurrency(stats.valueThisMonth) : "$0"}</span>
            <span className="text-muted-foreground ml-2">this month</span>
          </div>
        </div>

        <div className="metric-card group">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Active Deals</p>
              <h3 className="text-3xl font-bold text-foreground">
                {statsLoading ? <Skeleton className="h-9 w-16" /> : <AnimatedNumber value={stats?.totalDeals || 0} formatter={(v) => Math.round(v).toString()} />}
              </h3>
            </div>
            <div className="p-2 bg-purple-500/10 rounded-lg group-hover:bg-purple-500/20 transition-colors">
              <Briefcase className="w-5 h-5 text-purple-400" />
            </div>
          </div>
          <div className="flex items-center text-sm">
            <span className="text-purple-400 font-medium">{stats?.dealsThisMonth || 0} new</span>
            <span className="text-muted-foreground ml-2">this month</span>
          </div>
        </div>

        <div className="metric-card group">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Avg AI Score</p>
              <h3 className="text-3xl font-bold text-foreground">
                {statsLoading ? <Skeleton className="h-9 w-16" /> : <AnimatedNumber value={stats?.avgScore || 0} formatter={(v) => Math.round(v).toString()} />}
              </h3>
            </div>
            <div className="p-2 bg-amber-500/10 rounded-lg group-hover:bg-amber-500/20 transition-colors">
              <BrainCircuit className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <div className="w-full h-1.5 bg-background rounded-full mt-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-1000 ease-out" 
              style={{ width: `${stats?.avgScore || 0}%` }}
            />
          </div>
        </div>

        <div className="metric-card group">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Win Rate</p>
              <h3 className="text-3xl font-bold text-foreground">
                {statsLoading ? <Skeleton className="h-9 w-20" /> : <AnimatedNumber value={stats?.winRate || 0} formatter={(v) => `${v.toFixed(1)}%`} />}
              </h3>
            </div>
            <div className="p-2 bg-emerald-500/10 rounded-lg group-hover:bg-emerald-500/20 transition-colors">
              <Percent className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs text-muted-foreground">{stats?.closedWon || 0} Won</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-rose-500" />
              <span className="text-xs text-muted-foreground">{stats?.closedLost || 0} Lost</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
        {/* Pipeline Stage Breakdown */}
        <div className="glass-card p-6 lg:col-span-2 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Pipeline Velocity
            </h2>
            <Link href="/deals">
              <span className="text-sm text-primary hover:text-primary/80 flex items-center cursor-pointer">
                View All <ChevronRight className="w-4 h-4 ml-1" />
              </span>
            </Link>
          </div>
          
          <div className="flex-1 flex flex-col justify-center space-y-6">
            {pipelineLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between"><Skeleton className="h-4 w-24" /><Skeleton className="h-4 w-16" /></div>
                  <Skeleton className="h-3 w-full" />
                </div>
              ))
            ) : (
              pipeline?.map((stage, i) => {
                const maxValue = Math.max(...pipeline.map(s => s.value)) || 1;
                const widthPercent = Math.max((stage.value / maxValue) * 100, 2);
                
                return (
                  <div key={stage.stage} className="relative group">
                    <div className="flex items-end justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium capitalize text-foreground">{stage.stage.replace('_', ' ')}</span>
                        <span className="text-xs text-muted-foreground bg-background/50 px-2 py-0.5 rounded-md border border-border">
                          {stage.count} deals
                        </span>
                      </div>
                      <span className="text-sm font-bold">{formatCurrency(stage.value)}</span>
                    </div>
                    
                    <div className="h-2 bg-background rounded-full overflow-hidden border border-border/50">
                      <div 
                        className="h-full bg-primary relative animate-slide-in-left group-hover:brightness-125 transition-all"
                        style={{ 
                          width: `${widthPercent}%`, 
                          animationDelay: `${i * 100}ms` 
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20" />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* AI Insights Panel */}
        <div className="glass-card-accent p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-primary">
              <BrainCircuit className="w-5 h-5" />
              Active Intelligence
            </h2>
          </div>
          
          <div className="space-y-4 flex-1">
            {insightsLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-lg" />
              ))
            ) : (
              insights?.slice(0, 3).map((insight, i) => (
                <div 
                  key={insight.id} 
                  className="p-4 rounded-lg bg-background/40 border border-primary/20 hover:border-primary/40 transition-colors animate-fade-in-up"
                  style={{ animationDelay: `${300 + (i * 100)}ms` }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {insight.type === 'risk' && <AlertTriangle className="w-4 h-4 text-rose-400" />}
                    {insight.type === 'opportunity' && <TrendingUp className="w-4 h-4 text-emerald-400" />}
                    {insight.type === 'market' && <Lightbulb className="w-4 h-4 text-amber-400" />}
                    {insight.type === 'deal' && <Briefcase className="w-4 h-4 text-primary" />}
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{insight.type}</span>
                  </div>
                  <h4 className="text-sm font-medium text-foreground mb-1">{insight.title}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-2">{insight.body}</p>
                </div>
              ))
            )}
          </div>
          
          <Link href="/ai-insights">
            <button className="w-full mt-4 py-2 rounded-lg border border-primary/30 text-primary text-sm font-medium hover:bg-primary/10 transition-colors">
              View All Intelligence
            </button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
        {/* Top Deals */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold mb-6 flex items-center justify-between">
            Top Active Deals
            <Link href="/deals"><span className="text-xs text-primary font-normal cursor-pointer hover:underline">View Pipeline</span></Link>
          </h2>
          
          <div className="space-y-3">
            {dealsLoading ? (
              Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)
            ) : (
              deals?.slice(0, 5).map((deal, i) => (
                <Link key={deal.id} href={`/deals/${deal.id}`}>
                  <div 
                    className="flex items-center justify-between p-3 rounded-lg border border-border bg-background/30 hover:bg-background/80 hover:border-primary/30 transition-all cursor-pointer group animate-fade-in"
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-md bg-secondary flex items-center justify-center border border-border group-hover:border-primary/50 transition-colors">
                        <span className="font-bold text-foreground">{deal.company.charAt(0)}</span>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                          {deal.company}
                          <span className={`score-badge ${getScoreBadgeClass(deal.score)}`}>{deal.score}</span>
                        </h4>
                        <p className="text-xs text-muted-foreground">{deal.title}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-foreground">{formatCompactCurrency(deal.value)}</div>
                      <div className="text-xs capitalize text-muted-foreground">{deal.stage.replace('_', ' ')}</div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold mb-6">Recent Activity</h2>
          
          <div className="space-y-4">
            {activityLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <div className="flex-1 space-y-2"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-1/4" /></div>
                </div>
              ))
            ) : (
              activities?.map((activity, i) => {
                let colorClass = "text-muted-foreground bg-secondary";
                if (activity.type === 'deal_won') colorClass = "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
                if (activity.type === 'deal_lost') colorClass = "text-rose-400 bg-rose-400/10 border-rose-400/20";
                if (activity.type === 'ai_scored') colorClass = "text-purple-400 bg-purple-400/10 border-purple-400/20";
                if (activity.type === 'deal_stage_changed') colorClass = "text-primary bg-primary/10 border-primary/20";
                
                return (
                  <div 
                    key={activity.id} 
                    className="flex gap-4 animate-fade-in-up"
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    <div className={`mt-1 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border ${colorClass}`}>
                      {activity.type === 'deal_won' && <DollarSign className="w-4 h-4" />}
                      {activity.type === 'deal_lost' && <AlertTriangle className="w-4 h-4" />}
                      {activity.type === 'ai_scored' && <BrainCircuit className="w-4 h-4" />}
                      {activity.type.includes('stage') && <ArrowUpRight className="w-4 h-4" />}
                      {!['deal_won', 'deal_lost', 'ai_scored', 'deal_stage_changed'].includes(activity.type) && <Activity className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 pb-4 border-b border-border/50 last:border-0">
                      <p className="text-sm text-foreground">
                        {activity.description}
                        {activity.dealTitle && <span className="font-semibold ml-1 text-primary">({activity.dealTitle})</span>}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(activity.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
