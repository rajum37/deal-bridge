import { useState } from "react";
import { useGetAiInsights, useScoreDeal, InsightType, Insight } from "@workspace/api-client-react";
import { 
  BrainCircuit, 
  Lightbulb, 
  TrendingUp, 
  AlertTriangle, 
  Briefcase,
  Zap,
  RefreshCw,
  Sparkles
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

const InsightIcon = ({ type, className }: { type: InsightType, className?: string }) => {
  switch (type) {
    case 'opportunity': return <TrendingUp className={className} />;
    case 'risk': return <AlertTriangle className={className} />;
    case 'market': return <Lightbulb className={className} />;
    case 'deal': return <Briefcase className={className} />;
    default: return <BrainCircuit className={className} />;
  }
};

const InsightColor = (type: InsightType) => {
  switch (type) {
    case 'opportunity': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
    case 'risk': return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
    case 'market': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
    case 'deal': return 'text-primary bg-primary/10 border-primary/20';
    default: return 'text-muted-foreground bg-secondary border-border';
  }
};

export default function AiInsights() {
  const { data: insights, isLoading } = useGetAiInsights();
  const scoreDeal = useScoreDeal();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("all");

  const handleRequestAnalysis = () => {
    scoreDeal.mutate({ data: { dealData: { context: "global_market_scan" } } }, {
      onSuccess: () => {
        toast({ title: "Global scan initiated", description: "Intelligence network is processing new signals." });
      }
    });
  };

  const filteredInsights = insights?.filter(i => activeTab === 'all' || i.type === activeTab) || [];

  return (
    <div className="flex flex-col gap-8 pb-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 animate-fade-in-up">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <BrainCircuit className="w-8 h-8 text-primary" />
            AI Insights
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Synthesized intelligence from market trends, historical deal patterns, and active pipeline data.
          </p>
        </div>
        
        <Button 
          onClick={handleRequestAnalysis}
          disabled={scoreDeal.isPending}
          className="bg-primary/20 text-primary hover:bg-primary/30 border border-primary/50 glow-accent shrink-0"
        >
          {scoreDeal.isPending ? (
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Zap className="w-4 h-4 mr-2" />
          )}
          {scoreDeal.isPending ? "Scanning Networks..." : "Request Global Scan"}
        </Button>
      </div>

      {/* Featured Insight (Top one) */}
      {!isLoading && insights && insights.length > 0 && activeTab === 'all' && (
        <div className="glass-card-accent p-1 relative overflow-hidden rounded-2xl animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-purple-500/10 to-primary/10 animate-[gradientShift_8s_ease_infinite] background-size-[200%_200%]" />
          
          <div className="bg-background/80 backdrop-blur-xl p-8 rounded-xl relative z-10 flex flex-col md:flex-row gap-8 items-start">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/30 shrink-0 glow-pulse">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 uppercase tracking-wider text-[10px] font-bold px-2 py-0.5">
                  High Priority Intelligence
                </Badge>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <span className="status-dot active" /> Live Data Stream
                </span>
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-3">{insights[0].title}</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {insights[0].body}
              </p>
              
              {insights[0].relevantDealIds && insights[0].relevantDealIds.length > 0 && (
                <div className="mt-6 pt-6 border-t border-border/50">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-3">Impacts {insights[0].relevantDealIds.length} Active Deals</p>
                  <div className="flex gap-2">
                    {insights[0].relevantDealIds.slice(0, 3).map(id => (
                      <div key={id} className="h-2 w-16 bg-primary/30 rounded-full overflow-hidden">
                        <div className="h-full bg-primary data-flow" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Grid of insights */}
      <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-background/50 border border-border mb-8 p-1">
            <TabsTrigger value="all" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">All Signals</TabsTrigger>
            <TabsTrigger value="market" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">Market Trends</TabsTrigger>
            <TabsTrigger value="opportunity" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400">Opportunities</TabsTrigger>
            <TabsTrigger value="risk" className="data-[state=active]:bg-rose-500/20 data-[state=active]:text-rose-400">Risk Alerts</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-0 outline-none">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-48 w-full rounded-xl" />
                ))
              ) : (
                filteredInsights.slice(activeTab === 'all' ? 1 : 0).map((insight, i) => {
                  const colorClass = InsightColor(insight.type);
                  
                  return (
                    <div 
                      key={insight.id}
                      className="glass-card p-6 flex flex-col group hover:border-primary/30 transition-all animate-fade-in-up"
                      style={{ animationDelay: `${(i * 50)}ms` }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className={`p-2 rounded-lg border ${colorClass}`}>
                          <InsightIcon type={insight.type} className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-medium text-muted-foreground bg-background/50 px-2 py-1 rounded-md border border-border/50">
                          {new Date(insight.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <h3 className="text-base font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                        {insight.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                        {insight.body}
                      </p>
                      
                      {insight.relevantDealIds && insight.relevantDealIds.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Relevant to {insight.relevantDealIds.length} deals</span>
                          <Button variant="ghost" size="sm" className="h-7 text-xs text-primary hover:text-primary hover:bg-primary/10 px-2">
                            View Matches
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
              
              {!isLoading && filteredInsights.length === 0 && (
                <div className="col-span-full p-12 text-center border border-dashed border-border/50 rounded-xl bg-background/30">
                  <BrainCircuit className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium text-foreground">No signals detected</h3>
                  <p className="text-muted-foreground">The AI engine hasn't generated insights of this type yet.</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
