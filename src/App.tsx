import { Routes, Route, Navigate } from 'react-router-dom';
import { RequireAuth } from './components/RequireAuth';
import { MainLayout } from './components/MainLayout';
import { LoginPage } from './pages/LoginPage';
import { KnowledgePage } from './pages/KnowledgePage';
import { PromptsPage } from './pages/PromptsPage';
import { QuestionsPage } from './pages/QuestionsPage';
import { StatsPage, UsersPage, OrdersPage, SettingsPage } from './pages/AdminPages';

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireAuth><MainLayout /></RequireAuth>}>
        <Route path="/knowledge" element={<KnowledgePage />} />
        <Route path="/questions" element={<QuestionsPage />} />
        <Route path="/prompts" element={<PromptsPage />} />
        <Route path="/stats" element={<StatsPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/knowledge" replace />} />
    </Routes>
  );
}