import { useState } from "react";
import { useParams, Link } from "wouter";
import { 
  useGetDeal, 
  useUpdateDeal, 
  useAnalyzeDeal,
  getGetDealQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { 
  ArrowLeft,
  Building2,
  Mail,
  User,
  BrainCircuit,
  Zap,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  DollarSign,
  Tag
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const stages = [
  { id: 'lead', label: 'Lead' },
  { id: 'qualified', label: 'Qualified' },
  { id: 'proposal', label: 'Proposal' },
  { id: 'negotiation', label: 'Negotiation' },
  { id: 'closed_won', label: 'Closed Won' },
  { id: 'closed_lost', label: 'Closed Lost' }
];

const formatCurrency = (val: number) => 
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

export default function DealDetail() {
  const params = useParams();
  const id = params.id as string;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: deal, isLoading: dealLoading } = useGetDeal(id, { 
    query: { enabled: !!id, queryKey: getGetDealQueryKey(id) } 
  });
  
  const updateDeal = useUpdateDeal();
  const analyzeDeal = useAnalyzeDeal();
  
  const [analysisPanelVisible, setAnalysisPanelVisible] = useState(false);
  const [analysisData, setAnalysisData] = useState<any>(null);

  const handleStageChange = (newStage: string) => {
    updateDeal.mutate({ id, data: { stage: newStage } }, {
      onSuccess: () => {
        toast({ title: "Stage updated successfully" });
        queryClient.invalidateQueries({ queryKey: getGetDealQueryKey(id) });
      }
    });
  };

  const handleRunAnalysis = () => {
    setAnalysisPanelVisible(true);
    analyzeDeal.mutate({ id }, {
      onSuccess: (data) => {
        setAnalysisData(data);
        queryClient.invalidateQueries({ queryKey: getGetDealQueryKey(id) });
      },
      onError: () => {
        toast({ title: "Analysis failed", variant: "destructive" });
        setAnalysisPanelVisible(false);
      }
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 50) return "text-amber-400";
    return "text-rose-400";
  };

  if (dealLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <Skeleton className="h-8 w-32" />
        <div className="flex gap-8">
          <Skeleton className="h-64 w-2/3" />
          <Skeleton className="h-64 w-1/3" />
        </div>
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <AlertTriangle className="w-12 h-12 mb-4 text-rose-500/50" />
        <h2 className="text-xl font-bold">Deal Not Found</h2>
        <p className="mt-2">The deal you're looking for does not exist or has been removed.</p>
        <Link href="/deals">
          <Button variant="outline" className="mt-6 border-border">Back to Pipeline</Button>
        </Link>
      </div>
    );
  }

  // Calculate circular progress for score
  const scorePercent = deal.score;
  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDashoffset = circumference - (scorePercent / 100) * circumference;

  return (
    <div className="flex flex-col gap-8 pb-12 max-w-6xl mx-auto">
      {/* Top Nav */}
      <div className="flex items-center gap-4 animate-fade-in-up">
        <Link href="/deals">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full border-border bg-background/50 hover:bg-background hover:text-primary">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Deal Intelligence Profile
        </div>
      </div>

      {/* Header Profile */}
      <div className="glass-card p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-secondary/50 border border-primary/20 flex items-center justify-center glow-accent flex-shrink-0">
            <Building2 className="w-10 h-10 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
              {deal.company}
              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-xs py-0">
                {deal.industry || "B2B Enterprise"}
              </Badge>
            </h1>
            <p className="text-xl text-muted-foreground">{deal.title}</p>
          </div>
        </div>

        <div className="flex items-center gap-8 bg-background/40 p-4 rounded-xl border border-border/50">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Deal Value</p>
            <div className="text-3xl font-bold text-emerald-400">{formatCurrency(deal.value)}</div>
          </div>
          <div className="w-px h-12 bg-border/50" />
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Pipeline Stage</p>
            <Select value={deal.stage} onValueChange={handleStageChange}>
              <SelectTrigger className="w-[180px] h-9 bg-background/50 border-primary/30 font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {stages.map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-8">
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-4 p-4 rounded-lg bg-background/40 border border-border/50">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                  <User className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Primary Contact</p>
                  <p className="font-medium text-foreground">{deal.contactName || "Unassigned"}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-lg bg-background/40 border border-border/50">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Email Address</p>
                  <p className="font-medium text-foreground">{deal.contactEmail || "No email provided"}</p>
                </div>
              </div>
            </div>

            {deal.tags && deal.tags.length > 0 && (
              <div className="mt-6 flex items-center gap-2 flex-wrap">
                <Tag className="w-4 h-4 text-muted-foreground mr-2" />
                {deal.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="bg-secondary/50 text-secondary-foreground border-border/50">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-primary" />
                AI Deal Synthesis
              </h3>
            </div>
            {deal.aiSummary ? (
              <div className="prose prose-invert max-w-none text-muted-foreground">
                <p className="leading-relaxed">{deal.aiSummary}</p>
              </div>
            ) : (
              <div className="p-8 text-center bg-background/30 rounded-lg border border-dashed border-border/50">
                <BrainCircuit className="w-8 h-8 mx-auto text-muted-foreground mb-3 opacity-50" />
                <p className="text-muted-foreground">No AI summary generated yet. Run analysis to generate insights.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Score & Analysis */}
        <div className="space-y-8">
          <div className="glass-card-accent p-6 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 hero-glow opacity-50" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-primary mb-6 relative z-10">AI Confidence Score</h3>
            
            <div className="relative w-48 h-48 mb-6 z-10 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="96" cy="96" r="45"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-background/50"
                />
                <circle
                  cx="96" cy="96" r="45"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className={`${getScoreColor(deal.score)} transition-all duration-1000 ease-out`}
                  style={{ filter: `drop-shadow(0 0 8px currentColor)` }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-5xl font-bold ${getScoreColor(deal.score)}`}>{deal.score}</span>
                <span className="text-xs text-muted-foreground uppercase font-semibold mt-1">/ 100</span>
              </div>
            </div>

            <Button 
              onClick={handleRunAnalysis} 
              disabled={analyzeDeal.isPending}
              className="w-full bg-primary/20 hover:bg-primary/30 text-primary border border-primary/50 relative z-10 glow-accent"
            >
              <Zap className={`w-4 h-4 mr-2 ${analyzeDeal.isPending ? 'animate-pulse' : ''}`} />
              {analyzeDeal.isPending ? "Analyzing Data Streams..." : "Run Deep Analysis"}
            </Button>
          </div>

          {(analysisPanelVisible || deal.aiSummary) && (
            <div className={`glass-card p-6 border-primary/20 transition-all duration-500 ${analyzeDeal.isPending ? 'opacity-50' : 'opacity-100'}`}>
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Intelligence Report
              </h3>
              
              {analyzeDeal.isPending && !analysisData ? (
                <div className="space-y-6">
                  <div className="space-y-2"><Skeleton className="h-4 w-1/4"/><Skeleton className="h-16 w-full"/></div>
                  <div className="space-y-2"><Skeleton className="h-4 w-1/4"/><Skeleton className="h-16 w-full"/></div>
                </div>
              ) : (
                <div className="space-y-6 animate-fade-in">
                  {/* Real data if available, else fallback if old deal has it, else placeholders since this is mock UI structure */}
                  <div>
                    <h4 className="text-sm font-semibold text-emerald-400 flex items-center gap-2 mb-3">
                      <CheckCircle2 className="w-4 h-4" /> Key Strengths
                    </h4>
                    <ul className="space-y-2">
                      {(analysisData?.strengths || ['High historical win rate in industry', 'Strong executive sponsorship']).map((s: string, i: number) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50 mt-1.5 flex-shrink-0" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-rose-400 flex items-center gap-2 mb-3">
                      <AlertTriangle className="w-4 h-4" /> Identified Risks
                    </h4>
                    <ul className="space-y-2">
                      {(analysisData?.risks || ['Extended procurement timeline likely', 'Competitor pricing pressure']).map((r: string, i: number) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500/50 mt-1.5 flex-shrink-0" />
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {analysisData?.winProbability && (
                    <div className="pt-4 border-t border-border/50">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-muted-foreground">Estimated Win Probability</span>
                        <span className="text-sm font-bold text-primary">{analysisData.winProbability}%</span>
                      </div>
                      <div className="w-full h-2 bg-background rounded-full overflow-hidden">
                        <div className="h-full bg-primary data-flow" style={{ width: `${analysisData.winProbability}%` }} />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
