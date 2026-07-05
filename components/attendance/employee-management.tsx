'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BadgeStatus } from '@/components/common/badge-status';
import { Edit2, Trash2, Plus, Search, Loader2 } from 'lucide-react';
import { EmployeeEditDialog } from './employee-edit-dialog';

interface Employee {
  id: string; // Memetakan fingerprint_id dari database
  name: string;
  fingerprintStatus: 'registered' | 'pending';
}

export function EmployeeManagement() {
  const [employees, setEmployees] = useState<Employee[]>([]); // Menyimpan data riil database
  const [isLoading, setIsLoading] = useState(true); // Indikator loading saat memuat data awal
  const [searchTerm, setSearchTerm] = useState('');
  const [editingEmployee, setEditingEmployee] = useState<any | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // ==========================================
  // AMBIL DATA DARI DATABASE (FETCHING)
  // ==========================================
  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/employees');
      const result = await response.json();
      
      if (response.ok && result.success) {
        // Memastikan ID dikonversi menjadi string murni tanpa karakter tambahan
        const formattedData = result.data.map((emp: any) => ({
          id: String(emp.id).replace('#', '').trim(),
          name: emp.name,
          fingerprintStatus: emp.fingerprintStatus || 'registered'
        }));
        setEmployees(formattedData);
      } else {
        console.error('Gagal memuat data dari DB:', result.message);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally { // 🟢 Perbaikan: tambahkan satu huruf 'l' lagi
      setIsLoading(false);
    }
  };

  // Jalankan penarikan data otomatis saat halaman diakses pertama kali
  useEffect(() => {
    fetchEmployees();
  }, []);

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ==========================================
  // PROSES PENGHAPUSAN AMAN (DELETE SINKRON)
  // ==========================================
  const handleDelete = async (id: string) => {
    // Menghilangkan karakter pagar jika tidak sengaja terbawa dari state UI
    const cleanId = id.replace('#', '').trim();

    if (!confirm(`Apakah Anda yakin ingin menghapus karyawan dengan ID Fingerprint #${cleanId}? Data di database dan modul hardware R307 akan dibersihkan.`)) {
      return;
    }

    try {
      setIsDeleting(id); // Aktifkan efek loading spinner pada baris tombol terkait
      
      const response = await fetch('/api/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: cleanId }), // Mengirimkan ID angka bersih ke backend API
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Hapus data dari state lokal agar tabel langsung terupdate tanpa reload browser
        setEmployees((prev) => prev.filter((emp) => emp.id !== id));
        alert(`Berhasil! Data ID #${cleanId} dihapus dari DB dan perintah pembersihan memori dikirim ke Arduino.`);
      } else {
        alert(`Gagal menghapus: ${result.message}`);
      }
    } catch (error) {
      alert('Gagal terhubung ke API internal Next.js.');
    } finally {
      setIsDeleting(null); // Matikan efek loading spinner
    }
  };

  const handleEdit = (employee: any) => {
    setEditingEmployee(employee);
    setShowDialog(true);
  };

  // Callback refresh otomatis setelah dialog edit menyimpan perubahan nama baru
  const handleSave = () => {
    fetchEmployees(); 
    setShowDialog(false);
    setEditingEmployee(null);
  };

  return (
    <div className="space-y-4">
      {/* Header Search & Add */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search employee..."
            className="pl-9 h-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Add Employee
        </Button>
      </div>

      {/* Tabel Utama */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border bg-gray-50/50">
                <TableHead className="font-semibold">Fingerprint ID</TableHead>
                <TableHead className="font-semibold">Name</TableHead>
                <TableHead className="font-semibold">Fingerprint Status</TableHead>
                <TableHead className="font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Menghubungkan ke database PostgreSQL...
                  </TableCell>
                </TableRow>
              ) : filteredEmployees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                    Tidak ada data karyawan di database.
                  </TableCell>
                </TableRow>
              ) : (
                filteredEmployees.map((employee) => (
                  <TableRow key={employee.id} className="border-b border-border hover:bg-gray-50">
                    <TableCell className="font-mono text-sm">#{employee.id}</TableCell>
                    <TableCell className="font-medium">{employee.name}</TableCell>
                    <TableCell>
                      <BadgeStatus status={employee.fingerprintStatus} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={isDeleting !== null}
                          onClick={() => handleEdit(employee)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          disabled={isDeleting !== null}
                          onClick={() => handleDelete(employee.id)}
                        >
                          {isDeleting === employee.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit/Enroll Dialog */}
      <EmployeeEditDialog
        employee={editingEmployee}
        open={showDialog}
        onOpenChange={setShowDialog}
        onSave={handleSave}
      />
    </div>
  );
}