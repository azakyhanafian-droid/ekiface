// components/dashboard/smoke-sensor-gauge.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// 1. Definisikan tipe data untuk log gas dari PostgreSQL
interface GasLog {
  id: number;
  value: number;
  status: string;
  created_at: string;
}

interface SmokeSensorGaugeProps {
  logs: GasLog[];
  isLoading: boolean;
}

export function SmokeSensorGauge({ logs, isLoading }: SmokeSensorGaugeProps) {
  // Ambil data terbaru (paling atas) sebagai pointer gauge utama
  const latestRead = logs && logs.length > 0 ? logs[0] : { value: 0, status: 'safe' };

  return (
    <Card className="border border-border/60 shadow-sm">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Current Level
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-24 w-full bg-muted animate-pulse rounded-lg" />
        ) : (
          <div className="space-y-4">
            {/* Tampilan Ringkasan Utama */}
            <div className="text-center py-4">
              <span className="text-4xl font-extrabold tracking-tight">
                {latestRead.value} <span className="text-sm font-normal text-muted-foreground">PPM</span>
              </span>
              <p className={`text-xs font-semibold mt-2 uppercase ${
                latestRead.status.toLowerCase() === 'danger' ? 'text-rose-600' : 'text-emerald-600'
              }`}>
                Status: {latestRead.status}
              </p>
            </div>

            {/* Riwayat Mini 3 Data Terakhir */}
            <div className="text-xs space-y-1.5 border-t pt-3">
              <p className="font-medium text-muted-foreground mb-1">Recent Readings:</p>
              {logs.slice(0, 3).map((log) => (
                <div key={log.id} className="flex justify-between items-center text-muted-foreground">
                  <span>{new Date(log.created_at).toLocaleTimeString('id-ID')}</span>
                  <span className="font-mono font-bold">{log.value} PPM</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}