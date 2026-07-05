'use client';

import { useState, useEffect } from 'react';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { LiveCameraPreview } from '@/components/dashboard/live-camera-preview';
import { SmokeSensorGauge } from '@/components/dashboard/smoke-sensor-gauge';
import { RealtimeAttendance } from '@/components/dashboard/realtime-attendance';
import { Badge } from '@/components/ui/badge';
import { Activity } from 'lucide-react';

export default function DashboardPage() {
  // 1. State Statistik Utama
  const [stats, setStats] = useState({
    totalAttendanceToday: 0,
    lateEmployees: 0,
    safetyViolations: 0,
    averageConfidence: 0,
  });

  // 2. State Tambahan untuk Sinkronisasi Real-time Komponen Anak
  const [gasLogs, setGasLogs] = useState([]);
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fungsi mengumpulkan semua data dari API internal sekaligus (PostgreSQL + MQTT Worker logs)
  const fetchDashboardData = async () => {
    try {
      // Fetch statistik ringkasan
      const resStats = await fetch('/api/dashboard');
      if (resStats.ok) {
        const data = await resStats.json();
        setStats(data);
      }

      // Fetch pembacaan sensor gas terbaru dari sensor_logs (MQTT Worker)
      const resGas = await fetch('/api/gas');
      if (resGas.ok) {
        const dataGas = await resGas.json();
        setGasLogs(dataGas);
      }

      // Fetch log absensi fingerprint terbaru dari attendance_logs (MQTT Worker + Sepatu)
      const resAttendance = await fetch('/api/attendance');
      if (resAttendance.ok) {
        const dataAttendance = await resAttendance.json();
        setAttendanceLogs(dataAttendance);
      }

    } catch (err) {
      console.error('Gagal menyinkronkan data dashboard NeoGuard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Polling periodik terpusat setiap 3 detik agar sinkronisasi data IoT 
    // dari MQTT Worker & skrip Python AI langsung instan masuk ke UI web
    const interval = setInterval(fetchDashboardData, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 space-y-6 bg-background">
      {/* Judul Halaman & Indikator Ekosistem IoT */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Real-time monitoring overview</p>
        </div>
        <div className="flex items-center">
          <Badge variant="outline" className="px-3 py-1 bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm font-medium">
            <Activity className="w-3.5 h-3.5 mr-1.5 text-emerald-600 animate-pulse" />
            Core Server Active (4 CAMs)
          </Badge>
        </div>
      </div>

      {/* 1. Panel Ringkasan Statistik Utama (Bebas Error TS2322) */}
      <StatsCards data={stats} isLoading={loading} />

      {/* Grid Utama Layout Pemantauan */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* 3. Panel Gauge Monitoring Asap & Gas Lingkungan Pabrik */}
        <div className="xl:col-span-4 space-y-4">
          <h2 className="text-lg font-semibold text-foreground tracking-tight">Environmental Monitoring</h2>
          <SmokeSensorGauge logs={gasLogs} isLoading={loading} />
        </div>

      </div>

      {/* 4. Aliran Aktivitas Absensi Fingerprint Real-time */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground tracking-tight">Realtime Fingerprint Attendance</h2>
        <RealtimeAttendance logs={attendanceLogs} isLoading={loading} />
      </div>
    </div>
  );
}