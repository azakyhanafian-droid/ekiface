import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, StopCircle, Maximize2 } from 'lucide-react';
import { mockCameras } from '@/lib/mock-data';

export function LiveCameraPreview() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {mockCameras.map((camera) => (
        <Card key={camera.id} className="border-0 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
          {/* Camera Feed Placeholder */}
          <div className="bg-gray-900 aspect-video flex items-center justify-center relative group">
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Play className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-gray-400 text-sm">{camera.name}</p>
            </div>

            {/* Status Indicator */}
            <div className="absolute top-3 right-3">
              <Badge
                className={
                  camera.status === 'online'
                    ? 'bg-green-safe text-white'
                    : 'bg-red-danger text-white'
                }
              >
                {camera.status === 'online' ? '● Live' : '● Offline'}
              </Badge>
            </div>

            {/* Overlay on Hover */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button
                size="icon"
                variant="ghost"
                className="bg-white/20 hover:bg-white/30 text-white"
              >
                <Play className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="bg-white/20 hover:bg-white/30 text-white"
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Camera Info */}
          <CardHeader className="pb-2 pt-3">
            <CardTitle className="text-sm">{camera.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-xs">
            <p className="text-muted-foreground">
              <span className="font-semibold">Resolution:</span> {camera.resolution}
            </p>
            <p className="text-muted-foreground">
              <span className="font-semibold">FPS:</span> {camera.fps}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
