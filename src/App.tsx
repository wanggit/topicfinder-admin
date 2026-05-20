import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/MainLayout';
import { LoginPage } from './pages/LoginPage';
import { KnowledgePage } from './pages/KnowledgePage';
import { PromptsPage } from './pages/PromptsPage';
import { QuestionsPage } from './pages/QuestionsPage';
import { PlaceholderPage } from './pages/PlaceholderPage';

const OTHER_ROUTES = [
  { path: '/stats', title: '数据统计' },
  { path: '/users', title: '用户管理' },
  { path: '/orders', title: '订单管理' },
  { path: '/settings', title: '系统配置' },
];

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<MainLayout />}>
        <Route path="/knowledge" element={<KnowledgePage />} />
        <Route path="/questions" element={<QuestionsPage />} />
        <Route path="/prompts" element={<PromptsPage />} />
        {OTHER_ROUTES.map(({ path, title }) => (
          <Route key={path} path={path} element={<PlaceholderPage title={title} />} />
        ))}
      </Route>
      <Route path="*" element={<Navigate to="/knowledge" replace />} />
    </Routes>
  );
}
