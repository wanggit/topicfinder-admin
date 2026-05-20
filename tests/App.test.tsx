import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { App } from '../src/App';

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>
  );
}

describe('Login page', () => {
  it('renders login form with account and password fields and submit button', () => {
    renderAt('/login');

    expect(screen.getByRole('button', { name: /登.*录/ })).toBeDefined();
    expect(screen.getByText('题探管理后台')).toBeDefined();
    // Ant Design Input with placeholder renders the placeholder as an aria-label or attribute
    const inputs = document.querySelectorAll('input');
    const placeholders = Array.from(inputs).map(i => i.getAttribute('placeholder'));
    expect(placeholders.some(p => p?.includes('账号'))).toBe(true);
    expect(placeholders.some(p => p?.includes('密码'))).toBe(true);
  });
});

describe('Sidebar navigation', () => {
  const menuItems = [
    '知识点管理', '题目管理', 'Prompt管理', '数据统计',
    '用户管理', '订单管理', '系统配置',
  ];

  it('renders all 7 menu items in sidebar', () => {
    renderAt('/knowledge');

    for (const item of menuItems) {
      const elements = screen.getAllByText(item);
      expect(elements.length).toBeGreaterThanOrEqual(1);
    }
  });
});

describe('Page routing', () => {
  const pages = [
    { path: '/knowledge', title: '知识点管理' },
    { path: '/questions', title: '题目管理' },
    { path: '/prompts', title: 'Prompt管理' },
    { path: '/stats', title: '数据统计' },
    { path: '/users', title: '用户管理' },
    { path: '/orders', title: '订单管理' },
    { path: '/settings', title: '系统配置' },
  ];

  it.each(pages)('$path renders $title as page heading', ({ path, title }) => {
    renderAt(path);
    // Each page renders an <h4> with the title as heading
    const headings = screen.getAllByRole('heading', { level: 4 });
    expect(headings.some(h => h.textContent === title)).toBe(true);
  });
});
