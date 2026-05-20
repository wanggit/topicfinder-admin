import { useState } from 'react';
import { Table, Button, Modal, Input, Space, Typography, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const { Title } = Typography;

interface Version {
  id: number;
  name: string;
}

interface Grade {
  id: number;
  version_id: number;
  name: string;
  sort_order: number;
}

export function KnowledgePage() {
  const [versions, setVersions] = useState<Version[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
  const [versionModal, setVersionModal] = useState<{ open: boolean; editing?: Version }>({ open: false });
  const [gradeModal, setGradeModal] = useState<{ open: boolean; editing?: Grade }>({ open: false });
  const [nameInput, setNameInput] = useState('');

  const loadVersions = async () => {
    const res = await fetch('/api/admin/versions');
    const data = await res.json();
    setVersions(data);
  };

  const loadGrades = async (versionId: number) => {
    const res = await fetch(`/api/admin/grades?versionId=${versionId}`);
    const data = await res.json();
    setGrades(data);
  };

  // Versions
  const saveVersion = async () => {
    if (versionModal.editing) {
      await fetch(`/api/admin/versions/${versionModal.editing.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: nameInput }),
      });
    } else {
      await fetch('/api/admin/versions', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: nameInput }),
      });
    }
    setVersionModal({ open: false });
    loadVersions();
    message.success(versionModal.editing ? '版本已更新' : '版本已创建');
  };

  const deleteVersion = async (id: number) => {
    await fetch(`/api/admin/versions/${id}`, { method: 'DELETE' });
    loadVersions();
    if (selectedVersion?.id === id) setSelectedVersion(null);
    message.success('版本已删除');
  };

  // Grades
  const saveGrade = async () => {
    if (!selectedVersion) return;
    if (gradeModal.editing) {
      await fetch(`/api/admin/grades/${gradeModal.editing.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: nameInput }),
      });
    } else {
      await fetch('/api/admin/grades', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ versionId: selectedVersion.id, name: nameInput, sortOrder: grades.length }),
      });
    }
    setGradeModal({ open: false });
    loadGrades(selectedVersion.id);
    message.success(gradeModal.editing ? '年级已更新' : '年级已创建');
  };

  const deleteGrade = async (id: number) => {
    if (!selectedVersion) return;
    await fetch(`/api/admin/grades/${id}`, { method: 'DELETE' });
    loadGrades(selectedVersion.id);
    message.success('年级已删除');
  };

  return (
    <div>
      <Title level={4}>知识点管理</Title>
      <div style={{ display: 'flex', gap: 24 }}>
        <div style={{ width: 360 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <Title level={5} style={{ margin: 0 }}>教材版本管理</Title>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => { setNameInput(''); setVersionModal({ open: true }); }}>
              新增版本
            </Button>
          </div>
          <Table
            dataSource={versions}
            rowKey="id"
            size="small"
            pagination={false}
            onRow={(record) => ({
              onClick: () => { setSelectedVersion(record); loadGrades(record.id); },
              style: { background: selectedVersion?.id === record.id ? '#e6f4ff' : undefined, cursor: 'pointer' },
            })}
            columns={[
              { title: '版本名称', dataIndex: 'name' },
              {
                title: '操作', render: (_: any, record: Version) => (
                  <Space>
                    <Button size="small" icon={<EditOutlined />} onClick={(e) => { e.stopPropagation(); setNameInput(record.name); setVersionModal({ open: true, editing: record }); }} />
                    <Button size="small" danger icon={<DeleteOutlined />} onClick={(e) => { e.stopPropagation(); deleteVersion(record.id); }} />
                  </Space>
                ),
              },
            ]}
          />
        </div>
        <div style={{ flex: 1 }}>
          <Title level={5} style={{ margin: 0, marginBottom: 12 }}>年级管理</Title>
          {!selectedVersion ? (
            <Typography.Text type="secondary">请先选择一个教材版本</Typography.Text>
          ) : (
            <>
              <div style={{ marginBottom: 12 }}>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => { setNameInput(''); setGradeModal({ open: true }); }}>
                  新增年级
                </Button>
              </div>
              <Table
                dataSource={grades}
                rowKey="id"
                size="small"
                pagination={false}
                columns={[
                  { title: '年级名称', dataIndex: 'name' },
                  {
                    title: '操作', render: (_: any, record: Grade) => (
                      <Space>
                        <Button size="small" icon={<EditOutlined />} onClick={() => { setNameInput(record.name); setGradeModal({ open: true, editing: record }); }} />
                        <Button size="small" danger icon={<DeleteOutlined />} onClick={() => deleteGrade(record.id)} />
                      </Space>
                    ),
                  },
                ]}
              />
            </>
          )}
        </div>
      </div>

      <Modal title={versionModal.editing ? '编辑版本' : '新增版本'} open={versionModal.open} onOk={saveVersion} onCancel={() => setVersionModal({ open: false })}>
        <Input placeholder="版本名称" value={nameInput} onChange={e => setNameInput(e.target.value)} />
      </Modal>
      <Modal title={gradeModal.editing ? '编辑年级' : '新增年级'} open={gradeModal.open} onOk={saveGrade} onCancel={() => setGradeModal({ open: false })}>
        <Input placeholder="年级名称" value={nameInput} onChange={e => setNameInput(e.target.value)} />
      </Modal>
    </div>
  );
}
