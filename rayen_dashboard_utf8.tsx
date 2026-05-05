import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Activity, Loader2, Star, PlayCircle, CheckCircle2, Gift } from 'lucide-react';
import { performanceService } from '@/services/performanceService';
import { playerLevelService } from '@/services/playerLevelService';
import { badgePlayerService } from '@/services/badgePlayerService';
import { badgeService } from '@/services/badgeService';
import { promotionService } from '@/services/promotionService';
import { PerformanceRequest, PerformanceResponse } from '@/types/performance';
import { xpCalculator } from '@/utils/xpCalculator';
import { toast } from 'sonner';

// UI Components
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/app/components/ui/dialog';

export default function PerformanceDashboard() {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isWorkflowOpen, setIsWorkflowOpen] = useState(false);
  const [editingPerformance, setEditingPerformance] = useState<PerformanceResponse | null>(null);
  const [selectedPerformance, setSelectedPerformance] = useState<PerformanceResponse | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Workflow State
  const [workflowStep, setWorkflowStep] = useState(0);
  const [calculatedXp, setCalculatedXp] = useState(0);
  const [awardedBadge, setAwardedBadge] = useState<any>(null);
  const [generatedPromo, setGeneratedPromo] = useState<string>('');

  // Form State
  const [formData, setFormData] = useState<PerformanceRequest>({
    playerId: 1,
    matchId: 1,
    score: 0,
    assists: 0,
    distanceCovered: 0,
    timePlayed: 90,
    rating: 5,
  });

  // Fetch Data
  const { data: performances, isLoading } = useQuery({
    queryKey: ['performances'],
    queryFn: performanceService.getAll,
  });

  const { data: badges } = useQuery({
    queryKey: ['badges'],
    queryFn: badgeService.getAll,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: performanceService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performances'] });
      setIsFormOpen(false);
      resetForm();
      toast.success('Performance enregistr├®e avec succ├¿s !');
    },
    onError: (error: any) => {
      if (error.validationErrors) {
        setErrors(error.validationErrors);
        toast.error('Erreur de validation. Veuillez v├®rifier les champs.');
      } else {
        toast.error(error.message || 'Erreur lors de la cr├®ation');
      }
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: PerformanceRequest }) => performanceService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performances'] });
      setIsFormOpen(false);
      resetForm();
      toast.success('Performance modifi├®e avec succ├¿s !');
    },
    onError: (error: any) => {
      if (error.validationErrors) {
        setErrors(error.validationErrors);
        toast.error('Erreur de validation. Veuillez v├®rifier les champs.');
      } else {
        toast.error(error.message || 'Erreur lors de la modification');
      }
    }
  });

  const deleteMutation = useMutation({
    mutationFn: performanceService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performances'] });
      toast.success('Performance supprim├®e avec succ├¿s !');
    },
    onError: (error: any) => toast.error(error.message || 'Erreur lors de la suppression')
  });

  // Workflow Mutations
  const addXpMutation = useMutation({
    mutationFn: ({ playerId, xp }: { playerId: number, xp: number }) => playerLevelService.addXp(playerId, xp),
    onSuccess: () => {
      setWorkflowStep(1);
      toast.success('XP v├®rifi├® et enregistr├® !');
    },
    onError: (error: any) => toast.error(error.message || 'Erreur lors de l\'enregistrement de l\'XP')
  });

  const awardBadgeMutation = useMutation({
    mutationFn: ({ playerId, badgeId, perfId }: any) => badgePlayerService.awardBadge(playerId, badgeId, perfId),
    onSuccess: () => {
      setWorkflowStep(2);
      toast.success('Badge attribu├® avec succ├¿s !');
    },
    onError: (error: any) => toast.error(error.message || 'Le joueur poss├¿de d├®j├á ce badge ou une erreur est survenue.')
  });

  const generatePromoMutation = useMutation({
    mutationFn: promotionService.create,
    onSuccess: () => {
      setWorkflowStep(3);
      toast.success('Code promo g├®n├®r├® et sauvegard├® !');
    },
    onError: (error: any) => toast.error(error.message || 'Erreur lors de la g├®n├®ration du code promo.')
  });

  const resetForm = () => {
    setFormData({ playerId: 1, matchId: 1, score: 0, assists: 0, distanceCovered: 0, timePlayed: 90, rating: 5 });
    setEditingPerformance(null);
    setErrors({});
  };

  const openEditModal = (performance: PerformanceResponse) => {
    setEditingPerformance(performance);
    setFormData({
      playerId: performance.playerId, matchId: performance.matchId, score: performance.score,
      assists: performance.assists, distanceCovered: performance.distanceCovered,
      timePlayed: performance.timePlayed, rating: performance.rating,
    });
    setErrors({});
    setIsFormOpen(true);
  };

  const openWorkflow = (performance: PerformanceResponse) => {
    setSelectedPerformance(performance);
    setWorkflowStep(0);
    setCalculatedXp(0);
    setAwardedBadge(null);
    setGeneratedPromo('');
    setIsWorkflowOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    if (editingPerformance) updateMutation.mutate({ id: editingPerformance.id, data: formData });
    else createMutation.mutate(formData);
  };

  // Workflow Handlers
  const handleVerifyXp = () => {
    if (!selectedPerformance) return;
    const xp = xpCalculator.calculateXpGained(selectedPerformance);
    setCalculatedXp(xp);
    addXpMutation.mutate({ playerId: selectedPerformance.playerId, xp });
  };

  const handleAwardBadge = () => {
    if (!selectedPerformance || !badges || badges.length === 0) {
      toast.warning("Aucun badge disponible dans le syst├¿me.");
      return;
    }
    // Simulation: Picks the highest available badge for demo purposes
    const badgeToAward = badges[0]; 
    setAwardedBadge(badgeToAward);
    awardBadgeMutation.mutate({ 
      playerId: selectedPerformance.playerId, 
      badgeId: badgeToAward.id, 
      perfId: selectedPerformance.id 
    });
  };

  const handleGeneratePromo = () => {
    if (!awardedBadge) return;
    const code = `PROMO${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    setGeneratedPromo(code);
    generatePromoMutation.mutate({
      name: `R├®compense Badge ${awardedBadge.name}`,
      promoCode: code,
      discount: 20,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0], // 24h
    });
  };

  const handleApplyPromo = () => {
    toast.success(`Code promo ${generatedPromo} appliqu├® avec succ├¿s ! La r├®duction est valid├®e.`);
    setWorkflowStep(4);
    setTimeout(() => setIsWorkflowOpen(false), 2000);
  };

  return (
    <div className="container mx-auto py-10 px-4 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Activity className="h-8 w-8 text-primary" />
            Module Performance
          </h1>
          <p className="text-gray-400 mt-2">G├®rez les performances et d├®clenchez le workflow de r├®compense.</p>
        </div>

        <Dialog open={isFormOpen} onOpenChange={(open) => { setIsFormOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setIsFormOpen(true); }} className="bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" /> Ajouter Performance
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[650px] bg-card border-border/50 text-foreground shadow-2xl overflow-hidden rounded-2xl">
            <DialogHeader className="bg-muted/30 -mx-6 -mt-6 p-6 border-b border-border/50">
              <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Activity className="h-6 w-6 text-primary" />
                </div>
                {editingPerformance ? 'Modifier la Performance' : 'Nouvelle Performance'}
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-2">
                Saisissez les statistiques du joueur pour enregistrer sa performance.
              </p>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="p-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                
                {/* Identifiants Section */}
                <div className="md:col-span-2 grid grid-cols-2 gap-4 p-4 bg-muted/20 rounded-xl border border-border/50">
                  <div className="grid gap-2">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">ID Joueur</Label>
                    <div className="relative">
                      <Input 
                        className="pl-3 bg-background border-border focus:ring-primary focus:border-primary transition-all" 
                        type="number" min="1" value={formData.playerId} onChange={(e) => setFormData({ ...formData, playerId: parseInt(e.target.value) || 1 })} required 
                      />
                    </div>
                    {errors.playerId && <span className="text-xs text-red-500 font-medium">{errors.playerId}</span>}
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">ID Match</Label>
                    <Input 
                      className="pl-3 bg-background border-border focus:ring-primary focus:border-primary transition-all" 
                      type="number" min="1" value={formData.matchId} onChange={(e) => setFormData({ ...formData, matchId: parseInt(e.target.value) || 1 })} required 
                    />
                    {errors.matchId && <span className="text-xs text-red-500 font-medium">{errors.matchId}</span>}
                  </div>
                </div>

                {/* Statistiques Offensives */}
                <div className="space-y-5">
                  <h4 className="text-sm font-semibold flex items-center gap-2 text-foreground border-b border-border/50 pb-2">
                    <Star className="w-4 h-4 text-yellow-500" /> Actions Offensives
                  </h4>
                  <div className="grid gap-3">
                    <Label className="font-medium">Buts marqu├®s <span className="text-muted-foreground font-normal text-xs">(0-20)</span></Label>
                    <Input 
                      className="bg-background text-lg font-semibold" 
                      type="number" min="0" max="20" value={formData.score} onChange={(e) => setFormData({ ...formData, score: parseInt(e.target.value) || 0 })} required 
                    />
                    {errors.score && <span className="text-xs text-red-500">{errors.score}</span>}
                  </div>
                  <div className="grid gap-3">
                    <Label className="font-medium">Passes d├®cisives <span className="text-muted-foreground font-normal text-xs">(0-15)</span></Label>
                    <Input 
                      className="bg-background text-lg font-semibold" 
                      type="number" min="0" max="15" value={formData.assists} onChange={(e) => setFormData({ ...formData, assists: parseInt(e.target.value) || 0 })} required 
                    />
                    {errors.assists && <span className="text-xs text-red-500">{errors.assists}</span>}
                  </div>
                </div>

                {/* Effort Physique */}
                <div className="space-y-5">
                  <h4 className="text-sm font-semibold flex items-center gap-2 text-foreground border-b border-border/50 pb-2">
                    <Activity className="w-4 h-4 text-blue-400" /> Effort Physique
                  </h4>
                  <div className="grid gap-3">
                    <Label className="font-medium">Distance <span className="text-muted-foreground font-normal text-xs">(km)</span></Label>
                    <Input 
                      className="bg-background text-lg font-semibold text-blue-500" 
                      type="number" step="0.1" min="0" max="50" value={formData.distanceCovered} onChange={(e) => setFormData({ ...formData, distanceCovered: parseFloat(e.target.value) || 0 })} required 
                    />
                    {errors.distanceCovered && <span className="text-xs text-red-500">{errors.distanceCovered}</span>}
                  </div>
                  <div className="grid gap-3">
                    <Label className="font-medium">Temps de jeu <span className="text-muted-foreground font-normal text-xs">(min)</span></Label>
                    <Input 
                      className="bg-background text-lg font-semibold" 
                      type="number" min="0" max="120" value={formData.timePlayed} onChange={(e) => setFormData({ ...formData, timePlayed: parseInt(e.target.value) || 0 })} required 
                    />
                    {errors.timePlayed && <span className="text-xs text-red-500">{errors.timePlayed}</span>}
                  </div>
                </div>

                {/* Note Globale */}
                <div className="md:col-span-2 p-5 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl border border-primary/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-lg font-bold text-foreground">Note Globale du Match</Label>
                      <p className="text-sm text-muted-foreground">├ëvaluation de la performance sur 10</p>
                    </div>
                    <div className="w-1/3">
                      <Input 
                        className="text-2xl font-bold text-center h-14 bg-background border-primary/30 text-primary shadow-inner" 
                        type="number" step="0.1" min="0" max="10" value={formData.rating} onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) || 0 })} required 
                      />
                    </div>
                  </div>
                  {errors.rating && <span className="text-xs text-red-500 block mt-2 text-right">{errors.rating}</span>}
                </div>
              </div>
              <DialogFooter className="mt-4 pt-4 border-t border-border/50">
                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} className="mr-auto">
                  Annuler
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 transition-all">
                  {(createMutation.isPending || updateMutation.isPending) ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                  )}
                  {editingPerformance ? 'Enregistrer les modifications' : 'Valider la Performance'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden mb-8">
        <div className="p-4 bg-muted/30 border-b border-border/50 font-semibold text-white">
          Voir Performance
        </div>
        {isLoading ? (
          <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
        ) : (
          <Table>
            <TableHeader className="bg-muted/10">
              <TableRow>
                <TableHead>Player</TableHead>
                <TableHead className="text-center">Buts</TableHead>
                <TableHead className="text-center">Passes</TableHead>
                <TableHead className="text-center">Note</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {performances?.map((perf) => (
                <TableRow key={perf.id} className="border-border/50">
                  <TableCell>Player #{perf.playerId}</TableCell>
                  <TableCell className="text-center">{perf.score}</TableCell>
                  <TableCell className="text-center">{perf.assists}</TableCell>
                  <TableCell className="text-center"><Star className="inline h-4 w-4 text-yellow-500 mr-1"/>{perf.rating}</TableCell>
                  <TableCell className="text-right flex justify-end gap-2">
                    <Button size="sm" variant="outline" className="bg-primary/20 hover:bg-primary/40 text-primary border-primary/30" onClick={() => openWorkflow(perf)}>
                      <PlayCircle className="mr-2 h-4 w-4" /> Lancer Workflow
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => openEditModal(perf)}><Pencil className="h-4 w-4 text-blue-400" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => {
                        if(window.confirm('Voulez-vous supprimer cette performance ?')) deleteMutation.mutate(perf.id);
                    }} disabled={deleteMutation.isPending}><Trash2 className="h-4 w-4 text-red-400" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Workflow Modal */}
      <Dialog open={isWorkflowOpen} onOpenChange={setIsWorkflowOpen}>
        <DialogContent className="sm:max-w-[550px] bg-card border-border/50 text-foreground shadow-2xl rounded-2xl overflow-hidden p-0">
          <DialogHeader className="bg-gradient-to-r from-primary/10 to-accent/10 px-6 py-6 border-b border-border/50">
            <DialogTitle className="text-2xl font-bold flex items-center gap-3 text-foreground">
              <div className="p-2 bg-background rounded-full shadow-sm border border-border/50">
                <Gift className="h-6 w-6 text-primary" />
              </div>
              Workflow de R├®compense
            </DialogTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Suivez les ├®tapes pour attribuer les r├®compenses suite ├á cette performance.
            </p>
          </DialogHeader>
          <div className="p-6 space-y-4 bg-background/50">
            
            {/* Step 1 */}
            <div className={`p-5 border rounded-xl flex items-center justify-between transition-all duration-300 ${workflowStep >= 0 ? 'bg-card border-primary/40 shadow-sm ring-1 ring-primary/10' : 'opacity-60 grayscale bg-muted/50 border-border'}`}>
              <div className="pr-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${workflowStep >= 0 ? 'bg-primary text-primary-foreground' : 'bg-muted-foreground/30 text-muted-foreground'}`}>1</span>
                  <h3 className="font-semibold text-foreground text-lg">D├®tection de niveau</h3>
                </div>
                <p className="text-sm text-muted-foreground pl-8">Calcule l'XP pour cette performance.</p>
                {workflowStep >= 1 && <span className="text-sm font-semibold text-primary mt-2 ml-8 inline-block bg-primary/10 px-2 py-1 rounded-md">+{calculatedXp} XP confirm├®s !</span>}
              </div>
              <div>
                {workflowStep === 0 ? (
                  <Button onClick={handleVerifyXp} disabled={addXpMutation.isPending} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md transition-all hover:scale-105">
                    {addXpMutation.isPending ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : 'V├®rifier XP'}
                  </Button>
                ) : <CheckCircle2 className="text-primary h-8 w-8 animate-in zoom-in duration-300" />}
              </div>
            </div>

            {/* Step 2 */}
            <div className={`p-5 border rounded-xl flex items-center justify-between transition-all duration-300 ${workflowStep >= 1 ? 'bg-card border-primary/40 shadow-sm ring-1 ring-primary/10' : 'opacity-60 grayscale bg-muted/50 border-border'}`}>
              <div className="pr-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${workflowStep >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted-foreground/30 text-muted-foreground'}`}>2</span>
                  <h3 className="font-semibold text-foreground text-lg">R├®compense de Badge</h3>
                </div>
                <p className="text-sm text-muted-foreground pl-8">Octroie un badge si le seuil est atteint.</p>
                {awardedBadge && <span className="text-sm font-semibold text-accent mt-2 ml-8 inline-block bg-accent/10 px-2 py-1 rounded-md">Badge '{awardedBadge.name}' obtenu !</span>}
              </div>
              <div>
                {workflowStep === 1 ? (
                  <Button onClick={handleAwardBadge} disabled={awardBadgeMutation.isPending} variant="secondary" className="shadow-md transition-all hover:scale-105">
                    {awardBadgeMutation.isPending ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : 'Attribuer Badge'}
                  </Button>
                ) : workflowStep > 1 ? <CheckCircle2 className="text-primary h-8 w-8 animate-in zoom-in duration-300" /> : null}
              </div>
            </div>

            {/* Step 3 */}
            <div className={`p-5 border rounded-xl flex items-center justify-between transition-all duration-300 ${workflowStep >= 2 ? 'bg-card border-primary/40 shadow-sm ring-1 ring-primary/10' : 'opacity-60 grayscale bg-muted/50 border-border'}`}>
              <div className="pr-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${workflowStep >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted-foreground/30 text-muted-foreground'}`}>3</span>
                  <h3 className="font-semibold text-foreground text-lg">Offre Promotionnelle</h3>
                </div>
                <p className="text-sm text-muted-foreground pl-8">G├®n├¿re un code de r├®duction temporaire.</p>
                {generatedPromo && <span className="text-sm font-mono bg-yellow-500/10 text-yellow-600 border border-yellow-500/30 px-3 py-1 rounded-md mt-2 ml-8 inline-block font-semibold">Code : {generatedPromo} (24h)</span>}
              </div>
              <div>
                {workflowStep === 2 ? (
                  <Button onClick={handleGeneratePromo} disabled={generatePromoMutation.isPending} className="bg-yellow-500 hover:bg-yellow-600 text-white shadow-md transition-all hover:scale-105">
                    {generatePromoMutation.isPending ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : 'G├®n├®rer Promo'}
                  </Button>
                ) : workflowStep > 2 ? <CheckCircle2 className="text-primary h-8 w-8 animate-in zoom-in duration-300" /> : null}
              </div>
            </div>

            {/* Step 4 - Success Message */}
            {workflowStep >= 3 && (
               <div className="p-6 mt-6 border-2 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/5 border-green-500/30 flex flex-col items-center justify-center space-y-5 animate-in slide-in-from-bottom-4 fade-in duration-500 shadow-inner">
                 <div className="text-center space-y-2">
                   <div className="flex justify-center mb-3">
                     <div className="bg-green-500/20 p-3 rounded-full">
                       <Gift className="h-8 w-8 text-green-500" />
                     </div>
                   </div>
                   <h3 className="font-extrabold text-green-600 dark:text-green-400 text-xl">F├®licitations !</h3>
                   <p className="text-sm text-muted-foreground">
                     Utilisez le code <strong className="font-mono text-foreground bg-muted px-2 py-1 rounded border border-border shadow-sm text-base mx-1">{generatedPromo}</strong> pour profiter de 20% de r├®duction.
                   </p>
                 </div>
                 <Button onClick={handleApplyPromo} size="lg" className="w-full bg-green-600 hover:bg-green-500 text-white font-bold shadow-lg shadow-green-500/30 transition-all hover:-translate-y-1">
                   Appliquer la Promo
                 </Button>
               </div>
            )}

          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
