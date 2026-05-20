import { Typography } from 'antd';

const { Title } = Typography;

export function PlaceholderPage({ title }: { title: string }) {
  return (
    <div>
      <Title level={4}>{title}</Title>
      <p>此页面正在建设中...</p>
    </div>
  );
}
