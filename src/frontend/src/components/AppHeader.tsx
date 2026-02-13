import { Link, useNavigate } from '@tanstack/react-router';
import { useAuth } from '../auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { Building2, LogOut, Settings } from 'lucide-react';
import OfflineBanner from './OfflineBanner';

export default function AppHeader() {
  const { logout, username } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate({ to: '/login' });
  };

  return (
    <header className="border-b bg-card shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-md">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Vivid Design Tech BTM</h1>
              <p className="text-xs text-muted-foreground">Property Listings</p>
            </div>
          </Link>
          
          <div className="flex items-center gap-4">
            <OfflineBanner />
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {username}
            </span>
            <Link to="/settings">
              <Button variant="ghost" size="icon">
                <Settings className="w-5 h-5" />
              </Button>
            </Link>
            <Button variant="outline" onClick={handleLogout} className="gap-2">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
