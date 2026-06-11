import React from 'react';

export const AVATAR_MAP: Record<string, { emoji: string; label: string; bg: string }> = {
  avatar_fox: { emoji: '🦊', label: 'Zorro', bg: 'bg-orange-100 border-orange-300 text-orange-600' },
  avatar_tiger: { emoji: '🐯', label: 'Tigre', bg: 'bg-yellow-100 border-yellow-300 text-yellow-600' },
  avatar_lion: { emoji: '🦁', label: 'León', bg: 'bg-amber-100 border-amber-300 text-amber-600' },
  avatar_panda: { emoji: '🐼', label: 'Panda', bg: 'bg-slate-100 border-slate-300 text-slate-600' },
  avatar_koala: { emoji: '🐨', label: 'Koala', bg: 'bg-zinc-100 border-zinc-300 text-zinc-600' },
  avatar_unicorn: { emoji: '🦄', label: 'Unicornio', bg: 'bg-purple-100 border-purple-300 text-purple-600' },
  avatar_dino: { emoji: '🦖', label: 'Dino', bg: 'bg-green-100 border-green-300 text-green-600' },
  avatar_octopus: { emoji: '🐙', label: 'Pulpo', bg: 'bg-pink-100 border-pink-300 text-pink-600' },
};

interface AvatarProps {
  id: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
  interactive?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({
  id,
  size = 'md',
  className = '',
  onClick,
  interactive = false,
}) => {
  const avatar = AVATAR_MAP[id] || AVATAR_MAP.avatar_fox;

  const sizeClasses = {
    sm: 'w-10 h-10 text-xl border-2',
    md: 'w-14 h-14 text-3xl border-2',
    lg: 'w-24 h-24 text-5xl border-[3px]',
    xl: 'w-32 h-32 text-7xl border-4',
  };

  return (
    <div
      onClick={onClick}
      className={`
        flex items-center justify-center rounded-full border-solid aspect-square select-none
        ${avatar.bg} ${sizeClasses[size]}
        ${interactive ? 'cursor-pointer hover:scale-105 active:scale-95 transition-transform duration-200' : ''}
        ${className}
      `}
    >
      <span className="leading-none">{avatar.emoji}</span>
    </div>
  );
};

export default Avatar;
