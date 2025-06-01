import { Link, useLocation } from 'wouter';
import { Home, Clock, TrendingUp, User } from 'lucide-react';

export default function Navigation() {
  const [location] = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/orders', icon: Clock, label: 'Orders' },
    { path: '/earnings', icon: TrendingUp, label: 'Earnings' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200 px-6 py-3 z-50">
      <div className="flex justify-around items-center">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location === path;
          return (
            <Link key={path} href={path}>
              <button className={`flex flex-col items-center space-y-1 ${
                isActive ? 'text-primary' : 'text-gray-400'
              }`}>
                <Icon className="text-lg" size={20} />
                <span className="text-xs font-medium">{label}</span>
              </button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
