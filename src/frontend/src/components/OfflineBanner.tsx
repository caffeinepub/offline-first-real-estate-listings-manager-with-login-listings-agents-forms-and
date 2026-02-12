import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { Badge } from '@/components/ui/badge';
import { WifiOff, Wifi } from 'lucide-react';

export default function OfflineBanner() {
  const isOnline = useOnlineStatus();

  if (isOnline) {
    return (
      <Badge variant="outline" className="gap-1.5 text-green-600 border-green-600/30 bg-green-50 dark:bg-green-950/20">
        <Wifi className="w-3.5 h-3.5" />
        Online
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="gap-1.5 text-orange-600 border-orange-600/30 bg-orange-50 dark:bg-orange-950/20">
      <WifiOff className="w-3.5 h-3.5" />
      Offline
    </Badge>
  );
}
