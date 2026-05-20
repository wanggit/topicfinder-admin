import { useEffect, useState } from 'react';
import { Table, Button, Modal, Input, Space, Typography, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { api } from '../utils/api';

const { Title, Text } = Typography;

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

interface Subject {
  id: number;
  grade_id: number;
  name: string;
  sort_order: number;
}

interface KnowledgePoint {
  id: number;
  subject_id: number;
  name: string;
  description: string;
}

type ModalMode = { open: boolean; editing?: any; type: 'version' | 'grade' | 'subject' | 'kp' };

export function KnowledgePage() {
  const [versions, setVersions] = useState<Version[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [knowledgePoints, setKnowledgePoints] = useState<KnowledgePoint[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [modal, setModal] = useState<ModalMode>({ open: false, type: 'version' });
  const [nameInput, setNameInput] = useState('');
  const [descInput, setDescInput] = useState('');

  const loadVersions = async () => {
    setVersions(await api.get<Version[]>('/api/admin/versions'));
  };

  const loadGrades = async (versionId: number) => {
    setGrades(await api.get<Grade[]>(`/api/admin/grades?versionId=${versionId}`));
  };

  const loadSubjects = async (gradeId: number) => {
    setSubjects(await api.get<Subject[]>(`/api/admin/subjects?gradeId=${gradeId}`));
  };

  const loadKnowledgePoints = async (subjectId: number) => {
    setKnowledgePoints(await api.get<KnowledgePoint[]>(`/api/admin/knowledge-points?subjectId=${subjectId}`));
  };

  useEffect(() => {
    loadVersions().catch(() => {});
  }, []);

  const selectVersion = (version: Version) => {
    setSelectedVersion(version);
    setSelectedGrade(null);
    setSelectedSubject(null);
    setSubjects([]);
    setKnowledgePoints([]);
    loadGrades(version.id).catch(() => {});
  };

  const selectGrade = (grade: Grade) => {
    setSelectedGrade(grade);
    setSelectedSubject(null);
    setKnowledgePoints([]);
    loadSubjects(grade.id).catch(() => {});
  };

  const selectSubject = (subject: Subject) => {
    setSelectedSubject(subject);
    loadKnowledgePoints(subject.id).catch(() => {});
  };

  const handleSave = async () => {
    const basePath = {
      version: '/api/admin/versions',
      grade: '/api/admin/grades',
      subject: '/api/admin/subjects',
      kp: '/api/admin/knowledge-points',
    }[modal.type];

    const body = {
      version: { name: nameInput },
      grade: { name: nameInput, versionId: selectedVersion!.id, sortOrder: modal.editing?.sort_order ?? grades.length },
      subject: { name: nameInput, gradeId: selectedGrade!.id, sortOrder: modal.editing?.sort_order ?? subjects.length },
      kp: { name: nameInput, subjectId: selectedSubject!.id, description: descInput },
    }[modal.type];

    if (modal.editing) await api.put(`${basePath}/${modal.editing.id}`, body);
    else await api.post(basePath, body);

    setModal({ open: false, type: 'version' });
    if (modal.type === 'version') await loadVersions();
    if (modal.type === 'grade' && selectedVersion) await loadGrades(selectedVersion.id);
    if (modal.type === 'subject' && selectedGrade) await loadSubjects(selectedGrade.id);
    if (modal.type === 'kp' && selectedSubject) await loadKnowledgePoints(selectedSubject.id);
    message.success('保存成功');
  };

  const handleDelete = async (path: string, onReload: () => Promise<void>, onClear?: () => void) => {
    await api.delete(path);
    if (onClear) onClear();
    await onReload();
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
        <Panel title="教材版本" onAdd={() => openModal('version')} disabled={false}>
          <Table
            dataSource={versions}
            rowKey="id"
            size="small"
            pagination={false}
            onRow={(record) => ({
              onClick: () => selectVersion(record),
              style: { background: selectedVersion?.id === record.id ? '#e6f4ff' : undefined, cursor: 'pointer' },
            })}
            columns={[
              { title: '名称', dataIndex: 'name' },
              {
                title: '',
                render: (_: any, record: Version) => (
                  <Space>
                    <Button size="small" icon={<EditOutlined />} onClick={(e) => { e.stopPropagation(); openModal('version', record); }} />
                    <Button
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(`/api/admin/versions/${record.id}`, loadVersions, () => {
                          if (selectedVersion?.id === record.id) {
                            setSelectedVersion(null);
                            setGrades([]);
                            setSelectedGrade(null);
                            setSubjects([]);
                            setSelectedSubject(null);
                            setKnowledgePoints([]);
                          }
                        }).catch(() => {});
                      }}
                    />
                  </Space>
                ),
              },
            ]}
          />
        </Panel>

        <Panel title="年级" onAdd={() => openModal('grade')} disabled={!selectedVersion}>
          {!selectedVersion ? <Text type="secondary">请先选择版本</Text> : (
            <Table
              dataSource={grades}
              rowKey="id"
              size="small"
              pagination={false}
              onRow={(record) => ({
                onClick: () => selectGrade(record),
                style: { background: selectedGrade?.id === record.id ? '#e6f4ff' : undefined, cursor: 'pointer' },
              })}
              columns={[
                { title: '名称', dataIndex: 'name' },
                {
                  title: '',
                  render: (_: any, record: Grade) => (
                    <Space>
                      <Button size="small" icon={<EditOutlined />} onClick={(e) => { e.stopPropagation(); openModal('grade', record); }} />
                      <Button
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(`/api/admin/grades/${record.id}`, () => loadGrades(selectedVersion.id), () => {
                            if (selectedGrade?.id === record.id) {
                              setSelectedGrade(null);
                              setSubjects([]);
                              setSelectedSubject(null);
                              setKnowledgePoints([]);
                            }
                          }).catch(() => {});
                        }}
                      />
                    </Space>
                  ),
                },
              ]}
            />
          )}
        </Panel>

        <Panel title="学科" onAdd={() => openModal('subject')} disabled={!selectedGrade}>
          {!selectedGrade ? <Text type="secondary">请先选择年级</Text> : (
            <Table
              dataSource={subjects}
              rowKey="id"
              size="small"
              pagination={false}
              onRow={(record) => ({
                onClick: () => selectSubject(record),
                style: { background: selectedSubject?.id === record.id ? '#e6f4ff' : undefined, cursor: 'pointer' },
              })}
              columns={[
                { title: '名称', dataIndex: 'name' },
                {
                  title: '',
                  render: (_: any, record: Subject) => (
                    <Space>
                      <Button size="small" icon={<EditOutlined />} onClick={(e) => { e.stopPropagation(); openModal('subject', record); }} />
                      <Button
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(`/api/admin/subjects/${record.id}`, () => loadSubjects(selectedGrade.id), () => {
                            if (selectedSubject?.id === record.id) {
                              setSelectedSubject(null);
                              setKnowledgePoints([]);
                            }
                          }).catch(() => {});
                        }}
                      />
                    </Space>
                  ),
                },
              ]}
            />
          )}
        </Panel>

        <Panel title="知识点" onAdd={() => openModal('kp')} disabled={!selectedSubject}>
          {!selectedSubject ? <Text type="secondary">请先选择学科</Text> : (
            <Table
              dataSource={knowledgePoints}
              rowKey="id"
              size="small"
              pagination={false}
              columns={[
                { title: '名称', dataIndex: 'name' },
                {
                  title: '',
                  render: (_: any, record: KnowledgePoint) => (
                    <Space>
                      <Button size="small" icon={<EditOutlined />} onClick={() => openModal('kp', record)} />
                      <Button
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => {
                          handleDelete(
                            `/api/admin/knowledge-points/${record.id}`,
                            () => loadKnowledgePoints(selectedSubject.id),
                          ).catch(() => {});
                        }}
                      />
                    </Space>
                  ),
                },
              ]}
            />
          )}
        </Panel>
      </div>

      <Modal
        title={`${modal.editing ? '编辑' : '新增'}${modal.type === 'version' ? '版本' : modal.type === 'grade' ? '年级' : modal.type === 'subject' ? '学科' : '知识点'}`}
        open={modal.open}
        onOk={() => handleSave().catch(() => {})}
        onCancel={() => setModal({ open: false, type: 'version' })}
      >
        <Input placeholder="名称" value={nameInput} onChange={(e) => setNameInput(e.target.value)} style={{ marginBottom: 8 }} />
        {modal.type === 'kp' ? (
          <Input placeholder="描述（可选）" value={descInput} onChange={(e) => setDescInput(e.target.value)} />
        ) : null}
      </Modal>
    </div>
  );
}

function Panel({ title, onAdd, children, disabled }: { title: string; onAdd: () => void; children: React.ReactNode; disabled: boolean }) {
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
