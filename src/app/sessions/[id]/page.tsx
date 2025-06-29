'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { createBrowserClient } from '@supabase/ssr';
import { format, parseISO } from 'date-fns';
import { useRouter } from 'next/navigation';

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

type MatchRequest = {
  id: string;
  session_id: string;
  requester_id: string;
  status: 'pending' | 'accepted' | 'declined';
  message: string | null;
  created_at: string;
  user: {
    id: string;
    email: string;
    skill_level: number;
  };
};

export default function SessionDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useUser();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const [session, setSession] = useState<Session | null>(null);
  const [requests, setRequests] = useState<MatchRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch session and match requests
  const fetchSessionData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch session details
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', params.id)
        .single();

      if (sessionError) throw sessionError;

      // Fetch match requests with user details
      const { data: requestsData, error: requestsError } = await supabase
        .from('match_requests')
        .select(`
          *,
          user:requester_id (
            id,
            email,
            skill_level
          )
        `)
        .eq('session_id', params.id);

      if (requestsError) throw requestsError;

      setSession(sessionData);
      setRequests(requestsData);
    } catch (err) {
      console.error('Error fetching session data:', err);
      setError('Failed to load session details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessionData();

    // Subscribe to match request changes
    const requestsSubscription = supabase
      .channel('match_requests_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'match_requests',
          filter: `session_id=eq.${params.id}`,
        },
        () => {
          fetchSessionData();
        }
      )
      .subscribe();

    return () => {
      requestsSubscription.unsubscribe();
    };
  }, [params.id]);

  const handleRequestAction = async (requestId: string, action: 'accepted' | 'declined') => {
    try {
      const { error: updateError } = await supabase
        .from('match_requests')
        .update({ status: action })
        .eq('id', requestId);

      if (updateError) throw updateError;

      // Refresh data
      fetchSessionData();
    } catch (err) {
      console.error('Error updating request:', err);
      setError(`Failed to ${action} request. Please try again.`);
    }
  };

  const handleCancelSession = async () => {
    try {
      const { error: updateError } = await supabase
        .from('sessions')
        .update({ status: 'cancelled' })
        .eq('id', params.id);

      if (updateError) throw updateError;

      router.push('/sessions/browse');
    } catch (err) {
      console.error('Error cancelling session:', err);
      setError('Failed to cancel session. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading session details...</p>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Session not found'}</p>
          <button
            onClick={() => router.back()}
            className="text-blue-500 hover:text-blue-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const isCreator = session.creator_id === user?.id;
  const userRequest = requests.find(r => r.requester_id === user?.id);
  const pendingRequests = requests.filter(r => r.status === 'pending');
  const acceptedRequests = requests.filter(r => r.status === 'accepted');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow">
          {/* Session Details */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-start mb-6">
              <h1 className="text-2xl font-bold">{session.title}</h1>
              {isCreator && session.status === 'open' && (
                <button
                  onClick={handleCancelSession}
                  className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-600 rounded-md hover:bg-red-50"
                >
                  Cancel Session
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
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
              </div>
              <div className="space-y-4">
                <p>
                  <span className="font-medium">Skill Range:</span>{' '}
                  {session.skill_min.toFixed(1)} - {session.skill_max.toFixed(1)} NTRP
                </p>
                <p>
                  <span className="font-medium">Players:</span>{' '}
                  {session.current_players}/{session.max_players}
                </p>
                <p>
                  <span className="font-medium">Status:</span>{' '}
                  <span className={`capitalize ${
                    session.status === 'open' ? 'text-green-600' :
                    session.status === 'full' ? 'text-orange-600' :
                    'text-red-600'
                  }`}>
                    {session.status}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Match Requests Section */}
          {isCreator && session.status === 'open' && (
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">Match Requests</h2>
              {pendingRequests.length === 0 ? (
                <p className="text-gray-500">No pending requests</p>
              ) : (
                <div className="space-y-4">
                  {pendingRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{request.user.email}</p>
                        <p className="text-sm text-gray-600">
                          Skill Level: {request.user.skill_level.toFixed(1)} NTRP
                        </p>
                        {request.message && (
                          <p className="text-sm text-gray-600 mt-1">{request.message}</p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleRequestAction(request.id, 'accepted')}
                          className="px-3 py-1 text-sm font-medium text-white bg-green-600 rounded hover:bg-green-700"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleRequestAction(request.id, 'declined')}
                          className="px-3 py-1 text-sm font-medium text-red-600 bg-white border border-red-600 rounded hover:bg-red-50"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Accepted Players Section */}
          {acceptedRequests.length > 0 && (
            <div className="p-6 border-t border-gray-200">
              <h2 className="text-lg font-semibold mb-4">Accepted Players</h2>
              <div className="space-y-2">
                {acceptedRequests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center space-x-2 text-sm text-gray-600"
                  >
                    <span>•</span>
                    <span>{request.user.email}</span>
                    <span>({request.user.skill_level.toFixed(1)} NTRP)</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Join Request Status */}
          {!isCreator && session.status === 'open' && (
            <div className="p-6 border-t border-gray-200">
              {userRequest ? (
                <div className="text-center">
                  <p className="text-lg">
                    Request Status:{' '}
                    <span className={`font-medium ${
                      userRequest.status === 'pending' ? 'text-orange-600' :
                      userRequest.status === 'accepted' ? 'text-green-600' :
                      'text-red-600'
                    }`}>
                      {userRequest.status.charAt(0).toUpperCase() + userRequest.status.slice(1)}
                    </span>
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <button
                    onClick={() => router.push(`/sessions/${session.id}/join`)}
                    className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Request to Join
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 