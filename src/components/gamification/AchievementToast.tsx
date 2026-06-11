import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MaterialIcon from '../ui/MaterialIcon';

interface ToastItemProps {
  name: string;
  description: string;
  icon: string;
  onClose: () => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ name, description, icon, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, y: -20 }}
      transition={{ type: 'spring', damping: 15, stiffness: 200 }}
      className="clay-card border-secondary bg-surface-container-lowest p-4 max-w-sm w-full flex items-center gap-4 relative shadow-lg pointer-events-auto overflow-hidden pr-8 border-solid border-2"
    >
      {/* Icon Badge */}
      <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center text-secondary border-2 border-secondary shrink-0 shadow-sm">
        <MaterialIcon name={icon} className="text-2xl" />
      </div>

      {/* Text Details */}
      <div className="text-left">
        <div className="text-xs uppercase tracking-wider text-secondary font-black">¡Logro Desbloqueado!</div>
        <div className="font-bold text-on-surface text-base leading-tight mt-0.5">{name}</div>
        <div className="text-xs text-outline leading-tight mt-0.5">{description}</div>
      </div>

      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-outline/50 hover:text-outline cursor-pointer select-none"
      >
        <MaterialIcon name="close" className="text-base" />
      </button>
    </motion.div>
  );
};

interface AchievementToastListProps {
  toasts: { id: string; name: string; description: string; icon: string }[];
  onRemove: (id: string) => void;
}

export const AchievementToastList: React.FC<AchievementToastListProps> = ({ toasts, onRemove }) => {
  return (
    <div className="fixed top-20 right-4 left-4 sm:left-auto z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map(toast => (
          <ToastItem
            key={toast.id}
            name={toast.name}
            description={toast.description}
            icon={toast.icon}
            onClose={() => onRemove(toast.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default AchievementToastList;
