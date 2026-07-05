'use client';

import { useState, useEffect } from 'react';
import { EventToolbar } from './event-toolbar';
import { TimelineCards } from './timeline-cards';

export function EventLogContainer() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState('all');
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Debounce search query to avoid overloading database queries
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);

    return () => {
      clearTimeout(handler);
    };
  }, [search]);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.append('search', debouncedSearch);
      if (date) params.append('date', date);
      if (type !== 'all') params.append('type', type);

      const res = await fetch(`/api/event-log?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      } else {
        console.error('Failed to fetch event logs:', res.statusText);
      }
    } catch (error) {
      console.error('Error fetching event logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [debouncedSearch, date, type]);

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <EventToolbar
        search={search}
        onSearchChange={setSearch}
        date={date}
        onDateChange={setDate}
        type={type}
        onTypeChange={setType}
      />

      {/* Timeline Cards */}
      <TimelineCards events={events} isLoading={isLoading} />
    </div>
  );
}
