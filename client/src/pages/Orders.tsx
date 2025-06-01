import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, CheckCircle, XCircle, Eye } from 'lucide-react';
import type { PickupOrder } from '@shared/schema';

// Mock user data
const currentUser = { id: 1 };

export default function Orders() {
  const { data: orders = [] } = useQuery<PickupOrder[]>({
    queryKey: [`/api/orders/customer/${currentUser.id}`],
  });

  const activeOrders = orders.filter(order => 
    !['completed', 'cancelled'].includes(order.status)
  );
  
  const completedOrders = orders.filter(order => 
    order.status === 'completed'
  );

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'cancelled': return <XCircle className="w-5 h-5 text-red-600" />;
      default: return <Clock className="w-5 h-5 text-blue-600" />;
    }
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const OrderCard = ({ order }: { order: PickupOrder }) => (
    <Card key={order.id} className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            {getStatusIcon(order.status)}
            <div>
              <div className="font-semibold text-gray-900">
                Order #SP{order.id.toString().padStart(8, '0')}
              </div>
              <div className="text-sm text-gray-500">
                {formatDate(order.createdAt)}
              </div>
            </div>
          </div>
          <Badge className={getStatusColor(order.status)}>
            {order.status.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Weight:</span>
            <span className="font-medium">
              {order.actualWeight || order.estimatedWeight}kg
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Earning:</span>
            <span className="font-medium text-green-600">
              ₹{order.actualEarning || order.estimatedEarning}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Preferred Time:</span>
            <span className="font-medium">{order.preferredTime}</span>
          </div>
        </div>

        <div className="text-xs text-gray-500 mb-3">
          {order.pickupAddress}
        </div>

        {order.status !== 'completed' && order.status !== 'cancelled' && (
          <Button variant="outline" size="sm" className="w-full">
            <Eye className="w-4 h-4 mr-2" />
            Track Order
          </Button>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen pb-20">
      <div className="sticky top-0 bg-white border-b border-gray-200 p-4 z-10">
        <h1 className="text-xl font-bold text-gray-900">My Orders</h1>
      </div>

      <div className="p-4">
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="active" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Active ({activeOrders.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Completed ({completedOrders.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-0">
            {activeOrders.length > 0 ? (
              activeOrders.map(order => <OrderCard key={order.id} order={order} />)
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No Active Orders
                  </h3>
                  <p className="text-gray-500 mb-4">
                    You don't have any active pickup orders at the moment.
                  </p>
                  <Button>Schedule New Pickup</Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-0">
            {completedOrders.length > 0 ? (
              completedOrders.map(order => <OrderCard key={order.id} order={order} />)
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No Completed Orders
                  </h3>
                  <p className="text-gray-500">
                    Your completed pickup orders will appear here.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
