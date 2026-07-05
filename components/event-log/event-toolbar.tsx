'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Download, FileText } from 'lucide-react';

interface EventToolbarProps {
  search: string;
  onSearchChange: (val: string) => void;
  date: string;
  onDateChange: (val: string) => void;
  type: string;
  onTypeChange: (val: string) => void;
}

export function EventToolbar({
  search,
  onSearchChange,
  date,
  onDateChange,
  type,
  onTypeChange,
}: EventToolbarProps) {
  return (
    <div className="bg-white border border-border rounded-lg p-4 space-y-4 print:hidden">
      {/* Search and Basic Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 relative w-full">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by employee name or ID..."
            className="pl-9"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <Input
          type="date"
          className="w-full md:w-48"
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
        />
      </div>

      {/* Filter Tags and Export */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-sm text-muted-foreground">Filters:</span>
        {[
          { label: 'All Types', value: 'all' },
          { label: 'Shoes Violation', value: 'shoes' },
          { label: 'Glasses Violation', value: 'glasses' }
        ].map((filter) => {
          const isActive = type === filter.value;
          return (
            <Button
              key={filter.value}
              variant={isActive ? 'default' : 'outline'}
              size="sm"
              className="rounded-full"
              onClick={() => onTypeChange(filter.value)}
            >
              {filter.label}
            </Button>
          );
        })}

        <div className="ml-auto flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
          >
            <FileText className="w-4 h-4 mr-2" />
            Print Report
          </Button>
        </div>
      </div>
    </div>
  );
}
