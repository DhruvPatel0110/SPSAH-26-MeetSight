import { motion } from 'framer-motion';
import { TrendingUp, ThumbsUp, Target, Users, Lightbulb, Sparkles } from 'lucide-react';
import Card from '../UI/Card';
import { SkeletonCard } from '../UI/Skeleton';

const iconMap = {
  TrendingUp,
  ThumbsUp,
  Target,
  Users,
  Lightbulb,
  Sparkles
};

const colorMap = {
  cyan: {
    bg: 'bg-accent-cyan/10',
    text: 'text-accent-cyan',
    border: 'border-accent-cyan/30'
  },
  purple: {
    bg: 'bg-accent-purple/10',
    text: 'text-accent-purple',
    border: 'border-accent-purple/30'
  },
  pink: {
    bg: 'bg-accent-pink/10',
    text: 'text-accent-pink',
    border: 'border-accent-pink/30'
  }
};

const SummaryCard = ({ point, index }) => {
  const Icon = iconMap[point.icon] || Sparkles;
  const colors = colorMap[point.color] || colorMap.cyan;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card gradient hover className="h-full">
        <div className="flex items-start gap-4">
          <div className={`p-3 ${colors.bg} rounded-lg flex-shrink-0`}>
            <Icon className={`w-6 h-6 ${colors.text}`} />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-text-primary mb-2 break-words whitespace-normal">
              {point.title}
            </h3>
            <p className="text-text-secondary leading-relaxed break-words whitespace-normal overflow-wrap-anywhere">
              {point.description}
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

const SummaryCards = ({ summary, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-text-primary">AI Summary</h2>
          <p className="text-sm text-text-secondary">Generating insights...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="space-y-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-text-primary">AI Summary</h2>
          <p className="text-sm text-text-secondary">Key insights from your transcript</p>
        </div>
        <Card className="text-center py-12">
          <div className="p-4 bg-accent-purple/10 rounded-full inline-block mb-4">
            <Sparkles className="w-12 h-12 text-accent-purple" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            No Summary Available
          </h3>
          <p className="text-text-secondary">
            Upload and transcribe an audio file to generate an AI summary
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-xl font-bold text-text-primary">AI Summary</h2>
          <p className="text-sm text-text-secondary">
            Key insights from your transcript
          </p>
        </div>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {summary.keyPoints.map((point, index) => (
          <SummaryCard key={point.id} point={point} index={index} />
        ))}
      </div>

      {/* Additional Info */}
      <Card>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-text-secondary mb-2">Topics Discussed</h4>
            <div className="flex flex-wrap gap-2">
              {summary.topics.map((topic, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-primary-hover border border-accent-cyan/20 rounded-full text-sm text-text-primary"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-text-secondary">Overall Sentiment:</span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              summary.sentiment === 'positive' 
                ? 'bg-status-success/20 text-status-success'
                : summary.sentiment === 'negative'
                ? 'bg-status-error/20 text-status-error'
                : 'bg-status-warning/20 text-status-warning'
            }`}>
              {summary.sentiment.charAt(0).toUpperCase() + summary.sentiment.slice(1)}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SummaryCards;
