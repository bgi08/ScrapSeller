import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Package, Weight, Clock, IndianRupee, Plus, X } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { MaterialCategory } from '@shared/schema';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
  userAddress: string;
}

interface SelectedMaterial {
  categoryId: number;
  category: MaterialCategory;
  weight: number;
}

export default function BookingModal({ isOpen, onClose, userId, userAddress }: BookingModalProps) {
  const [selectedMaterials, setSelectedMaterials] = useState<SelectedMaterial[]>([]);
  const [totalWeight, setTotalWeight] = useState([5]);
  const [preferredTime, setPreferredTime] = useState('tomorrow');
  const [showMaterialPicker, setShowMaterialPicker] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: categories = [] } = useQuery<MaterialCategory[]>({
    queryKey: ['/api/categories'],
  });

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const response = await apiRequest('POST', '/api/orders', orderData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Pickup Scheduled",
        description: "Your pickup has been scheduled successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      onClose();
      resetForm();
    },
    onError: () => {
      toast({
        title: "Booking Failed",
        description: "Failed to schedule pickup. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setSelectedMaterials([]);
    setTotalWeight([5]);
    setPreferredTime('tomorrow');
    setShowMaterialPicker(false);
  };

  const addMaterial = (category: MaterialCategory) => {
    const existing = selectedMaterials.find(m => m.categoryId === category.id);
    if (existing) return;

    setSelectedMaterials(prev => [...prev, {
      categoryId: category.id,
      category,
      weight: 1,
    }]);
    setShowMaterialPicker(false);
  };

  const removeMaterial = (categoryId: number) => {
    setSelectedMaterials(prev => prev.filter(m => m.categoryId !== categoryId));
  };

  const updateMaterialWeight = (categoryId: number, weight: number) => {
    setSelectedMaterials(prev => prev.map(m => 
      m.categoryId === categoryId ? { ...m, weight } : m
    ));
  };

  const calculateEstimatedEarning = () => {
    return selectedMaterials.reduce((total, material) => {
      return total + (material.weight * parseFloat(material.category.ratePerKg));
    }, 0);
  };

  const handleSubmit = () => {
    if (selectedMaterials.length === 0) {
      toast({
        title: "No materials selected",
        description: "Please select at least one material type.",
        variant: "destructive",
      });
      return;
    }

    const materials = selectedMaterials.map(m => ({
      categoryId: m.categoryId,
      weight: m.weight,
      rate: parseFloat(m.category.ratePerKg),
    }));

    const totalWeight = selectedMaterials.reduce((sum, m) => sum + m.weight, 0);
    const estimatedEarning = calculateEstimatedEarning();

    createOrderMutation.mutate({
      customerId: userId,
      status: 'pending',
      pickupAddress: userAddress,
      estimatedWeight: totalWeight.toString(),
      estimatedEarning: estimatedEarning.toString(),
      materials,
      preferredTime,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            Schedule Pickup
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Pickup Location */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-semibold">
              <MapPin className="w-4 h-4 text-primary" />
              Pickup Location
            </Label>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">{userAddress}</div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-primary">
                    Change
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Material Selection */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-semibold">
              <Package className="w-4 h-4 text-primary" />
              Select Materials
            </Label>
            
            {/* Selected Materials */}
            <div className="space-y-2">
              {selectedMaterials.map(material => (
                <Card key={material.categoryId} className="border-primary/30 bg-primary/5">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-medium">{material.category.name}</div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeMaterial(material.categoryId)}
                        className="text-red-500 h-6 w-6 p-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                      <span>Rate: ₹{material.category.ratePerKg}/kg</span>
                      <span>Weight: {material.weight}kg</span>
                    </div>
                    <Slider
                      value={[material.weight]}
                      onValueChange={([value]) => updateMaterialWeight(material.categoryId, value)}
                      max={20}
                      min={0.5}
                      step={0.5}
                      className="w-full"
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Add Material Button */}
            {!showMaterialPicker ? (
              <Button 
                variant="outline" 
                className="w-full border-dashed border-2 h-12"
                onClick={() => setShowMaterialPicker(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Material Type
              </Button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {categories.map(category => (
                  <Card 
                    key={category.id} 
                    className="cursor-pointer hover:border-primary transition-colors"
                    onClick={() => addMaterial(category)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-1">
                        <div className={`w-6 h-6 bg-${category.color}-100 rounded-lg flex items-center justify-center`}>
                          <i className={`${category.icon} text-${category.color}-600 text-xs`}></i>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          ₹{category.ratePerKg}/kg
                        </Badge>
                      </div>
                      <div className="text-xs font-medium">{category.name}</div>
                      <div className="text-xs text-gray-500">{category.description}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Estimated Earning */}
          {selectedMaterials.length > 0 && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <IndianRupee className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Estimated Earning</span>
                  </div>
                  <span className="text-xl font-bold text-green-800">
                    ₹{Math.round(calculateEstimatedEarning())}
                  </span>
                </div>
                <div className="text-xs text-green-600 mt-1">
                  Final amount depends on actual weight
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pickup Time */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-semibold">
              <Clock className="w-4 h-4 text-primary" />
              Preferred Time
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant={preferredTime === 'today' ? 'default' : 'outline'}
                onClick={() => setPreferredTime('today')}
                className="p-3 h-auto flex flex-col"
              >
                <div className="text-sm font-medium">Today</div>
                <div className="text-xs opacity-75">2-5 PM</div>
              </Button>
              <Button
                variant={preferredTime === 'tomorrow' ? 'default' : 'outline'}
                onClick={() => setPreferredTime('tomorrow')}
                className="p-3 h-auto flex flex-col"
              >
                <div className="text-sm font-medium">Tomorrow</div>
                <div className="text-xs opacity-75">10 AM-1 PM</div>
              </Button>
            </div>
          </div>

          {/* Schedule Button */}
          <Button 
            className="w-full h-12 text-lg font-semibold"
            onClick={handleSubmit}
            disabled={createOrderMutation.isPending || selectedMaterials.length === 0}
          >
            {createOrderMutation.isPending ? (
              'Scheduling...'
            ) : (
              <>
                <Clock className="w-5 h-5 mr-2" />
                Schedule Pickup
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
