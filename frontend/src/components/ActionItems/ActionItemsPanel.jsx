import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckSquare, Square, AlertCircle, Clock, User } from 'lucide-react';
import Card from '../UI/Card';

const priorityConfig = {
  high: {
    color: 'text-status-error',
    bg: 'bg-status-error/10',
    border: 'border-status-error/30'
  },
  medium: {
    color: 'text-status-warning',
    bg: 'bg-status-warning/10',
    border: 'border-status-warning/30'
  },
  low: {
    color: 'text-accent-cyan',
    bg: 'bg-accent-cyan/10',
    border: 'border-accent-cyan/30'
  }
};

const ActionItem = ({ item, onToggle }) => {
  const config = priorityConfig[item.priority];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={`p-4 rounded-lg border ${config.border} ${config.bg} transition-all hover:shadow-lg`}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={() => onToggle(item.id)}
          className="mt-1 text-text-secondary hover:text-accent-cyan transition-colors"
        >
          {item.completed ? (
            <CheckSquare className="w-5 h-5 text-status-success" />
          ) : (
            <Square className="w-5 h-5" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <p className={`text-text-primary leading-relaxed ${item.completed ? 'line-through opacity-60' : ''}`}>
            {item.text}
          </p>
          
          <div className="flex flex-wrap items-center gap-3 mt-3 text-sm">
            <span className={`flex items-center gap-1 ${config.color}`}>
              <AlertCircle className="w-4 h-4" />
              {item.priority}
            </span>
            
            {item.assignee && (
              <span className="flex items-center gap-1 text-text-secondary">
                <User className="w-4 h-4" />
                {item.assignee}
              </span>
            )}
            
            {item.dueDate && (
              <span className="flex items-center gap-1 text-text-secondary">
                <Clock className="w-4 h-4" />
                {new Date(item.dueDate).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const ActionItemsPanel = ({ actionItems: initialItems, isLoading = false }) => {
  const [items, setItems] = useState(initialItems || []);
  const [filter, setFilter] = useState('all'); // all, active, completed

  const handleToggle = (id) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const filteredItems = items.filter(item => {
    if (filter === 'active') return !item.completed;
    if (filter === 'completed') return item.completed;
    return true;
  });

  const completedCount = items.filter(item => item.completed).length;
  const totalCount = items.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  if (!items || items.length === 0) {
    return (
      <Card className="h-full">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-accent-cyan/10 rounded-lg">
            <CheckSquare className="w-6 h-6 text-accent-cyan" />
          </div>
          <h2 className="text-xl font-bold text-gradient">Action Items</h2>
        </div>
        
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="p-4 bg-accent-cyan/10 rounded-full mb-4">
            <CheckSquare className="w-12 h-12 text-accent-cyan" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            No Action Items
          </h3>
          <p className="text-text-secondary">
            Action items will appear here after transcription
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent-cyan/10 rounded-lg">
            <CheckSquare className="w-6 h-6 text-accent-cyan" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gradient">Action Items</h2>
            <p className="text-sm text-text-secondary">
              {completedCount} of {totalCount} completed
            </p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="h-2 bg-primary-hover rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
            className="h-full bg-gradient-to-r from-accent-cyan to-accent-purple"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4">
        {['all', 'active', 'completed'].map((filterType) => (
          <button
            key={filterType}
            onClick={() => setFilter(filterType)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === filterType
                ? 'bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/30'
                : 'text-text-secondary hover:text-text-primary hover:bg-primary-hover'
            }`}
          >
            {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
            {filterType === 'all' && ` (${totalCount})`}
            {filterType === 'active' && ` (${totalCount - completedCount})`}
            {filterType === 'completed' && ` (${completedCount})`}
          </button>
        ))}
      </div>

      {/* Action Items List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredItems.map((item) => (
            <ActionItem key={item.id} item={item} onToggle={handleToggle} />
          ))}
        </AnimatePresence>
        
        {filteredItems.length === 0 && (
          <div className="text-center py-8 text-text-secondary">
            No {filter} items
          </div>
        )}
      </div>
    </Card>
  );
};

export default ActionItemsPanel;
