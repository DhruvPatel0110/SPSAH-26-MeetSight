import { useState } from 'react';
import { User, LogOut, History } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { logout } from '../../services/authService';

const UserMenu = ({ onHistoryClick }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
  };

  if (!user) return null;

  return (
    <div className="relative">
      {/* User Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 hover:bg-raised rounded-md transition-colors duration-150 text-ink focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-canvas"
      >
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName || 'User'}
            className="w-7 h-7 rounded-full border border-line object-cover"
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-raised border border-line flex items-center justify-center text-ink-muted">
            <User className="w-4 h-4" />
          </div>
        )}
        <span className="hidden md:inline text-xs font-medium text-ink truncate max-w-[100px]">
          {user.displayName || 'User'}
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div
            className="absolute right-0 mt-2 w-56 bg-surface border border-line rounded-lg shadow-sm dark:shadow-none z-50 overflow-hidden py-1 transition-all duration-150"
          >
            {/* User Info */}
            <div className="px-4 py-3 border-b border-line">
              <p className="text-xs font-semibold text-ink truncate">
                {user.displayName || 'User'}
              </p>
              <p className="text-[11px] text-ink-muted truncate font-mono">{user.email}</p>
            </div>

            {/* Menu Items */}
            <div className="py-1">
              <button
                onClick={() => {
                  onHistoryClick?.();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-raised transition-colors duration-150 text-left text-xs text-ink"
              >
                <History className="w-3.5 h-3.5 text-ink-muted" />
                <span>Transcript History</span>
              </button>

              <div className="my-1 border-t border-line" />

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-rose-soft transition-colors duration-150 text-left text-xs text-rose"
              >
                <LogOut className="w-3.5 h-3.5 text-rose" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserMenu;