import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { LEVEL_CONFIG } from '../../models/rewards';
import MaterialIcon from '../ui/MaterialIcon';

interface LevelUpModalProps {
  oldLevel: number;
  newLevel: number;
  onClose: () => void;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({ oldLevel, newLevel, onClose }) => {
  const newLevelDetails = LEVEL_CONFIG.find(c => c.level === newLevel) || {
    level: newLevel,
    title: 'Superestrella',
  };

  useEffect(() => {
    // Shoot confetti when level up modal appears
    const duration = 2.5 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.8 },
        colors: ['#3d4ad8', '#fece4a', '#bc572c'],
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.8 },
        colors: ['#3d4ad8', '#fece4a', '#bc572c'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal content box */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 50 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="clay-card max-w-sm w-full p-8 text-center relative z-10 border-primary bg-surface-container-lowest overflow-hidden"
        >
          {/* Decorative Sparkle Ornaments */}
          <div className="absolute top-4 left-4 text-secondary text-2xl animate-pulse select-none">✨</div>
          <div className="absolute top-4 right-4 text-tertiary text-2xl animate-pulse select-none">✨</div>

          {/* Level Icon / Emblem */}
          <div className="flex justify-center mb-4">
            <motion.div
              initial={{ rotate: -180, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-24 h-24 rounded-full bg-secondary-container flex items-center justify-center border-4 border-secondary text-secondary shadow-lg"
            >
              <MaterialIcon name="military_tech" className="text-6xl" />
            </motion.div>
          </div>

          {/* Title */}
          <h2 className="text-3xl font-extrabold text-primary mb-1 font-base">¡Sube de Nivel!</h2>
          <p className="text-outline text-sm font-semibold mb-6">
            Has subido del nivel <span className="text-on-surface">{oldLevel}</span> al <span className="text-primary">{newLevel}</span>.
          </p>

          {/* Big Level Number Card */}
          <div className="bg-primary/5 rounded-2xl border-2 border-primary/20 py-4 mb-6">
            <div className="text-xs text-primary/70 uppercase tracking-widest font-bold">Nuevo Rango</div>
            <div className="text-lg font-bold text-on-surface mb-1">{newLevelDetails.title}</div>
            <div className="text-5xl font-black text-primary font-mono">{newLevel}</div>
          </div>

          {/* Action button */}
          <button
            onClick={onClose}
            className="chunky-button w-full py-3 bg-primary text-white border-primary-container rounded-full font-bold hover:chunky-button-active hover:bg-primary-container transition-all select-none"
          >
            ¡Genial, a seguir aprendiendo!
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default LevelUpModal;
