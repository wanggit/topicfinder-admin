import { useEffect, useState } from 'react';
import { Typography, Input, Button, List, message, Spin } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { api } from '../utils/api';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface Prompt {
  id: number;
  prompt_key: string;
  template: string;
  description: string;
  version: number;
}

export function PromptsPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [selected, setSelected] = useState<Prompt | null>(null);
  const [editing, setEditing] = useState('');
  const [loading, setLoading] = useState(false);

  const loadPrompts = async () => {
    setLoading(true);
    try {
      const data = await api.get<Prompt[]>('/api/admin/prompts');
      setPrompts(data);
      if (data.length > 0) {
        setSelected(current => current ?? data[0]);
        setEditing(current => current || data[0].template);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrompts().catch(() => {});
  }, []);

  const handleSelect = (prompt: Prompt) => {
    setSelected(prompt);
    setEditing(prompt.template);
  };

  const handleSave = async () => {
    if (!selected) return;

    const updated = await api.put<Prompt>(`/api/admin/prompts/${selected.prompt_key}`, {
      template: editing,
    });

    setPrompts(current => current.map(prompt => (
      prompt.prompt_key === selected.prompt_key
        ? { ...prompt, template: updated.template, version: updated.version }
        : prompt
    )));
    setSelected({ ...selected, template: updated.template, version: updated.version });
    message.success('Prompt 已保存');
  };

  return (
    <div>
      <Title level={4}>Prompt管理</Title>
      <div style={{ display: 'flex', gap: 24, minHeight: 400 }}>
        <div style={{ width: 240 }}>
          <Title level={5}>模板列表</Title>
          {loading ? <Spin /> : (
            <List
              dataSource={prompts}
              renderItem={(item) => (
                <List.Item
                  onClick={() => handleSelect(item)}
                  style={{
                    cursor: 'pointer',
                    background: selected?.prompt_key === item.prompt_key ? '#e6f4ff' : undefined,
                    padding: '8px 12px',
                  }}
                >
                  <div>
                    <Text strong>{item.prompt_key}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>v{item.version}</Text>
                  </div>
                </List.Item>
              )}
            />
          )}
        </div>
        <div style={{ flex: 1 }}>
          {selected ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <div>
                  <Text strong>{selected.prompt_key}</Text>
                  <Text type="secondary" style={{ marginLeft: 8 }}>v{selected.version}</Text>
                </div>
                <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>保存</Button>
              </div>
              {selected.description ? (
                <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
                  {selected.description}
                </Text>
              ) : null}
              <TextArea
                value={editing}
                onChange={(e) => setEditing(e.target.value)}
                rows={20}
                style={{ fontFamily: 'monospace' }}
              />
            </>
          ) : (
            <Text type="secondary">请从左侧选择一个 Prompt 模板</Text>
          )}
        </div>
      </div>
    </div>
  );
}
