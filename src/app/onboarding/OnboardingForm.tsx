'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface OnboardingFormProps {
  userId: string;
}

interface FormErrors {
  name?: string;
  skill_level?: string;
  location_preference?: string;
}

export default function OnboardingForm({ userId }: OnboardingFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    skill_level: '3.0',
    location_preference: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.location_preference.trim()) {
      newErrors.location_preference = 'Location preference is required';
    }
    
    const skillLevel = parseFloat(formData.skill_level);
    if (isNaN(skillLevel) || skillLevel < 2.5 || skillLevel > 4.5) {
      newErrors.skill_level = 'Skill level must be between 2.5 and 4.5';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.from('users').insert({
        id: userId,
        name: formData.name.trim(),
        skill_level: parseFloat(formData.skill_level),
        elo_rating: parseFloat(formData.skill_level) * 400,
        location_preference: formData.location_preference.trim(),
      });

      if (error) throw error;
      
      router.push('/dashboard');
    } catch (error) {
      console.error('Error saving user data:', error);
      setSubmitError('Failed to save your profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {submitError && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          {submitError}
        </div>
      )}
      
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Full Name
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className={`mt-1 block w-full rounded-md shadow-sm ${
            errors.name ? 'border-red-300' : 'border-gray-300'
          } focus:border-blue-500 focus:ring-blue-500`}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
        )}
      </div>

      <div>
        <label htmlFor="skill_level" className="block text-sm font-medium text-gray-700">
          NTRP Skill Level (2.5-4.5)
        </label>
        <select
          id="skill_level"
          value={formData.skill_level}
          onChange={(e) => setFormData({ ...formData, skill_level: e.target.value })}
          className={`mt-1 block w-full rounded-md shadow-sm ${
            errors.skill_level ? 'border-red-300' : 'border-gray-300'
          } focus:border-blue-500 focus:ring-blue-500`}
        >
          {[2.5, 3.0, 3.5, 4.0, 4.5].map((level) => (
            <option key={level} value={level}>{level}</option>
          ))}
        </select>
        {errors.skill_level && (
          <p className="mt-1 text-sm text-red-600">{errors.skill_level}</p>
        )}
      </div>

      <div>
        <label htmlFor="location_preference" className="block text-sm font-medium text-gray-700">
          Preferred Location
        </label>
        <input
          type="text"
          id="location_preference"
          value={formData.location_preference}
          onChange={(e) => setFormData({ ...formData, location_preference: e.target.value })}
          placeholder="e.g., Downtown Tennis Club"
          className={`mt-1 block w-full rounded-md shadow-sm ${
            errors.location_preference ? 'border-red-300' : 'border-gray-300'
          } focus:border-blue-500 focus:ring-blue-500`}
        />
        {errors.location_preference && (
          <p className="mt-1 text-sm text-red-600">{errors.location_preference}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
          isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
        }`}
      >
        {isSubmitting ? 'Saving...' : 'Complete Profile'}
      </button>
    </form>
  );
} 