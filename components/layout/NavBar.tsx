import React from 'react';
import type { View } from '../../App';
import { ClipboardListIcon } from '../icons/ClipboardListIcon';
import { ClockIcon } from '../icons/ClockIcon';
import { ListBulletIcon } from '../icons/ListBulletIcon';
import { CogIcon } from '../icons/CogIcon';

interface NavItem {
  view: View;
  label: string;
  icon: React.FC;
}

const NAV_ITEMS: NavItem[] = [
  { view: 'create', label: 'Create Task', icon: ClipboardListIcon },
  { view: 'focus', label: 'Focus', icon: ClockIcon },
  { view: 'tasks', label: 'My Tasks', icon: ListBulletIcon },
  { view: 'settings', label: 'Settings', icon: CogIcon },
];

interface NavBarProps {
  activeView: View;
  onNavigate: (view: View) => void;
}

export const NavBar: React.FC<NavBarProps> = ({ activeView, onNavigate }) => {
  return (
    <nav className="bg-surface border-b border-gray-200 sticky top-0 z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-1 overflow-x-auto">
          {NAV_ITEMS.map(({ view, label, icon: Icon }) => {
            const isActive = activeView === view;
            return (
              <button
                key={view}
                onClick={() => onNavigate(view)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon />
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
