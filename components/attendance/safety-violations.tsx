// components/attendance/safety-violations.tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// 1. Definisikan tipe data sesuai skema database asli (Gabungan Kacamata & Sepatu)
interface ViolationData {
  id: number;
  nama: string;
  violation_status?: string;
  camera_name: string;
  confidence: number;
  image_path: string;
  created_at: string;
}

interface SafetyViolationsProps {
  violations?: ViolationData[]; // Tanda tanya (?) menjaga jika data belum siap/kosong dari parent
  isLoading?: boolean;
}

export function SafetyViolations({ violations = [], isLoading = false }: SafetyViolationsProps) {
  return (
    <Card className="border border-border/60 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-bold">Safety Violations History</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border bg-muted/40">
              <TableHead className="font-semibold">Employee</TableHead>
              <TableHead className="font-semibold">Violation Type</TableHead>
              <TableHead className="font-semibold">Camera</TableHead>
              <TableHead className="font-semibold">Confidence</TableHead>
              <TableHead className="font-semibold">Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              /* Skeleton Loading Mode */
              [1, 2, 3].map((i) => (
                <TableRow key={i} className="animate-pulse">
                  <TableCell colSpan={5} className="h-12 bg-muted/20" />
                </TableRow>
              ))
            ) : !violations || violations.length === 0 ? (
              /* Jika baris log database masih kosong */
              <TableRow>
                <td colSpan={5} className="px-6 py-10 text-center text-sm text-muted-foreground">
                  Belum ada riwayat pelanggaran APD yang tercatat di database.
                </td>
              </TableRow>
            ) : (
              /* Tampilkan Data Riil Gabungan Kacamata + Sepatu */
              violations.map((violation) => {
                const isShoes = violation.violation_status === 'NO SAFETY SHOES';
                
                return (
                  <TableRow 
                    key={`${violation.camera_name}-${violation.id}`} 
                    className="border-b border-border hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-4 py-3.5 font-medium text-foreground">{violation.nama}</td>
                    <td className="px-4 py-3.5 text-sm">
                      <span className={`font-semibold ${isShoes ? 'text-amber-600' : 'text-rose-600'}`}>
                        {violation.violation_status || 'NO SAFETY GLASSES'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-muted-foreground font-mono">{violation.camera_name}</td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        isShoes ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {parseFloat(violation.confidence.toString()).toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-muted-foreground">
                      {new Date(violation.created_at).toLocaleString('id-ID', {
                        dateStyle: 'medium',
                        timeStyle: 'short'
                      })}
                    </td>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}