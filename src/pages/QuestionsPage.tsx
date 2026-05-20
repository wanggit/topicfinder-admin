import { useState, useEffect } from 'react';
import { Table, Button, Modal, Input, Select, Space, Typography, message, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { TextArea } = Input;

interface Question {
  id: number; knowledge_point_id: number; type: string; difficulty: string;
  stem: string; options: string; answer: string; explanation: string;
  solution_steps: string; common_mistakes: string; concept_tags: string;
  review_status: string; version: number; usage_count: number; correct_count: number;
}

export function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<{ open: boolean; editing?: Question }>({ open: false });
  const [form, setForm] = useState({ type: 'choice', difficulty: 'easy', stem: '', answer: '', explanation: '', knowledgePointId: 1, options: '' });

  const load = async () => {
    try {
      const res = await fetch(`/api/admin/questions?page=${page}`);
      const data = await res.json();
      setQuestions(data.questions);
      setTotal(data.total);
    } catch { /* API not available in test */ }
  };

  useEffect(() => { load(); }, [page]);

  const handleSave = async () => {
    const body: any = { ...form, options: form.options ? form.options.split('\n').filter(Boolean) : [] };
    const url = modal.editing ? `/api/admin/questions/${modal.editing.id}` : '/api/admin/questions';
    await fetch(url, { method: modal.editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    setModal({ open: false });
    load();
    message.success(modal.editing ? '已更新' : '已创建');
  };

  const handleDelete = async (id: number) => {
    await fetch(`/api/admin/questions/${id}`, { method: 'DELETE' });
    load();
    message.success('已删除');
  };

  const openEdit = (q?: Question) => {
    if (q) {
      setForm({ type: q.type, difficulty: q.difficulty, stem: q.stem, answer: q.answer, explanation: q.explanation || '', knowledgePointId: q.knowledge_point_id, options: (q.options ? JSON.parse(q.options).join('\n') : '') });
      setModal({ open: true, editing: q });
    } else {
      setForm({ type: 'choice', difficulty: 'easy', stem: '', answer: '', explanation: '', knowledgePointId: 1, options: '' });
      setModal({ open: true });
    }
  };

  return (
    <div>
      <Title level={4}>题目管理</Title>
      <Button type="primary" icon={<PlusOutlined />} onClick={() => openEdit()} style={{ marginBottom: 16 }}>新增题目</Button>
      <Table dataSource={questions} rowKey="id"
        pagination={{ current: page, total, pageSize: 20, onChange: setPage }}
        columns={[
          { title: 'ID', dataIndex: 'id', width: 60 },
          { title: '题干', dataIndex: 'stem', ellipsis: true, width: 200 },
          { title: '题型', dataIndex: 'type', width: 80, render: (v: string) => <Tag>{v === 'choice' ? '选择' : v === 'fill' ? '填空' : '解答'}</Tag> },
          { title: '难度', dataIndex: 'difficulty', width: 80 },
          { title: '状态', dataIndex: 'review_status', width: 80, render: (v: string) => <Tag color={v === 'approved' ? 'green' : 'orange'}>{v}</Tag> },
          {
            title: '操作', render: (_: any, r: Question) => (
              <Space>
                <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(r)} />
                <Button size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(r.id)} />
              </Space>
            ),
          },
        ]}
      />
      <Modal title={modal.editing ? '编辑题目' : '新增题目'} open={modal.open} onOk={handleSave} onCancel={() => setModal({ open: false })} width={640}>
        <Select value={form.type} onChange={v => setForm({ ...form, type: v })} style={{ width: '100%', marginBottom: 8 }}
          options={[{ value: 'choice', label: '选择题' }, { value: 'fill', label: '填空题' }, { value: 'essay', label: '解答题' }]} />
        <Select value={form.difficulty} onChange={v => setForm({ ...form, difficulty: v })} style={{ width: '100%', marginBottom: 8 }}
          options={[{ value: 'easy', label: '简单' }, { value: 'medium', label: '中等' }, { value: 'hard', label: '困难' }]} />
        <TextArea placeholder="题干" value={form.stem} onChange={e => setForm({ ...form, stem: e.target.value })} rows={3} style={{ marginBottom: 8 }} />
        {form.type === 'choice' && <TextArea placeholder="选项（每行一个）" value={form.options} onChange={e => setForm({ ...form, options: e.target.value })} rows={4} style={{ marginBottom: 8 }} />}
        <Input placeholder="答案" value={form.answer} onChange={e => setForm({ ...form, answer: e.target.value })} style={{ marginBottom: 8 }} />
        <TextArea placeholder="解析" value={form.explanation} onChange={e => setForm({ ...form, explanation: e.target.value })} rows={2} />
      </Modal>
    </div>
  );
}
