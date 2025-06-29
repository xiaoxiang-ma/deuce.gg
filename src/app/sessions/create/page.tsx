'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { addHours } from 'date-fns';

type FormData = {
  title: string;
  location: string;
  dateTime: string;
  duration: number;
  intent: 'match' | 'rally' | 'drills';
  skillMin: number;
  skillMax: number;
  maxPlayers: number;
};

export default function CreateSessionPage() {
  const router = useRouter();
  const { user } = useUser();
  const supabase = createClientComponentClient();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Default to user's skill level ± 0.5 for skill range
  const userSkillLevel = 3.0; // TODO: Get from user profile
  const defaultSkillMin = Math.max(2.5, userSkillLevel - 0.5);
  const defaultSkillMax = Math.min(4.5, userSkillLevel + 0.5);

  const [formData, setFormData] = useState<FormData>({
    title: '',
    location: '',
    dateTime: new Date(addHours(new Date(), 1)).toISOString().slice(0, 16),
    duration: 90,
    intent: 'match',
    skillMin: defaultSkillMin,
    skillMax: defaultSkillMax,
    maxPlayers: 2,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data, error: supabaseError } = await supabase
        .from('sessions')
        .insert([
          {
            creator_id: user?.id,
            title: formData.title,
            location: formData.location,
            date_time: new Date(formData.dateTime).toISOString(),
            duration: formData.duration,
            intent: formData.intent,
            skill_min: formData.skillMin,
            skill_max: formData.skillMax,
            max_players: formData.maxPlayers,
          },
        ])
        .select()
        .single();

      if (supabaseError) throw supabaseError;

      router.push(`/sessions/${data.id}`);
    } catch (err) {
      console.error('Error creating session:', err);
      setError('Failed to create session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-6">Create a New Session</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
                placeholder="e.g., Looking for a match partner"
              />
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                Location
              </label>
              <input
                type="text"
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
                placeholder="Enter court location"
              />
            </div>

            {/* Date and Time */}
            <div>
              <label htmlFor="dateTime" className="block text-sm font-medium text-gray-700">
                Date and Time
              </label>
              <input
                type="datetime-local"
                id="dateTime"
                value={formData.dateTime}
                onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>

            {/* Duration */}
            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                Duration (minutes)
              </label>
              <select
                id="duration"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value={60}>60 minutes</option>
                <option value={90}>90 minutes</option>
                <option value={120}>120 minutes</option>
              </select>
            </div>

            {/* Intent */}
            <div>
              <label htmlFor="intent" className="block text-sm font-medium text-gray-700">
                Session Type
              </label>
              <select
                id="intent"
                value={formData.intent}
                onChange={(e) => setFormData({ ...formData, intent: e.target.value as FormData['intent'] })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="match">Match</option>
                <option value="rally">Rally</option>
                <option value="drills">Drills</option>
              </select>
            </div>

            {/* Skill Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Skill Range (NTRP)</label>
              <div className="flex gap-4">
                <div className="flex-1">
                  <select
                    value={formData.skillMin}
                    onChange={(e) => setFormData({ ...formData, skillMin: Number(e.target.value) })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    {[2.5, 3.0, 3.5, 4.0, 4.5].map((level) => (
                      <option key={level} value={level} disabled={level > formData.skillMax}>
                        {level.toFixed(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center">to</div>
                <div className="flex-1">
                  <select
                    value={formData.skillMax}
                    onChange={(e) => setFormData({ ...formData, skillMax: Number(e.target.value) })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    {[2.5, 3.0, 3.5, 4.0, 4.5].map((level) => (
                      <option key={level} value={level} disabled={level < formData.skillMin}>
                        {level.toFixed(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Max Players */}
            <div>
              <label htmlFor="maxPlayers" className="block text-sm font-medium text-gray-700">
                Maximum Players
              </label>
              <select
                id="maxPlayers"
                value={formData.maxPlayers}
                onChange={(e) => setFormData({ ...formData, maxPlayers: Number(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value={2}>2 players</option>
                <option value={4}>4 players</option>
              </select>
            </div>

            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Session'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 