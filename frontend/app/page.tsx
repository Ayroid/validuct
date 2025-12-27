import Timeline from '@/components/Timeline';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Validuct</h1>
            <p className="text-gray-600 mt-1">Validate and launch your ideas with the community</p>
          </div>
          <Link
            href="/new-idea"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Share Your Idea
          </Link>
        </div>

        {/* Timeline */}
        <Timeline />
      </div>
    </div>
  );
}
