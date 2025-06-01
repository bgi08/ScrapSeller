import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, Plus, Zap, Recycle } from 'lucide-react';
import MapView from '@/components/MapView';
import BookingModal from '@/components/BookingModal';
import TrackingModal from '@/components/TrackingModal';
import { useWebSocket } from '@/lib/websocket';
import type { MaterialCategory, PickupOrder } from '@shared/schema';

// Mock user data - in real app this would come from auth context
const currentUser = {
  id: 1,
  name: "John Doe",
  address: "123 HSR Layout, Sector 7, Bangalore, Karnataka 560102",
  location: "HSR Layout, Bangalore"
};

export default function Home() {
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [trackingOrderId, setTrackingOrderId] = useState<number | null>(null);
  const [agentLocations, setAgentLocations] = useState<any[]>([]);

  const { data: categories = [] } = useQuery<MaterialCategory[]>({
    queryKey: ['/api/categories'],
  });

  const { data: stats } = useQuery({
    queryKey: [`/api/dashboard/stats/${currentUser.id}`],
  });

  const { data: recentOrders = [] } = useQuery<PickupOrder[]>({
    queryKey: [`/api/orders/customer/${currentUser.id}`],
  });

  const { data: agentLocationsData = [] } = useQuery({
    queryKey: ['/api/agents/locations'],
  });

  useEffect(() => {
    setAgentLocations(agentLocationsData);
  }, [agentLocationsData]);

  // WebSocket for real-time updates
  useWebSocket((message) => {
    if (message.type === 'locationUpdate') {
      setAgentLocations(prev => prev.map(agent => 
        agent.agentId === message.agentId 
          ? { ...agent, latitude: message.latitude, longitude: message.longitude }
          : agent
      ));
    } else if (message.type === 'orderStatusUpdate') {
      // Refetch orders when status updates
      window.location.reload(); // Simple approach - in production use query invalidation
    }
  });

  const activeOrder = recentOrders.find(order => 
    !['completed', 'cancelled'].includes(order.status)
  );

  const handleCategoryClick = (category: MaterialCategory) => {
    setShowBookingModal(true);
  };

  const handleTrackOrder = (orderId: number) => {
    setTrackingOrderId(orderId);
    setShowTrackingModal(true);
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
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

  return (
    <div className="max-w-md mx-auto bg-white shadow-2xl min-h-screen relative">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 p-4 relative z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Recycle className="text-white" size={16} />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">ScrapPick</h1>
              <p className="text-xs text-gray-500">{currentUser.location}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button className="relative p-2">
              <Bell className="text-gray-600" size={20} />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                2
              </span>
            </button>
            <div className="w-8 h-8 bg-gray-300 rounded-full overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100" 
                alt="User profile" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Map View */}
      <div className="relative">
        <MapView 
          height="24rem"
          agents={agentLocations}
          userLocation={{ latitude: 12.9200, longitude: 77.6400 }}
        />
        
        {/* Map Controls */}
        <div className="absolute top-4 right-4 flex flex-col space-y-2">
          <Button size="sm" variant="secondary" className="w-10 h-10 p-0">
            <i className="fas fa-crosshairs"></i>
          </Button>
          <Button size="sm" variant="secondary" className="w-10 h-10 p-0">
            <i className="fas fa-plus"></i>
          </Button>
          <Button size="sm" variant="secondary" className="w-10 h-10 p-0">
            <i className="fas fa-minus"></i>
          </Button>
        </div>
      </div>

      {/* Bottom Sheet Content */}
      <div className="bg-white rounded-t-3xl shadow-2xl relative z-40 -mt-8 pb-20">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
        </div>

        {/* Active Order Alert */}
        {activeOrder && (
          <div className="mx-6 mb-4">
            <Card className="border-primary bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <Recycle className="text-white" size={16} />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Active Pickup</div>
                      <div className="text-xs text-gray-500">Order #SP{activeOrder.id.toString().padStart(8, '0')}</div>
                    </div>
                  </div>
                  <Badge className={getStatusColor(activeOrder.status)}>
                    {activeOrder.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
                <Button 
                  size="sm" 
                  className="w-full"
                  onClick={() => handleTrackOrder(activeOrder.id)}
                >
                  Track Pickup
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quick Stats */}
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <div className="text-center">
              <div className="text-xl font-bold text-primary">₹{stats?.totalEarnings || 0}</div>
              <div className="text-xs text-gray-500">This Month</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-gray-900">{stats?.totalPickups || 0}</div>
              <div className="text-xs text-gray-500">Pickups</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-accent">{stats?.totalWeight || 0}kg</div>
              <div className="text-xs text-gray-500">Weight</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 space-y-4">
          {/* Schedule Pickup Button */}
          <Button 
            className="w-full h-12 text-lg font-semibold"
            onClick={() => setShowBookingModal(true)}
          >
            <Plus className="mr-2" size={20} />
            Schedule New Pickup
          </Button>

          {/* Material Categories */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center">
              <i className="fas fa-layer-group mr-2 text-gray-500"></i>
              Quick Categories
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              {categories.map(category => (
                <Card 
                  key={category.id}
                  className="cursor-pointer hover:border-primary transition-colors"
                  onClick={() => handleCategoryClick(category)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className={`w-8 h-8 bg-${category.color}-100 rounded-lg flex items-center justify-center`}>
                        <i className={`${category.icon} text-${category.color}-600 text-sm`}></i>
                      </div>
                      <Badge variant="secondary" className="text-xs font-semibold text-primary">
                        ₹{category.ratePerKg}/kg
                      </Badge>
                    </div>
                    <div className="text-sm font-medium text-gray-900">{category.name}</div>
                    <div className="text-xs text-gray-500">{category.description}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Recent Pickups */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center">
                <i className="fas fa-history mr-2 text-gray-500"></i>
                Recent Pickups
              </h3>
              <Button variant="ghost" size="sm" className="text-primary">
                View All
              </Button>
            </div>
            
            <div className="space-y-2">
              {recentOrders.slice(0, 2).map(order => (
                <Card key={order.id} className="cursor-pointer hover:bg-gray-50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          order.status === 'completed' 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-blue-100 text-blue-600'
                        }`}>
                          {order.status === 'completed' ? (
                            <i className="fas fa-check"></i>
                          ) : (
                            <i className="fas fa-clock"></i>
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            Mixed Materials
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDate(order.createdAt)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-gray-900">
                          ₹{order.actualEarning || order.estimatedEarning}
                        </div>
                        <div className="text-xs text-gray-500">
                          {order.actualWeight || order.estimatedWeight}kg
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-600">
                      Estimated weight: {order.estimatedWeight}kg
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Emergency Button */}
      <div className="absolute bottom-20 right-6 z-50">
        <Button 
          size="lg"
          className="w-14 h-14 rounded-full bg-accent hover:bg-yellow-500 text-white shadow-lg"
        >
          <Zap size={24} />
        </Button>
      </div>

      {/* Modals */}
      <BookingModal 
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        userId={currentUser.id}
        userAddress={currentUser.address}
      />

      {trackingOrderId && (
        <TrackingModal 
          isOpen={showTrackingModal}
          onClose={() => {
            setShowTrackingModal(false);
            setTrackingOrderId(null);
          }}
          orderId={trackingOrderId}
        />
      )}
    </div>
  );
}
