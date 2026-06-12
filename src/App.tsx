import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AudioProvider } from './context/AudioContext';
import { UserProgressProvider } from './context/UserProgressContext';
import { ROUTES } from './config/routes';
import AppLayout from './layout/AppLayout';

// Pages
import HomePage from './features/home/pages/HomePage';
import ExamStartPage from './features/exam/pages/ExamStartPage';
import ExamPlayPage from './features/exam/pages/ExamPlayPage';
import ExamResultPage from './features/exam/pages/ExamResultPage';
import ExamReviewPage from './features/exam/pages/ExamReviewPage';
import ProfilePage from './features/profile/pages/ProfilePage';
import QuestsPage from './features/quests/pages/QuestsPage';
import ImportExamPage from './features/import/pages/ImportExamPage';

function App() {
  return (
    <AudioProvider>
      <UserProgressProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path={ROUTES.HOME} element={<HomePage />} />
              <Route path={ROUTES.EXAM_START} element={<ExamStartPage />} />
              <Route path={ROUTES.EXAM_PLAY} element={<ExamPlayPage />} />
              <Route path={ROUTES.EXAM_RESULT} element={<ExamResultPage />} />
              <Route path={ROUTES.EXAM_REVIEW} element={<ExamReviewPage />} />
              <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
              <Route path={ROUTES.QUESTS} element={<QuestsPage />} />
              <Route path={ROUTES.IMPORT} element={<ImportExamPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </UserProgressProvider>
    </AudioProvider>
  );
}

export default App;
