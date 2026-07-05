// components/attendance/register-fingerprint.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Fingerprint, Loader2, Trash2 } from 'lucide-react';

interface RegisterFingerprintProps {
  onRegisterSuccess?: () => void;
}

export function RegisterFingerprint({ onRegisterSuccess }: RegisterFingerprintProps) {
  const [formData, setFormData] = useState({ employeeId: '', employeeName: '' });
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fungsi Kirim Aksi Registrasi (Enroll)
  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: parseInt(formData.employeeId, 10),
          nama: formData.employeeName,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Modul R307 Siap! Perhatikan petunjuk LCD pada alat untuk scan ketukan jari.");
        setFormData({ employeeId: "", employeeName: "" });
        if (onRegisterSuccess) onRegisterSuccess();
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("Koneksi gagal menghubungi API Endpoint.");
    } finally { setLoading(false); }
  };

  // Fungsi Kirim Aksi Hapus ID (Remote Delete)
  const handleDeleteId = async () => {
    if (!formData.employeeId) {
      alert("Silakan masukkan Fingerprint Slot ID yang ingin dihapus!");
      return;
    }
    if (!confirm(`Apakah Anda yakin ingin menghapus Slot ID #${formData.employeeId} dari hardware & DB?`)) return;

    setDeleteLoading(true);
    try {
      const res = await fetch("/api/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: parseInt(formData.employeeId, 10),
          nama: "DELETE_ACTION" // Sebagai penanda khusus aksi hapus
        }),
      });
      // Catatan: Anda bisa memisahkan rute hapus ke /api/delete-fingerprint jika ingin lebih rapi
      alert("Sinyal perintah hapus berhasil dikirim ke perangkat keras R307!");
    } catch (err) {
      alert("Gagal mengirim perintah hapus.");
    } finally { setDeleteLoading(false); }
  };

  return (
    <Card className="border border-border/60 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-bold">
          <Fingerprint className="w-5 h-5 text-primary" />
          Hardware Device & Fingerprint Control
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleEnroll} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="emp-id" className="text-zinc-700 font-medium">Fingerprint Slot ID</Label>
            <Input
              id="emp-id"
              type="number"
              min="1"
              max="127"
              placeholder="Masukkan angka 1 - 127"
              value={formData.employeeId}
              onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="emp-name" className="text-zinc-700 font-medium">Employee Name</Label>
            <Input
              id="emp-name"
              type="text"
              placeholder="Masukkan nama lengkap karyawan"
              value={formData.employeeName}
              onChange={(e) => setFormData({ ...formData, employeeName: e.target.value })}
            />
          </div>

          <div className="bg-blue-50/60 border border-blue-100 rounded-lg p-3 text-xs text-blue-900 leading-relaxed">
            <p className="font-bold text-blue-950 mb-1">💡 Alur Sinkronisasi Otomatis:</p>
            <ol className="list-decimal list-inside space-y-1 text-blue-900/90">
              <li>Tekan <strong>Register</strong> untuk menyalakan sensor R307 dari jauh.</li>
              <li>Gunakan tombol <strong>Delete Object ID</strong> untuk membersihkan memori slot hardware.</li>
            </ol>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button type="submit" disabled={loading || !formData.employeeId || !formData.employeeName}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Register & Sync'}
            </Button>
            
            <Button 
              type="button" 
              variant="destructive" 
              disabled={deleteLoading || !formData.employeeId} 
              onClick={handleDeleteId}
            >
              {deleteLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                <>
                  <Trash2 className="w-4 h-4 mr-1.5" />
                  Delete ID Slot
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}