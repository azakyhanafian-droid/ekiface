// lib/mock-data.ts

// =========================================================================
// 1. Data Mock Absensi Harian Karyawan (ID diubah ke Angka Hardware)
// =========================================================================
export const mockAttendanceData = [
  {
    id: '1',
    name: 'Ahmad Rizky',
    time: '08:15 AM',
    status: 'on_time',
    confidence: 98.5,
  },
  {
    id: '2',
    name: 'Siti Nurhaliza',
    time: '08:32 AM',
    status: 'late',
    confidence: 97.2,
  },
  {
    id: '3',
    name: 'Budi Santoso',
    time: '08:05 AM',
    status: 'on_time',
    confidence: 99.1,
  },
  {
    id: '4',
    name: 'Dewi Lestari',
    time: '08:45 AM',
    status: 'late',
    confidence: 96.8,
  },
  {
    id: '5',
    name: 'Eka Prasetyo',
    time: '08:12 AM',
    status: 'on_time',
    confidence: 98.9,
  },
  {
    id: '6',
    name: 'Farah Aziza',
    time: 'Unknown',
    status: 'unknown',
    confidence: 0,
  },
];

// =========================================================================
// 2. Data Mock Log Pembacaan Kadar Asap / Gas 
// =========================================================================
export const mockSmokeReadings = [
  { id: 1, time: '14:35', value: 15, status: 'safe' },
  { id: 2, time: '14:30', value: 22, status: 'warning' },
  { id: 3, time: '14:25', value: 18, status: 'safe' },
  { id: 4, time: '14:20', value: 28, status: 'warning' },
  { id: 5, time: '14:15', value: 12, status: 'safe' },
  { id: 6, time: '14:10', value: 35, status: 'danger' },
  { id: 7, time: '14:05', value: 20, status: 'safe' },
];

// =========================================================================
// 3. Data Mock Pelanggaran APD (Koreksi relasi nama berdasarkan ID)
// =========================================================================
export const mockSafetyViolations = [
  {
    id: 'VIO001',
    photo: '/placeholder-violation.jpg',
    name: 'Ahmad Rizky',
    violation: 'Missing Safety Glasses',
    confidence: 94.2,
    time: '2026-07-02 09:15 AM',
    camera: 'CAM-1',
  },
  {
    id: 'VIO002',
    photo: '/placeholder-violation.jpg',
    name: 'Budi Santoso',
    violation: 'Missing Safety Shoes',
    confidence: 91.8,
    time: '2026-07-02 09:32 AM',
    camera: 'CAM-4',
  },
  {
    id: 'VIO003',
    photo: '/placeholder-violation.jpg',
    name: 'Siti Nurhaliza',
    violation: 'Improper PPE',
    confidence: 88.5,
    time: '2026-07-02 10:05 AM',
    camera: 'CAM-3',
  },
];

// =========================================================================
// 4. Data Mock Event Log Deteksi Bounding Box AI
// =========================================================================
export const mockEventLog = [
  {
    id: 'EVT001',
    image: '/placeholder-event.jpg',
    employeeName: 'Ahmad Rizky',
    employeeId: '1', // Sinkron dengan ID Hardware 1
    camera: 'CAM-1',
    violationType: 'Missing Safety Glasses',
    confidence: 94.2,
    timestamp: '2026-07-02 09:15 AM',
    boundingBox: { x: 100, y: 50, width: 200, height: 300 },
  },
  {
    id: 'EVT002',
    image: '/placeholder-event.jpg',
    employeeName: 'Budi Santoso',
    employeeId: '3', // Sinkron dengan ID Hardware 3
    camera: 'CAM-4',
    violationType: 'Missing Safety Shoes',
    confidence: 91.8,
    timestamp: '2026-07-02 09:32 AM',
    boundingBox: { x: 120, y: 40, width: 180, height: 320 },
  },
];

// =========================================================================
// 5. Data Mock Status Master Karyawan (Sesuai Slot Memori R307)
// =========================================================================
export const mockEmployees = [
  { id: '1', name: 'Ahmad Rizky', fingerprintStatus: 'registered' },
  { id: '2', name: 'Siti Nurhaliza', fingerprintStatus: 'registered' },
  { id: '3', name: 'Budi Santoso', fingerprintStatus: 'registered' },
  { id: '4', name: 'Dewi Lestari', fingerprintStatus: 'pending' },
  { id: '5', name: 'Eka Prasetyo', fingerprintStatus: 'registered' },
];

// =========================================================================
// 6. Data Grid Kamera Terintegrasi (4 Kamera)
// =========================================================================
export const mockCameras = [
  {
    id: 'CAM001',
    name: 'CAM-1 (Welding Area 1)',
    status: 'online',
    fps: 30,
    resolution: '420x320',
  },
  {
    id: 'CAM002',
    name: 'CAM-2 (Welding Area 2)',
    status: 'online',
    fps: 30,
    resolution: '420x320',
  },
  {
    id: 'CAM003',
    name: 'CAM-3 (Welding Area 3)',
    status: 'online',
    fps: 25,
    resolution: '420x320',
  },
  {
    id: 'CAM004',
    name: 'CAM-4 (Attendance Area)',
    status: 'online',
    fps: 30,
    resolution: '1280x720',
  },
];

// =========================================================================
// 7. Data Mock Ringkasan Statistik untuk Panel Dashboard Utama
// =========================================================================
export const mockDashboardStats = {
  totalAttendanceToday: 23,
  lateEmployees: 4,
  safetyViolations: 7,
  shoesViolations: 3,
  glassesViolations: 4,
  averageConfidence: 95.2,
  connectedCameras: 4,
  smokeStatus: 'safe',
  fingerprintStatus: 'online',
  esp32Status: 'online',
};

// =========================================================================
// 8. Data Mock Kalender Kehadiran Bulanan
// =========================================================================
export const mockCalendarData = {
  2026: {
    7: {
      1: { status: 'present', count: 23 },
      2: { status: 'present', count: 25 },
    },
  },
};