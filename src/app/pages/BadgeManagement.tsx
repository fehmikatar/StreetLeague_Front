import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Award, Loader2, Image as ImageIcon } from 'lucide-react';
import { badgeService } from '@/services/badgeService';
import { BadgeRequest, BadgeResponse } from '@/types/badge';
import { toast } from 'sonner';

// UI Components
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
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

export default function BadgeManagement() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBadge, setEditingBadge] = useState<BadgeResponse | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<BadgeRequest>({
    name: '',
    description: '',
    level: 1,
    requiredXp: 100,
    category: 'BRONZE',
    iconUrl: '',
  });

  // Queries
  const { data: badges, isLoading } = useQuery({
    queryKey: ['badges'],
    queryFn: badgeService.getAll,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: badgeService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['badges'] });
      setIsModalOpen(false);
      resetForm();
      toast.success('Badge added successfully!');
    },
    onError: (error: any) => {
      if (error.validationErrors) {
        setErrors(error.validationErrors);
        toast.error('Validation error. Please check the fields.');
      } else {
        toast.error(error.message || 'Error adding badge');
      }
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: BadgeRequest }) => badgeService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['badges'] });
      setIsModalOpen(false);
      resetForm();
      toast.success('Badge updated successfully!');
    },
    onError: (error: any) => {
      if (error.validationErrors) {
        setErrors(error.validationErrors);
        toast.error('Validation error. Please check the fields.');
      } else {
        toast.error(error.message || 'Error updating badge');
      }
    }
  });

  const deleteMutation = useMutation({
    mutationFn: badgeService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['badges'] });
      toast.success('Badge deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error deleting badge');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    if (editingBadge) {
      updateMutation.mutate({ id: editingBadge.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      level: 1,
      requiredXp: 100,
      category: 'BRONZE',
      iconUrl: '',
    });
    setEditingBadge(null);
    setErrors({});
  };

  const openEditModal = (badge: BadgeResponse) => {
    setEditingBadge(badge);
    setFormData({
      name: badge.name,
      description: badge.description || '',
      level: badge.level,
      requiredXp: badge.requiredXp,
      category: badge.category,
      iconUrl: badge.iconUrl || '',
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  return (
    <div className="container mx-auto py-10 px-4 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Award className="h-8 w-8 text-primary" />
            Badge Module
          </h1>
          <p className="text-gray-400 mt-2">Manage the reward system badges.</p>
        </div>

        <Dialog open={isModalOpen} onOpenChange={(open) => { setIsModalOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button onClick={openCreateModal} className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all hover:scale-105">
              <Plus className="mr-2 h-4 w-4" /> Add Badge
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] bg-card border-border/50 text-foreground">
            <DialogHeader>
              <DialogTitle className="text-xl">{editingBadge ? 'Edit Badge' : 'Add Badge'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Badge Name</Label>
                <Input
                  id="name"
                  maxLength={100}
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Sniper"
                />
                {errors.name && <span className="text-sm text-red-500">{errors.name}</span>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value: any) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BRONZE">Bronze</SelectItem>
                    <SelectItem value="SILVER">Silver</SelectItem>
                    <SelectItem value="GOLD">Gold</SelectItem>
                    <SelectItem value="PLATINUM">Platinum</SelectItem>
                  </SelectContent>
                </Select>
                {errors.category && <span className="text-sm text-red-500">{errors.category}</span>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="level">Level (0-10)</Label>
                  <Input
                    id="level"
                    type="number"
                    min="0"
                    max="10"
                    required
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) || 0 })}
                  />
                  {errors.level && <span className="text-sm text-red-500">{errors.level}</span>}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="requiredXp">Required XP</Label>
                  <Input
                    id="requiredXp"
                    type="number"
                    min="0"
                    required
                    value={formData.requiredXp}
                    onChange={(e) => setFormData({ ...formData, requiredXp: parseInt(e.target.value) || 0 })}
                  />
                  {errors.requiredXp && <span className="text-sm text-red-500">{errors.requiredXp}</span>}
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  maxLength={255}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the conditions to obtain..."
                  className="resize-none"
                />
                {errors.description && <span className="text-sm text-red-500">{errors.description}</span>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="iconUrl">Icon URL (Optional)</Label>
                <Input
                  id="iconUrl"
                  type="url"
                  pattern="^(https?|ftp)://[^\s/$.?#].[^\s]*$"
                  value={formData.iconUrl}
                  onChange={(e) => setFormData({ ...formData, iconUrl: e.target.value })}
                  placeholder="https://..."
                />
                {errors.iconUrl && <span className="text-sm text-red-500">{errors.iconUrl}</span>}
              </div>

              <DialogFooter className="mt-6">
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="w-full sm:w-auto">
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {editingBadge ? 'Edit Badge' : 'Add Badge'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden shadow-xl">
        <div className="p-4 bg-muted/30 border-b border-border/50 flex justify-between items-center">
          <h2 className="font-semibold text-foreground">View Badges</h2>
        </div>
        {isLoading ? (
          <div className="flex justify-center items-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-muted/10">
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead className="w-[80px] text-center">Icon</TableHead>
                <TableHead>Badge Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-center">Level</TableHead>
                <TableHead className="text-center">Required XP</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {badges?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No badges found. Click "Add Badge" to start.
                  </TableCell>
                </TableRow>
              ) : (
                badges?.map((badge) => (
                  <TableRow key={badge.id} className="border-border/50 hover:bg-muted/10 transition-colors">
                    <TableCell className="text-center">
                      {badge.iconUrl ? (
                        <img src={badge.iconUrl} alt={badge.name} className="w-10 h-10 rounded-full mx-auto object-cover bg-background border border-border" />
                      ) : (
                        <div className="w-10 h-10 rounded-full mx-auto bg-muted flex items-center justify-center border border-border">
                          <ImageIcon className="h-5 w-5 text-gray-400" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-foreground">{badge.name}</div>
                      <div className="text-sm text-gray-400 truncate max-w-[200px]">{badge.description || '-'}</div>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border
                        ${badge.category === 'GOLD' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 
                          badge.category === 'SILVER' ? 'bg-gray-400/10 text-gray-300 border-gray-400/20' : 
                          badge.category === 'BRONZE' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 
                          'bg-purple-500/10 text-purple-400 border-purple-500/20'}`}
                      >
                        {badge.category}
                      </span>
                    </TableCell>
                    <TableCell className="text-center font-medium">Lvl {badge.level}</TableCell>
                    <TableCell className="text-center font-mono text-primary bg-primary/5 rounded-md px-2 py-1 inline-block mt-2">
                      {badge.requiredXp} XP
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => openEditModal(badge)}
                          className="hover:bg-blue-500/10 hover:text-blue-400 transition-colors"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            if(window.confirm('Are you sure you want to delete this badge?')) {
                              deleteMutation.mutate(badge.id);
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
