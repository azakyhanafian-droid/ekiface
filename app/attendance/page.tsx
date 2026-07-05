'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RealtimeAttendance } from '@/components/dashboard/realtime-attendance';
import { SafetyViolations } from '@/components/attendance/safety-violations';
import { RegisterFingerprint } from '@/components/attendance/register-fingerprint';
import { EmployeeManagement } from '@/components/attendance/employee-management';

export default function AttendancePage() {
  // 1. Kumpulan State untuk menampung data riil dari database
  const [attendanceLogs, setAttendanceLogs] = useState<any[]>([]);
  const [violations, setViolations] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // 2. Fungsi Fetching data kolektif dari semua API Terkait
  const fetchAllAttendanceData = async () => {
    try {
      // A. Ambil data Absensi Fingerprint
      const resAttendance = await fetch('/api/attendance');
      const dataAttendance = resAttendance.ok ? await resAttendance.json() : [];
      setAttendanceLogs(dataAttendance);

      // B. Ambil data Pelanggaran (Gabungan Kacamata + Sepatu)
      const resGlasses = await fetch('/api/glasses-violations');
      const glassesData = resGlasses.ok ? await resGlasses.json() : [];
      const resShoes = await fetch('/api/shoe-violations');
      const shoesData = resShoes.ok ? await resShoes.json() : [];
      
      const combinedViolations = [...glassesData, ...shoesData].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setViolations(combinedViolations);

      // C. Ambil data Master Karyawan (Jika sudah ada API khusus)
      // const resEmployees = await fetch('/api/employees');
      // const dataEmployees = resEmployees.ok ? await resEmployees.json() : [];
      // setEmployees(dataEmployees);

    } catch (err) {
      console.error('Gagal menyinkronkan data ekosistem absensi:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllAttendanceData();

    // Polling periodik terpusat setiap 3 detik agar sinkronisasi hardware R307,
    // MQTT worker, dan Kamera deteksi AI langsung ter-update otomatis di semua tab
    const interval = setInterval(fetchAllAttendanceData, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 space-y-6 bg-background">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Attendance Management</h1>
        <p className="text-muted-foreground mt-1">Employee fingerprint attendance & safety monitoring</p>
      </div>

      {/* Tabs Layout */}
      <Tabs defaultValue="attendance" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-white border border-border p-1 rounded-lg h-auto">
          <TabsTrigger value="attendance" className="rounded py-2 font-medium">
            Attendance
          </TabsTrigger>
          <TabsTrigger value="violations" className="rounded py-2 font-medium">
            Violations
          </TabsTrigger>
          <TabsTrigger value="register" className="rounded py-2 font-medium">
            Register
          </TabsTrigger>
          <TabsTrigger value="employees" className="rounded py-2 font-medium">
            Employees
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Realtime Attendance Log */}
        <TabsContent value="attendance" className="space-y-4 mt-4">
          <RealtimeAttendance logs={attendanceLogs} isLoading={loading} />
        </TabsContent>

        {/* Tab 2: Safety Violations Feed */}
        <TabsContent value="violations" className="space-y-4 mt-4">
          <SafetyViolations violations={violations} isLoading={loading} />
        </TabsContent>

        {/* Tab 3: Register Fingerprint */}
        <TabsContent value="register" className="space-y-4 mt-4">
          <div className="max-w-md">
            <RegisterFingerprint />
          </div>
        </TabsContent>

        {/* Tab 4: Employee Management List (PERBAIKAN: Melepas parameter isLoading bawaan) */}
        <TabsContent value="employees" className="space-y-4 mt-4">
          <EmployeeManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}