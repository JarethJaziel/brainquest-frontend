import { Outlet } from 'react-router-dom';
import Header from './Header';
import BottomNav from './BottomNav';
import { useUserProgress } from '../context/UserProgressContext';
import LevelUpModal from '../components/gamification/LevelUpModal';
import AchievementToastList from '../components/gamification/AchievementToast';

const AppLayout = () => {
  const { levelUpEvent, clearLevelUpEvent, toasts, removeToast } = useUserProgress();

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col font-base pb-28">
      {/* Header */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-[1000px] mx-auto px-4 py-6">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <BottomNav />

      {/* Floating Achievement Toasts */}
      <AchievementToastList toasts={toasts} onRemove={removeToast} />

      {/* Level Up Overlay */}
      {levelUpEvent && (
        <LevelUpModal
          oldLevel={levelUpEvent.oldLevel}
          newLevel={levelUpEvent.newLevel}
          onClose={clearLevelUpEvent}
        />
      )}
    </div>
  );
};

export default AppLayout;
