// components/dashboard/realtime-attendance.tsx
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// 1. Definisikan tipe data sesuai dengan output query app/api/attendance/route.ts
interface AttendanceLog {
  id: number;
  nama: string;
  status: string;
  time: string;
}

interface RealtimeAttendanceProps {
  logs: AttendanceLog[];
  isLoading: boolean;
}

export function RealtimeAttendance({ logs, isLoading }: RealtimeAttendanceProps) {
  return (
    <Card className="border border-border/60 shadow-sm overflow-hidden">
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 bg-muted animate-pulse rounded" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-muted-foreground">
              <thead className="text-xs uppercase bg-muted/40 text-foreground border-b font-medium">
                <tr>
                  <th className="px-6 py-3.5">Nama Karyawan</th>
                  <th className="px-6 py-3.5">Waktu Scan</th>
                  <th className="px-6 py-3.5">Status Kehadiran</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 bg-card text-foreground">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-muted-foreground">
                      Belum ada aktivitas absensi hari ini.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-3.5 font-medium">{log.nama}</td>
                      <td className="px-6 py-3.5 font-mono text-xs text-muted-foreground">{log.time}</td>
                      <td className="px-6 py-3.5">
                        <Badge 
                          variant="outline" 
                          className={
                            log.status.toLowerCase().includes('time') || log.status.toLowerCase() === 'present'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }
                        >
                          {log.status}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}