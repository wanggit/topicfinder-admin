import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/MainLayout';
import { LoginPage } from './pages/LoginPage';
import { PlaceholderPage } from './pages/PlaceholderPage';

const PLACEHOLDER_TITLES: Record<string, string> = {
  '/knowledge': '知识点管理',
  '/questions': '题目管理',
  '/prompts': 'Prompt管理',
  '/stats': '数据统计',
  '/users': '用户管理',
  '/orders': '订单管理',
  '/settings': '系统配置',
};

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<MainLayout />}>
        {Object.entries(PLACEHOLDER_TITLES).map(([path, title]) => (
          <Route key={path} path={path} element={<PlaceholderPage title={title} />} />
        ))}
      </Route>
      <Route path="*" element={<Navigate to="/knowledge" replace />} />
    </Routes>
  );
}
