import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Progress } from '@/app/components/ui/progress';
import { Badge } from '@/app/components/ui/badge';
import { 
  Trophy, 
  Gift, 
  History, 
  Coins,
  ArrowRight,
  Sparkles,
  ShoppingBag
} from 'lucide-react';
import { loyaltyService } from '@/services/loyaltyService';
import { LoyaltyClient, LoyaltyProgram, LoyaltyTransaction } from '@/types/loyalty';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';

export default function LoyaltyDashboard() {
  const [client, setClient] = useState<LoyaltyClient | null>(null);
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
  const [programs, setPrograms] = useState<LoyaltyProgram[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Redeem state
  const [redeemAmount, setRedeemAmount] = useState<number>(0);
  const [redeemReason, setRedeemReason] = useState<string>('');
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redeemOpen, setRedeemOpen] = useState(false);

  // Get user ID from local storage
  const userId = parseInt(localStorage.getItem('user_id') || '0', 10);

  useEffect(() => {
    fetchLoyaltyData();
  }, []);

  const fetchLoyaltyData = async () => {
    setLoading(true);
    try {
      if (!userId) return;

      // Fetch user's loyalty profile
      try {
        const clientData = await loyaltyService.getClientByUser(userId);
        setClient(clientData);
        
        // Fetch transactions if client exists
        const txData = await loyaltyService.getUserTransactions(userId);
        setTransactions(txData);
      } catch (e: any) {
        // If 404 or error, they might not be enrolled
        if (e.response?.status === 404 || e.status === 404 || !client) {
           const allPrograms = await loyaltyService.getAllPrograms();
           setPrograms(allPrograms);
        }
      }
    } catch (error) {
      console.error("Failed to fetch loyalty data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (programId: number) => {
    try {
      await loyaltyService.enrollUser({ userId, programId });
      fetchLoyaltyData();
    } catch (error) {
      console.error("Enrollment failed", error);
    }
  };

  const handleRedeem = async () => {
    if (redeemAmount <= 0 || !redeemReason) return;
    setIsRedeeming(true);
    try {
      await loyaltyService.redeemPoints(userId, redeemAmount, redeemReason);
      setRedeemOpen(false);
      fetchLoyaltyData();
    } catch (error) {
      console.error("Failed to redeem points", error);
    } finally {
      setIsRedeeming(false);
    }
  };

  if (loading) {
    return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  }

  // If user is not enrolled in any program, show available programs
  if (!client) {
    return (
      <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full mb-4">
            <Trophy className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Join the Loyalty Program</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Earn points every match, level up and unlock exclusive rewards.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {programs.map(program => (
            <Card key={program.id} className="relative overflow-hidden border-2 hover:border-primary transition-colors group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Sparkles className="w-24 h-24" />
              </div>
              <CardHeader>
                <CardTitle>{program.name}</CardTitle>
                <CardDescription>{program.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <span className="text-3xl font-bold text-primary">{program.pointValue}</span>
                  <span className="text-muted-foreground ml-2">Pts / action</span>
                </div>
                <Button className="w-full" onClick={() => handleEnroll(program.id!)}>
                  Join this program <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
          {programs.length === 0 && (
            <div className="col-span-full text-center text-muted-foreground p-8 border border-dashed rounded-lg">
              No loyalty program available at the moment.
            </div>
          )}
        </div>
      </div>
    );
  }

  // Dashboard for enrolled users
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-slate-900 to-slate-800 p-8 rounded-2xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative z-10 space-y-2">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Trophy className="text-yellow-400" /> 
            Loyalty Hub
          </h1>
          <p className="text-slate-300">Manage your points and rewards.</p>
        </div>
        
        <div className="relative z-10 flex gap-4">
           <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-xl border border-white/20 text-center min-w-[150px]">
             <div className="text-sm text-slate-300 mb-1">Current Balance</div>
             <div className="text-3xl font-bold text-yellow-400 flex items-center justify-center gap-2">
               {client.pointsBalance} <Coins className="w-6 h-6" />
             </div>
           </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column: Status and Tier */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="shadow-lg border-t-4 border-t-primary">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" /> 
                Current Tier
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-end mb-2">
                <div className="text-2xl font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                  {client.tier?.name || 'Standard'}
                </div>
                {client.tier && (
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                    x{client.tier.multiplier} Points
                  </Badge>
                )}
              </div>
              
              <div className="mt-6 space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Overall Progress</span>
                  <span>{client.totalPointsEarned} Pts earned total</span>
                </div>
                <Progress value={Math.min(100, (client.totalPointsEarned % 1000) / 10)} className="h-2" />
                <p className="text-xs text-right text-muted-foreground">Next tier in {1000 - (client.totalPointsEarned % 1000)} pts</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md bg-gradient-to-br from-primary/5 to-transparent border-primary/10">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Gift className="w-5 h-5 text-primary" />
                Redeem Points
              </CardTitle>
              <CardDescription>
                Use your points to get discounts, bookings or items.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog open={redeemOpen} onOpenChange={setRedeemOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full gap-2" variant="default" disabled={client.pointsBalance <= 0}>
                    <ShoppingBag className="w-4 h-4" /> Use my points
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Redeem points</DialogTitle>
                    <DialogDescription>
                      Choose the amount of points to redeem and the reason (e.g. 10$ voucher).
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="points">Number of points (Max: {client.pointsBalance})</Label>
                      <Input 
                        id="points" 
                        type="number" 
                        max={client.pointsBalance} 
                        min={1} 
                        value={redeemAmount || ''} 
                        onChange={(e) => setRedeemAmount(parseInt(e.target.value) || 0)} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reason">Reason for redemption</Label>
                      <Input 
                        id="reason" 
                        placeholder="Ex: 10$ voucher" 
                        value={redeemReason} 
                        onChange={(e) => setRedeemReason(e.target.value)} 
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setRedeemOpen(false)}>Cancel</Button>
                    <Button 
                      onClick={handleRedeem} 
                      disabled={isRedeeming || redeemAmount <= 0 || redeemAmount > client.pointsBalance || !redeemReason}
                    >
                      {isRedeeming ? "Processing..." : "Confirm"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Transactions History */}
        <div className="lg:col-span-2">
          <Card className="h-full shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5 text-muted-foreground" />
                Transaction History
              </CardTitle>
              <CardDescription>
                Your recent point earnings and redemptions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length > 0 ? (
                <div className="space-y-4">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-full ${
                          tx.transactionType === 'EARN' ? 'bg-green-100 text-green-600 dark:bg-green-900/30' : 
                          tx.transactionType === 'REDEEM' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30' : 
                          'bg-blue-100 text-blue-600 dark:bg-blue-900/30'
                        }`}>
                          {tx.transactionType === 'EARN' ? <Trophy className="w-4 h-4" /> : 
                           tx.transactionType === 'REDEEM' ? <ShoppingBag className="w-4 h-4" /> : 
                           <Coins className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{tx.description}</p>
                          <p className="text-xs text-muted-foreground">{new Date(tx.createdAt).toLocaleDateString('fr-FR', {
                            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute:'2-digit'
                          })}</p>
                        </div>
                      </div>
                      <div className={`font-bold ${
                        tx.transactionType === 'EARN' ? 'text-green-600' : 
                        tx.transactionType === 'REDEEM' ? 'text-orange-600' : 
                        'text-blue-600'
                      }`}>
                        {tx.transactionType === 'EARN' ? '+' : '-'}{tx.points}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-12 text-muted-foreground flex flex-col items-center">
                  <History className="w-12 h-12 mb-4 opacity-20" />
                  <p>No transactions yet.</p>
                  <p className="text-sm mt-2">Participate in matches to start earning points!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
