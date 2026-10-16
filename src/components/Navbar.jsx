import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_ORIGIN = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace(/\/api\/?$/, '');

export default function Navbar({ onSearch, connected }) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const avatarSrc = user?.avatar ? `${API_ORIGIN}${user.avatar}` : null;

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-keep-border">
      <div className="flex items-center gap-4 px-4 sm:px-6 py-3">
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-md bg-yellow-400 flex items-center justify-center font-bold text-white">
            N
          </div>
          <h1 className="text-lg font-medium hidden sm:block">Notebook</h1>
        </div>

        <div className="flex-1 flex justify-center">
          <input
            placeholder="Search notes..."
            onChange={(e) => onSearch(e.target.value)}
            className="w-full max-w-xl bg-gray-100 rounded-full px-5 py-2 text-sm outline-none transition
                       focus:bg-white focus:ring-2 focus:ring-yellow-300 focus:shadow-sm"
          />
        </div>

        <div className="flex items-center gap-3 shrink-0 relative" ref={menuRef}>
          <span
            title={connected ? 'Connected' : 'Reconnecting…'}
            className={`w-2.5 h-2.5 rounded-full ${
              connected ? 'bg-green-500' : 'bg-gray-400 animate-pulse'
            }`}
          />

          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2 rounded-full hover:bg-gray-100 pl-1 pr-3 py-1 transition"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden bg-yellow-100 text-yellow-800 flex items-center justify-center text-sm font-medium">
              {avatarSrc ? (
                <img src={avatarSrc} alt="" className="w-full h-full object-cover" />
              ) : (
                user?.name?.[0]?.toUpperCase() || '?'
              )}
            </div>
            <span className="hidden md:block text-sm text-gray-700 max-w-32 truncate">
              {user?.name}
            </span>
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-12 w-56 bg-white rounded-xl shadow-lg border border-keep-border py-2">
              <div className="px-4 py-2 border-b border-keep-border flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-yellow-100 text-yellow-800 flex items-center justify-center font-medium">
                  {avatarSrc ? (
                    <img src={avatarSrc} alt="" className="w-full h-full object-cover" />
                  ) : (
                    user?.name?.[0]?.toUpperCase() || '?'
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{user?.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
              </div>

              <Link
                to="/profile"
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-2 text-sm hover:bg-gray-100"
              >
                Edit profile
              </Link>

              <button
                onClick={() => {
                  setMenuOpen(false);
                  logout();
                }}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}