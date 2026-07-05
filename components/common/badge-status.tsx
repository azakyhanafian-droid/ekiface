import { Badge } from '@/components/ui/badge';

interface BadgeStatusProps {
  status: 'on_time' | 'late' | 'unknown' | 'safe' | 'warning' | 'danger' | 'registered' | 'pending' | 'online' | 'offline';
  label?: string;
}

export function BadgeStatus({ status, label }: BadgeStatusProps) {
  const statusConfig = {
    on_time: { color: 'bg-green-safe text-white', text: label || 'On Time' },
    late: { color: 'bg-yellow-warning text-white', text: label || 'Late' },
    unknown: { color: 'bg-gray-400 text-white', text: label || 'Unknown' },
    safe: { color: 'bg-green-safe text-white', text: label || 'Safe' },
    warning: { color: 'bg-yellow-warning text-white', text: label || 'Warning' },
    danger: { color: 'bg-red-danger text-white', text: label || 'Danger' },
    registered: { color: 'bg-green-safe text-white', text: label || 'Registered' },
    pending: { color: 'bg-yellow-warning text-white', text: label || 'Pending' },
    online: { color: 'bg-green-safe text-white', text: label || 'Online' },
    offline: { color: 'bg-red-danger text-white', text: label || 'Offline' },
  };

  const config = statusConfig[status];

  return (
    <Badge className={`${config.color} font-medium`}>
      {config.text}
    </Badge>
  );
}
