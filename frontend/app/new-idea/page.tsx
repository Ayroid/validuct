'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { ideasApi } from '@/lib/api/ideas';

export default function NewIdeaPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    heading: '',
    description: '',
    status: 'DRAFT' as 'DRAFT' | 'VALIDATED' | 'WIP' | 'LAUNCHED',
    launchedLink: '',
  });

  // Redirect to login if not authenticated
  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      const idea = await ideasApi.createIdea({
        heading: formData.heading,
        description: formData.description,
        status: formData.status,
        launchedLink: formData.launchedLink || undefined,
      });

      router.push(`/idea/${idea.id}`);
    } catch (error) {
      console.error('Failed to create idea:', error);
      alert('Failed to create idea. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Share Your Idea</h1>
          <p className="text-gray-600 mt-2">
            Share your idea with the community and get valuable feedback
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-md p-8 border border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Heading */}
            <div>
              <label htmlFor="heading" className="block text-sm font-medium text-gray-700 mb-2">
                Heading <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="heading"
                name="heading"
                value={formData.heading}
                onChange={handleChange}
                required
                maxLength={200}
                placeholder="Enter a catchy heading for your idea"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-1">{formData.heading.length}/200</p>
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={8}
                placeholder="Describe your idea in detail..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
              />
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="DRAFT">Draft</option>
                <option value="VALIDATED">Validated</option>
                <option value="WIP">Work in Progress</option>
                <option value="LAUNCHED">Launched</option>
              </select>
            </div>

            {/* Launched Link */}
            {(formData.status === 'LAUNCHED' || formData.status === 'WIP') && (
              <div>
                <label
                  htmlFor="launchedLink"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Link {formData.status === 'LAUNCHED' && '(optional)'}
                </label>
                <input
                  type="url"
                  id="launchedLink"
                  name="launchedLink"
                  value={formData.launchedLink}
                  onChange={handleChange}
                  placeholder="https://your-project-url.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading || !formData.heading || !formData.description}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Share Idea'}
              </button>
              <Link
                href="/"
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-center"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
