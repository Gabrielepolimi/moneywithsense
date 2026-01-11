'use client';

import React, { useState } from 'react';

const INTERESTS = [
  { id: 'saving', label: 'Saving & Budgeting', icon: '💰' },
  { id: 'investing', label: 'Investing Basics', icon: '📈' },
  { id: 'income', label: 'Income & Side Hustles', icon: '🚀' },
];

const TOPICS = [
  'Emergency Fund',
  'Debt Payoff',
  'ETFs & Index Funds',
  'Retirement Planning',
  'Budget Templates',
  'Tax Optimization',
  'Credit Score',
  'Passive Income',
];

export default function NewsletterSection() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    interests: [] as string[],
    topics: [] as string[],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showTopics, setShowTopics] = useState(false);

  const handleInterestToggle = (id: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(id)
        ? prev.interests.filter(i => i !== id)
        : [...prev.interests, id]
    }));
  };

  const handleTopicToggle = (topic: string) => {
    setFormData(prev => ({
      ...prev,
      topics: prev.topics.includes(topic)
        ? prev.topics.filter(t => t !== topic)
        : [...prev.topics, topic]
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
          topics: formData.topics,
          regions: [],
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to subscribe');
      }
      
      setIsSubmitted(true);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to subscribe';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <section className="py-20 bg-gradient-to-b from-secondary-50 to-white">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="bg-white rounded-3xl shadow-card border border-secondary-100 p-12">
            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-secondary-900 mb-3">You're subscribed! 🎉</h3>
            <p className="text-secondary-600">
              We'll send you weekly insights on: {formData.interests.join(', ')}.
              Check your inbox for a confirmation email.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-b from-secondary-50 to-white">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-primary-600 text-sm font-semibold uppercase tracking-wider mb-2 block">
            Free Newsletter
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
            Weekly money insights, tailored to you
          </h2>
          <p className="text-lg text-secondary-600 max-w-2xl mx-auto">
            Tell us what you want to learn. We'll send only relevant, actionable content—no spam, just value.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-card border border-secondary-100 p-8 md:p-10">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  First name
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  required
                  placeholder="Alex"
                  className="w-full px-4 py-3 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all text-secondary-900 placeholder-secondary-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Last name
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  required
                  placeholder="Morgan"
                  className="w-full px-4 py-3 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all text-secondary-900 placeholder-secondary-400"
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
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all text-secondary-900 placeholder-secondary-400"
              />
            </div>

            {/* Interests */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-3">
                What are you most interested in?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {INTERESTS.map((interest) => (
                  <button
                    key={interest.id}
                    type="button"
                    onClick={() => handleInterestToggle(interest.id)}
                    className={`p-4 rounded-2xl border-2 transition-all text-left ${
                      formData.interests.includes(interest.id)
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-secondary-200 hover:border-secondary-300 text-secondary-700'
                    }`}
                  >
                    <div className="text-2xl mb-2">{interest.icon}</div>
                    <div className="font-medium text-sm">{interest.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Topics (Optional) */}
            <div>
              <button
                type="button"
                onClick={() => setShowTopics(!showTopics)}
                className="flex items-center justify-between w-full p-4 rounded-xl border border-secondary-200 hover:border-secondary-300 transition-colors"
              >
                <div className="text-left">
                  <div className="font-medium text-secondary-900">
                    {formData.topics.length > 0 
                      ? `${formData.topics.length} topic${formData.topics.length > 1 ? 's' : ''} selected`
                      : 'Specific topics (optional)'
                    }
                  </div>
                  <div className="text-sm text-secondary-500">
                    {formData.topics.length > 0 
                      ? formData.topics.slice(0, 3).join(', ') + (formData.topics.length > 3 ? '...' : '')
                      : 'Fine-tune your content preferences'
                    }
                  </div>
                </div>
                <svg 
                  className={`w-5 h-5 text-secondary-400 transition-transform ${showTopics ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showTopics && (
                <div className="mt-3 p-4 bg-secondary-50 rounded-xl">
                  <div className="flex flex-wrap gap-2">
                    {TOPICS.map((topic) => (
                      <button
                        key={topic}
                        type="button"
                        onClick={() => handleTopicToggle(topic)}
                        className={`px-4 py-2 text-sm rounded-full transition-all ${
                          formData.topics.includes(topic)
                            ? 'bg-primary-600 text-white'
                            : 'bg-white border border-secondary-200 text-secondary-700 hover:border-secondary-300'
                        }`}
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || formData.interests.length === 0}
              className="w-full py-4 px-6 bg-primary-600 hover:bg-primary-700 disabled:bg-secondary-300 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all shadow-finance hover:shadow-lg"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Subscribing...
                </span>
              ) : (
                'Subscribe for free'
              )}
            </button>

            {/* Privacy Note */}
            <p className="text-center text-xs text-secondary-500">
              By subscribing you agree to our{' '}
              <a href="/privacy" className="underline hover:text-secondary-700">Privacy Policy</a>.
              {' '}We respect your inbox—unsubscribe anytime.
            </p>
          </form>
        </div>

        {/* Trust Badges */}
        <div className="mt-10 flex flex-wrap justify-center gap-8 text-sm text-secondary-500">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Your data is secure</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
            <span>No spam, ever</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Weekly digest</span>
          </div>
        </div>
      </div>
    </section>
  );
}
