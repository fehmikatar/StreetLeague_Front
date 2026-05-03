import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { Trophy, Shield, Coins, Plus, Trash2, Edit } from 'lucide-react';
import { loyaltyService } from '@/services/loyaltyService';
import { LoyaltyProgram, LoyaltyTier } from '@/types/loyalty';
import { toast } from 'sonner';

export default function AdminLoyalty() {
  const [programs, setPrograms] = useState<LoyaltyProgram[]>([]);
  const [tiers, setTiers] = useState<LoyaltyTier[]>([]);
  const [selectedProgramId, setSelectedProgramId] = useState<number | null>(null);
  
  // Forms state
  const [isProgramDialogOpen, setIsProgramDialogOpen] = useState(false);
  const [programForm, setProgramForm] = useState<LoyaltyProgram>({ name: '', description: '', pointValue: 10 });
  
  const [isTierDialogOpen, setIsTierDialogOpen] = useState(false);
  const [tierForm, setTierForm] = useState<LoyaltyTier>({ programId: 0, name: '', minPoints: 0, multiplier: 1 });

  const [addPointsForm, setAddPointsForm] = useState({ userId: '', points: '', reason: '' });

  useEffect(() => {
    fetchPrograms();
  }, []);

  useEffect(() => {
    if (selectedProgramId) {
      fetchTiers(selectedProgramId);
    }
  }, [selectedProgramId]);

  const fetchPrograms = async () => {
    try {
      const data = await loyaltyService.getAllPrograms();
      setPrograms(data);
      if (data.length > 0 && !selectedProgramId) {
        setSelectedProgramId(data[0].id!);
      }
    } catch (error) {
      console.error("Failed to fetch programs", error);
    }
  };

  const fetchTiers = async (programId: number) => {
    try {
      const data = await loyaltyService.getTiersByProgram(programId);
      setTiers(data);
    } catch (error) {
      console.error("Failed to fetch tiers", error);
    }
  };

  const handleCreateProgram = async () => {
    try {
      await loyaltyService.createProgram(programForm);
      setIsProgramDialogOpen(false);
      setProgramForm({ name: '', description: '', pointValue: 10 });
      fetchPrograms();
      toast.success('Program created successfully!');
    } catch (error: any) {
      console.error("Failed to create program", error);
      toast.error(error.message || 'Error creating program');
    }
  };

  const handleDeleteProgram = async (id: number) => {
    if(!confirm("Are you sure you want to delete this program?")) return;
    try {
      await loyaltyService.deleteProgram(id);
      fetchPrograms();
      if (selectedProgramId === id) setSelectedProgramId(null);
      toast.success('Program deleted successfully!');
    } catch (error: any) {
      console.error("Failed to delete program", error);
      toast.error(error.message || 'Error deleting program');
    }
  };

  const handleCreateTier = async () => {
    try {
      if (!selectedProgramId) return;
      await loyaltyService.createTier({ ...tierForm, programId: selectedProgramId });
      setIsTierDialogOpen(false);
      setTierForm({ programId: 0, name: '', minPoints: 0, multiplier: 1 });
      fetchTiers(selectedProgramId);
      toast.success('Tier created successfully!');
    } catch (error: any) {
      console.error("Failed to create tier", error);
      toast.error(error.message || 'Error creating tier');
    }
  };

  const handleDeleteTier = async (id: number) => {
    if(!confirm("Are you sure you want to delete this tier?")) return;
    try {
      await loyaltyService.deleteTier(id);
      if (selectedProgramId) fetchTiers(selectedProgramId);
      toast.success('Tier deleted successfully!');
    } catch (error: any) {
      console.error("Failed to delete tier", error);
      toast.error(error.message || 'Error deleting tier');
    }
  };

  const handleAddPoints = async () => {
    try {
      await loyaltyService.addPoints({
        userId: parseInt(addPointsForm.userId),
        points: parseInt(addPointsForm.points),
        reason: addPointsForm.reason
      });
      setAddPointsForm({ userId: '', points: '', reason: '' });
      alert("Points added successfully!");
    } catch (error) {
      console.error("Failed to add points", error);
      alert("Error adding points.");
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex justify-between items-center bg-slate-900 text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="text-primary" /> 
            Administration - Loyalty
          </h1>
          <p className="text-slate-300 mt-1">Manage programs, tiers and distribute points.</p>
        </div>
        <Trophy className="w-24 h-24 absolute right-0 top-1/2 -translate-y-1/2 text-white/5" />
      </div>

      <Tabs defaultValue="programs" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="programs">Programs</TabsTrigger>
          <TabsTrigger value="tiers">Tiers</TabsTrigger>
          <TabsTrigger value="points">Point Distribution</TabsTrigger>
        </TabsList>
        
        {/* PROGRAMS TAB */}
        <TabsContent value="programs" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Active Programs</h2>
            <Dialog open={isProgramDialogOpen} onOpenChange={setIsProgramDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2"><Plus className="w-4 h-4" /> New Program</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create a program</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input value={programForm.name} onChange={e => setProgramForm({...programForm, name: e.target.value})} placeholder="Ex: Street League Rewards" />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input value={programForm.description} onChange={e => setProgramForm({...programForm, description: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Point Value (default pts earned)</Label>
                    <Input type="number" value={programForm.pointValue} onChange={e => setProgramForm({...programForm, pointValue: parseInt(e.target.value) || 0})} />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsProgramDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleCreateProgram}>Create</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map(program => (
              <Card key={program.id} className={`border-2 transition-colors cursor-pointer ${selectedProgramId === program.id ? 'border-primary' : 'hover:border-primary/50'}`} onClick={() => setSelectedProgramId(program.id!)}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{program.name}</CardTitle>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600" onClick={(e) => { e.stopPropagation(); handleDeleteProgram(program.id!); }}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <CardDescription>{program.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm font-medium text-primary">Base value : {program.pointValue} pts</div>
                </CardContent>
              </Card>
            ))}
            {programs.length === 0 && <div className="text-muted-foreground italic">No programs. Create one.</div>}
          </div>
        </TabsContent>

        {/* TIERS TAB */}
        <TabsContent value="tiers" className="space-y-4">
          {!selectedProgramId ? (
            <div className="p-8 text-center border-2 border-dashed rounded-lg text-muted-foreground">
              Please select or create a program in the "Programs" tab first.
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  Tiers for program <Badge variant="secondary">{programs.find(p => p.id === selectedProgramId)?.name}</Badge>
                </h2>
                <Dialog open={isTierDialogOpen} onOpenChange={setIsTierDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2"><Plus className="w-4 h-4" /> Add a Tier</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create a VIP tier</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Tier Name (ex: GOLD)</Label>
                        <Input value={tierForm.name} onChange={e => setTierForm({...tierForm, name: e.target.value})} placeholder="BRONZE, SILVER, GOLD..." />
                      </div>
                      <div className="space-y-2">
                        <Label>Minimum Points Required</Label>
                        <Input type="number" value={tierForm.minPoints} onChange={e => setTierForm({...tierForm, minPoints: parseInt(e.target.value) || 0})} />
                      </div>
                      <div className="space-y-2">
                        <Label>Point Multiplier (ex: 1.5)</Label>
                        <Input type="number" step="0.1" value={tierForm.multiplier} onChange={e => setTierForm({...tierForm, multiplier: parseFloat(e.target.value) || 1})} />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsTierDialogOpen(false)}>Cancel</Button>
                      <Button onClick={handleCreateTier}>Create</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Minimum Points</TableHead>
                      <TableHead>Multiplier</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tiers.map(tier => (
                      <TableRow key={tier.id}>
                        <TableCell className="font-bold">{tier.name}</TableCell>
                        <TableCell>{tier.minPoints}</TableCell>
                        <TableCell>x{tier.multiplier}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50 hover:text-red-600" onClick={() => handleDeleteTier(tier.id!)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {tiers.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No tiers defined for this program.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Card>
            </>
          )}
        </TabsContent>

        {/* DISTRIBUTE POINTS TAB */}
        <TabsContent value="points" className="max-w-2xl mx-auto mt-8">
          <Card className="border-t-4 border-t-primary shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="text-yellow-500" />
                Assign Points
              </CardTitle>
              <CardDescription>
                Manually give points to a user (special reward, event, etc.)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>User ID</Label>
                <Input type="number" placeholder="User ID" value={addPointsForm.userId} onChange={e => setAddPointsForm({...addPointsForm, userId: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Number of Points</Label>
                <Input type="number" placeholder="Ex: 500" value={addPointsForm.points} onChange={e => setAddPointsForm({...addPointsForm, points: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Reason / Description</Label>
                <Input placeholder="Ex: Summer tournament winner" value={addPointsForm.reason} onChange={e => setAddPointsForm({...addPointsForm, reason: e.target.value})} />
              </div>
              <Button className="w-full mt-4" onClick={handleAddPoints} disabled={!addPointsForm.userId || !addPointsForm.points || !addPointsForm.reason}>
                Distribute points
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
