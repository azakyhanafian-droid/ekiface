'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Download, FileText } from 'lucide-react';

export function EventToolbar() {
  return (
    <div className="bg-white border border-border rounded-lg p-4 space-y-4">
      {/* Search and Basic Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by employee name or ID..."
            className="pl-9"
          />
        </div>
        <Input
          type="date"
          className="w-full md:w-48"
        />
      </div>

      {/* Filter Tags and Export */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-sm text-muted-foreground">Filters:</span>
        {['All Types', 'Shoes Violation', 'Glasses Violation'].map((filter) => (
          <Button
            key={filter}
            variant="outline"
            size="sm"
            className="rounded-full"
          >
            {filter}
          </Button>
        ))}

        <div className="ml-auto flex gap-2">
          <Button
            variant="outline"
            size="sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Excel
          </Button>
          <Button
            variant="outline"
            size="sm"
          >
            <FileText className="w-4 h-4 mr-2" />
            PDF
          </Button>
        </div>
      </div>
    </div>
  );
}
