'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const INTERESTS = [
  { id: 'saving', label: 'Saving & Budgeting', icon: '💰', desc: 'Tips to save more and budget smarter' },
  { id: 'investing', label: 'Investing Basics', icon: '📈', desc: 'Learn to grow your wealth' },
  { id: 'income', label: 'Side Income', icon: '🚀', desc: 'Ideas to earn extra money' },
];

export default function NewsletterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    interests: [] as string[],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleInterestToggle = (id: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(id)
        ? prev.interests.filter(i => i !== id)
        : [...prev.interests, id]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          interests: formData.interests,
          topics: [],
          regions: [],
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to subscribe');
      }
      
      setIsSubmitted(true);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to subscribe';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white flex items-center justify-center py-20">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary-100 flex items-center justify-center">
            <svg className="w-10 h-10 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-secondary-900 mb-4">You're subscribed! 🎉</h1>
          <p className="text-secondary-600 mb-8">
            Check your inbox for a confirmation email. We'll send you weekly insights on the topics you selected.
          </p>
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-medium rounded-full hover:bg-primary-700 transition-all"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      {/* Header */}
      <section className="py-16">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <span className="text-primary-600 text-sm font-semibold uppercase tracking-wider mb-4 block">
            Free Newsletter
          </span>
          <h1 className="text-4xl font-bold text-secondary-900 mb-4">
            Get smarter about money
          </h1>
          <p className="text-xl text-secondary-600">
            Join thousands of readers getting weekly personal finance insights. 
            No spam, no fluff—just actionable tips.
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="pb-20">
        <div className="max-w-xl mx-auto px-4">
          <div className="bg-white rounded-3xl shadow-card border border-secondary-100 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    First name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    placeholder="Alex"
                    className="w-full px-4 py-3 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Last name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    placeholder="Morgan"
                    className="w-full px-4 py-3 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Email address
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
                />
              </div>

              {/* Interests */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-3">
                  What interests you most?
                </label>
                <div className="space-y-3">
                  {INTERESTS.map((interest) => (
                    <button
                      key={interest.id}
                      type="button"
                      onClick={() => handleInterestToggle(interest.id)}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-start gap-4 ${
                        formData.interests.includes(interest.id)
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-secondary-200 hover:border-secondary-300'
                      }`}
                    >
                      <span className="text-2xl">{interest.icon}</span>
                      <div>
                        <div className="font-medium text-secondary-900">{interest.label}</div>
                        <div className="text-sm text-secondary-500">{interest.desc}</div>
                      </div>
                      {formData.interests.includes(interest.id) && (
                        <svg className="w-5 h-5 text-primary-600 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting || formData.interests.length === 0}
                className="w-full py-4 px-6 bg-primary-600 hover:bg-primary-700 disabled:bg-secondary-300 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all"
              >
                {isSubmitting ? 'Subscribing...' : 'Subscribe for free'}
              </button>

              <p className="text-center text-xs text-secondary-500">
                By subscribing you agree to our{' '}
                <Link href="/privacy" className="underline hover:text-secondary-700">Privacy Policy</Link>.
                {' '}Unsubscribe anytime.
              </p>
            </form>
          </div>

          {/* Benefits */}
          <div className="mt-10 grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl mb-2">📬</div>
              <div className="text-sm text-secondary-600">Weekly insights</div>
            </div>
            <div>
              <div className="text-2xl mb-2">🚫</div>
              <div className="text-sm text-secondary-600">No spam</div>
            </div>
            <div>
              <div className="text-2xl mb-2">🔓</div>
              <div className="text-sm text-secondary-600">Free forever</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
