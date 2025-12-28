'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { ideasApi } from '@/lib/api/ideas';
import { Idea } from '@/types';

export default function EditIdeaPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [idea, setIdea] = useState<Idea | null>(null);
  const [formData, setFormData] = useState({
    heading: '',
    description: '',
    status: 'DRAFT' as 'DRAFT' | 'VALIDATED' | 'WIP' | 'LAUNCHED',
    launchedLink: '',
    isPrivate: false,
  });

  useEffect(() => {
    // Redirect to login if not authenticated
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (params.id && status === 'authenticated') {
      loadIdea();
    }
  }, [params.id, status]);

  const loadIdea = async () => {
    try {
      setLoading(true);
      const data = await ideasApi.getIdeaById(params.id as string);

      // Check if user owns this idea
      if (data.userId !== (session?.user as any)?.id) {
        alert('You do not have permission to edit this idea');
        router.push(`/idea/${params.id}`);
        return;
      }

      setIdea(data);
      setFormData({
        heading: data.heading,
        description: data.description,
        status: data.status,
        launchedLink: data.launchedLink || '',
        isPrivate: data.isPrivate ?? false,
      });
    } catch (error) {
      console.error('Failed to load idea:', error);
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      await ideasApi.updateIdea(params.id as string, {
        heading: formData.heading,
        description: formData.description,
        status: formData.status,
        launchedLink: formData.launchedLink || undefined,
        isPrivate: formData.isPrivate,
      });

      router.push(`/idea/${params.id}`);
    } catch (error) {
      console.error('Failed to update idea:', error);
      alert('Failed to update idea. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this idea? This action cannot be undone.')) {
      return;
    }

    try {
      await ideasApi.deleteIdea(params.id as string);
      router.push('/');
    } catch (error) {
      console.error('Failed to delete idea:', error);
      alert('Failed to delete idea. Please try again.');
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

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!idea) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/idea/${params.id}`}
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
            Back to Idea
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Edit Idea</h1>
          <p className="text-gray-600 mt-2">Update your idea details</p>
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

            {/* Privacy Toggle */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                id="isPrivate"
                name="isPrivate"
                checked={formData.isPrivate}
                onChange={(e) =>
                  setFormData({ ...formData, isPrivate: e.target.checked })
                }
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="isPrivate" className="flex-1">
                <div className="text-sm font-medium text-gray-900">
                  Make this idea private
                </div>
                <div className="text-xs text-gray-500">
                  Only you will be able to see this idea
                </div>
              </label>
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={submitting || !formData.heading || !formData.description}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Updating...' : 'Update Idea'}
              </button>
              <Link
                href={`/idea/${params.id}`}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-center"
              >
                Cancel
              </Link>
            </div>

            {/* Delete Button */}
            <div className="pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleDelete}
                className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Delete Idea
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
