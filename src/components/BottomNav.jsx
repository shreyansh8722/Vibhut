import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Heart, User, Search } from 'lucide-react';
import { cn } from '../lib/utils';

const NavButton = ({ to, icon: Icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={cn(
        "flex flex-col items-center text-gray-500",
        isActive && "text-yellow-600 font-medium"
      )}
    >
      <Icon className="w-6 h-6" strokeWidth={isActive ? 2 : 1.5} />
      <span className="text-xs mt-1">{label}</span>
    </Link>
  );
};

export default function BottomNav() {
  return (
    // This nav is fixed to the bottom and hides on desktop (md:hidden)
    <div className="fixed left-0 right-0 bottom-0 bg-white border-t border-gray-200 py-3 z-30 md:hidden">
      <div className="max-w-4xl mx-auto px-6 flex justify-around items-center">
        <NavButton to="/" icon={Home} label="Home" />
        <NavButton to="/search" icon={Search} label="Search" />
        <NavButton to="/favorites" icon={Heart} label="Favorites" />
        <NavButton to="/profile" icon={User} label="Profile" />
      </div>
    </div>
  );
}