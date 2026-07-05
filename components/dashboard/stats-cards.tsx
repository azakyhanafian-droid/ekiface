// components/dashboard/stats-cards.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, AlertTriangle, TrendingUp, Radio } from 'lucide-react';

// 1. Deklarasi Interface tipe data agar TypeScript mengenali properti lemparan dari parent
interface StatsCardsProps {
  data: {
    totalAttendanceToday: number;
    lateEmployees: number;
    safetyViolations: number;
    averageConfidence: number;
  };
  isLoading: boolean;
}

export function StatsCards({ data, isLoading }: StatsCardsProps) {
  // Array stats yang sudah disinkronkan dengan props dinamis (bukan mock lagi)
  const stats = [
    {
      title: 'Total Attendance',
      value: isLoading ? '...' : data.totalAttendanceToday,
      icon: Users,
      color: 'bg-blue-50 text-primary',
    },
    {
      title: 'Late Employees',
      value: isLoading ? '...' : data.lateEmployees,
      icon: TrendingUp,
      color: 'bg-yellow-50 text-yellow-warning',
    },
    {
      title: 'Safety Violations',
      value: isLoading ? '...' : data.safetyViolations,
      icon: AlertTriangle,
      color: 'bg-red-50 text-red-danger',
    },
    {
      title: 'Avg. Confidence',
      value: isLoading ? '...' : `${data.averageConfidence}%`,
      icon: Radio,
      color: 'bg-green-50 text-green-safe',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card 
            key={stat.title} 
            className={`border-0 shadow-sm hover:shadow-md transition-shadow ${
              isLoading ? 'animate-pulse' : ''
            }`}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                {stat.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}