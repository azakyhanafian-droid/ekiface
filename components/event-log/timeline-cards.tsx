'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Eye } from 'lucide-react';
import { DetailModal } from './detail-modal';

interface TimelineCardsProps {
  events: any[];
  isLoading: boolean;
}

export function TimelineCards({ events, isLoading }: TimelineCardsProps) {
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  const handleViewDetail = (event: any) => {
    setSelectedEvent(event);
    setShowModal(true);
  };

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

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border border-border/60 shadow-sm overflow-hidden animate-pulse">
            <CardContent className="p-0">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Event Image skeleton */}
                <div className="w-full sm:w-32 h-32 bg-muted flex-shrink-0" />

                {/* Event Details skeleton */}
                <div className="flex-1 p-4 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="h-5 bg-muted rounded w-1/3" />
                      <div className="h-5 bg-muted rounded w-20" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="h-4 bg-muted rounded w-1/2" />
                      <div className="h-4 bg-muted rounded w-1/3" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-8 bg-muted rounded flex-1" />
                    <div className="h-8 bg-muted rounded flex-1" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground bg-white border border-border rounded-lg shadow-sm">
        <p className="text-lg font-medium">No safety events found</p>
        <p className="text-sm mt-1">There are no records matching your current filter criteria.</p>
      </div>
    );
  }

  return (
    <>
      {/* Print Only Header */}
      <div className="hidden print:block mb-8 pb-4 border-b-2 border-slate-900">
        <h1 className="text-3xl font-bold text-slate-950">NeoGuard safety Violation Report</h1>
        <p className="text-sm text-slate-500 mt-1">
          Generated on {new Date().toLocaleString('id-ID')} • System Source: PostgreSQL
        </p>
      </div>

      <div className="space-y-4">
        {events.map((event) => {
          const isShoes = event.type === 'shoes' || event.violationType?.toLowerCase().includes('shoes');
          
          return (
            <Card key={`${event.type}-${event.id}`} className="border border-border/60 shadow-sm overflow-hidden hover:shadow-md transition-shadow print:shadow-none print:border-slate-300 print:break-inside-avoid print:page-break-inside-avoid print:bg-white">
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row gap-4 print:flex-row print:gap-6">
                  {/* Event Image */}
                  <div className="w-full sm:w-32 h-32 bg-zinc-950 flex-shrink-0 flex items-center justify-center relative overflow-hidden print:w-28 print:h-28 print:rounded-md">
                    {event.image_path ? (
                      <img
                        src={event.image_path}
                        alt={event.violationType || 'Violation capture'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder.jpg';
                        }}
                      />
                    ) : (
                      <div className="text-zinc-500 text-xs text-center p-2">
                        <p>No Image</p>
                        <p>Available</p>
                      </div>
                    )}
                  </div>

                  {/* Event Details */}
                  <div className="flex-1 p-4 flex flex-col justify-between print:py-2 print:pr-2">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-semibold text-foreground print:text-slate-950">{event.employeeName}</h3>
                          <p className="text-sm text-muted-foreground font-mono">ID: {event.employeeId || 'N/A'}</p>
                        </div>
                        <Badge className={`print:text-xs print:font-bold ${isShoes ? 'bg-amber-500 text-white border-none' : 'bg-red-500 text-white border-none'}`}>
                          {event.violationType || 'Unknown Violation'}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        <div>
                          <p className="text-muted-foreground text-xs">Camera</p>
                          <p className="font-medium text-foreground print:text-slate-950">{event.camera}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Confidence</p>
                          <p className="font-medium text-foreground print:text-slate-950">{parseFloat(event.confidence).toFixed(1)}%</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-muted-foreground text-xs">Timestamp</p>
                          <p className="font-medium text-foreground print:text-slate-950">{formatTimestamp(event.timestamp)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-4 print:hidden">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewDetail(event)}
                        className="flex-1 h-9"
                      >
                        <Eye className="w-4 h-4 mr-2 text-blue-500" />
                        View Details
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewDetail(event)}
                        className="flex-1 h-9"
                      >
                        <Download className="w-4 h-4 mr-2 text-green-500" />
                        Print Event
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Detail Modal */}
      <DetailModal
        event={selectedEvent}
        open={showModal}
        onOpenChange={setShowModal}
      />
    </>
  );
}
