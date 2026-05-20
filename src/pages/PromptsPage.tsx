import { useState, useEffect } from 'react';
import { Typography, Input, Button, List, message, Spin } from 'antd';
import { SaveOutlined } from '@ant-design/icons';

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
      const res = await fetch('/api/admin/prompts');
      const data = await res.json();
      setPrompts(data);
      if (!selected && data.length > 0) {
        setSelected(data[0]);
        setEditing(data[0].template);
      }
    } catch {
      // API not available (e.g. in test environment)
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPrompts(); }, []);

  const handleSelect = (prompt: Prompt) => {
    setSelected(prompt);
    setEditing(prompt.template);
  };

  const handleSave = async () => {
    if (!selected) return;
    const res = await fetch(`/api/admin/prompts/${selected.prompt_key}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ template: editing }),
    });
    if (!res.ok) throw new Error('Save failed');
    const updated = await res.json();
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
                  style={{ cursor: 'pointer', background: selected?.prompt_key === item.prompt_key ? '#e6f4ff' : undefined, padding: '8px 12px' }}
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
              {selected.description && <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>{selected.description}</Text>}
              <TextArea
                value={editing}
                onChange={e => setEditing(e.target.value)}
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
