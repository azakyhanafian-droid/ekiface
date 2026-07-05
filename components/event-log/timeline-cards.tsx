'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Eye } from 'lucide-react';
import { mockEventLog } from '@/lib/mock-data';
import { DetailModal } from './detail-modal';

export function TimelineCards() {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleViewDetail = (event) => {
    setSelectedEvent(event);
    setShowModal(true);
  };

  return (
    <>
      <div className="space-y-4">
        {mockEventLog.map((event) => (
          <Card key={event.id} className="border-0 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-0">
              <div className="flex gap-4">
                {/* Event Image */}
                <div className="w-32 h-32 bg-gray-900 flex-shrink-0 flex items-center justify-center">
                  <div className="text-gray-500 text-xs text-center">
                    <p>Event</p>
                    <p>Capture</p>
                  </div>
                </div>

                {/* Event Details */}
                <div className="flex-1 py-4 pr-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground">{event.employeeName}</h3>
                        <p className="text-sm text-muted-foreground font-mono">{event.employeeId}</p>
                      </div>
                      <Badge className="bg-red-danger text-white">
                        {event.violationType}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Camera</p>
                        <p className="font-medium text-foreground">{event.camera}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Confidence</p>
                        <p className="font-medium text-foreground">{event.confidence}%</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-muted-foreground">Timestamp</p>
                        <p className="font-medium text-foreground">{event.timestamp}</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewDetail(event)}
                      className="flex-1"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export PDF
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
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
