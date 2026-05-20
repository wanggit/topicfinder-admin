import { useEffect, useState } from 'react';
import { Table, Button, Modal, Input, Select, Space, Typography, message, Tag, InputNumber } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { api } from '../utils/api';

const { Title } = Typography;
const { TextArea } = Input;

interface Question {
  id: number;
  knowledge_point_id: number;
  type: string;
  difficulty: string;
  stem: string;
  options: string;
  answer: string;
  explanation: string;
  solution_steps: string;
  common_mistakes: string;
  concept_tags: string;
  review_status: string;
  version: number;
  usage_count: number;
  correct_count: number;
}

export function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<{ open: boolean; editing?: Question }>({ open: false });
  const [genModal, setGenModal] = useState(false);
  const [form, setForm] = useState({
    type: 'choice',
    difficulty: 'easy',
    stem: '',
    answer: '',
    explanation: '',
    knowledgePointId: 1,
    options: '',
  });
  const [genForm, setGenForm] = useState({
    knowledgePointId: 1,
    types: ['choice'],
    difficulty: 'easy',
    count: 20,
  });

  const load = async () => {
    try {
      const data = await api.get<{ questions: Question[]; total: number }>(`/api/admin/questions?page=${page}`);
      setQuestions(data.questions);
      setTotal(data.total);
    } catch {}
  };

  useEffect(() => {
    load().catch(() => {});
  }, [page]);

  const handleSave = async () => {
    const body: any = {
      ...form,
      options: form.options ? form.options.split('\n').filter(Boolean) : [],
    };
    const url = modal.editing ? `/api/admin/questions/${modal.editing.id}` : '/api/admin/questions';

    if (modal.editing) await api.put(url, body);
    else await api.post(url, body);

    setModal({ open: false });
    load().catch(() => {});
    message.success(modal.editing ? '已更新' : '已创建');
  };

  const handleGen = async () => {
    await api.post('/api/admin/generation-tasks', {
      knowledgePointId: genForm.knowledgePointId,
      questionTypes: genForm.types,
      difficulty: genForm.difficulty,
      count: genForm.count,
    });
    setGenModal(false);
    message.success('批量生成任务已创建');
  };

  const handleDelete = async (id: number) => {
    await api.delete(`/api/admin/questions/${id}`);
    load().catch(() => {});
    message.success('已删除');
  };

  const openEdit = (question?: Question) => {
    if (question) {
      setForm({
        type: question.type,
        difficulty: question.difficulty,
        stem: question.stem,
        answer: question.answer,
        explanation: question.explanation || '',
        knowledgePointId: question.knowledge_point_id,
        options: question.options ? JSON.parse(question.options).join('\n') : '',
      });
      setModal({ open: true, editing: question });
      return;
    }

    setForm({
      type: 'choice',
      difficulty: 'easy',
      stem: '',
      answer: '',
      explanation: '',
      knowledgePointId: 1,
      options: '',
    });
    setModal({ open: true });
  };

  return (
    <div>
      <Title level={4}>题目管理</Title>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openEdit()}>新增题目</Button>
        <Button icon={<ThunderboltOutlined />} onClick={() => setGenModal(true)}>批量生成</Button>
      </Space>
      <Table
        dataSource={questions}
        rowKey="id"
        pagination={{ current: page, total, pageSize: 20, onChange: setPage }}
        columns={[
          { title: 'ID', dataIndex: 'id', width: 60 },
          { title: '题干', dataIndex: 'stem', ellipsis: true, width: 200 },
          {
            title: '题型',
            dataIndex: 'type',
            width: 80,
            render: (value: string) => <Tag>{value === 'choice' ? '选择' : value === 'fill' ? '填空' : '解答'}</Tag>,
          },
          { title: '难度', dataIndex: 'difficulty', width: 80 },
          {
            title: '状态',
            dataIndex: 'review_status',
            width: 80,
            render: (value: string) => <Tag color={value === 'approved' ? 'green' : 'orange'}>{value}</Tag>,
          },
          {
            title: '操作',
            render: (_: any, record: Question) => (
              <Space>
                <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />
                <Button size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
              </Space>
            ),
          },
        ]}
      />
      <Modal title={modal.editing ? '编辑题目' : '新增题目'} open={modal.open} onOk={handleSave} onCancel={() => setModal({ open: false })} width={640}>
        <Select
          value={form.type}
          onChange={(value) => setForm({ ...form, type: value })}
          style={{ width: '100%', marginBottom: 8 }}
          options={[
            { value: 'choice', label: '选择题' },
            { value: 'fill', label: '填空题' },
            { value: 'essay', label: '解答题' },
          ]}
        />
        <Select
          value={form.difficulty}
          onChange={(value) => setForm({ ...form, difficulty: value })}
          style={{ width: '100%', marginBottom: 8 }}
          options={[
            { value: 'easy', label: '简单' },
            { value: 'medium', label: '中等' },
            { value: 'hard', label: '困难' },
          ]}
        />
        <TextArea placeholder="题干" value={form.stem} onChange={(e) => setForm({ ...form, stem: e.target.value })} rows={3} style={{ marginBottom: 8 }} />
        {form.type === 'choice' ? (
          <TextArea placeholder="选项（每行一个）" value={form.options} onChange={(e) => setForm({ ...form, options: e.target.value })} rows={4} style={{ marginBottom: 8 }} />
        ) : null}
        <Input placeholder="答案" value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} style={{ marginBottom: 8 }} />
        <TextArea placeholder="解析" value={form.explanation} onChange={(e) => setForm({ ...form, explanation: e.target.value })} rows={2} />
      </Modal>
      <Modal title="批量生成题目" open={genModal} onOk={handleGen} onCancel={() => setGenModal(false)}>
        <div style={{ marginBottom: 8 }}>
          <TextArea
            placeholder="知识点 ID"
            value={genForm.knowledgePointId}
            onChange={(e) => setGenForm({ ...genForm, knowledgePointId: Number(e.target.value) || 0 })}
          />
        </div>
        <Select
          mode="multiple"
          value={genForm.types}
          onChange={(value) => setGenForm({ ...genForm, types: value })}
          style={{ width: '100%', marginBottom: 8 }}
          options={[
            { value: 'choice', label: '选择题' },
            { value: 'fill', label: '填空题' },
            { value: 'essay', label: '解答题' },
          ]}
        />
        <Select
          value={genForm.difficulty}
          onChange={(value) => setGenForm({ ...genForm, difficulty: value })}
          style={{ width: '100%', marginBottom: 8 }}
          options={[
            { value: 'easy', label: '简单' },
            { value: 'medium', label: '中等' },
            { value: 'hard', label: '困难' },
          ]}
        />
        <InputNumber
          value={genForm.count}
          onChange={(value) => setGenForm({ ...genForm, count: value || 20 })}
          min={1}
          max={100}
          style={{ width: '100%' }}
          addonBefore="数量"
        />
      </Modal>
    </div>
  );
}
