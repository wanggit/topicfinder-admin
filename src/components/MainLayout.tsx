import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Dropdown } from 'antd';
import {
  BookOutlined, QuestionCircleOutlined, CodeOutlined,
  BarChartOutlined, UserOutlined, ShoppingCartOutlined, SettingOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';

const { Sider, Content, Header } = Layout;

const MENU_ITEMS = [
  { key: '/knowledge', icon: <BookOutlined />, label: '知识点管理' },
  { key: '/questions', icon: <QuestionCircleOutlined />, label: '题目管理' },
  { key: '/prompts', icon: <CodeOutlined />, label: 'Prompt管理' },
  { key: '/stats', icon: <BarChartOutlined />, label: '数据统计' },
  { key: '/users', icon: <UserOutlined />, label: '用户管理' },
  { key: '/orders', icon: <ShoppingCartOutlined />, label: '订单管理' },
  { key: '/settings', icon: <SettingOutlined />, label: '系统配置' },
];

export function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { username, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible>
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: '#fff', fontSize: 18, fontWeight: 600 }}>题探后台</span>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={MENU_ITEMS}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 16 }}>TopicFinder 管理后台</span>
          <Dropdown
            menu={{ items: [{ key: 'logout', icon: <LogoutOutlined />, label: '退出登录', onClick: handleLogout }] }}
          >
            <span style={{ cursor: 'pointer' }}>
              <UserOutlined style={{ marginRight: 8 }} />
              {username}
            </span>
          </Dropdown>
        </Header>
        <Content style={{ margin: 24, padding: 24, background: '#fff', borderRadius: 8 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}