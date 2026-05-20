import { useState } from 'react';
import { Table, Button, Modal, Input, Space, Typography, message, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface Version { id: number; name: string }
interface Grade { id: number; version_id: number; name: string; sort_order: number }
interface Subject { id: number; grade_id: number; name: string; sort_order: number }
interface KnowledgePoint { id: number; subject_id: number; name: string; description: string }

type ModalMode = { open: boolean; editing?: any; type: 'version' | 'grade' | 'subject' | 'kp' };

export function KnowledgePage() {
  const [versions, setVersions] = useState<Version[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [kps, setKps] = useState<KnowledgePoint[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [modal, setModal] = useState<ModalMode>({ open: false, type: 'version' });
  const [nameInput, setNameInput] = useState('');
  const [descInput, setDescInput] = useState('');

  const loadVersions = async () => {
    const res = await fetch('/api/admin/versions');
    setVersions(await res.json());
  };
  const loadGrades = async (vid: number) => {
    const res = await fetch(`/api/admin/grades?versionId=${vid}`);
    setGrades(await res.json());
  };
  const loadSubjects = async (gid: number) => {
    const res = await fetch(`/api/admin/subjects?gradeId=${gid}`);
    setSubjects(await res.json());
  };
  const loadKPs = async (sid: number) => {
    const res = await fetch(`/api/admin/knowledge-points?subjectId=${sid}`);
    setKps(await res.json());
  };

  const selectVersion = (v: Version) => { setSelectedVersion(v); setSelectedGrade(null); setSelectedSubject(null); loadGrades(v.id); };
  const selectGrade = (g: Grade) => { setSelectedGrade(g); setSelectedSubject(null); loadSubjects(g.id); };
  const selectSubject = (s: Subject) => { setSelectedSubject(s); loadKPs(s.id); };

  const handleSave = async () => {
    const urlMap: Record<string, string> = {
      version: '/api/admin/versions',
      grade: '/api/admin/grades',
      subject: '/api/admin/subjects',
      kp: '/api/admin/knowledge-points',
    };
    const bodyMap: Record<string, any> = {
      version: { name: nameInput },
      grade: { name: nameInput, versionId: selectedVersion!.id, sortOrder: grades.length },
      subject: { name: nameInput, gradeId: selectedGrade!.id, sortOrder: subjects.length },
      kp: { name: nameInput, subjectId: selectedSubject!.id, description: descInput },
    };
    const url = modal.editing ? `${urlMap[modal.type]}/${modal.editing.id}` : urlMap[modal.type];
    const method = modal.editing ? 'PUT' : 'POST';

    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(bodyMap[modal.type]) });
    setModal({ open: false, type: 'version' });
    if (modal.type === 'version') loadVersions();
    else if (modal.type === 'grade' && selectedVersion) loadGrades(selectedVersion.id);
    else if (modal.type === 'subject' && selectedGrade) loadSubjects(selectedGrade.id);
    else if (modal.type === 'kp' && selectedSubject) loadKPs(selectedSubject.id);
    message.success('保存成功');
  };

  const handleDelete = async (type: string, id: number) => {
    await fetch(`/api/admin/${type}s/${id}`, { method: 'DELETE' });
    if (type === 'version') { loadVersions(); if (selectedVersion?.id === id) setSelectedVersion(null); }
    else if (type === 'grade' && selectedVersion) loadGrades(selectedVersion.id);
    else if (type === 'subject' && selectedGrade) loadSubjects(selectedGrade.id);
    else if (type === 'knowledge-point' && selectedSubject) loadKPs(selectedSubject.id);
    message.success('删除成功');
  };

  const openModal = (type: ModalMode['type'], editing?: any) => {
    setNameInput(editing?.name || '');
    setDescInput(editing?.description || '');
    setModal({ open: true, type, editing });
  };

  return (
    <div>
      <Title level={4}>知识点管理</Title>
      <div style={{ display: 'flex', gap: 16 }}>
        {/* Versions */}
        <Panel title="教材版本" onAdd={() => openModal('version')} count={versions.length}>
          <Table dataSource={versions} rowKey="id" size="small" pagination={false}
            onRow={(r) => ({ onClick: () => selectVersion(r), style: { background: selectedVersion?.id === r.id ? '#e6f4ff' : undefined, cursor: 'pointer' } })}
            columns={[
              { title: '名称', dataIndex: 'name' },
              { title: '', render: (_: any, r: Version) => (
                <Space><Button size="small" icon={<EditOutlined />} onClick={e => { e.stopPropagation(); openModal('version', r); }} /><Button size="small" danger icon={<DeleteOutlined />} onClick={e => { e.stopPropagation(); handleDelete('version', r.id); }} /></Space>
              )},
            ]}
          />
        </Panel>
        {/* Grades */}
        <Panel title="年级" onAdd={() => selectedVersion && openModal('grade')} count={grades.length} disabled={!selectedVersion}>
          {!selectedVersion ? <Text type="secondary">请先选择版本</Text> : (
            <Table dataSource={grades} rowKey="id" size="small" pagination={false}
              onRow={(r) => ({ onClick: () => selectGrade(r), style: { background: selectedGrade?.id === r.id ? '#e6f4ff' : undefined, cursor: 'pointer' } })}
              columns={[
                { title: '名称', dataIndex: 'name' },
                { title: '', render: (_: any, r: Grade) => (
                  <Space><Button size="small" icon={<EditOutlined />} onClick={e => { e.stopPropagation(); openModal('grade', r); }} /><Button size="small" danger icon={<DeleteOutlined />} onClick={e => { e.stopPropagation(); handleDelete('grade', r.id); }} /></Space>
                )},
              ]}
            />
          )}
        </Panel>
        {/* Subjects */}
        <Panel title="学科" onAdd={() => selectedGrade && openModal('subject')} count={subjects.length} disabled={!selectedGrade}>
          {!selectedGrade ? <Text type="secondary">请先选择年级</Text> : (
            <Table dataSource={subjects} rowKey="id" size="small" pagination={false}
              onRow={(r) => ({ onClick: () => selectSubject(r), style: { background: selectedSubject?.id === r.id ? '#e6f4ff' : undefined, cursor: 'pointer' } })}
              columns={[
                { title: '名称', dataIndex: 'name' },
                { title: '', render: (_: any, r: Subject) => (
                  <Space><Button size="small" icon={<EditOutlined />} onClick={e => { e.stopPropagation(); openModal('subject', r); }} /><Button size="small" danger icon={<DeleteOutlined />} onClick={e => { e.stopPropagation(); handleDelete('subject', r.id); }} /></Space>
                )},
              ]}
            />
          )}
        </Panel>
        {/* KPs */}
        <Panel title="知识点" onAdd={() => selectedSubject && openModal('kp')} count={kps.length} disabled={!selectedSubject}>
          {!selectedSubject ? <Text type="secondary">请先选择学科</Text> : (
            <Table dataSource={kps} rowKey="id" size="small" pagination={false}
              columns={[
                { title: '名称', dataIndex: 'name' },
                { title: '', render: (_: any, r: KnowledgePoint) => (
                  <Space><Button size="small" icon={<EditOutlined />} onClick={() => openModal('kp', r)} /><Button size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete('knowledge-point', r.id)} /></Space>
                )},
              ]}
            />
          )}
        </Panel>
      </div>
      <Modal title={`${modal.editing ? '编辑' : '新增'}${modal.type === 'kp' ? '知识点' : modal.type === 'subject' ? '学科' : modal.type === 'grade' ? '年级' : '版本'}`}
        open={modal.open} onOk={handleSave} onCancel={() => setModal({ open: false, type: 'version' })}>
        <Input placeholder="名称" value={nameInput} onChange={e => setNameInput(e.target.value)} style={{ marginBottom: 8 }} />
        {modal.type === 'kp' && <Input placeholder="描述（可选）" value={descInput} onChange={e => setDescInput(e.target.value)} />}
      </Modal>
    </div>
  );
}

function Panel({ title, onAdd, children, count, disabled }: { title: string; onAdd: () => void; children: React.ReactNode; count: number; disabled?: boolean }) {
  return (
    <div style={{ width: 220, flexShrink: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <Title level={5} style={{ margin: 0 }}>{title}</Title>
        <Button type="primary" size="small" icon={<PlusOutlined />} onClick={onAdd} disabled={disabled} />
      </div>
      {children}
    </div>
  );
}
