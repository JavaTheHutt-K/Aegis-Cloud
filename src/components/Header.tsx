import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Zap, 
  Menu, 
  X, 
  Cloud, 
  LogIn, 
  LogOut, 
  Sparkles, 
  Layers, 
  Lock, 
  FileText, 
  Server, 
  Database, 
  Activity 
} from 'lucide-react';
import { FirebaseUser } from '../firebase/config';

export type ActiveTab = 
  | 'overview' 
  | 'models' 
  | 'federated' 
  | 'homomorphic' 
  | 'audit' 
  | 'topology' 
  | 'ledger' 
  | 'simulator';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onQuickSimulate: () => void;
  isSimulating: boolean;
  currentUser: FirebaseUser | null;
  onGoogleSignIn: () => void;
  onSignOut: () => void;
  isFirestoreConnected: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onQuickSimulate,
  isSimulating,
  currentUser,
  onGoogleSignIn,
  onSignOut,
  isFirestoreConnected
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <Activity className="w-3.5 h-3.5" /> },
    { id: 'models', label: 'Hugging Face Models', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: 'federated', label: 'Federated Learning', icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'homomorphic', label: 'Homomorphic AI', icon: <Lock className="w-3.5 h-3.5" /> },
    { id: 'audit', label: 'Audit Trail', icon: <FileText className="w-3.5 h-3.5" /> },
    { id: 'topology', label: 'Cloud Topology', icon: <Server className="w-3.5 h-3.5" /> },
    { id: 'ledger', label: 'Blockchain Ledger', icon: <Database className="w-3.5 h-3.5" /> },
    { id: 'simulator', label: 'Attack Lab', icon: <Zap className="w-3.5 h-3.5" /> },
  ];

  const handleNavClick = (tab: ActiveTab) => {
    onTabChange(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 px-4 sm:px-6 py-3">
        {/* Zone 1: Single text element Brand Zone with Cloud Status */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleNavClick('overview')}
            className="text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0 flex items-center gap-2 hover:text-cyan-400 transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            <span>AegisCloud</span>
          </button>

          {/* Cloud Database Connection Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
            <Cloud className={`w-3 h-3 ${isFirestoreConnected ? 'text-emerald-400' : 'text-amber-400'}`} />
            <span>{isFirestoreConnected ? 'Google Cloud Firestore' : 'Connecting DB...'}</span>
          </div>
        </div>

        {/* Zone 2: Desktop Navigation Bar with icons & single-line text */}
        <nav className="hidden xl:flex items-center gap-1 text-xs font-medium text-slate-300">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  isActive 
                    ? 'bg-slate-900 text-cyan-400 font-semibold border border-slate-800' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Actions & Google Authentication */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Quick Threat Test Button */}
          <button
            onClick={onQuickSimulate}
            disabled={isSimulating}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-sm cursor-pointer disabled:opacity-50"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>{isSimulating ? 'Simulating...' : 'Threat Test'}</span>
          </button>

          {/* Google Auth Status / Login */}
          {currentUser ? (
            <div className="flex items-center gap-2 pl-1 border-l border-slate-800">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || 'User'}
                  className="w-7 h-7 rounded-full border border-slate-700 object-cover"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-cyan-950 border border-cyan-800 flex items-center justify-center text-xs font-bold text-cyan-300">
                  {(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}
                </div>
              )}
              <div className="hidden md:block text-left text-[11px] leading-tight">
                <div className="font-medium text-white truncate max-w-[110px]">
                  {currentUser.displayName || 'Cloud Operator'}
                </div>
                <div className="text-[10px] text-emerald-400 font-mono">Verified</div>
              </div>
              <button
                onClick={onSignOut}
                title="Sign out of Firebase"
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onGoogleSignIn}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 text-cyan-400" />
              <span>Google Sign-In</span>
            </button>
          )}

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-slate-800 bg-slate-950 px-4 py-3 space-y-1">
          <div className="text-[10px] font-mono text-slate-500 uppercase px-2 py-1">
            Framework Navigation
          </div>
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                  isActive
                    ? 'bg-slate-900 text-cyan-400 font-semibold border border-slate-800'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
