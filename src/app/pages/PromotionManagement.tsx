import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Tag, Loader2, Calendar, Percent } from 'lucide-react';
import { promotionService } from '@/services/promotionService';
import { PromotionRequest, PromotionResponse } from '@/types/promotion';
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

export default function PromotionManagement() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<PromotionResponse | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<PromotionRequest>({
    name: '',
    promoCode: '',
    discount: 10,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0],
  });

  // Fetch Promotions
  const { data: promotions, isLoading } = useQuery({
    queryKey: ['promotions'],
    queryFn: promotionService.getAll,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: promotionService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
      setIsModalOpen(false);
      resetForm();
      toast.success('Promotion created successfully!');
    },
    onError: (error: any) => {
      if (error.validationErrors) {
        setErrors(error.validationErrors);
        toast.error('Validation error. Please check the fields.');
      } else {
        toast.error(error.message || 'Error creating promotion');
      }
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: PromotionRequest }) => promotionService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
      setIsModalOpen(false);
      resetForm();
      toast.success('Promotion updated successfully!');
    },
    onError: (error: any) => {
      if (error.validationErrors) {
        setErrors(error.validationErrors);
        toast.error('Validation error. Please check the fields.');
      } else {
        toast.error(error.message || 'Error updating promotion');
      }
    }
  });

  const deleteMutation = useMutation({
    mutationFn: promotionService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
      toast.success('Promotion deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error deleting');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    if (editingPromotion) {
      updateMutation.mutate({ id: editingPromotion.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      promoCode: '',
      discount: 10,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0],
    });
    setEditingPromotion(null);
    setErrors({});
  };

  const openEditModal = (promotion: PromotionResponse) => {
    setEditingPromotion(promotion);
    setFormData({
      name: promotion.name,
      promoCode: promotion.promoCode,
      discount: promotion.discount,
      startDate: promotion.startDate,
      endDate: promotion.endDate,
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  // Helper pour afficher un badge de statut stylisé
  const renderStatus = (startDate: string, endDate: string) => {
    const today = new Date().toISOString().split('T')[0];
    if (endDate < today) {
      return <span className="px-2 py-1 rounded text-xs font-medium bg-red-500/10 text-red-500 border border-red-500/20">Expired</span>;
    }
    if (startDate > today) {
      return <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">Upcoming</span>;
    }
    return <span className="px-2 py-1 rounded text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">Active</span>;
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="container mx-auto py-10 px-4 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Tag className="h-8 w-8 text-primary" />
            Promotion Module
          </h1>
          <p className="text-gray-400 mt-2">Manage promotional codes and discount campaigns.</p>
        </div>

        <Dialog open={isModalOpen} onOpenChange={(open) => { setIsModalOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button onClick={openCreateModal} className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all hover:scale-105">
              <Plus className="mr-2 h-4 w-4" /> Create Promotion
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] bg-card border-border/50 text-foreground">
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center gap-2">
                <Tag className="h-5 w-5 text-primary" />
                {editingPromotion ? 'Edit Promotion' : 'Create Promotion'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Campaign Name</Label>
                <Input
                  id="name"
                  maxLength={100}
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Summer Sale"
                />
                {errors.name && <span className="text-sm text-red-500">{errors.name}</span>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="promoCode">Promo Code (4-20 chars)</Label>
                  <Input
                    id="promoCode"
                    required
                    pattern="^[A-Z0-9]{4,20}$"
                    title="4 to 20 uppercase letters or numbers"
                    maxLength={20}
                    value={formData.promoCode}
                    onChange={(e) => setFormData({ ...formData, promoCode: e.target.value.toUpperCase() })}
                    placeholder="Ex: SUMMER24"
                    className="uppercase font-mono"
                  />
                  {errors.promoCode && <span className="text-sm text-red-500">{errors.promoCode}</span>}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="discount">Discount (%)</Label>
                  <div className="relative">
                    <Input
                      id="discount"
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="100.0"
                      required
                      value={formData.discount}
                      onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
                      className="pr-8"
                    />
                    <Percent className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                  </div>
                  {errors.discount && <span className="text-sm text-red-500">{errors.discount}</span>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <div className="relative">
                    <Input
                      id="startDate"
                      type="date"
                      required
                      min={!editingPromotion ? todayStr : undefined}
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    />
                  </div>
                  {errors.startDate && <span className="text-sm text-red-500">{errors.startDate}</span>}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <div className="relative">
                    <Input
                      id="endDate"
                      type="date"
                      required
                      min={formData.startDate || todayStr}
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    />
                  </div>
                  {errors.endDate && <span className="text-sm text-red-500">{errors.endDate}</span>}
                </div>
              </div>

              <DialogFooter className="mt-6">
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="w-full sm:w-auto">
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {editingPromotion ? 'Edit Promotion' : 'Create Promotion'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden shadow-xl">
        <div className="p-4 bg-muted/30 border-b border-border/50 flex justify-between items-center">
          <h2 className="font-semibold text-foreground">View Promotions</h2>
        </div>
        {isLoading ? (
          <div className="flex justify-center items-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-muted/10">
              <TableRow className="border-border/50">
                <TableHead>Campaign / Code</TableHead>
                <TableHead className="text-center">Discount</TableHead>
                <TableHead>Validity</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {promotions?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    No active promotions.
                  </TableCell>
                </TableRow>
              ) : (
                promotions?.map((promo) => (
                  <TableRow key={promo.id} className="border-border/50 hover:bg-muted/10 transition-colors">
                    <TableCell>
                      <div className="font-medium text-foreground">{promo.name}</div>
                      <div className="font-mono text-sm text-primary bg-primary/10 px-2 py-0.5 rounded inline-block mt-1">
                        {promo.promoCode}
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-bold text-green-400">
                      -{promo.discount}%
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm text-gray-300">
                        <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                        {promo.startDate} <span className="mx-1 text-gray-600">→</span> {promo.endDate}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {renderStatus(promo.startDate, promo.endDate)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => openEditModal(promo)}
                          className="hover:bg-blue-500/10 hover:text-blue-400 transition-colors"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            if(window.confirm('Are you sure you want to delete this promotion?')) {
                              deleteMutation.mutate(promo.id);
                            }
                          }}
                          disabled={deleteMutation.isPending}
                          className="hover:bg-red-500/10 hover:text-red-400 transition-colors"
                        >
                          {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
