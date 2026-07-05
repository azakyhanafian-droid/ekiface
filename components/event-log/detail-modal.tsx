'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download } from 'lucide-react';

interface DetailModalProps {
  event: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DetailModal({ event, open, onOpenChange }: DetailModalProps) {
  if (!event) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Event Details</DialogTitle>
          <DialogDescription>
            Detailed information about the detection event
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Large Image */}
          <div className="w-full aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
            <div className="text-gray-500 text-center">
              <p className="text-lg font-medium">Event Capture</p>
              <p className="text-sm">Detection Image</p>
            </div>
          </div>

          {/* Bounding Box Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-medium text-blue-900 mb-2">Bounding Box Results:</p>
            <p className="text-xs text-blue-800">
              Position: ({event.boundingBox.x}, {event.boundingBox.y}) | Size:{' '}
              {event.boundingBox.width}x{event.boundingBox.height}px
            </p>
          </div>

          {/* Detection Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground font-medium">Employee Name</p>
              <p className="text-foreground font-semibold mt-1">{event.employeeName}</p>
            </div>
            <div>
              <p className="text-muted-foreground font-medium">Employee ID</p>
              <p className="text-foreground font-mono mt-1">{event.employeeId}</p>
            </div>
            <div>
              <p className="text-muted-foreground font-medium">Violation Type</p>
              <Badge className="mt-1 bg-red-danger text-white">
                {event.violationType}
              </Badge>
            </div>
            <div>
              <p className="text-muted-foreground font-medium">Confidence Score</p>
              <p className="text-foreground font-semibold mt-1">{event.confidence}%</p>
            </div>
            <div className="col-span-2">
              <p className="text-muted-foreground font-medium">Camera</p>
              <p className="text-foreground mt-1">{event.camera}</p>
            </div>
            <div className="col-span-2">
              <p className="text-muted-foreground font-medium">Timestamp</p>
              <p className="text-foreground mt-1">{event.timestamp}</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
          <Button className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white">
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
