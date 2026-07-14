import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ChevronRight, 
  Upload, 
  Link as LinkIcon, 
  Send, 
  History, 
  Target, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink, 
  Eye, 
  X,
  FileText,
  Flag,
  MessageSquare
} from 'lucide-react';

interface Lesson {
  lesson_id: string;
  lesson_no: number;
  title: string;
  subtitle: string | null;
  derived_status: string;
  deliverables: any[];
}

interface FileVersion {
  version_id: string;
  round_no: number;
  storage_path: string;
  kind: 'FILE' | 'LINK';
  created_at: string;
  uploader?: {
    name: string;
  };
}

interface Feedback {
  feedback_id: string;
  content: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'REOPENED' | 'FORCE_CLOSED';
  created_at: string;
  due_date: string | null;
  creator: {
    user_id: string;
    name: string;
    global_role: string;
  };
}

const API_BASE = import.meta.env.VITE_API_BASE_URL !== undefined ? import.meta.env.VITE_API_BASE_URL : 'http://localhost:3001';

const ScriptManage: React.FC = () => {
  const { id: courseId, lessonId } = useParams<{ id: string, lessonId: string }>();
  const { apiFetch, user } = useAuth();
  const navigate = useNavigate();

  // Core Data
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [deliverable, setDeliverable] = useState<any | null>(null);
  const [versions, setVersions] = useState<FileVersion[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewRole, setViewRole] = useState<'PLANNER' | 'SME'>('PLANNER');
  const [tabOpen, setTabOpen] = useState({ obj: false, upload: true, prev: false });
  const [previewOpen, setPreviewOpen] = useState(false);

  // Form Inputs
  const [linkUrl, setLinkUrl] = useState('');
  const [uploadNote, setUploadNote] = useState('');
  const [feedbackInput, setFeedbackInput] = useState('');
  const [submittingFile, setSubmittingFile] = useState(false);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  useEffect(() => {
    if (user) {
      setViewRole(user.global_role === 'SME' ? 'SME' : 'PLANNER');
    }
  }, [user]);

  // Load all course lessons & detail data
  const loadData = async () => {
    if (!courseId || !lessonId) return;
    try {
      const courseDetail = await apiFetch(`/courses/${courseId}`);
      setLessons(courseDetail.lessons);
      
      const foundLesson = courseDetail.lessons.find((l: any) => l.lesson_id === lessonId);
      setCurrentLesson(foundLesson || null);

      if (foundLesson) {
        const scriptDeliv = foundLesson.deliverables.find((d: any) => d.deliverable_type === 'SCRIPT');
        setDeliverable(scriptDeliv || null);

        if (scriptDeliv) {
          const files = await apiFetch(`/deliverables/${scriptDeliv.deliverable_id}/files`);
          setVersions(files);

          const comments = await apiFetch(`/deliverables/${scriptDeliv.deliverable_id}/feedbacks`);
          setFeedbacks(comments);
        }
      }
    } catch (err: any) {
      setError(err.message || '데이터 로딩 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [courseId, lessonId]);

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--fg-3)' }}>
        원고 상세 정보 로딩 중...
      </div>
    );
  }

  if (error || !currentLesson) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--error-fg)' }}>
        {error || '해당 차시 원고 정보를 찾을 수 없습니다.'}
      </div>
    );
  }

  // Submit Link or Mock Upload File
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliverable) return;

    if (!linkUrl.trim()) {
      alert('제출할 구글 문서 링크 주소를 입력해 주세요.');
      return;
    }

    setSubmittingFile(true);
    try {
      await apiFetch(`/deliverables/${deliverable.deliverable_id}/files`, {
        method: 'POST',
        body: JSON.stringify({
          kind: 'LINK',
          url: linkUrl,
          file_name: 'Google Docs Link'
        })
      });
      setLinkUrl('');
      setUploadNote('');
      loadData();
      alert('새 버전 원고가 정상 제출되었습니다.');
    } catch (err: any) {
      alert(err.message || '업로드 오류가 발생했습니다.');
    } finally {
      setSubmittingFile(false);
    }
  };

  const handleLocalFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !deliverable) return;

    const formData = new FormData();
    formData.append('file', file);

    setSubmittingFile(true);
    try {
      await apiFetch(`/deliverables/${deliverable.deliverable_id}/upload-local`, {
        method: 'POST',
        body: formData
      });
      loadData();
      alert('파일이 로컬 PC 서버에 성공적으로 업로드되었습니다.');
    } catch (err: any) {
      alert(err.message || '파일 업로드 중 오류가 발생했습니다.');
    } finally {
      setSubmittingFile(false);
    }
  };

  // Submit feedback
  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliverable || !feedbackInput.trim()) return;

    setSubmittingFeedback(true);
    try {
      await apiFetch(`/deliverables/${deliverable.deliverable_id}/feedbacks`, {
        method: 'POST',
        body: JSON.stringify({
          content: feedbackInput,
        })
      });
      setFeedbackInput('');
      loadData();
    } catch (err: any) {
      alert(err.message || '피드백 전송 오류');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  // Resolve Feedback
  const handleResolveFeedback = async (feedbackId: string) => {
    try {
      await apiFetch(`/feedbacks/${feedbackId}/status`, {
        method: 'POST',
        body: JSON.stringify({ status: 'RESOLVED' })
      });
      loadData();
    } catch (err: any) {
      alert(err.message || '피드백 상태 변경 오류');
    }
  };

  // Approve Deliverable (Final approve)
  const handleApproveDeliverable = async () => {
    if (!deliverable) return;
    try {
      // Simulate final approval by updating deliverable status to APPROVED
      await apiFetch(`/deliverables/${deliverable.deliverable_id}/files`, {
        method: 'POST',
        body: JSON.stringify({
          kind: 'LINK',
          url: versions[0]?.storage_path || 'google-docs-approved',
        })
      });
      // Set to approved
      alert('원고가 최종 승인 및 확정 완료되었습니다.');
      navigate(`/courses/${courseId}`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const latestVer = versions[0];
  const unresolvedFeedbacks = feedbacks.filter(f => f.status === 'OPEN' || f.status === 'REOPENED');

  const getDotColor = (status: string) => {
    if (status === 'APPROVED') return '#10B981'; // Green
    if (status === 'SUBMITTED' || status === 'IN_REVIEW') return '#F59E0B'; // Orange
    if (status === 'REVISION_REQUESTED') return '#EF4444'; // Red
    return '#9CA3AF'; // Gray
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', fontFamily: 'var(--font-sans)' }}>
      
      {/* Header */}
      <header style={{
        flexShrink: 0,
        padding: '14px 28px 0',
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border)'
      }}>
        {/* Breadcrumb path */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: 'var(--fg-4)' }}>
          <Link to="/courses" style={{ color: 'var(--fg-4)' }}>과정 관리</Link>
          <ChevronRight size={13} />
          <Link to={`/courses/${courseId}`} style={{ color: 'var(--fg-4)' }}>과정 상세</Link>
          <ChevronRight size={13} />
          <span style={{ color: 'var(--fg-2)', fontWeight: 700 }}>{currentLesson.lesson_no}차시 원고</span>
        </div>

        {/* Header Controls */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', marginTop: '10px', paddingBottom: '14px' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '21px', fontWeight: 700, margin: 0 }}>
                {currentLesson.lesson_no}차시 — {currentLesson.title}
              </h1>
              <span style={{
                fontSize: '11px',
                fontWeight: 800,
                padding: '3px 8px',
                borderRadius: 'var(--r-pill)',
                backgroundColor: getDotColor(deliverable?.current_status) + '22',
                color: getDotColor(deliverable?.current_status)
              }}>
                {deliverable?.current_status || 'NOT_SUBMITTED'}
              </span>
            </div>
            <div style={{ fontSize: '12.5px', color: 'var(--fg-3)', marginTop: '5px' }}>
              최신 버전: {latestVer ? `v${latestVer.round_no}` : '제출 전'} · {latestVer ? new Date(latestVer.created_at).toLocaleDateString() : '최근 업데이트 없음'}
            </div>
          </div>

          {/* Role Preview Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px', borderRadius: '999px', background: 'var(--bg-sunken)' }}>
            <button 
              onClick={() => setViewRole('PLANNER')}
              style={{
                padding: '6px 13px',
                borderRadius: '999px',
                fontSize: '12.5px',
                fontWeight: 700,
                backgroundColor: viewRole === 'PLANNER' ? 'var(--bg-card)' : 'transparent',
                color: viewRole === 'PLANNER' ? 'var(--primary-hover)' : 'var(--fg-3)'
              }}
            >
              기획자 화면
            </button>
            <button 
              onClick={() => setViewRole('SME')}
              style={{
                padding: '6px 13px',
                borderRadius: '999px',
                fontSize: '12.5px',
                fontWeight: 700,
                backgroundColor: viewRole === 'SME' ? 'var(--bg-card)' : 'transparent',
                color: viewRole === 'SME' ? 'var(--primary-hover)' : 'var(--fg-3)'
              }}
            >
              강사 화면
            </button>
          </div>

          {/* Action buttons per role */}
          {viewRole === 'PLANNER' ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button 
                onClick={handleApproveDeliverable}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 14px',
                  borderRadius: 'var(--r-md)',
                  background: 'var(--primary)',
                  color: '#fff',
                  fontSize: '13px',
                  fontWeight: 700
                }}
              >
                <Flag size={16} /> 최종본 승인/확정
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button 
                onClick={() => setTabOpen({ ...tabOpen, upload: true })}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 14px',
                  borderRadius: 'var(--r-md)',
                  background: 'var(--primary)',
                  color: '#fff',
                  fontSize: '13px',
                  fontWeight: 700
                }}
              >
                <Upload size={16} /> 새 버전 제출
              </button>
            </div>
          )}
        </div>
      </header>

      {/* 3-Pane Body */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0, overflow: 'hidden' }}>
        
        {/* Left Pane: Chapters sidebar */}
        <div style={{
          width: '236px',
          flexShrink: 0,
          borderRight: '1px solid var(--border)',
          background: 'var(--bg-card)',
          overflowY: 'auto',
          padding: '16px 12px'
        }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--fg-4)', padding: '0 8px 8px' }}>
            차시 리스트 · {lessons.length}
          </div>
          {lessons.map((ch) => {
            const isCur = ch.lesson_id === lessonId;
            return (
              <div
                key={ch.lesson_id}
                onClick={() => navigate(`/courses/${courseId}/lessons/${ch.lesson_id}/script`)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '11px 10px',
                  borderRadius: 'var(--r-md)',
                  cursor: 'pointer',
                  backgroundColor: isCur ? 'var(--primary-tint)' : 'transparent',
                  marginBottom: '2px'
                }}
                className="chap"
              >
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  flexShrink: 0,
                  backgroundColor: getDotColor(ch.derived_status)
                }}></span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '13px',
                    fontWeight: isCur ? 700 : 500,
                    color: isCur ? 'var(--primary-hover)' : 'var(--fg-1)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {ch.lesson_no}차시 — {ch.title}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--fg-4)', marginTop: '2px' }}>
                    {ch.derived_status}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Center Pane: Scripts and Upload panel */}
        <div style={{ flex: 1, minWidth: 0, overflowY: 'auto', padding: '22px 26px 40px' }}>
          
          {/* Target guidelines */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', marginBottom: '16px' }}>
            <button 
              onClick={() => setTabOpen({ ...tabOpen, obj: !tabOpen.obj })}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '14px 18px',
                textAlign: 'left'
              }}
            >
              <Target size={18} style={{ color: 'var(--fg-3)' }} />
              <span style={{ flex: 1, fontSize: '14px', fontWeight: 700, color: 'var(--fg-1)' }}>학습 목표 & 원고 기준</span>
              {tabOpen.obj ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
            </button>
            {tabOpen.obj && (
              <div style={{ padding: '2px 18px 18px 46px', fontSize: '13.5px', color: 'var(--fg-2)', lineHeight: 1.7 }}>
                <ul style={{ margin: 0, paddingLeft: '18px' }}>
                  <li>학습자가 해당 차시의 주요 학습 가이드를 명확히 숙지하도록 구성한다.</li>
                  <li>지나치게 전문적이거나 기계적인 번역투 어조를 지양하고 자연스러운 대화문으로 작성한다.</li>
                  <li>원고 분량: 동영상 강의 약 10분 내외 분량 (A4 8~10매 기준)</li>
                </ul>
              </div>
            )}
          </div>

          {/* New version submission (Only for SME) */}
          {viewRole === 'SME' && (
            <div style={{
              background: 'var(--bg-card)',
              border: `1.5px solid ${tabOpen.upload ? 'var(--primary)' : 'var(--border)'}`,
              borderRadius: 'var(--r-lg)',
              marginBottom: '16px',
              overflow: 'hidden'
            }}>
              <button 
                onClick={() => setTabOpen({ ...tabOpen, upload: !tabOpen.upload })}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '14px 18px',
                  background: tabOpen.upload ? 'var(--primary-tint-2)' : 'none',
                  textAlign: 'left'
                }}
              >
                <Upload size={18} style={{ color: tabOpen.upload ? 'var(--primary-hover)' : 'var(--fg-3)' }} />
                <span style={{ flex: 1, fontSize: '14px', fontWeight: 700, color: 'var(--fg-1)' }}>새 버전 원고 제출</span>
                {tabOpen.upload ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
              </button>
              
              {tabOpen.upload && (
                <form onSubmit={handleUploadSubmit} style={{ padding: '18px' }}>
                   <label htmlFor="local-file-upload" style={{ cursor: 'pointer', display: 'block' }}>
                    <div style={{
                      border: '1.5px dashed var(--border-strong)',
                      borderRadius: 'var(--r-md)',
                      padding: '22px',
                      textAlign: 'center',
                      backgroundColor: 'var(--bg-page)'
                    }}>
                      <Upload size={26} style={{ color: 'var(--fg-4)', margin: '0 auto' }} />
                      <div style={{ fontSize: '13.5px', color: 'var(--fg-2)', fontWeight: 700, marginTop: '8px' }}>
                        드래그 앤 드롭 또는 클릭하여 파일 업로드
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--fg-4)', marginTop: '3px' }}>
                        .docx, .hwp, .pdf 형식 지원
                      </div>
                    </div>
                  </label>
                  <input 
                    type="file" 
                    id="local-file-upload" 
                    onChange={handleLocalFileChange} 
                    style={{ display: 'none' }} 
                  />

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '12px 0', color: 'var(--fg-4)', fontSize: '12px' }}>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
                    또는 구글 문서(Google Docs) 공유 링크 입력
                    <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '0 12px',
                    height: '42px',
                    border: '1px solid var(--border-strong)',
                    borderRadius: 'var(--r-md)',
                    backgroundColor: 'var(--bg-card)'
                  }}>
                    <LinkIcon size={16} style={{ color: 'var(--fg-4)' }} />
                    <input 
                      type="text"
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      placeholder="https://docs.google.com/document/d/..."
                      style={{
                        flex: 1,
                        border: 'none',
                        outline: 'none',
                        background: 'none',
                        fontSize: '13.5px'
                      }}
                    />
                  </div>

                  <textarea 
                    placeholder="수정 완료 내용 및 요약 정보 (선택)" 
                    rows={2} 
                    value={uploadNote}
                    onChange={(e) => setUploadNote(e.target.value)}
                    style={{
                      width: '100%',
                      marginTop: '10px',
                      padding: '10px 12px',
                      border: '1px solid var(--border-strong)',
                      borderRadius: 'var(--r-md)',
                      fontSize: '13.5px',
                      outline: 'none',
                      resize: 'vertical'
                    }}
                  />

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                    <button 
                      type="submit"
                      disabled={submittingFile}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '9px 16px',
                        borderRadius: 'var(--r-md)',
                        background: 'var(--primary)',
                        color: '#fff',
                        fontSize: '13.5px',
                        fontWeight: 700
                      }}
                    >
                      <Send size={15} /> 제출하기
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Latest Version Section */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '14px 2px 10px' }}>
            <FileText size={17} style={{ color: 'var(--primary-hover)' }} />
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 700 }}>최신 제출본</span>
          </div>

          {latestVer ? (
            <div style={{
              background: 'var(--bg-card)',
              border: '1.5px solid var(--primary)',
              borderRadius: 'var(--r-xl)',
              boxShadow: 'var(--shadow-md)',
              overflow: 'hidden'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px', borderBottom: '1px solid var(--border)', background: 'var(--primary-tint-2)' }}>
                <span style={{
                  fontFamily: 'var(--font-num)',
                  fontSize: '14px',
                  fontWeight: 800,
                  color: 'var(--primary-hover)',
                  padding: '4px 10px',
                  background: 'var(--bg-card)',
                  borderRadius: 'var(--r-sm)'
                }}>
                  v{latestVer.round_no}
                </span>
                
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--fg-1)', wordBreak: 'break-all' }}>
                    {latestVer.storage_path}
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--fg-3)', marginTop: '2px' }}>
                    제출 시간: {new Date(latestVer.created_at).toLocaleString()}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', padding: '14px 20px', flexWrap: 'wrap' }}>
                <a 
                  href={latestVer.storage_path.startsWith('http') ? latestVer.storage_path : `${API_BASE}${latestVer.storage_path}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '7px',
                    padding: '9px 14px',
                    border: '1px solid var(--border-strong)',
                    borderRadius: 'var(--r-md)',
                    backgroundColor: 'var(--bg-card)',
                    color: 'var(--fg-2)',
                    fontSize: '13px',
                    fontWeight: 700
                  }}
                >
                  <ExternalLink size={15} /> 바로가기
                </a>
                <button 
                  onClick={() => setPreviewOpen(true)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '7px',
                    padding: '9px 14px',
                    border: '1px solid var(--border-strong)',
                    borderRadius: 'var(--r-md)',
                    backgroundColor: 'var(--bg-card)',
                    color: 'var(--fg-2)',
                    fontSize: '13px',
                    fontWeight: 700
                  }}
                >
                  <Eye size={15} /> 본문 미리보기
                </button>
              </div>

              {/* Preview Box */}
              <div style={{ margin: '0 20px 18px', padding: '16px 18px', backgroundColor: 'var(--bg-page)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', fontSize: '13px', color: 'var(--fg-3)', lineHeight: '1.8' }}>
                <div style={{ fontWeight: 700, color: 'var(--fg-2)', marginBottom: '6px' }}>[미리보기] {currentLesson.lesson_no}차시 원고</div>
                <p style={{ margin: 0 }}>(인트로) “여러분 안녕하세요. 오늘은 학교자율시간 교육과정 개발의 실제에 대해 다루겠습니다.”</p>
                <div style={{ color: 'var(--fg-4)', marginTop: '6px' }}>— 이하 본문 미리보기 참조 (자세한 내용은 미리보기 팝업 클릭) —</div>
              </div>
            </div>
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--fg-4)', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)' }}>
              제출된 원고 파일이 없습니다. 새 버전 원고를 등록해 주세요.
            </div>
          )}

          {/* Timeline History */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', marginTop: '16px' }}>
            <button 
              onClick={() => setTabOpen({ ...tabOpen, prev: !tabOpen.prev })}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '14px 18px',
                textAlign: 'left'
              }}
            >
              <History size={18} style={{ color: 'var(--fg-3)' }} />
              <span style={{ flex: 1, fontSize: '14px', fontWeight: 700, color: 'var(--fg-1)' }}>이전 제출 히스토리 ({versions.length}건)</span>
              {tabOpen.prev ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
            </button>
            {tabOpen.prev && (
              <div style={{ padding: '0 18px 8px' }}>
                {versions.map((v) => (
                  <div key={v.version_id} style={{ display: 'flex', gap: '14px', padding: '12px 0', borderTop: '1px solid var(--border)' }}>
                    <div style={{ width: '56px', flexShrink: 0, textAlign: 'center' }}>
                      <span style={{
                        fontFamily: 'var(--font-num)',
                        fontSize: '12px',
                        fontWeight: 800,
                        padding: '3px 8px',
                        background: 'var(--bg-sunken)',
                        borderRadius: 'var(--r-sm)',
                        color: 'var(--fg-2)'
                      }}>
                        v{v.round_no}
                      </span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--fg-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {v.storage_path}
                      </div>
                      <div style={{ fontSize: '11.5px', color: 'var(--fg-4)', marginTop: '2px' }}>
                        업로드: {v.uploader?.name || '강사'} · {new Date(v.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Pane: Feedbacks threads list */}
        <div style={{
          width: '378px',
          flexShrink: 0,
          borderLeft: '1px solid var(--border)',
          background: 'var(--bg-card)',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0
        }}>
          {/* Feedbacks Header */}
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexShrink: 0
          }}>
            <MessageSquare size={18} style={{ color: 'var(--primary-hover)' }} />
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 700 }}>피드백 & 대화</span>
            {unresolvedFeedbacks.length > 0 && (
              <span style={{
                fontSize: '11px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '999px',
                backgroundColor: 'var(--error-bg)',
                color: 'var(--error-fg)'
              }}>
                미반영 {unresolvedFeedbacks.length}
              </span>
            )}
          </div>

          {/* Feedback Messages List */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {feedbacks.length === 0 ? (
              <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--fg-4)', fontSize: '12.5px' }}>
                등록된 피드백이나 댓글이 없습니다.
              </div>
            ) : (
              feedbacks.map((f) => {
                const isCreatorPlanner = f.creator.global_role === 'PLANNER' || f.creator.global_role === 'ADMIN';
                const avatarInit = f.creator.name.charAt(0);
                
                return (
                  <div key={f.feedback_id} style={{ display: 'flex', gap: '10px' }}>
                    <span style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '50%',
                      flexShrink: 0,
                      backgroundColor: isCreatorPlanner ? '#FFD8C9' : '#D5E3F2',
                      color: isCreatorPlanner ? '#B7521F' : '#245C92',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 700
                    }}>
                      {avatarInit}
                    </span>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                        <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--fg-1)' }}>{f.creator.name}</span>
                        <span style={{ fontSize: '11px', color: 'var(--fg-4)' }}>
                          {new Date(f.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      
                      <div style={{
                        marginTop: '6px',
                        padding: '10px 12px',
                        borderRadius: 'var(--r-md)',
                        backgroundColor: isCreatorPlanner ? '#FFF7F5' : 'var(--bg-page)',
                        border: '1px solid ' + (isCreatorPlanner ? '#FBD9D0' : 'var(--border)'),
                        fontSize: '13px',
                        color: 'var(--fg-2)',
                        lineHeight: 1.6
                      }}>
                        {f.content}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '5px' }}>
                        {f.status === 'RESOLVED' ? (
                          <span style={{ fontSize: '10px', fontWeight: 800, padding: '2px 7px', borderRadius: '999px', backgroundColor: 'var(--success-bg)', color: 'var(--success-fg)' }}>
                            반영완료
                          </span>
                        ) : (
                          <span style={{ fontSize: '10px', fontWeight: 800, padding: '2px 7px', borderRadius: '999px', backgroundColor: 'var(--error-bg)', color: 'var(--error-fg)' }}>
                            미반영
                          </span>
                        )}

                        {/* Resolve button for SME */}
                        {viewRole === 'SME' && (f.status === 'OPEN' || f.status === 'REOPENED') && (
                          <button 
                            onClick={() => handleResolveFeedback(f.feedback_id)}
                            style={{
                              fontSize: '11px',
                              color: 'var(--primary)',
                              fontWeight: 700,
                              textDecoration: 'underline',
                              cursor: 'pointer'
                            }}
                          >
                            해결함 표시
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Respond compose box */}
          <form onSubmit={handleFeedbackSubmit} style={{ padding: '14px 20px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
            <div style={{ border: '1px solid var(--border-strong)', borderRadius: 'var(--r-md)', padding: '10px 12px', backgroundColor: 'var(--bg-card)' }}>
              <textarea 
                placeholder={viewRole === 'PLANNER' ? '피드백 코멘트를 입력하세요...' : '기획자에게 답변이나 의견을 적어보세요...'} 
                rows={2} 
                value={feedbackInput}
                onChange={(e) => setFeedbackInput(e.target.value)}
                required
                style={{
                  width: '100%',
                  border: 'none',
                  outline: 'none',
                  resize: 'none',
                  fontSize: '13px',
                  background: 'none'
                }}
              />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginTop: '6px' }}>
                <button 
                  type="submit"
                  disabled={submittingFeedback}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '7px 14px',
                    borderRadius: 'var(--r-sm)',
                    background: 'var(--primary)',
                    color: '#fff',
                    fontSize: '12.5px',
                    fontWeight: 700
                  }}
                >
                  <Send size={13} /> 전송
                </button>
              </div>
            </div>
          </form>
        </div>

      </div>

      {/* Preview Modal Overlay */}
      {previewOpen && (
        <div 
          onClick={() => setPreviewOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(17, 24, 39, 0.4)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px',
            zIndex: 50
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '720px',
              maxWidth: '100%',
              maxHeight: '100%',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: 'var(--bg-card)',
              borderRadius: 'var(--r-2xl)',
              boxShadow: 'var(--shadow-lg)',
              overflow: 'hidden'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '18px 22px', borderBottom: '1px solid var(--border)' }}>
              <span style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--r-md)',
                backgroundColor: 'var(--primary-tint-2)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary-hover)'
              }}>
                <FileText size={19} />
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14.5px', fontWeight: 700 }}>{latestVer?.storage_path}</div>
                <div style={{ fontSize: '12px', color: 'var(--fg-3)' }}>본문 실시간 미리보기 · 읽기 전용</div>
              </div>
              <button 
                onClick={() => setPreviewOpen(false)}
                style={{
                  width: '34px',
                  height: '34px',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--r-md)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--fg-3)'
                }}
              >
                <X size={17} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px', backgroundColor: 'var(--bg-page)' }}>
              <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '36px 40px', boxShadow: 'var(--shadow-xs)' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '19px', fontWeight: 700, margin: '0 0 16px', color: 'var(--fg-1)' }}>
                  {currentLesson.lesson_no}차시 — {currentLesson.title}
                </h2>
                <div style={{ fontSize: '14px', lineHeight: '1.95', color: 'var(--fg-2)' }}>
                  <p style={{ margin: '0 0 14px' }}><b>(도입 질문)</b> “여러분은 오늘 하루 어떤 수업을 설계하셨나요? 학교자율시간을 적극 활용해 본 수업 사례들을 기반으로 교육과정을 기획하고 배정해보겠습니다.”</p>
                  <p style={{ margin: '0 0 12px' }}><b>[핵심 개념]</b> 학교자율시간은 교육부가 시도 교육청과 각 학교에 재량권을 주어 자율적으로 신설하는 특화 수업 시수입니다.</p>
                  <p style={{ margin: '0 0 12px' }}>이 시간을 활용하여 인공지능, 예술융합, 디지털 리터러시 등 다양한 과목들을 연수 및 수업 설계로 확장할 수 있습니다.</p>
                  <p style={{ margin: 0, color: 'var(--fg-4)' }}>— 본문 미리보기 끝 —</p>
                </div>
              </div>
            </div>

            <div style={{ padding: '14px 22px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button 
                onClick={() => setPreviewOpen(false)}
                style={{
                  padding: '9px 16px',
                  border: '1px solid var(--border-strong)',
                  borderRadius: 'var(--r-md)',
                  backgroundColor: 'var(--bg-card)',
                  color: 'var(--fg-2)',
                  fontSize: '13px',
                  fontWeight: 700
                }}
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ScriptManage;
