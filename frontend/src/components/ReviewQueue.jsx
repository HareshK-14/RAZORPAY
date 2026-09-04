import { useState } from 'react';
import RiskBadge from './RiskBadge';
import { updateReview } from '../api/api';
import { CheckCircle, Clock, Eye } from 'lucide-react';

const STATUS_ICONS = {
  'Needs Review': <Clock className="w-3.5 h-3.5 text-yellow-400" />,
  'Under Review': <Eye className="w-3.5 h-3.5 text-blue-400" />,
  'Reviewed': <CheckCircle className="w-3.5 h-3.5 text-green-400" />
};

const STATUS_COLORS = {
  'Needs Review': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  'Under Review': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Reviewed': 'bg-green-500/10 text-green-400 border-green-500/20'
};

function ReviewRow({ review, onUpdate }) {
  const [updating, setUpdating] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(review.status);

  const handleStatusChange = async (newStatus) => {
    if (newStatus === currentStatus) return;
    setUpdating(true);
    try {
      await updateReview(review.id, { status: newStatus });
      setCurrentStatus(newStatus);
      onUpdate && onUpdate(review.id, newStatus);
    } catch (e) {
      console.error(e);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="card p-4 fade-in hover:border-gray-700 transition-colors">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex-shrink-0 w-32">
          <div className="text-xs font-bold text-white font-mono">{review.transaction_id}</div>
          <div className="text-xs text-gray-500 mt-0.5">{review.created_at?.substring(0, 10)}</div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <RiskBadge level={review.risk_level} size="sm" />
            <span className="text-sm font-bold text-white">{review.risk_score}/100</span>
            <span className="text-xs text-gray-500">{review.top_signal}</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Confidence: {Math.round((review.confidence || 0) * 100)}%
          </div>
        </div>

        {/* Status selector */}
        <div className="flex-shrink-0">
          <select
            value={currentStatus}
            onChange={e => handleStatusChange(e.target.value)}
            disabled={updating}
            className={`text-xs font-medium border rounded-lg px-3 py-1.5 bg-transparent cursor-pointer focus:outline-none ${STATUS_COLORS[currentStatus]} disabled:opacity-50`}
          >
            <option value="Needs Review" className="bg-gray-900 text-yellow-400">Needs Review</option>
            <option value="Under Review" className="bg-gray-900 text-blue-400">Under Review</option>
            <option value="Reviewed" className="bg-gray-900 text-green-400">Reviewed</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export default function ReviewQueue({ reviews = [], loading, onUpdate }) {
  if (loading) return (
    <div className="space-y-3">
      {[1, 2, 3, 4].map(i => <div key={i} className="card p-4 animate-pulse h-16 bg-gray-800"></div>)}
    </div>
  );

  if (!reviews.length) return (
    <div className="card p-8 text-center text-gray-500">
      <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
      <p>No items in the review queue.</p>
    </div>
  );

  return (
    <div className="space-y-2.5">
      {reviews.map(r => (
        <ReviewRow key={r.id} review={r} onUpdate={onUpdate} />
      ))}
    </div>
  );
}
