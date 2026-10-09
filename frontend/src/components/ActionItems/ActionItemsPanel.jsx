import { useState, useEffect, useMemo } from 'react';
import { 
  Check, 
  Plus, 
  Trash2, 
  Copy, 
  Search, 
  Clock, 
  User, 
  X,
  CheckCircle2
} from 'lucide-react';
import { useTranscript } from '../../contexts/TranscriptContext';

const normalizeItem = (item, index) => {
  if (!item) return null;
  const id = item.id || item._id || `act-${index}-${Date.now()}`;
  const task = item.task || item.text || item.title || item.description || 'Action item';
  const assignee = item.assignee || 'Team';
  const priority = (item.priority || 'medium').toLowerCase();
  const deadline = item.deadline || item.dueDate || item.due_date || 'Next sync';
  const completed = Boolean(item.completed || item.status === 'completed' || item.status === 'done');
  return { id, task, assignee, priority, deadline, completed };
};

const ActionItemsPanel = ({ actionItems: initialItems = [], isLoading = false, onItemsChange }) => {
  let contextSetActionItems = null;
  try {
    const transcriptCtx = useTranscript();
    contextSetActionItems = transcriptCtx?.setActionItems;
  } catch {
    // If used outside of TranscriptProvider
  }

  const [items, setItems] = useState(() => 
    (initialItems || []).map(normalizeItem).filter(Boolean)
  );
  const [filter, setFilter] = useState('all'); // 'all' | 'active' | 'completed'
  const [priorityFilter, setPriorityFilter] = useState('all'); // 'all' | 'high' | 'medium' | 'low'
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [copied, setCopied] = useState(false);

  // New task form state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('medium');
  const [newTaskDeadline, setNewTaskDeadline] = useState('');

  // Keep state in sync when initialItems changes
  useEffect(() => {
    if (initialItems && Array.isArray(initialItems)) {
      setItems(initialItems.map(normalizeItem).filter(Boolean));
    }
  }, [initialItems]);

  const updateItems = (newItems) => {
    setItems(newItems);
    if (onItemsChange) {
      onItemsChange(newItems);
    }
    if (contextSetActionItems) {
      contextSetActionItems(newItems);
    }
  };

  const handleToggle = (id) => {
    const updated = items.map((item) =>
      item.id === id ? { ...item, completed: !item.completed, status: !item.completed ? 'completed' : 'pending' } : item
    );
    updateItems(updated);
  };

  const handleDelete = (id) => {
    const updated = items.filter((item) => item.id !== id);
    updateItems(updated);
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newItem = {
      id: `custom-${Date.now()}`,
      task: newTaskTitle.trim(),
      assignee: newTaskAssignee.trim() || 'Team',
      priority: newTaskPriority,
      deadline: newTaskDeadline.trim() || 'Next sync',
      completed: false,
      status: 'pending'
    };

    const updated = [newItem, ...items];
    updateItems(updated);

    // Reset form
    setNewTaskTitle('');
    setNewTaskAssignee('');
    setNewTaskPriority('medium');
    setNewTaskDeadline('');
    setIsAdding(false);
  };

  const handleCopyAll = () => {
    if (items.length === 0) return;
    const textToCopy = items
      .map((it) => `[${it.completed ? 'x' : ' '}] ${it.task} (Owner: ${it.assignee} | Priority: ${it.priority} | Due: ${it.deadline})`)
      .join('\n');
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Status filter
      if (filter === 'active' && item.completed) return false;
      if (filter === 'completed' && !item.completed) return false;

      // Priority filter
      if (priorityFilter !== 'all' && item.priority !== priorityFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTask = item.task.toLowerCase().includes(q);
        const matchesAssignee = item.assignee.toLowerCase().includes(q);
        if (!matchesTask && !matchesAssignee) return false;
      }

      return true;
    });
  }, [items, filter, priorityFilter, searchQuery]);

  const completedCount = items.filter((item) => item.completed).length;
  const totalCount = items.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  if (isLoading) {
    return (
      <section className="bg-surface border border-line rounded-lg p-6 shadow-sm dark:shadow-none space-y-4">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-sage" />
          <h3 className="text-[12px] font-semibold uppercase tracking-widest text-ink-faint">
            Action Items
          </h3>
        </div>
        <div className="space-y-3 animate-pulse">
          <div className="h-10 bg-raised rounded w-full" />
          <div className="h-10 bg-raised rounded w-full" />
          <div className="h-10 bg-raised rounded w-full" />
        </div>
      </section>
    );
  }

  return (
    <section className="bg-surface border border-line rounded-lg p-6 shadow-sm dark:shadow-none space-y-4">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-sage" />
          <h3 className="text-[12px] font-semibold uppercase tracking-widest text-ink-faint">
            Action Items
          </h3>
          <span className="text-xs text-ink-muted font-mono tabular-nums ml-1">
            ({completedCount}/{totalCount})
          </span>
          {totalCount > 0 && (
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-sage-soft text-sage">
              {progressPercent}%
            </span>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-raised hover:bg-line text-ink border border-line rounded transition-colors duration-150 focus:outline-none focus:ring-1 focus:ring-accent"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Task</span>
          </button>

          {totalCount > 0 && (
            <button
              onClick={handleCopyAll}
              title="Copy action items list to clipboard"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-raised hover:bg-line text-ink-muted hover:text-ink border border-line rounded transition-colors duration-150 focus:outline-none focus:ring-1 focus:ring-accent"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-sage" />
                  <span className="text-sage">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy List</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {totalCount > 0 && (
        <div className="w-full bg-line h-1 rounded-full overflow-hidden">
          <div 
            className="bg-sage h-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}

      {/* Inline Add Task Form */}
      {isAdding && (
        <form onSubmit={handleAddTask} className="p-4 bg-raised rounded-lg border border-line space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Create New Action Item
            </h4>
            <button 
              type="button" 
              onClick={() => setIsAdding(false)} 
              className="text-ink-muted hover:text-ink p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div>
            <input
              type="text"
              placeholder="What task needs to be completed? (e.g. Schedule database migration review)"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              autoFocus
              className="w-full px-3 py-2 text-sm bg-surface border border-line rounded text-ink placeholder:text-ink-faint focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div>
              <label className="block text-[11px] text-ink-muted mb-1 font-medium">Assignee</label>
              <input
                type="text"
                placeholder="Name or Team"
                value={newTaskAssignee}
                onChange={(e) => setNewTaskAssignee(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-surface border border-line rounded text-ink placeholder:text-ink-faint focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>

            <div>
              <label className="block text-[11px] text-ink-muted mb-1 font-medium">Priority</label>
              <select
                value={newTaskPriority}
                onChange={(e) => setNewTaskPriority(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-surface border border-line rounded text-ink focus:outline-none focus:ring-1 focus:ring-accent"
              >
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-ink-muted mb-1 font-medium">Deadline</label>
              <input
                type="text"
                placeholder="e.g. Friday, Next sync"
                value={newTaskDeadline}
                onChange={(e) => setNewTaskDeadline(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-surface border border-line rounded text-ink placeholder:text-ink-faint focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 text-xs text-ink-muted hover:text-ink rounded transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!newTaskTitle.trim()}
              className="px-3.5 py-1.5 text-xs font-medium bg-accent text-canvas rounded hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              Save Action Item
            </button>
          </div>
        </form>
      )}

      {/* Filters Bar: Search & Status tabs & Priority filter */}
      {totalCount > 0 && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
          {/* Search box */}
          <div className="relative flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 text-ink-faint absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tasks or assignees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1 text-xs bg-raised border border-line rounded text-ink placeholder:text-ink-faint focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          {/* Filter tabs & Priority Select */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Status Tabs */}
            <div className="flex items-center gap-1 bg-raised p-0.5 rounded border border-line">
              {['all', 'active', 'completed'].map((filterType) => (
                <button
                  key={filterType}
                  onClick={() => setFilter(filterType)}
                  className={`px-2 py-0.5 rounded text-[11px] transition-colors duration-150 capitalize ${
                    filter === filterType
                      ? 'bg-surface font-medium text-ink shadow-sm'
                      : 'text-ink-muted hover:text-ink'
                  }`}
                >
                  {filterType}
                </button>
              ))}
            </div>

            {/* Priority Selector */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-2 py-1 bg-raised text-ink-muted hover:text-ink border border-line rounded text-[11px] focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="all">All Priorities</option>
              <option value="high">High only</option>
              <option value="medium">Medium only</option>
              <option value="low">Low only</option>
            </select>
          </div>
        </div>
      )}

      {/* Action Items List */}
      {totalCount === 0 ? (
        <div className="p-8 text-center bg-raised/50 border border-line rounded-lg">
          <p className="font-serif text-base text-ink-muted">
            No action items cataloged yet.
          </p>
          <p className="text-xs text-ink-faint mt-1 mb-3">
            Individual assignments and deadlines will be extracted automatically from meetings.
          </p>
          <button
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-surface text-ink border border-line rounded hover:bg-raised transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add First Task</span>
          </button>
        </div>
      ) : (
        <div className="divide-y divide-line border border-line rounded-lg overflow-hidden bg-surface">
          {filteredItems.map((item) => {
            // Priority styling
            const p = item.priority || 'medium';
            let priorityClass = 'bg-raised text-ink-muted';
            if (p === 'high' || p === 'urgent' || p === 'critical') {
              priorityClass = 'bg-rose-soft text-rose';
            } else if (p === 'medium' || p === 'moderate') {
              priorityClass = 'bg-amber-soft text-amber';
            }

            // Assignee initials
            const assigneeName = item.assignee || 'Team';
            const initials = assigneeName
              .split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2)
              .toUpperCase() || 'TM';

            return (
              <div
                key={item.id}
                className={`p-3.5 sm:p-4 flex items-center justify-between gap-3 transition-colors duration-150 group ${
                  item.completed ? 'bg-raised/40 hover:bg-raised/60' : 'hover:bg-raised'
                }`}
              >
                {/* Left: Checkbox + Task description */}
                <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                  {/* Round Checkbox */}
                  <button
                    onClick={() => handleToggle(item.id)}
                    className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors duration-150 flex-shrink-0 mt-0.5 sm:mt-0 focus:outline-none focus:ring-2 focus:ring-accent ${
                      item.completed
                        ? 'bg-sage text-white'
                        : 'border border-line bg-surface hover:border-ink-faint'
                    }`}
                    aria-label={item.completed ? 'Mark incomplete' : 'Mark complete'}
                  >
                    {item.completed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </button>

                  {/* Task Text */}
                  <span
                    onClick={() => handleToggle(item.id)}
                    className={`text-sm text-ink leading-relaxed cursor-pointer select-none transition-colors ${
                      item.completed ? 'line-through text-ink-faint' : 'text-ink hover:text-accent'
                    }`}
                  >
                    {item.task}
                  </span>
                </div>

                {/* Right metadata & actions */}
                <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
                  {/* Assignee Avatar */}
                  <div
                    title={`Assigned to: ${assigneeName}`}
                    className="w-6 h-6 rounded-full bg-accent-soft text-accent text-[11px] font-semibold flex items-center justify-center select-none"
                  >
                    {initials}
                  </div>

                  {/* Priority Chip */}
                  <span className={`px-2 py-0.5 rounded text-[11px] font-medium capitalize select-none ${priorityClass}`}>
                    {p}
                  </span>

                  {/* Due Date */}
                  <span 
                    title={`Due: ${item.deadline}`}
                    className="font-mono tabular-nums text-xs text-ink-faint hidden md:inline truncate max-w-[110px]"
                  >
                    {item.deadline}
                  </span>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="opacity-0 group-hover:opacity-100 text-ink-faint hover:text-rose p-1 transition-opacity duration-150 rounded"
                    title="Delete task"
                    aria-label="Delete task"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}

          {filteredItems.length === 0 && (
            <div className="p-8 text-center text-xs text-ink-muted">
              No action items match the selected filter or search query.
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default ActionItemsPanel;
