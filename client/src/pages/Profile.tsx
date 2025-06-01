import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Phone, 
  MapPin, 
  Star, 
  Settings, 
  HelpCircle, 
  Shield, 
  Bell,
  CreditCard,
  History,
  LogOut
} from 'lucide-react';

// Mock user data
const currentUser = {
  id: 1,
  name: "John Doe",
  phone: "+91 9876543210",
  address: "123 HSR Layout, Sector 7, Bangalore, Karnataka 560102",
  rating: "4.5",
  totalPickups: 18,
  memberSince: "2023-06-15"
};

export default function Profile() {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
    });
  };

  const menuItems = [
    { icon: Settings, label: 'Account Settings', action: () => {} },
    { icon: Bell, label: 'Notifications', action: () => {} },
    { icon: CreditCard, label: 'Payment Methods', action: () => {} },
    { icon: History, label: 'Order History', action: () => {} },
    { icon: HelpCircle, label: 'Help & Support', action: () => {} },
    { icon: Shield, label: 'Privacy Policy', action: () => {} },
  ];

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen pb-20">
      <div className="sticky top-0 bg-white border-b border-gray-200 p-4 z-10">
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <User className="w-6 h-6 text-primary" />
          Profile
        </h1>
      </div>

      <div className="p-4 space-y-4">
        {/* Profile Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 bg-gray-300 rounded-full overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100" 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900">{currentUser.name}</h2>
                <div className="flex items-center gap-1 mb-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-medium">{currentUser.rating}</span>
                  <span className="text-sm text-gray-500">({currentUser.totalPickups} pickups)</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  Member since {formatDate(currentUser.memberSince)}
                </Badge>
              </div>
            </div>
            
            <Button variant="outline" className="w-full">
              Edit Profile
            </Button>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <Phone className="w-5 h-5 text-gray-500" />
              <div>
                <div className="text-sm font-medium text-gray-900">{currentUser.phone}</div>
                <div className="text-xs text-gray-500">Phone number</div>
              </div>
            </div>
            
            <Separator />
            
            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-gray-900">{currentUser.address}</div>
                <div className="text-xs text-gray-500">Primary address</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">{currentUser.totalPickups}</div>
                <div className="text-xs text-gray-500">Total Pickups</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">₹2,450</div>
                <div className="text-xs text-gray-500">Total Earned</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-accent">45kg</div>
                <div className="text-xs text-gray-500">Weight Sold</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Menu Items */}
        <Card>
          <CardContent className="p-0">
            {menuItems.map((item, index) => (
              <div key={index}>
                <button
                  onClick={item.action}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className="w-5 h-5 text-gray-500" />
                    <span className="text-sm font-medium text-gray-900">{item.label}</span>
                  </div>
                  <i className="fas fa-chevron-right text-gray-400 text-xs"></i>
                </button>
                {index < menuItems.length - 1 && <Separator />}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* App Information */}
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-sm font-medium text-gray-900 mb-1">ScrapPick</div>
            <div className="text-xs text-gray-500 mb-3">Version 1.0.0</div>
            <div className="text-xs text-gray-400">
              Made with ♻️ for a sustainable future
            </div>
          </CardContent>
        </Card>

        {/* Logout Button */}
        <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50">
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
}
