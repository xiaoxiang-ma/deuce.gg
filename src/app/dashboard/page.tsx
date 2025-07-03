'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { createBrowserClient } from '@supabase/ssr';
import { format, parseISO } from 'date-fns';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type Session = {
  id: string;
  title: string;
  location: string;
  date_time: string;
  duration: number;
  intent: 'match' | 'rally' | 'drills';
  status: 'open' | 'full' | 'completed' | 'cancelled';
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const [upcomingSessions, setUpcomingSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (isLoaded && !user) {
      router.replace('/auth/sign-in');
    }
  }, [isLoaded, user, router]);

  // If not authenticated, show nothing while redirecting
  if (!isLoaded || !user) {
    return null;
  }

  useEffect(() => {
    const fetchUpcomingSessions = async () => {
      try {
        const { data, error } = await supabase
          .from('sessions')
          .select('*')
          .or(`creator_id.eq.${user?.id},id.in.(select session_id from match_requests where requester_id = '${user?.id}' and status = 'accepted')`)
          .gte('date_time', new Date().toISOString())
          .order('date_time', { ascending: true })
          .limit(5);

        if (error) throw error;
        setUpcomingSessions(data || []);
      } catch (err) {
        console.error('Error fetching upcoming sessions:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchUpcomingSessions();
    }
  }, [user?.id]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome, {user?.firstName || user?.username || 'Player'}!
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Find your next tennis match or create a new session.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link 
            href="/sessions/create"
            className="block p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200"
          >
            <h2 className="text-lg font-semibold text-gray-900">Create Session</h2>
            <p className="mt-1 text-sm text-gray-600">
              Host a new tennis session and find players to join you.
            </p>
          </Link>

          <Link 
            href="/sessions/browse"
            className="block p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200"
          >
            <h2 className="text-lg font-semibold text-gray-900">Find Sessions</h2>
            <p className="mt-1 text-sm text-gray-600">
              Browse available sessions and join other players.
            </p>
          </Link>
        </div>

        {/* Upcoming Sessions */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Your Upcoming Sessions</h2>
              <Link 
                href="/sessions/browse"
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                View All
              </Link>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-500">Loading sessions...</p>
              </div>
            ) : upcomingSessions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-sm text-gray-500">No upcoming sessions found.</p>
                <Link 
                  href="/sessions/browse"
                  className="mt-2 inline-block text-sm text-blue-600 hover:text-blue-700"
                >
                  Find a session to join
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {upcomingSessions.map((session) => (
                  <Link 
                    key={session.id}
                    href={`/sessions/${session.id}`}
                    className="block py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{session.title}</h3>
                        <p className="mt-1 text-xs text-gray-500">{session.location}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-900">
                          {format(parseISO(session.date_time), 'MMM d, h:mm a')}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          {session.duration} minutes • {session.intent}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        session.status === 'open' ? 'bg-green-100 text-green-800' :
                        session.status === 'full' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 