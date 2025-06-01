import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Phone, MessageCircle, Truck, CheckCircle, Clock, X } from 'lucide-react';
import MapView from './MapView';
import type { PickupOrder, OrderStatusHistory } from '@shared/schema';

interface TrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: number;
}

export default function TrackingModal({ isOpen, onClose, orderId }: TrackingModalProps) {
  const { data: order } = useQuery<PickupOrder>({
    queryKey: [`/api/orders/${orderId}`],
    enabled: isOpen && !!orderId,
  });

  const { data: history = [] } = useQuery<OrderStatusHistory[]>({
    queryKey: [`/api/orders/${orderId}/history`],
    enabled: isOpen && !!orderId,
  });

  const getStatusIcon = (status: string, isCompleted: boolean) => {
    if (isCompleted) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    if (status === order?.status) {
      return <div className="w-4 h-4 bg-primary rounded-full animate-pulse" />;
    }
    return <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-purple-100 text-purple-800';
      case 'collecting': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (date: string | Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto max-h-screen overflow-y-auto p-0">
        {/* Header */}
        <div className="bg-primary text-white p-4">
          <DialogHeader>
            <div className="flex items-center justify-between mb-4">
              <DialogTitle className="text-lg font-semibold">
                Pickup In Progress
              </DialogTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClose}
                className="text-white hover:bg-white/20 h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="text-sm opacity-90">Order #SP{order.id.toString().padStart(8, '0')}</div>
          </DialogHeader>
        </div>

        <div className="p-0">
          {/* Agent Info */}
          {order.agentId && (
            <div className="p-4 bg-white border-b border-gray-200">
              <div className="flex items-center space-x-4">
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100" 
                  alt="Agent profile" 
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="text-sm font-semibold text-gray-900">Agent #A{order.agentId}</div>
                  <div className="text-xs text-gray-500">Agent • 4.8 ⭐ (234 reviews)</div>
                  <div className="text-xs text-green-600 font-medium">
                    {order.status === 'in_progress' ? '2 mins away' : 'On the way'}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" className="w-10 h-10 bg-green-100 hover:bg-green-200 text-green-600 p-0">
                    <Phone className="w-4 h-4" />
                  </Button>
                  <Button size="sm" className="w-10 h-10 bg-blue-100 hover:bg-blue-200 text-blue-600 p-0">
                    <MessageCircle className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Live Tracking Map */}
          <div className="h-64">
            <MapView 
              height="16rem"
              agents={[{
                id: order.agentId || 1,
                latitude: "12.9141",
                longitude: "77.6321",
                agent: { name: `Agent #A${order.agentId}` }
              }]}
              userLocation={{ latitude: 12.9200, longitude: 77.6400 }}
            />
          </div>

          {/* Order Details */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-700">Order Details</h3>
              <Badge className={getStatusColor(order.status)}>
                {order.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
            <div className="text-sm text-gray-600">
              <div>Weight: {order.estimatedWeight}kg (estimated)</div>
              <div>Earning: ₹{order.estimatedEarning} (estimated)</div>
            </div>
          </div>

          {/* Status Timeline */}
          <div className="p-4 space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">Pickup Status</h3>
            
            <div className="space-y-3">
              {history.map((item, index) => {
                const isCompleted = history.findIndex(h => h.status === order.status) >= index;
                
                return (
                  <div key={item.id} className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {getStatusIcon(item.status, isCompleted)}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        {item.status.split('_').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatTime(item.timestamp)}
                      </div>
                      {item.notes && (
                        <div className="text-xs text-gray-400 mt-1">{item.notes}</div>
                      )}
                    </div>
                    {isCompleted && <CheckCircle className="w-4 h-4 text-green-500" />}
                  </div>
                );
              })}
              
              {/* Future steps */}
              {!['completed', 'cancelled'].includes(order.status) && (
                <>
                  {order.status !== 'collecting' && (
                    <div className="flex items-center space-x-3 opacity-50">
                      <div className="w-4 h-4 border-2 border-gray-300 rounded-full flex-shrink-0"></div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-400">Material Collection</div>
                        <div className="text-xs text-gray-400">Pending</div>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center space-x-3 opacity-50">
                    <div className="w-4 h-4 border-2 border-gray-300 rounded-full flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-400">Payment & Completion</div>
                      <div className="text-xs text-gray-400">Pending</div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          {!['completed', 'cancelled'].includes(order.status) && (
            <div className="p-4 border-t border-gray-200 space-y-3">
              <Button 
                variant="outline" 
                className="w-full text-red-600 border-red-200 hover:bg-red-50"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel Pickup
              </Button>
              <div className="text-xs text-gray-500 text-center">
                Cancellation charges may apply
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
