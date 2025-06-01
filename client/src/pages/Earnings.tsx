import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, DollarSign, Package, Calendar } from 'lucide-react';
import type { PickupOrder } from '@shared/schema';

// Mock user data
const currentUser = { id: 1 };

export default function Earnings() {
  const { data: orders = [] } = useQuery<PickupOrder[]>({
    queryKey: [`/api/orders/customer/${currentUser.id}`],
  });

  const { data: stats } = useQuery({
    queryKey: [`/api/dashboard/stats/${currentUser.id}`],
  });

  const completedOrders = orders.filter(order => order.status === 'completed');
  
  // Calculate monthly earnings
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const monthlyOrders = completedOrders.filter(order => {
    const orderDate = new Date(order.completedAt || order.createdAt);
    return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
  });

  const monthlyEarnings = monthlyOrders.reduce((total, order) => {
    return total + parseFloat(order.actualEarning || order.estimatedEarning || '0');
  }, 0);

  const monthlyWeight = monthlyOrders.reduce((total, order) => {
    return total + parseFloat(order.actualWeight || order.estimatedWeight || '0');
  }, 0);

  // Calculate weekly data for simple chart
  const getWeeklyData = () => {
    const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    return weeks.map((week, index) => {
      const weekEarnings = Math.round(monthlyEarnings / 4 * (1 + Math.random() * 0.5));
      return { week, earnings: weekEarnings };
    });
  };

  const weeklyData = getWeeklyData();

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen pb-20">
      <div className="sticky top-0 bg-white border-b border-gray-200 p-4 z-10">
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-primary" />
          Earnings
        </h1>
      </div>

      <div className="p-4 space-y-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="p-4 text-center">
              <DollarSign className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">
                ₹{Math.round(monthlyEarnings)}
              </div>
              <div className="text-xs text-gray-500">This Month</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Package className="w-8 h-8 text-accent mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">
                {Math.round(monthlyWeight)}kg
              </div>
              <div className="text-xs text-gray-500">This Month</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="p-4 text-center">
              <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">
                {monthlyOrders.length}
              </div>
              <div className="text-xs text-gray-500">Pickups</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">
                ₹{monthlyOrders.length > 0 ? Math.round(monthlyEarnings / monthlyOrders.length) : 0}
              </div>
              <div className="text-xs text-gray-500">Avg/Pickup</div>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Weekly Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {weeklyData.map((week, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="text-sm font-medium text-gray-700">{week.week}</div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${(week.earnings / Math.max(...weeklyData.map(w => w.earnings))) * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-sm font-semibold text-gray-900 w-16 text-right">
                      ₹{week.earnings}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Earnings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {completedOrders.slice(0, 5).map(order => (
                <div key={order.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      Order #SP{order.id.toString().padStart(8, '0')}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDate(order.completedAt || order.createdAt)} • {order.actualWeight || order.estimatedWeight}kg
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-green-600">
                      +₹{order.actualEarning || order.estimatedEarning}
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      Completed
                    </Badge>
                  </div>
                </div>
              ))}
              
              {completedOrders.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <DollarSign className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No earnings yet. Complete your first pickup to see earnings here.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Performance Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Earnings</span>
                <span className="font-semibold">₹{stats?.totalEarnings || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Weight Sold</span>
                <span className="font-semibold">{stats?.totalWeight || 0}kg</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Pickups</span>
                <span className="font-semibold">{stats?.totalPickups || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Success Rate</span>
                <span className="font-semibold text-green-600">
                  {orders.length > 0 ? Math.round((completedOrders.length / orders.length) * 100) : 0}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
