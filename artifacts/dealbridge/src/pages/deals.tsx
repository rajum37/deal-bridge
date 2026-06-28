import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { 
  useListDeals, 
  useUpdateDeal, 
  useCreateDeal,
  getListDealsQueryKey,
  Deal,
  DealStage
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { 
  Plus, 
  LayoutGrid, 
  List as ListIcon, 
  Search, 
  Building2,
  MoreHorizontal,
  BrainCircuit,
  Calendar,
  Tag as TagIcon
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const stages = [
  { id: 'lead', label: 'Lead', color: 'bg-muted/50 border-muted text-muted-foreground' },
  { id: 'qualified', label: 'Qualified', color: 'bg-blue-500/10 border-blue-500/20 text-blue-400' },
  { id: 'proposal', label: 'Proposal', color: 'bg-purple-500/10 border-purple-500/20 text-purple-400' },
  { id: 'negotiation', label: 'Negotiation', color: 'bg-primary/10 border-primary/20 text-primary' },
  { id: 'closed_won', label: 'Closed Won', color: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' },
  { id: 'closed_lost', label: 'Closed Lost', color: 'bg-rose-500/10 border-rose-500/20 text-rose-400' }
];

const formatCurrency = (val: number) => 
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

const dealFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  company: z.string().min(1, "Company is required"),
  value: z.coerce.number().min(0, "Value must be positive"),
  stage: z.string().min(1, "Stage is required"),
  contactName: z.string().optional(),
  contactEmail: z.string().email("Invalid email").optional().or(z.literal('')),
});

type DealFormValues = z.infer<typeof dealFormSchema>;

export default function Deals() {
  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const [search, setSearch] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: deals, isLoading } = useListDeals(search ? { search } : undefined);
  const updateDeal = useUpdateDeal();
  const createDeal = useCreateDeal();

  const getScoreBadgeClass = (score: number) => {
    if (score >= 80) return "score-high";
    if (score >= 50) return "score-medium";
    return "score-low";
  };

  const form = useForm<DealFormValues>({
    resolver: zodResolver(dealFormSchema),
    defaultValues: {
      title: "",
      company: "",
      value: 0,
      stage: "lead",
      contactName: "",
      contactEmail: "",
    },
  });

  const onSubmit = (data: DealFormValues) => {
    createDeal.mutate({ data }, {
      onSuccess: () => {
        toast({ title: "Deal created successfully" });
        setSheetOpen(false);
        form.reset();
        queryClient.invalidateQueries({ queryKey: getListDealsQueryKey() });
      },
      onError: () => {
        toast({ title: "Failed to create deal", variant: "destructive" });
      }
    });
  };

  const handleStageChange = (dealId: string, newStage: string) => {
    updateDeal.mutate({ id: dealId, data: { stage: newStage } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListDealsQueryKey() });
      }
    });
  };

  // Group deals by stage
  const dealsByStage = stages.reduce((acc, stage) => {
    acc[stage.id] = deals?.filter(d => d.stage === stage.id) || [];
    return acc;
  }, {} as Record<string, Deal[]>);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 flex-shrink-0 animate-fade-in-up">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Pipeline</h1>
          <p className="text-muted-foreground mt-1">Manage and track active deal flows.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search deals, companies..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-background/50 border-border focus-visible:border-primary/50 focus-visible:ring-primary/20"
            />
          </div>
          
          <div className="flex bg-background/50 border border-border rounded-md p-1">
            <button 
              onClick={() => setView('kanban')}
              className={`p-1.5 rounded-sm transition-colors ${view === 'kanban' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setView('list')}
              className={`p-1.5 rounded-sm transition-colors ${view === 'list' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
          
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 glow-accent border border-primary-border">
                <Plus className="w-4 h-4 mr-2" />
                New Deal
              </Button>
            </SheetTrigger>
            <SheetContent className="bg-background border-border/50 sm:max-w-md w-full overflow-y-auto">
              <SheetHeader className="mb-6">
                <SheetTitle className="text-xl">Create New Deal</SheetTitle>
                <SheetDescription>
                  Enter the initial deal information. AI analysis will begin automatically once saved.
                </SheetDescription>
              </SheetHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="company"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company</FormLabel>
                        <FormControl>
                          <Input placeholder="Acme Corp" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Deal Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enterprise License Expansion" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="value"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Value ($)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="stage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Stage</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select stage" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {stages.map(s => (
                                <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="contactName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Jane Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="contactEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Email</FormLabel>
                        <FormControl>
                          <Input placeholder="jane@acme.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" className="w-full mt-6" disabled={createDeal.isPending}>
                    {createDeal.isPending ? "Creating..." : "Create Deal"}
                  </Button>
                </form>
              </Form>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden min-h-0 relative">
        {isLoading ? (
          <div className="flex gap-6 h-full w-full">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex-1 min-w-[280px] max-w-[320px] glass-card p-4 h-full flex flex-col gap-4">
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ))}
          </div>
        ) : view === 'kanban' ? (
          <div className="flex gap-6 h-full w-full overflow-x-auto pb-4 custom-scrollbar items-start">
            {stages.map((stage, i) => (
              <div 
                key={stage.id} 
                className="flex-shrink-0 w-[300px] flex flex-col h-full glass-card bg-background/20 border-border/30 animate-fade-in-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="p-4 border-b border-border/50 flex items-center justify-between sticky top-0 bg-background/40 backdrop-blur-xl z-10 rounded-t-xl">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${stage.color.split(' ')[0]}`} />
                    <h3 className="font-semibold text-foreground">{stage.label}</h3>
                  </div>
                  <span className="text-xs font-medium bg-background/50 px-2 py-1 rounded-md text-muted-foreground border border-border/50">
                    {dealsByStage[stage.id]?.length || 0}
                  </span>
                </div>
                
                <div className="p-3 overflow-y-auto flex-1 custom-scrollbar space-y-3">
                  {dealsByStage[stage.id]?.map((deal, j) => (
                    <div 
                      key={deal.id} 
                      className="glass-card p-4 group cursor-pointer hover:-translate-y-1 transition-all duration-300 animate-fade-in"
                      style={{ animationDelay: `${(i * 50) + (j * 50)}ms` }}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <Link href={`/deals/${deal.id}`} className="block flex-1 group-hover:text-primary transition-colors">
                          <h4 className="font-semibold text-sm line-clamp-1">{deal.company}</h4>
                        </Link>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40 bg-popover/90 backdrop-blur-xl border-border/50">
                            {stages.filter(s => s.id !== deal.stage).map(s => (
                              <DropdownMenuItem 
                                key={s.id} 
                                onClick={() => handleStageChange(deal.id, s.id)}
                                className="cursor-pointer"
                              >
                                Move to {s.label}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      
                      <Link href={`/deals/${deal.id}`} className="block">
                        <p className="text-xs text-muted-foreground mb-4 line-clamp-2">{deal.title}</p>
                        
                        <div className="flex items-end justify-between mt-auto">
                          <div className="font-bold text-foreground tracking-tight">
                            {formatCurrency(deal.value)}
                          </div>
                          <div className={`score-badge ${getScoreBadgeClass(deal.score)}`}>
                            {deal.score}
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                  
                  {dealsByStage[stage.id]?.length === 0 && (
                    <div className="h-24 border border-dashed border-border/30 rounded-lg flex items-center justify-center text-xs text-muted-foreground">
                      No deals
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card overflow-hidden h-full flex flex-col animate-fade-in">
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground bg-background/40 sticky top-0 z-10 backdrop-blur-md">
                  <tr>
                    <th className="px-6 py-4 font-medium border-b border-border/50">Company</th>
                    <th className="px-6 py-4 font-medium border-b border-border/50">Deal</th>
                    <th className="px-6 py-4 font-medium border-b border-border/50">Value</th>
                    <th className="px-6 py-4 font-medium border-b border-border/50">Stage</th>
                    <th className="px-6 py-4 font-medium border-b border-border/50">AI Score</th>
                    <th className="px-6 py-4 font-medium border-b border-border/50">Updated</th>
                    <th className="px-6 py-4 font-medium border-b border-border/50"></th>
                  </tr>
                </thead>
                <tbody>
                  {deals?.map((deal, i) => {
                    const stageConfig = stages.find(s => s.id === deal.stage);
                    return (
                      <tr 
                        key={deal.id} 
                        className="border-b border-border/20 hover:bg-white/5 transition-colors group animate-fade-in-up"
                        style={{ animationDelay: `${i * 50}ms` }}
                      >
                        <td className="px-6 py-4 font-medium text-foreground">
                          <Link href={`/deals/${deal.id}`} className="hover:text-primary transition-colors flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                            {deal.company}
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">{deal.title}</td>
                        <td className="px-6 py-4 font-bold">{formatCurrency(deal.value)}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${stageConfig?.color.split(' ')[0]}`} />
                            <span className="capitalize">{deal.stage.replace('_', ' ')}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`score-badge ${getScoreBadgeClass(deal.score)}`}>{deal.score}</span>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {new Date(deal.updatedAt || deal.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="p-2 hover:bg-background rounded-md transition-colors opacity-0 group-hover:opacity-100">
                                <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {stages.filter(s => s.id !== deal.stage).map(s => (
                                <DropdownMenuItem 
                                  key={s.id} 
                                  onClick={() => handleStageChange(deal.id, s.id)}
                                >
                                  Move to {s.label}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })}
                  {deals?.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                        No deals found matching your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
