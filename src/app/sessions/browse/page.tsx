'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { format, addDays, isAfter, isBefore, parseISO } from 'date-fns';

type Session = {
  id: string;
  title: string;
  location: string;
  date_time: string;
  duration: number;
  intent: 'match' | 'rally' | 'drills';
  skill_min: number;
  skill_max: number;
  max_players: number;
  current_players: number;
  status: 'open' | 'full' | 'completed' | 'cancelled';
  creator_id: string;
};

type Filters = {
  dateRange: [Date, Date];
  skillRange: [number, number];
  intent: 'all' | 'match' | 'rally' | 'drills';
  location: string;
};

export default function BrowseSessionsPage() {
  const { user } = useUser();
  const supabase = createClientComponentClient();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [filters, setFilters] = useState<Filters>({
    dateRange: [new Date(), addDays(new Date(), 7)],
    skillRange: [2.5, 4.5],
    intent: 'all',
    location: '',
  });

  // Fetch sessions with current filters
  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('sessions')
        .select('*')
        .eq('status', 'open')
        .gte('date_time', filters.dateRange[0].toISOString())
        .lte('date_time', filters.dateRange[1].toISOString())
        .gte('skill_min', filters.skillRange[0])
        .lte('skill_max', filters.skillRange[1]);

      if (filters.intent !== 'all') {
        query = query.eq('intent', filters.intent);
      }

      if (filters.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }

      const { data, error: supabaseError } = await query;

      if (supabaseError) throw supabaseError;

      // Sort by date_time
      const sortedSessions = data?.sort((a, b) => 
        new Date(a.date_time).getTime() - new Date(b.date_time).getTime()
      ) || [];

      setSessions(sortedSessions);
    } catch (err) {
      console.error('Error fetching sessions:', err);
      setError('Failed to load sessions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch sessions on mount and when filters change
  useEffect(() => {
    fetchSessions();
  }, [filters]);

  const handleJoinSession = async (sessionId: string) => {
    try {
      const { error: supabaseError } = await supabase
        .from('match_requests')
        .insert([
          {
            session_id: sessionId,
            requester_id: user?.id,
          },
        ]);

      if (supabaseError) throw supabaseError;

      // Refresh sessions to update UI
      fetchSessions();
    } catch (err) {
      console.error('Error joining session:', err);
      setError('Failed to join session. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow">
          {/* Filters */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold mb-4">Filters</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={format(filters.dateRange[0], 'yyyy-MM-dd')}
                  onChange={(e) => setFilters({
                    ...filters,
                    dateRange: [parseISO(e.target.value), filters.dateRange[1]]
                  })}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              {/* Skill Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Skill Range (NTRP)
                </label>
                <div className="flex gap-2">
                  <select
                    value={filters.skillRange[0]}
                    onChange={(e) => setFilters({
                      ...filters,
                      skillRange: [Number(e.target.value), filters.skillRange[1]]
                    })}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    {[2.5, 3.0, 3.5, 4.0, 4.5].map((level) => (
                      <option key={level} value={level}>
                        {level.toFixed(1)}
                      </option>
                    ))}
                  </select>
                  <span className="flex items-center">to</span>
                  <select
                    value={filters.skillRange[1]}
                    onChange={(e) => setFilters({
                      ...filters,
                      skillRange: [filters.skillRange[0], Number(e.target.value)]
                    })}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    {[2.5, 3.0, 3.5, 4.0, 4.5].map((level) => (
                      <option key={level} value={level}>
                        {level.toFixed(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Intent */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Session Type
                </label>
                <select
                  value={filters.intent}
                  onChange={(e) => setFilters({
                    ...filters,
                    intent: e.target.value as Filters['intent']
                  })}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="match">Match</option>
                  <option value="rally">Rally</option>
                  <option value="drills">Drills</option>
                </select>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={filters.location}
                  onChange={(e) => setFilters({
                    ...filters,
                    location: e.target.value
                  })}
                  placeholder="Search by location"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Sessions List */}
          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-gray-500">Loading sessions...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600">{error}</p>
                <button
                  onClick={fetchSessions}
                  className="mt-4 text-blue-500 hover:text-blue-600"
                >
                  Try Again
                </button>
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No sessions found matching your criteria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="p-6">
                      <h3 className="text-lg font-semibold mb-2">{session.title}</h3>
                      <div className="space-y-2 text-sm text-gray-600">
                        <p>
                          <span className="font-medium">Location:</span> {session.location}
                        </p>
                        <p>
                          <span className="font-medium">Date:</span>{' '}
                          {format(parseISO(session.date_time), 'MMM d, yyyy h:mm a')}
                        </p>
                        <p>
                          <span className="font-medium">Duration:</span> {session.duration} minutes
                        </p>
                        <p>
                          <span className="font-medium">Type:</span>{' '}
                          {session.intent.charAt(0).toUpperCase() + session.intent.slice(1)}
                        </p>
                        <p>
                          <span className="font-medium">Skill Range:</span>{' '}
                          {session.skill_min.toFixed(1)} - {session.skill_max.toFixed(1)} NTRP
                        </p>
                        <p>
                          <span className="font-medium">Players:</span>{' '}
                          {session.current_players}/{session.max_players}
                        </p>
                      </div>
                      <div className="mt-4">
                        <button
                          onClick={() => handleJoinSession(session.id)}
                          disabled={session.creator_id === user?.id}
                          className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {session.creator_id === user?.id ? 'Your Session' : 'Join Session'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 