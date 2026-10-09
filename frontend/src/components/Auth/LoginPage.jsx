import { useState } from 'react';
import { Mail, Lock, User } from 'lucide-react';
import Button from '../UI/Button';
import { signInWithGoogle, signInWithEmail, signUpWithEmail } from '../../services/authService';

const LoginPage = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');

    const result = await signInWithGoogle();

    if (!result.success) {
      setError(result.error);
    }

    setLoading(false);
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    let result;
    if (isSignUp) {
      result = await signUpWithEmail(email, password, displayName);
    } else {
      result = await signInWithEmail(email, password);
    }

    if (!result.success) {
      setError(result.error);
    }

    setLoading(false);
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
    setEmail('');
    setPassword('');
    setDisplayName('');
  };

  return (
    <div className="min-h-screen bg-canvas text-ink flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Brand: Plain text wordmark in display serif */}
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl font-semibold text-ink tracking-tight mb-1">
            MeetSight
          </h1>
          <p className="text-xs text-ink-muted">
            Autonomous meeting intelligence and vector memory
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-surface border border-line rounded-xl p-8 shadow-xl dark:shadow-none">
          <div className="mb-6 text-center">
            <h2 className="font-serif text-2xl font-medium text-ink mb-1">
              {isSignUp ? 'Create Account' : 'Sign In'}
            </h2>
            <p className="text-xs text-ink-muted">
              {isSignUp ? 'Sign up to persist transcripts to cloud' : 'Sign in to access your saved transcripts'}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-soft border border-rose/30 rounded-md text-rose text-xs">
              {error}
            </div>
          )}

          {/* Google Sign-In Button */}
          <Button
            onClick={handleGoogleSignIn}
            disabled={loading}
            variant="secondary"
            className="w-full mb-4 flex items-center justify-center gap-2 text-xs"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {loading ? 'Please wait...' : 'Continue with Google'}
          </Button>

          {/* Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-line"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-surface text-ink-faint">Or continue with email</span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleEmailAuth} className="space-y-3">
            {isSignUp && (
              <div>
                <label className="block text-xs font-medium text-ink-muted mb-1">
                  Display Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="John Doe"
                    required={isSignUp}
                    className="w-full pl-9 pr-3 py-2 bg-surface border border-line rounded-md text-xs text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-canvas"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-ink-muted mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-9 pr-3 py-2 bg-surface border border-line rounded-md text-xs text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-canvas"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-ink-muted mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full pl-9 pr-3 py-2 bg-surface border border-line rounded-md text-xs text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-canvas"
                />
              </div>
              {isSignUp && (
                <p className="mt-1 text-[11px] text-ink-faint font-mono">
                  Must be at least 6 characters
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading}
              variant="primary"
              className="w-full mt-4 text-xs"
            >
              {loading ? 'Please wait...' : isSignUp ? 'Sign Up' : 'Sign In'}
            </Button>
          </form>

          {/* Toggle */}
          <div className="mt-4 text-center">
            <button
              onClick={toggleMode}
              disabled={loading}
              className="text-xs text-ink-muted hover:text-ink transition-colors duration-150 disabled:opacity-50"
            >
              {isSignUp ? (
                <>
                  Already have an account?{' '}
                  <span className="font-semibold text-ink underline">Sign In</span>
                </>
              ) : (
                <>
                  Don't have an account?{' '}
                  <span className="font-semibold text-ink underline">Sign Up</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;