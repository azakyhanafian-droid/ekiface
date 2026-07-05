'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Maximize2, Download, Circle, ShieldAlert, Video, RefreshCw } from 'lucide-react';
import { mockCameras } from '@/lib/mock-data';

interface Violation {
  id: number;
  nama: string;
  camera_name: string;
  violation_status?: string;
  confidence: number;
  image_path: string;
  created_at: string;
}

export default function LiveMonitoringPage() {
  const [violations, setViolations] = useState<Violation[]>([]);
  const [streamErrors, setStreamErrors] = useState<{ [key: string]: boolean }>({});
  const [retryKey, setRetryKey] = useState<number>(0);

  // 1. Ambil data log pelanggaran sepatu safety dari API Next.js
  const fetchViolations = async () => {
    try {
      const res = await fetch('/api/shoe-violations');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setViolations(data);
      }
    } catch (err) {
      console.error('Failed to fetch shoe violations:', err);
    }
  };

  useEffect(() => {
    fetchViolations();
    const interval = setInterval(fetchViolations, 3000);
    return () => clearInterval(interval);
  }, []);

  // 2. Fungsi manual untuk reload/refresh stream yang macet
  const handleRefreshStreams = () => {
    setStreamErrors({});
    setRetryKey(prev => prev + 1);
  };

  return (
    <div className="p-6 space-y-6 bg-background">
      {/* Header Halaman */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Live Monitoring</h1>
          <p className="text-muted-foreground mt-1">Multi-camera stream dengan AI deteksi otomatis Sepatu Safety (PPE).</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefreshStreams} className="h-9">
            <RefreshCw className="w-4 h-4 mr-1.5" />
            Reconnect Streams
          </Button>
          <Badge variant="outline" className="px-3 py-1 bg-emerald-50 text-emerald-700 border-emerald-200 h-9">
            <Video className="w-3.5 h-3.5 mr-1 text-emerald-600 animate-pulse" />
            AI Core Connected (Port 5001)
          </Badge>
        </div>
      </div>

      {/* Grid Layout Utama */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Sisi Kiri: Grid Kamera Stream MJPEG dari Flask Python */}
        <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 auto-rows-max">
          {mockCameras.map((camera) => {
            const isCamOffline = streamErrors[camera.id] || camera.status !== 'online';
            
            // ✅ PERBAIKAN UTAMA: Mencocokkan string ID "CAM004" secara akurat sesuai log terminal kamu
            const isCamera4 = String(camera.id) === 'CAM004' || String(camera.id) === '4';
            
            // Jika CAM004, arahkan ke endpoint utama '/video_feed' milik shoe.py
            const streamUrl = isCamera4 
            ? `http://localhost:5001/video_feed?cache=${retryKey}` 
            : `http://localhost:5000/video_feed_${camera.id}?cache=${retryKey}`;

            return (
              <Card key={camera.id} className="border border-border/60 shadow-sm overflow-hidden flex flex-col justify-between">
                
                {/* Kontainer Video Stream */}
                <div className="bg-gray-950 aspect-video flex items-center justify-center relative group overflow-hidden">
                  
                  {!isCamOffline && (
                    <img
                      src={streamUrl}
                      alt={camera.name}
                      className="w-full h-full object-cover"
                      onLoad={() => {
                        if (streamErrors[camera.id]) {
                          setStreamErrors(prev => ({ ...prev, [camera.id]: false }));
                        }
                      }}
                      onError={() => {
                        setStreamErrors(prev => ({ ...prev, [camera.id]: true }));
                      }}
                    />
                  )}

                  {/* Tampilan Fallback / Jika Kamera Offline */}
                  {isCamOffline && (
                    <div className="text-center absolute inset-0 flex flex-col items-center justify-center bg-zinc-950 p-4">
                      <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center mb-2 border border-zinc-800">
                        <Play className="w-5 h-5 text-zinc-600 fill-zinc-600 ml-0.5" />
                      </div>
                      <p className="text-zinc-400 text-sm font-medium">{camera.name}</p>
                      <p className="text-rose-500 text-xs font-semibold mt-1">
                        {camera.status !== 'online' ? 'Camera Disabled' : 'Stream Disconnected (5001)'}
                      </p>
                    </div>
                  )}

                  {/* Label Status Live */}
                  <div className="absolute top-3 right-3 z-10">
                    <Badge
                      className={
                        !isCamOffline
                          ? 'bg-emerald-600 hover:bg-emerald-600 text-white border-0'
                          : 'bg-zinc-700 hover:bg-zinc-700 text-white border-0'
                      }
                    >
                      {!isCamOffline ? '● Live Stream' : '● Offline'}
                    </Badge>
                  </div>

                  {/* Indikator Perekaman (REC) */}
                  {!isCamOffline && (
                    <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-black/60 backdrop-blur-md text-rose-400 px-2.5 py-1 rounded-md text-xs font-semibold border border-rose-500/30">
                      <Circle className="w-2 h-2 fill-rose-500 text-rose-500 animate-pulse" />
                      REC AI
                    </div>
                  )}

                  {/* Overlay Kontrol Menu */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 z-20">
                    <Button size="icon" variant="ghost" className="bg-white/10 hover:bg-white/20 text-white rounded-full">
                      <Play className="w-5 h-5 fill-white" />
                    </Button>
                    <Button size="icon" variant="ghost" className="bg-white/10 hover:bg-white/20 text-white rounded-full">
                      <Maximize2 className="w-5 h-5" />
                    </Button>
                  </div>

                  {/* Tombol Aksi Snapshot */}
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary" className="flex-1 text-xs h-8 bg-zinc-900 text-zinc-200 hover:bg-zinc-800">
                        <Download className="w-3.5 h-3.5 mr-1.5" /> Snapshot
                      </Button>
                      <Button size="sm" variant="secondary" className="flex-1 text-xs h-8 bg-zinc-900 text-zinc-200 hover:bg-zinc-800">
                        <Maximize2 className="w-3.5 h-3.5 mr-1.5" /> Fullscreen
                      </Button>
                    </div>
                  </div>

                </div>

                {/* Deskripsi Informasi Kamera */}
                <CardHeader className="p-4 pt-3 pb-1">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold">{camera.name}</CardTitle>
                    <span className="text-xs font-mono px-1.5 py-0.5 bg-muted rounded text-muted-foreground">
                      {!isCamOffline ? `${camera.fps} FPS` : '0 FPS'}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0 pb-3 text-xs text-muted-foreground">
                  {camera.resolution} • {isCamera4 ? 'Safety Shoe Detector Zone' : 'Area Monitoring'}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Sisi Kanan: Panel Feed Pelanggaran Sepatu Safety */}
        <div className="xl:col-span-1">
          <Card className="h-full border border-border/60 shadow-sm flex flex-col">
            <CardHeader className="border-b bg-muted/40 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-rose-500" />
                  <CardTitle className="text-base font-bold">Shoe Violations Feed</CardTitle>
                </div>
                <Badge variant="destructive" className="animate-pulse bg-rose-600">Real-time</Badge>
              </div>
            </CardHeader>
            
            <CardContent className="p-4 overflow-y-auto flex-1 space-y-4 max-h-[580px] min-h-[400px]">
              {violations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center text-muted-foreground space-y-2">
                  <Circle className="w-8 h-8 text-muted-foreground/30 stroke-1" />
                  <p className="text-sm">Belum ada deteksi pelanggaran sepatu safety.</p>
                </div>
              ) : (
                violations.map((v) => (
                  <div 
                    key={v.id} 
                    className="flex gap-3 p-3 rounded-lg border border-rose-100 bg-rose-50/30 hover:bg-rose-50 transition-colors"
                  >
                    {/* Bukti Capture Pelanggaran */}
                    <div className="relative w-20 h-20 bg-zinc-900 rounded-md overflow-hidden flex-shrink-0 border border-rose-200">
                      <Image
                        src={v.image_path}
                        alt={`Pelanggaran ${v.nama}`}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    
                    {/* Deskripsi Data Pelanggaran */}
                    <div className="flex flex-col justify-between py-0.5 min-w-0 flex-1">
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-sm truncate text-rose-950">{v.nama}</span>
                          <span className="text-[10px] font-semibold bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full flex-shrink-0">
                            {v.camera_name || 'CAM-4'}
                          </span>
                        </div>
                        <p className="text-xs text-rose-600 mt-0.5 font-medium">
                          {v.violation_status || 'NO SAFETY SHOES'}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground border-t border-rose-100/50 pt-1 mt-1">
                        <span>Akurasi: <strong className="text-rose-600">{parseFloat(v.confidence.toString()).toFixed(1)}%</strong></span>
                        <span>{new Date(v.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                      </div>
                    </div>

                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}