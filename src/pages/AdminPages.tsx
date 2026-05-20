import { useEffect, useState } from 'react';
import { Typography, Card, Statistic, Row, Col, Table, Tag } from 'antd';
import { UserOutlined, QuestionCircleOutlined, CheckCircleOutlined, TeamOutlined } from '@ant-design/icons';
import { api } from '../utils/api';

const { Title } = Typography;

export function StatsPage() {
  const [stats, setStats] = useState<any>({});

  useEffect(() => {
    api.get('/api/admin/stats').then(setStats).catch(() => {});
  }, []);

  return (
    <div>
      <Title level={4}>数据统计</Title>
      <Row gutter={16}>
        <Col span={6}><Card><Statistic title="用户总数" value={stats.totalStudents || 0} prefix={<TeamOutlined />} /></Card></Col>
        <Col span={6}><Card><Statistic title="今日活跃" value={stats.activeToday || 0} prefix={<UserOutlined />} /></Card></Col>
        <Col span={6}><Card><Statistic title="题库总量" value={stats.totalQuestions || 0} prefix={<QuestionCircleOutlined />} /></Card></Col>
        <Col span={6}><Card><Statistic title="答题总数" value={stats.totalAnswers || 0} prefix={<CheckCircleOutlined />} /></Card></Col>
      </Row>
    </div>
  );
}

export function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    api.get<any[]>('/api/admin/users').then(setUsers).catch(() => {});
  }, []);

  return (
    <div>
      <Title level={4}>用户管理</Title>
      <Table
        dataSource={users}
        rowKey="id"
        columns={[
          { title: 'ID', dataIndex: 'id' },
          { title: 'OpenID', dataIndex: 'openid', ellipsis: true },
          {
            title: '状态',
            dataIndex: 'subscription_status',
            render: (value: string) => <Tag color={value === 'active' ? 'green' : 'orange'}>{value}</Tag>,
          },
          { title: '试用期截止', dataIndex: 'trial_expires_at' },
        ]}
      />
    </div>
  );
}

export function OrdersPage() {
  return <div><Title level={4}>订单管理</Title><p>暂无数据</p></div>;
}

export function SettingsPage() {
  return (
    <div>
      <Title level={4}>系统配置</Title>
      <Card title="API 配置" style={{ maxWidth: 500 }}>
        <p>OPENAI_API_KEY: ********</p>
        <p>OPENAI_MODEL_CHAT: gpt-4o-mini</p>
        <p>OPENAI_MODEL_VISION: gpt-4o</p>
      </Card>
    </div>
  );
}
