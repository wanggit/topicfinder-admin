import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import {
  BookOutlined, QuestionCircleOutlined, CodeOutlined,
  BarChartOutlined, UserOutlined, ShoppingCartOutlined, SettingOutlined,
} from '@ant-design/icons';

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
        <Header style={{ background: '#fff', padding: '0 24px' }}>
          <span style={{ fontSize: 16 }}>TopicFinder 管理后台</span>
        </Header>
        <Content style={{ margin: 24, padding: 24, background: '#fff', borderRadius: 8 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
