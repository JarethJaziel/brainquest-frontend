import React from 'react';
import { NavLink } from 'react-router-dom';
import MaterialIcon from '../components/ui/MaterialIcon';

export const BottomNav: React.FC = () => {
  const navItems = [
    { label: 'Inicio', path: '/', icon: 'home' },
    { label: 'Misiones', path: '/quests', icon: 'emoji_events' },
    { label: 'Perfil', path: '/profile', icon: 'person' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-surface-container-lowest border-t-2 border-outline-variant shadow-nav flex items-center justify-around py-2 px-4">
      <div className="w-full max-w-[1000px] mx-auto flex items-center justify-around">
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex flex-col items-center justify-center py-1 px-4 rounded-xl transition-all duration-200 select-none
              ${isActive ? 'text-primary font-bold scale-105' : 'text-outline hover:text-on-surface'}
            `}
          >
            {({ isActive }) => (
              <>
                <div
                  className={`
                    w-14 h-8 flex items-center justify-center rounded-2xl transition-all duration-200
                    ${isActive ? 'bg-primary-fixed text-primary' : 'bg-transparent'}
                  `}
                >
                  <MaterialIcon name={item.icon} filled={isActive} className="text-2xl animate-none" />
                </div>
                <span className="text-[10px] sm:text-xs mt-1 font-semibold">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
