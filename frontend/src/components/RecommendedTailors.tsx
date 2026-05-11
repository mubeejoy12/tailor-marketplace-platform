'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, Star, MapPin, ShieldCheck } from 'lucide-react';
import { getRecommendations, RecommendationResult } from '@/services/recommendationService';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { getUser } from '@/lib/auth';

export default function RecommendedTailors() {
  const [tailors, setTailors]   = useState<RecommendationResult[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const user = getUser();
    getRecommendations({ userId: user?.id, limit: 4 })
      .then(setTailors)
      .catch(() => setTailors([]))
      .finally(() => setLoading(false));
  }, []);

  // Don't render the section at all if there are no results
  if (!loading && tailors.length === 0) return null;

  return (
    <section className="py-16 bg-gradient-to-br from-purple-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="flex items-center gap-2 text-purple-600 text-sm font-medium mb-1">
              <Sparkles className="w-4 h-4" />
              Personalised for you
            </div>
            <h2 className="text-2xl font-semibold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Recommended Tailors
            </h2>
            <p className="text-sm text-gray-500 mt-1">Matched by rating, specialization and location</p>
          </div>
          <Link
            href="/tailors"
            className="hidden sm:flex items-center gap-1 text-sm text-teal-600 hover:text-teal-700 font-medium"
          >
            See all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            : tailors.map((t) => <RecommendationCard key={t.tailorId} tailor={t} />)
          }
        </div>
      </div>
    </section>
  );
}

function RecommendationCard({ tailor }: { tailor: RecommendationResult }) {
  return (
    <Link
      href={`/tailors/${tailor.tailorId}`}
      className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden"
    >
      {/* Image / placeholder */}
      <div className="h-36 bg-gradient-to-br from-teal-100 to-purple-100 relative">
        {tailor.profileImage ? (
          <img
            src={tailor.profileImage}
            alt={tailor.shopName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl text-teal-400 font-bold">
            {tailor.shopName.charAt(0)}
          </div>
        )}
        {tailor.verified && (
          <div className="absolute top-2 right-2 bg-white rounded-full p-1 shadow">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-sm truncate group-hover:text-teal-700 transition-colors">
          {tailor.shopName}
        </h3>
        {tailor.specialization && (
          <p className="text-xs text-gray-500 mt-0.5 truncate">{tailor.specialization}</p>
        )}
        <div className="flex items-center gap-1 mt-2">
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span className="text-xs font-medium text-gray-700">{Number(tailor.rating).toFixed(1)}</span>
          <span className="text-xs text-gray-400">· {tailor.totalOrders} orders</span>
        </div>
        <div className="flex items-center gap-1 mt-1.5">
          <MapPin className="w-3 h-3 text-gray-400" />
          <span className="text-xs text-gray-500 truncate">{tailor.location}</span>
        </div>
        {tailor.matchReason && (
          <div className="mt-2 px-2 py-1 bg-purple-50 rounded-lg">
            <p className="text-xs text-purple-600 truncate">{tailor.matchReason}</p>
          </div>
        )}
      </div>
    </Link>
  );
}
