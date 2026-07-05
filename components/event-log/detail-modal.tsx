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

  const isShoes = event.type === 'shoes' || event.violationType?.toLowerCase().includes('shoes');

  const formatTimestamp = (ts: string) => {
    try {
      const d = new Date(ts);
      if (isNaN(d.getTime())) return ts;
      return d.toLocaleString('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch {
      return ts;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl print:relative print:top-0 print:left-0 print:translate-x-0 print:translate-y-0 print:border-none print:shadow-none print:p-0 print:max-w-full print:w-full print:bg-white print:text-black">
        {/* Print Only Report Header */}
        <div className="hidden print:block mb-6 pb-3 border-b-2 border-slate-900">
          <h1 className="text-2xl font-bold text-slate-950">AI Safety Violation Incident Report</h1>
          <p className="text-xs text-slate-500 mt-1">
            Generated on {new Date().toLocaleString('id-ID')} • System Source: PostgreSQL
          </p>
        </div>

        <DialogHeader className="print:hidden">
          <DialogTitle>Event Details</DialogTitle>
          <DialogDescription>
            Detailed information about the detection event
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4 print:py-0">
          {/* Violation Image */}
          <div className="w-full aspect-video bg-zinc-950 rounded-lg flex items-center justify-center relative overflow-hidden border border-border/40 shadow-inner print:bg-white print:border-slate-300 print:aspect-auto print:h-auto print:py-2">
            {event.image_path ? (
              <img
                src={event.image_path}
                alt={event.violationType || 'Violation capture'}
                className="w-full h-full object-contain print:max-h-[280px] print:w-auto print:mx-auto print:rounded-md"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder.jpg';
                }}
              />
            ) : (
              <div className="text-zinc-500 text-center p-4">
                <p className="text-lg font-medium">No Image Available</p>
                <p className="text-sm text-zinc-600">No detection image was captured for this event</p>
              </div>
            )}
          </div>

          {/* Bounding Box Info (Only if coordinates exist, e.g. for mock data) */}
          {event.boundingBox && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 print:bg-slate-50 print:border-slate-300">
              <p className="text-sm font-medium text-blue-900 print:text-slate-900 mb-2">Bounding Box Results:</p>
              <p className="text-xs text-blue-800 print:text-slate-700 font-mono">
                Position: ({event.boundingBox.x}, {event.boundingBox.y}) | Size:{' '}
                {event.boundingBox.width}x{event.boundingBox.height}px
              </p>
            </div>
          )}

          {/* Detection Info */}
          <div className="grid grid-cols-2 gap-4 text-sm print:gap-y-4 print:text-slate-900">
            <div>
              <p className="text-muted-foreground font-medium text-xs">Employee Name</p>
              <p className="text-foreground font-semibold mt-1 print:text-slate-950">{event.employeeName}</p>
            </div>
            <div>
              <p className="text-muted-foreground font-medium text-xs">Employee ID</p>
              <p className="text-foreground font-mono mt-1">{event.employeeId || 'N/A'}</p>
            </div>
            <div>
              <p className="text-muted-foreground font-medium text-xs">Violation Type</p>
              <Badge className={`mt-1 border-none ${isShoes ? 'bg-amber-500 text-white' : 'bg-red-500 text-white'}`}>
                {event.violationType || 'Unknown Violation'}
              </Badge>
            </div>
            <div>
              <p className="text-muted-foreground font-medium text-xs">Confidence Score</p>
              <p className="text-foreground font-semibold mt-1">{parseFloat(event.confidence).toFixed(1)}%</p>
            </div>
            <div className="col-span-2">
              <p className="text-muted-foreground font-medium text-xs">Camera</p>
              <p className="text-foreground font-medium mt-1">{event.camera}</p>
            </div>
            <div className="col-span-2">
              <p className="text-muted-foreground font-medium text-xs">Timestamp</p>
              <p className="text-foreground font-medium mt-1">{formatTimestamp(event.timestamp)}</p>
            </div>
          </div>
        </div>

        <DialogFooter className="print:hidden">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
          <Button 
            className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white"
            onClick={() => window.print()}
          >
            <Download className="w-4 h-4 mr-2" />
            Print Event
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
