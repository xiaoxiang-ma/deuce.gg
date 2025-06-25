'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface OnboardingFormProps {
  userId: string;
}

export default function OnboardingForm({ userId }: OnboardingFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    skill_level: '3.0',
    location_preference: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase.from('users').insert({
        id: userId,
        name: formData.name,
        skill_level: parseFloat(formData.skill_level),
        elo_rating: parseFloat(formData.skill_level) * 400,
        location_preference: formData.location_preference,
      });

      if (error) throw error;
      
      router.push('/dashboard');
    } catch (error) {
      console.error('Error saving user data:', error);
      // TODO: Show error message to user
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Full Name
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          required
        />
      </div>

      <div>
        <label htmlFor="skill_level" className="block text-sm font-medium text-gray-700">
          NTRP Skill Level
        </label>
        <select
          id="skill_level"
          value={formData.skill_level}
          onChange={(e) => setFormData({ ...formData, skill_level: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          required
        >
          {['2.5', '3.0', '3.5', '4.0', '4.5'].map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700">
          Preferred Location
        </label>
        <input
          type="text"
          id="location"
          value={formData.location_preference}
          onChange={(e) => setFormData({ ...formData, location_preference: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          placeholder="e.g., Downtown Tennis Club"
          required
        />
      </div>

      <button
        type="submit"
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        Complete Profile
      </button>
    </form>
  );
} 