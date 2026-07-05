'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react'; // Import icon loading spinner

interface Employee {
  id: string;
  name: string;
  fingerprintStatus?: 'registered' | 'pending';
}

interface EmployeeEditDialogProps {
  employee: Employee | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (employee: Employee) => void;
}

export function EmployeeEditDialog({
  employee,
  open,
  onOpenChange,
  onSave,
}: EmployeeEditDialogProps) {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
  });
  const [isSaving, setIsSaving] = useState(false); // State baru untuk efek loading saat save

  useEffect(() => {
    if (employee) {
      setFormData({
        id: employee.id,
        name: employee.name,
      });
    }
  }, [employee]);

  // ==========================================
  // INTEGRASI HIT API ENROLL / UPDATE KE BACKEND
  // ==========================================
  const handleSave = async () => {
    if (!employee) return;
    if (!formData.name.trim()) {
      alert('Nama karyawan tidak boleh kosong!');
      return;
    }

    try {
      setIsSaving(true); // Aktifkan loading spinner

      // Lakukan hit API Enroll yang bertugas meng-update DB & Publish MQTT ke Arduino
      const response = await fetch('/api/enroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: formData.id,     // Slot Fingerprint ID (1-127)
          nama: formData.name, // Nama baru hasil edit
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Jika sukses di backend, update state di komponen utama Web (UI)
        onSave({
          ...employee,
          ...formData,
        });
        alert('Berhasil! Perubahan nama disimpan di database & disinkronkan ke hardware.');
        onOpenChange(false);
      } else {
        alert(`Gagal menyimpan: ${result.message || 'Terjadi kesalahan internal.'}`);
      }
    } catch (error) {
      console.error('Error updating employee:', error);
      alert('Gagal terhubung ke server API NeoGuard.');
    } finally {
      setIsSaving(false); // Matikan loading spinner
    }
  };

  if (!employee) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Karyawan / Sinkron Alat</DialogTitle>
          <DialogDescription>
            Ubah informasi nama karyawan di bawah. Perubahan akan langsung dikirim ke database dan modul sidik jari Arduino.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Input ID Fingerprint (Read Only) */}
          <div className="space-y-2">
            <Label htmlFor="id">Fingerprint ID (Slot Hardware)</Label>
            <Input
              id="id"
              value={formData.id}
              readOnly
              className="bg-gray-100 cursor-not-allowed select-none font-mono"
            />
          </div>

          {/* Input Nama Karyawan */}
          <div className="space-y-2">
            <Label htmlFor="name">Nama Lengkap Karyawan</Label>
            <Input
              id="name"
              value={formData.name}
              disabled={isSaving}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  name: e.target.value,
                })
              }
              placeholder="Masukkan nama baru..."
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            disabled={isSaving}
            onClick={() => onOpenChange(false)}
          >
            Batal
          </Button>

          {/* Tombol Simpan Dinamis dengan Feedback Spinner */}
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Menyimpan...
              </>
            ) : (
              'Simpan Perubahan'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}