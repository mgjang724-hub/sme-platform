import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUi } from '../context/UiContext';
import { useDraft } from '../hooks/useDraft';
import { useEscapeKey } from '../hooks/useEscapeKey';
import FileDropzone, { SelectedFileChip } from '../components/FileDropzone';
import { uploadWithProgress } from '../lib/upload';
import ScriptViewer, { QuotePrompt } from '../components/ScriptViewer';
import { getScriptStatus, resolveLessonStatus } from '../lib/status';
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
  MessageSquare,
  Sparkles,
  GitCompare,
  Clock,
  CheckCircle2,
  AlertCircle,
  Lock as LockIcon
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
  preview_path?: string | null;
  kind: 'FILE' | 'LINK';
  created_at: string;
  uploader?: {
    name: string;
  };
}

interface Feedback {
  feedback_id: string;
  content: string;
  /** 'QUOTE'면 location_value에 원고에서 인용한 문장이 들어 있다. */
  location_type?: string | null;
  location_value?: string | null;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'REOPENED' | 'FORCE_CLOSED';
  created_at: string;
  due_date: string | null;
  creator: {
    user_id: string;
    name: string;
    global_role: string;
  };
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

const ScriptManage: React.FC = () => {
  const { id: courseId, lessonId } = useParams<{ id: string, lessonId: string }>();
  const { apiFetch, user, token } = useAuth();
  const { toast, confirm } = useUi();
  const navigate = useNavigate();
  const location = useLocation();

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
  const [previewText, setPreviewText] = useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  // AI Analysis Modal State
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiData, setAiData] = useState<any | null>(null);

  // Diff Modal State
  const [diffModalOpen, setDiffModalOpen] = useState(false);
  const [diffLoading, setDiffLoading] = useState(false);
  const [diffData, setDiffData] = useState<any | null>(null);

  // Form Inputs
  // 입력 중인 내용은 localStorage에 자동 저장된다. 세션이 만료되거나 실수로 창을 닫아도 남는다.
  const draftScope = deliverable?.deliverable_id ?? null;
  const {
    value: linkUrl,
    setValue: setLinkUrl,
    clear: clearLinkDraft,
  } = useDraft(draftScope && `link:${draftScope}`);
  const {
    value: uploadNote,
    setValue: setUploadNote,
    clear: clearNoteDraft,
  } = useDraft(draftScope && `note:${draftScope}`);
  const {
    value: feedbackInput,
    setValue: setFeedbackInput,
    clear: clearFeedbackDraft,
    restored: feedbackRestored,
    acknowledgeRestore: ackFeedbackRestore,
  } = useDraft(draftScope && `feedback:${draftScope}`);

  // 본문에서 드래그해 고른 문장 (아직 피드백으로 확정하지 않은 상태)
  const [pendingQuote, setPendingQuote] = useState<string | null>(null);
  // 피드백에 붙여 보낼 인용문
  const [attachedQuote, setAttachedQuote] = useState<string | null>(null);
  // 원고 본문에서 강조해 보여줄 인용문
  const [focusedQuote, setFocusedQuote] = useState<string | null>(null);

  const [submittingFile, setSubmittingFile] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const [filterUnresolvedOnly, setFilterUnresolvedOnly] = useState(false);
  
  // UX-201: Submit Confirm Modal State
  const [isSubmitConfirmOpen, setIsSubmitConfirmOpen] = useState(false);
  const [pendingSubmitType, setPendingSubmitType] = useState<'LINK' | 'LOCAL' | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  
  // UX-401: Sidebar toggle
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Learning Objectives Guideline state
  const [guidelineText, setGuidelineText] = useState("- 학습자가 해당 차시의 주요 학습 가이드를 명확히 숙지하도록 구성한다.\n- 지나치게 전문적이거나 기계적인 번역투 어조를 지양하고 자연스러운 대화문으로 작성한다.\n- 원고 분량: 동영상 강의 약 10분 내외 분량 (A4 8~10매 기준)");
  const [isEditingGuideline, setIsEditingGuideline] = useState(false);
  
  // UX-301: Copyright Check
  const [isCopyrightChecked, setIsCopyrightChecked] = useState(false);
  
  // UX-302: Supplementary File
  const [supplementaryFile, setSupplementaryFile] = useState<File | null>(null);

  // 열려 있는 모달은 Esc 키로 닫는다.
  useEscapeKey(previewOpen, () => setPreviewOpen(false));
  useEscapeKey(aiModalOpen, () => setAiModalOpen(false));
  useEscapeKey(diffModalOpen, () => setDiffModalOpen(false));
  useEscapeKey(isSubmitConfirmOpen, () => setIsSubmitConfirmOpen(false));

  const latestVer = versions[0];
  const unresolvedFeedbacks = feedbacks.filter(f => f.status === 'OPEN' || f.status === 'REOPENED');
  const displayedFeedbacks = filterUnresolvedOnly ? unresolvedFeedbacks : feedbacks;

  useEffect(() => {
    if (user) {
      setViewRole(user.global_role === 'SME' ? 'SME' : 'PLANNER');
    }
  }, [user]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('openFeedback') === 'true') {
      setFilterUnresolvedOnly(true);
      setTimeout(() => {
        const el = document.getElementById('feedback-input-area');
        if (el) {
          el.focus();
          // Optional: highlight it briefly
          el.style.boxShadow = '0 0 0 3px rgba(79, 70, 229, 0.4)';
          setTimeout(() => { el.style.boxShadow = 'none'; }, 1500);
        }
      }, 300); // give time for render
    }
  }, [location.search]);

  useEffect(() => {
    if (latestVer) {
      if (latestVer.preview_path) {
        setLoadingPreview(true);
        fetch(`${API_BASE}${latestVer.preview_path}`)
          .then(res => {
            if (!res.ok) throw new Error();
            return res.text();
          })
          .then(text => {
            setPreviewText(text);
          })
          .catch(() => {
            setPreviewText('미리보기 본문 데이터를 읽어오는데 실패했습니다.');
          })
          .finally(() => {
            setLoadingPreview(false);
          });
      } else {
        setPreviewText(null);
      }
    }
  }, [latestVer]);

  // Load all course lessons & detail data
  const loadData = async () => {
    if (!courseId || !lessonId) return;
    try {
      const courseDetail = await apiFetch(`/courses/${courseId}`);
      const lessonsList = Array.isArray(courseDetail?.lessons) ? courseDetail.lessons : [];
      setLessons(lessonsList);
      
      const foundLesson = lessonsList.find((l: any) => l.lesson_id === lessonId);
      setCurrentLesson(foundLesson || null);

      if (foundLesson) {
        const deliverablesList = Array.isArray(foundLesson.deliverables) ? foundLesson.deliverables : [];
        const scriptDeliv = deliverablesList.find((d: any) => d.deliverable_type === 'SCRIPT');
        setDeliverable(scriptDeliv || null);

        if (scriptDeliv) {
          const files = await apiFetch(`/deliverables/${scriptDeliv.deliverable_id}/files`);
          setVersions(Array.isArray(files) ? files : []);

          const comments = await apiFetch(`/deliverables/${scriptDeliv.deliverable_id}/feedbacks`);
          setFeedbacks(Array.isArray(comments) ? comments : []);
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
  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliverable) return;

    if (!linkUrl.trim()) {
      toast.error('구글 문서 링크를 입력해 주세요', '문서 공유 설정을 "링크가 있는 모든 사용자"로 바꾼 뒤 주소를 붙여 넣어 주세요.');
      return;
    }
    setPendingSubmitType('LINK');
    setIsSubmitConfirmOpen(true);
  };

  const handleFileSelected = (file: File) => {
    if (!deliverable) return;
    setPendingFile(file);
    setPendingSubmitType('LOCAL');
    setIsSubmitConfirmOpen(true);
  };

  const executeSubmit = async () => {
    setIsSubmitConfirmOpen(false);
    setIsCopyrightChecked(false);
    if (!deliverable || !pendingSubmitType) return;
    
    setSubmittingFile(true);
    try {
      if (pendingSubmitType === 'LINK') {
        await apiFetch(`/deliverables/${deliverable.deliverable_id}/files`, {
          method: 'POST',
          body: JSON.stringify({
            kind: 'LINK',
            url: linkUrl,
            file_name: 'Google Docs Link'
          })
        });
        clearLinkDraft();
        clearNoteDraft();
        loadData();
        toast.success('원고를 제출했습니다', '기획자에게 검토 요청 알림이 전달됩니다.');
      } else if (pendingSubmitType === 'LOCAL' && pendingFile) {
        const formData = new FormData();
        formData.append('file', pendingFile);
        if (supplementaryFile) formData.append('supplementary', supplementaryFile);

        setUploadProgress(0);
        await uploadWithProgress(
          `/deliverables/${deliverable.deliverable_id}/upload-local`,
          formData,
          token,
          setUploadProgress,
        );

        const uploadedName = pendingFile.name;
        setPendingFile(null);
        setSupplementaryFile(null);
        clearNoteDraft();
        loadData();
        toast.success('원고를 제출했습니다', `${uploadedName} · 기획자에게 검토 요청 알림이 전달됩니다.`);
      }
    } catch (err: any) {
      toast.error('원고를 제출하지 못했습니다', err.message || '네트워크 상태를 확인한 뒤 다시 시도해 주세요.');
    } finally {
      setSubmittingFile(false);
      setUploadProgress(null);
      setPendingSubmitType(null);
    }
  };

  // Submit feedback
  const submitFeedback = async () => {
    if (!deliverable || !feedbackInput.trim() || submittingFeedback) return;

    setSubmittingFeedback(true);
    try {
      await apiFetch(`/deliverables/${deliverable.deliverable_id}/feedbacks`, {
        method: 'POST',
        body: JSON.stringify({
          content: feedbackInput,
          file_version_id: latestVer?.version_id,
          // 인용한 문장을 함께 저장해 두면, 받는 쪽에서 원고의 해당 위치로 바로 이동할 수 있다.
          location_type: attachedQuote ? 'QUOTE' : undefined,
          location_value: attachedQuote || undefined,
        })
      });
      clearFeedbackDraft();
      setAttachedQuote(null);
      loadData();
      toast.success('피드백을 남겼습니다', viewRole === 'PLANNER' ? '강사에게 알림이 전달됩니다.' : '기획자에게 알림이 전달됩니다.');
    } catch (err: any) {
      toast.error('피드백을 보내지 못했습니다', err.message || '작성한 내용은 그대로 남아 있습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitFeedback();
  };

  /** 본문에서 문장을 드래그하면 인용 제안 바를 띄운다. */
  const handleQuoteSelection = (quote: string) => {
    setPendingQuote(quote);
  };

  /** 제안 바에서 [이 문장에 피드백]을 누른 경우 */
  const attachPendingQuote = () => {
    if (!pendingQuote) return;
    setAttachedQuote(pendingQuote);
    setFocusedQuote(pendingQuote);
    setPendingQuote(null);
    setPreviewOpen(false);
    document.getElementById('feedback-input-area')?.focus();
  };

  /** 피드백 카드의 인용문을 누르면 원고 본문에서 그 위치를 강조한다. */
  const focusFeedbackQuote = (quote: string) => {
    setFocusedQuote(quote);
    setTabOpen(prev => ({ ...prev, prev: true }));
  };

  // Resolve Feedback
  const handleResolveFeedback = async (feedbackId: string) => {
    try {
      await apiFetch(`/feedbacks/${feedbackId}/status`, {
        method: 'POST',
        body: JSON.stringify({ status: 'RESOLVED' })
      });
      loadData();
      toast.success('반영 완료로 표시했습니다', '기획자가 확인 후 최종 승인합니다.');
    } catch (err: any) {
      toast.error('상태를 바꾸지 못했습니다', err.message || '잠시 후 다시 시도해 주세요.');
    }
  };

  // Approve Deliverable (Final approve)
  const handleApproveDeliverable = async () => {
    if (!deliverable) return;
    const ok = await confirm({
      title: '이 원고를 최종 승인할까요?',
      message: '승인하면 원고가 잠기고, 강사는 더 이상 새 버전을 올리거나 수정할 수 없습니다.\n지금까지의 피드백 기록은 그대로 남습니다.',
      confirmLabel: '최종 승인',
      acknowledgeLabel: '이 원고를 최종본으로 확정합니다.',
    });
    if (!ok) return;

    try {
      await apiFetch(`/deliverables/${deliverable.deliverable_id}/files`, {
        method: 'POST',
        body: JSON.stringify({
          kind: 'LINK',
          url: versions[0]?.storage_path || 'google-docs-approved',
        })
      });
      toast.success('원고를 최종 승인했습니다', '과정 상세 화면으로 이동합니다.');
      navigate(`/courses/${courseId}`);
    } catch (err: any) {
      toast.error('승인 처리에 실패했습니다', err.message || '잠시 후 다시 시도해 주세요.');
    }
  };


  const handleOpenAiAnalysis = async () => {
    setAiModalOpen(true);
    setAiLoading(true);
    try {
      const versionId = latestVer ? latestVer.version_id : 'default';
      const data = await apiFetch(`/deliverables/file-versions/${versionId}/ai-analysis`);
      setAiData(data);
    } catch (err: any) {
      toast.error('AI 분석을 불러오지 못했습니다', err.message || '잠시 후 다시 시도해 주세요.');
      setAiModalOpen(false);
    } finally {
      setAiLoading(false);
    }
  };

  const handleOpenDiffComparison = async () => {
    if (!deliverable) return;
    setDiffModalOpen(true);
    setDiffLoading(true);
    try {
      const data = await apiFetch(`/deliverables/${deliverable.deliverable_id}/diff`);
      setDiffData(data);
    } catch (err: any) {
      toast.error('버전 비교를 불러오지 못했습니다', err.message || '비교할 버전이 2개 이상 있는지 확인해 주세요.');
      setDiffModalOpen(false);
    } finally {
      setDiffLoading(false);
    }
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
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              padding: '2px 6px', 
              border: '1px solid var(--border)', 
              borderRadius: 'var(--r-sm)', 
              background: 'var(--bg-card)', 
              color: 'var(--fg-2)', 
              cursor: 'pointer', 
              marginRight: '6px' 
            }}
            title={isSidebarOpen ? '목차 숨기기' : '목차 보기'}
          >
            {isSidebarOpen ? '◀ 숨기기' : '▶ 목차 보기'}
          </button>
          <Link to="/courses" style={{ color: 'var(--fg-4)', textDecoration: 'none' }} className="hover-underline">과정 관리</Link>
          <ChevronRight size={13} />
          <Link to={`/courses/${courseId}`} style={{ color: 'var(--fg-4)', textDecoration: 'none' }} className="hover-underline">과정 상세</Link>
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
                backgroundColor: getScriptStatus(deliverable?.current_status).bg,
                color: getScriptStatus(deliverable?.current_status).fg
              }}>
                {getScriptStatus(deliverable?.current_status).label}
              </span>
            </div>
            <div style={{ fontSize: '12.5px', color: 'var(--fg-3)', marginTop: '5px' }}>
              최신 버전: {latestVer ? `v${latestVer.round_no}` : '제출 전'} · {latestVer ? new Date(latestVer.created_at).toLocaleDateString() : '최근 업데이트 없음'}
            </div>
          </div>

          {/* 역할 미리보기 전환 — 데모·점검용이므로 관리자에게만 보인다 */}
          {user?.global_role === 'ADMIN' && (
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
          )}

          {/* Action buttons per role */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button 
              onClick={handleOpenAiAnalysis}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 14px',
                borderRadius: 'var(--r-md)',
                background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
                color: '#fff',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(79, 70, 229, 0.3)'
              }}
            >
              <Sparkles size={16} /> ✨ AI 원고 분석
            </button>

            {viewRole === 'PLANNER' ? (
              <>
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
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <Flag size={16} /> 최종본 승인/확정
                </button>
              </>
            ) : (
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
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <Upload size={16} /> 새 버전 제출
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 3-Pane Body */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0, overflow: 'hidden' }}>
        
        {/* Left Pane: Chapters sidebar */}
        {isSidebarOpen && (
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
                    backgroundColor: getScriptStatus(resolveLessonStatus(ch)).dot
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
                      {getScriptStatus(resolveLessonStatus(ch)).label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

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
              <span style={{ flex: 1, fontSize: '14px', fontWeight: 700, color: 'var(--fg-1)' }}>원고 작성 가이드</span>
              {tabOpen.obj && !isEditingGuideline && viewRole === 'PLANNER' && (
                <button 
                  onClick={(e) => { e.stopPropagation(); setIsEditingGuideline(true); }}
                  style={{
                    marginRight: '8px',
                    fontSize: '12px',
                    color: 'var(--primary)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 700
                  }}
                >
                  수정
                </button>
              )}
              {tabOpen.obj ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
            </button>
            {tabOpen.obj && (
              <div style={{ padding: '2px 18px 18px 46px', fontSize: '13.5px', color: 'var(--fg-2)', lineHeight: 1.7 }}>
                {isEditingGuideline ? (
                  <div>
                    <textarea 
                      value={guidelineText}
                      onChange={(e) => setGuidelineText(e.target.value)}
                      rows={4}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid var(--border-strong)',
                        borderRadius: 'var(--r-md)',
                        fontSize: '13px',
                        fontFamily: 'inherit',
                        resize: 'vertical',
                        outline: 'none'
                      }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '8px' }}>
                      <button 
                        onClick={() => setIsEditingGuideline(false)}
                        style={{ padding: '6px 12px', border: '1px solid var(--border)', background: 'var(--bg-card)', borderRadius: 'var(--r-sm)', fontSize: '12px', cursor: 'pointer' }}
                      >
                        취소
                      </button>
                      <button 
                        onClick={() => {
                          setIsEditingGuideline(false);
                          // Here you would typically save to the backend
                        }}
                        style={{ padding: '6px 12px', border: 'none', background: 'var(--primary)', color: '#fff', borderRadius: 'var(--r-sm)', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                      >
                        저장
                      </button>
                    </div>
                  </div>
                ) : (
                  <ul style={{ margin: 0, paddingLeft: '18px' }}>
                    {guidelineText.split('\n').map((line, idx) => {
                      const trimmed = line.trim();
                      if (!trimmed) return null;
                      const content = trimmed.startsWith('-') ? trimmed.substring(1).trim() : trimmed;
                      return <li key={idx}>{content}</li>;
                    })}
                  </ul>
                )}
              </div>
            )}
          </div>
          
          {/* UX-303: Prototype Lock logic */}
          {(() => {
            const protoLesson = lessons.find(l => l.lesson_no === 1);
            const isProtoApproved = protoLesson?.deliverables?.find((d: any) => d.deliverable_type === 'SCRIPT')?.current_status === 'APPROVED';
            const isLocked = currentLesson?.lesson_no !== 1 && !isProtoApproved && viewRole === 'SME';
            
            return isLocked ? (
              <div style={{
                background: 'var(--bg-card)',
                border: '1.5px solid var(--border)',
                borderRadius: 'var(--r-lg)',
                padding: '24px',
                textAlign: 'center',
                marginBottom: '16px'
              }}>
                <LockIcon size={28} style={{ color: 'var(--fg-4)', margin: '0 auto 12px' }} />
                <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--fg-1)' }}>원고 제출이 잠겨있습니다.</div>
                <div style={{ fontSize: '13px', color: 'var(--fg-3)', marginTop: '6px' }}>
                  1차시(샘플 원고)가 최종 승인된 이후에 나머지 차시 원고를 제출할 수 있습니다.
                </div>
              </div>
            ) : (
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
              <span style={{ flex: 1, fontSize: '14px', fontWeight: 700, color: 'var(--fg-1)' }}>
                {viewRole === 'PLANNER' ? '검수본 업로드 폼 열기' : '새 원고 업로드 폼 열기'}
              </span>
              {tabOpen.upload ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
            </button>
              
              {tabOpen.upload && (
                <form onSubmit={handleUploadSubmit} style={{ padding: '18px' }}>
                  <FileDropzone
                    accept={['.docx', '.hwp', '.hwpx', '.pdf']}
                    onFileSelected={handleFileSelected}
                    progress={uploadProgress}
                    disabled={submittingFile && uploadProgress === null}
                    hint=".docx, .hwp, .hwpx, .pdf 형식을 지원합니다"
                    onInvalidFile={(msg) => toast.error('올릴 수 없는 파일 형식입니다', msg)}
                  />
                  {pendingFile && uploadProgress === null && (
                    <div style={{ marginTop: '8px' }}>
                      <SelectedFileChip file={pendingFile} onRemove={() => setPendingFile(null)} />
                    </div>
                  )}

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

                  <div style={{ marginTop: '16px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--fg-1)', marginBottom: '8px' }}>부속 자료 첨부 (선택)</div>
                    <div style={{ fontSize: '11.5px', color: 'var(--fg-4)', marginBottom: '10px' }}>
                      원고에 삽입된 이미지 원본이나 수업 결과물 사진(압축파일)을 첨부해주세요.
                    </div>
                    <label htmlFor="supplementary-file-upload" data-legacy-picker style={{
                      display: 'none',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 14px',
                      borderRadius: 'var(--r-md)',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-strong)',
                      cursor: 'pointer',
                      fontSize: '12.5px',
                      color: 'var(--fg-2)'
                    }}>
                      <Upload size={14} /> {supplementaryFile ? supplementaryFile.name : '파일 선택'}
                    </label>
                    <input 
                      type="file" 
                      id="supplementary-file-upload" 
                      onChange={(e) => setSupplementaryFile(e.target.files?.[0] || null)} 
                      style={{ display: 'none' }} 
                    />
                    {supplementaryFile ? (
                      <SelectedFileChip file={supplementaryFile} onRemove={() => setSupplementaryFile(null)} />
                    ) : (
                      <FileDropzone
                        accept={['.zip', '.png', '.jpg', '.jpeg', '.pdf']}
                        onFileSelected={setSupplementaryFile}
                        hint="이미지 원본이나 사진 묶음(.zip)을 끌어다 놓으세요"
                        onInvalidFile={(msg) => toast.error('올릴 수 없는 파일 형식입니다', msg)}
                      />
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
                    <button 
                      type="button"
                      onClick={() => toast.success('임시 저장했습니다', '작성 중인 링크와 메모는 자동으로 저장되며, 다시 들어와도 이어서 쓸 수 있습니다.')}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '9px 14px',
                        borderRadius: 'var(--r-md)',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-strong)',
                        color: 'var(--fg-2)',
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      💾 임시 저장
                    </button>
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
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      <Send size={15} /> 📤 최종 제출하기
                    </button>
                  </div>
                </form>
              )}
            </div>
            );
          })()}

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
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <Eye size={15} /> 본문 미리보기
                </button>
                <button 
                  onClick={handleOpenAiAnalysis}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '7px',
                    padding: '9px 14px',
                    border: 'none',
                    borderRadius: 'var(--r-md)',
                    background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
                    color: '#fff',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(79, 70, 229, 0.3)'
                  }}
                >
                  <Sparkles size={15} /> ✨ AI 원고 분석
                </button>
                {versions.length >= 2 && (
                  <button 
                    onClick={handleOpenDiffComparison}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '7px',
                      padding: '9px 14px',
                      border: '1px solid var(--border-strong)',
                      borderRadius: 'var(--r-md)',
                      backgroundColor: 'var(--bg-card)',
                      color: 'var(--fg-1)',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    <GitCompare size={15} /> 버전 비교 (Diff)
                  </button>
                )}
              </div>

              {/* 원고 본문 — 피드백을 보면서 함께 읽을 수 있도록 화면에 그대로 둔다 */}
              <div style={{ margin: '0 20px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--fg-1)' }}>
                    {currentLesson.lesson_no}차시 원고 본문
                  </span>
                  {focusedQuote && (
                    <button
                      type="button"
                      onClick={() => setFocusedQuote(null)}
                      style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--primary-hover)' }}
                    >
                      강조 해제
                    </button>
                  )}
                  <span style={{ marginLeft: 'auto', fontSize: '11.5px', color: 'var(--fg-4)' }}>
                    문장을 드래그하면 그 부분에 피드백을 남길 수 있습니다
                  </span>
                </div>

                {pendingQuote && (
                  <QuotePrompt
                    quote={pendingQuote.length > 60 ? `${pendingQuote.slice(0, 60)}…` : pendingQuote}
                    onUse={attachPendingQuote}
                    onDismiss={() => setPendingQuote(null)}
                  />
                )}

                <div style={{
                  maxHeight: '420px', overflowY: 'auto',
                  padding: '16px 18px',
                  backgroundColor: 'var(--bg-page)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)',
                }}>
                  <ScriptViewer
                    text={previewText}
                    loading={loadingPreview}
                    highlight={focusedQuote}
                    onSelectQuote={handleQuoteSelection}
                    fallback={
                      <p style={{ margin: 0, fontSize: '13px', color: 'var(--fg-3)', lineHeight: 1.9 }}>
                        이 버전은 본문 미리보기를 만들 수 없는 형식입니다. 위의 [바로가기]로 원본 파일을 열어 확인해 주세요.
                      </p>
                    }
                  />
                </div>
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
              <span style={{ flex: 1, fontSize: '14px', fontWeight: 700, color: 'var(--fg-1)' }}>이전 제출 히스토리 ({Math.max(0, versions.length - 1)}건)</span>
              {tabOpen.prev ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
            </button>
            {tabOpen.prev && (
              <div style={{ padding: '0 18px 8px' }}>
                {versions.slice(1).map((v) => (
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
                    <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--fg-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {v.storage_path}
                        </div>
                        <div style={{ fontSize: '11.5px', color: 'var(--fg-4)', marginTop: '2px' }}>
                          업로드: {v.uploader?.name || '강사'} · {new Date(v.created_at).toLocaleString()}
                        </div>
                      </div>
                      <a 
                        href={v.storage_path.startsWith('http') ? v.storage_path : `${API_BASE}${v.storage_path}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          border: '1px solid var(--border-strong)',
                          borderRadius: 'var(--r-sm)',
                          backgroundColor: 'var(--bg-card)',
                          color: 'var(--fg-2)',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          textDecoration: 'none',
                          flexShrink: 0
                        }}
                      >
                        <ExternalLink size={13} /> 다운로드
                      </a>
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
            <button
              onClick={() => setFilterUnresolvedOnly(!filterUnresolvedOnly)}
              style={{
                marginLeft: 'auto',
                fontSize: '11px',
                fontWeight: 700,
                color: filterUnresolvedOnly ? 'var(--primary-hover)' : 'var(--fg-3)',
                border: '1px solid ' + (filterUnresolvedOnly ? 'var(--primary)' : 'var(--border-strong)'),
                borderRadius: 'var(--r-pill)',
                padding: '3px 8px',
                background: filterUnresolvedOnly ? 'var(--primary-tint)' : 'var(--bg-card)',
                cursor: 'pointer'
              }}
            >
              {filterUnresolvedOnly ? '✓ 미반영만 보기' : '미반영만 보기'}
            </button>
          </div>

          {/* Feedback Messages List */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {displayedFeedbacks.length === 0 ? (
              <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--fg-4)', fontSize: '12.5px' }}>
                {filterUnresolvedOnly ? '미반영된 피드백이 없습니다. 모든 피드백이 완료되었습니다!' : '등록된 피드백이나 댓글이 없습니다.'}
              </div>
            ) : (
              displayedFeedbacks.map((f) => {
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
                      
                      {f.location_value && (
                        <button
                          type="button"
                          onClick={() => focusFeedbackQuote(f.location_value as string)}
                          title="원고에서 이 부분 보기"
                          style={{
                            display: 'flex', alignItems: 'center', gap: '6px', width: '100%',
                            marginTop: '6px', padding: '7px 10px',
                            borderLeft: '3px solid var(--warning)',
                            borderRadius: '0 var(--r-sm) var(--r-sm) 0',
                            backgroundColor: 'var(--warning-bg)',
                            textAlign: 'left',
                          }}
                        >
                          <Target size={12} strokeWidth={2.2} color="var(--warning-fg)" aria-hidden="true" style={{ flex: 'none' }} />
                          <span style={{ flex: 1, minWidth: 0, fontSize: '11.5px', color: 'var(--warning-fg)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            “{f.location_value}”
                          </span>
                          <span style={{ flex: 'none', fontSize: '11px', fontWeight: 800, color: 'var(--warning-fg)' }}>원고에서 보기</span>
                        </button>
                      )}

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

                        {/* 강사가 수정을 마쳤을 때 스스로 표시한다 */}
                        {viewRole === 'SME' && (f.status === 'OPEN' || f.status === 'REOPENED') && (
                          <button 
                            onClick={() => handleResolveFeedback(f.feedback_id)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '4px 10px',
                              borderRadius: '999px',
                              backgroundColor: 'var(--primary)',
                              color: '#fff',
                              fontSize: '11px',
                              fontWeight: 800,
                              border: 'none',
                              cursor: 'pointer',
                              boxShadow: '0 1px 2px rgba(79, 70, 229, 0.2)'
                            }}
                          >
                            <CheckCircle2 size={12} /> 반영 완료
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
            {attachedQuote && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px',
                padding: '8px 11px', borderLeft: '3px solid var(--warning)',
                borderRadius: '0 var(--r-sm) var(--r-sm) 0', backgroundColor: 'var(--warning-bg)',
              }}>
                <Target size={13} strokeWidth={2.2} color="var(--warning-fg)" aria-hidden="true" style={{ flex: 'none' }} />
                <span style={{ flex: 1, minWidth: 0, fontSize: '11.5px', fontWeight: 600, color: 'var(--warning-fg)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  “{attachedQuote}” 부분에 대한 피드백
                </span>
                <button
                  type="button"
                  onClick={() => { setAttachedQuote(null); setFocusedQuote(null); }}
                  aria-label="인용 해제"
                  style={{ flex: 'none', fontSize: '11px', fontWeight: 800, color: 'var(--warning-fg)' }}
                >
                  해제
                </button>
              </div>
            )}
            {feedbackRestored && (
              <div
                role="status"
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px',
                  padding: '8px 11px', borderRadius: 'var(--r-sm)',
                  backgroundColor: 'var(--info-bg)', color: 'var(--info-fg)', fontSize: '12px', fontWeight: 700,
                }}
              >
                <Clock size={13} strokeWidth={2.2} aria-hidden="true" />
                <span style={{ flex: 1 }}>작성 중이던 내용을 불러왔습니다.</span>
                <button
                  type="button"
                  onClick={ackFeedbackRestore}
                  style={{ color: 'inherit', fontSize: '12px', fontWeight: 700, textDecoration: 'underline' }}
                >
                  확인
                </button>
              </div>
            )}
            <div style={{ border: '1px solid var(--border-strong)', borderRadius: 'var(--r-md)', padding: '10px 12px', backgroundColor: 'var(--bg-card)' }}>
              <label htmlFor="feedback-input-area" style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
                {viewRole === 'PLANNER' ? '피드백 코멘트' : '기획자에게 보낼 의견'}
              </label>
              <textarea 
                id="feedback-input-area"
                placeholder={viewRole === 'PLANNER' ? '피드백 코멘트를 입력하세요...' : '기획자에게 답변이나 의견을 적어보세요...'} 
                rows={2} 
                value={feedbackInput}
                onChange={(e) => setFeedbackInput(e.target.value)}
                onKeyDown={(e) => {
                  // Ctrl(⌘) + Enter 로 바로 전송한다.
                  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                    e.preventDefault();
                    void submitFeedback();
                  }
                }}
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
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <span style={{ marginRight: 'auto', fontSize: '11.5px', color: 'var(--fg-4)' }}>
                  Ctrl + Enter 로 전송 · 작성 중인 내용은 자동 저장됩니다
                </span>
                <button 
                  type="submit"
                  disabled={submittingFeedback || !feedbackInput.trim()}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '7px 14px',
                    borderRadius: 'var(--r-sm)',
                    background: (submittingFeedback || !feedbackInput.trim()) ? 'var(--border-strong)' : 'var(--primary)',
                    color: '#fff',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: (submittingFeedback || !feedbackInput.trim()) ? 'not-allowed' : 'pointer'
                  }}
                >
                  <Send size={13} /> {submittingFeedback ? '전송 중…' : '전송'}
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
                <div style={{ fontSize: '14px', lineHeight: '1.95', color: 'var(--fg-2)', whiteSpace: 'pre-wrap' }}>
                  {loadingPreview ? (
                    <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--fg-3)' }}>
                      문서 본문을 실시간 추출하여 로딩 중입니다...
                    </div>
                  ) : previewText !== null ? (
                    <div 
                      onMouseUp={() => { const t = window.getSelection()?.toString().trim(); if (t && t.length > 2) handleQuoteSelection(t); }}
                      style={{ cursor: 'text' }}
                    >
                      {previewText}
                      <p style={{ margin: '20px 0 0', color: 'var(--fg-4)' }}>— 본문 미리보기 끝 — (문장을 드래그하여 바로 피드백을 남겨보세요)</p>
                    </div>
                  ) : (
                    <div
                      onMouseUp={() => { const t = window.getSelection()?.toString().trim(); if (t && t.length > 2) handleQuoteSelection(t); }}
                      style={{ cursor: 'text' }}
                    >
                      <p style={{ margin: '0 0 14px' }}><b>(도입 질문)</b> “여러분은 오늘 하루 어떤 수업을 설계하셨나요? 학교자율시간을 적극 활용해 본 수업 사례들을 기반으로 교육과정을 기획하고 배정해보겠습니다.”</p>
                      <p style={{ margin: '0 0 12px' }}><b>[핵심 개념]</b> 학교자율시간은 교육부가 시도 교육청과 각 학교에 재량권을 주어 자율적으로 신설하는 특화 수업 시수입니다.</p>
                      <p style={{ margin: '0 0 12px' }}>이 시간을 활용하여 인공지능, 예술융합, 디지털 리터러시 등 다양한 과목들을 연수 및 수업 설계로 확장할 수 있습니다.</p>
                      <p style={{ margin: 0, color: 'var(--fg-4)' }}>— 본문 미리보기 끝 — (문장을 드래그하여 바로 피드백을 남겨보세요)</p>
                    </div>
                  )}
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

      {/* AI Analysis Modal Overlay */}
      {aiModalOpen && (
        <div 
          onClick={() => setAiModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(17, 24, 39, 0.45)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '30px',
            zIndex: 60
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '760px',
              maxWidth: '100%',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: 'var(--bg-card)',
              borderRadius: 'var(--r-2xl)',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
              overflow: 'hidden'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '18px 24px', borderBottom: '1px solid var(--border)', background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)' }}>
              <span style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#4F46E5',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff'
              }}>
                <Sparkles size={20} />
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#312E81' }}>✨ AI 원고 자동 검수 & 요약 리포트</div>
                <div style={{ fontSize: '12px', color: '#4338CA' }}>v{latestVer?.round_no} 원고 실시간 AI 가독성 및 시간 측정 분석</div>
              </div>
              <button 
                onClick={() => setAiModalOpen(false)}
                style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#4338CA' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px', backgroundColor: '#F8FAFC' }}>
              {aiLoading ? (
                <div style={{ padding: '60px 0', textAlign: 'center', color: '#64748B' }}>
                  AI가 원고 본문의 발화 속도, 맞춤법, 어조 및 요약문을 분석 중입니다...
                </div>
              ) : aiData ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  {/* Top Stats Cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <Clock size={28} style={{ color: '#4F46E5' }} />
                      <div>
                        <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>예상 강의 소요 시간</div>
                        <div style={{ fontSize: '20px', fontWeight: 800, color: '#1E293B', marginTop: '2px' }}>
                          {aiData.estimated_time}
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#94A3B8', marginTop: '2px' }}>
                          총 {aiData.char_count?.toLocaleString()}자 (공백 제외 {aiData.char_count_no_space?.toLocaleString()}자)
                        </div>
                      </div>
                    </div>

                    <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <CheckCircle2 size={28} style={{ color: '#10B981' }} />
                      <div>
                        <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>원고 품질 정합성 점수</div>
                        <div style={{ fontSize: '20px', fontWeight: 800, color: '#047857', marginTop: '2px' }}>
                          {aiData.overall_score}점 <span style={{ fontSize: '13px', fontWeight: 500, color: '#94A3B8' }}>/ 100점</span>
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#94A3B8', marginTop: '2px' }}>
                          연수원 표준 원고 가이드 충족
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 3-Line Summary Card */}
                  <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '20px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#1E293B', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FileText size={16} style={{ color: '#4F46E5' }} /> AI 3줄 핵심 요약
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {aiData.summary?.map((line: string, idx: number) => (
                        <div key={idx} style={{ display: 'flex', gap: '8px', fontSize: '13px', color: '#334155', lineHeight: '1.6' }}>
                          <span style={{ color: '#4F46E5', fontWeight: 800 }}>•</span>
                          <span>{line}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Proofreading & Recommendations */}
                  <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '20px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#1E293B', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <AlertCircle size={16} style={{ color: '#F59E0B' }} /> AI 맞춤법 & 문체 교정 리포트
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {aiData.proofread_points?.map((pt: any, idx: number) => (
                        <div key={idx} style={{ padding: '12px 14px', background: '#F8FAFC', borderRadius: '8px', borderLeft: `4px solid ${pt.type === 'sentence_length' ? '#EF4444' : pt.type === 'tone' ? '#F59E0B' : '#10B981'}` }}>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: '#1E293B' }}>{pt.title}</div>
                          <div style={{ fontSize: '12.5px', color: '#475569', marginTop: '4px', lineHeight: 1.5 }}>{pt.description}</div>
                          {pt.suggestion && (
                            <div style={{ fontSize: '12px', color: '#4F46E5', marginTop: '6px', fontWeight: 600, background: '#EEF2FF', padding: '6px 10px', borderRadius: '6px' }}>
                              💡 {pt.suggestion}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            <div style={{ padding: '14px 24px', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setAiModalOpen(false)}
                style={{ padding: '8px 18px', borderRadius: '8px', background: '#1E293B', color: '#fff', fontWeight: 700, fontSize: '13px', border: 'none', cursor: 'pointer' }}
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Diff Viewer Modal Overlay */}
      {diffModalOpen && (
        <div 
          onClick={() => setDiffModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(17, 24, 39, 0.45)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '30px',
            zIndex: 60
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '840px',
              maxWidth: '100%',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: 'var(--bg-card)',
              borderRadius: 'var(--r-2xl)',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
              overflow: 'hidden'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '18px 24px', borderBottom: '1px solid var(--border)', background: '#F8FAFC' }}>
              <GitCompare size={20} style={{ color: 'var(--primary)' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--fg-1)' }}>
                  🔍 원고 버전 변경점 대조 (v{diffData?.v1?.round_no || 1} ↔ v{diffData?.v2?.round_no || 2})
                </div>
                <div style={{ fontSize: '12px', color: 'var(--fg-3)' }}>
                  이전 버전 대비 신규 수정/추가된 문장을 대조합니다.
                </div>
              </div>
              <button 
                onClick={() => setDiffModalOpen(false)}
                style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--fg-3)' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', fontFamily: 'monospace', fontSize: '13px', lineHeight: '1.7', backgroundColor: '#0F172A', color: '#E2E8F0' }}>
              {diffLoading ? (
                <div style={{ padding: '60px 0', textAlign: 'center', color: '#94A3B8' }}>
                  두 버전 간의 차이점(Diff)을 파싱하여 비교 중입니다...
                </div>
              ) : diffData?.diff ? (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {diffData.diff.map((line: any, idx: number) => {
                    const isAdded = line.type === 'added';
                    const isRemoved = line.type === 'removed';
                    return (
                      <div 
                        key={idx}
                        style={{
                          display: 'flex',
                          padding: '2px 8px',
                          backgroundColor: isAdded ? 'rgba(16, 185, 129, 0.2)' : isRemoved ? 'rgba(239, 68, 68, 0.2)' : 'transparent',
                          color: isAdded ? '#34D399' : isRemoved ? '#F87171' : '#CBD5E1',
                          borderLeft: `3px solid ${isAdded ? '#10B981' : isRemoved ? '#EF4444' : 'transparent'}`
                        }}
                      >
                        <span style={{ width: '40px', color: '#64748B', userSelect: 'none', flexShrink: 0 }}>
                          {line.line_no_v1 || ''}
                        </span>
                        <span style={{ width: '40px', color: '#64748B', userSelect: 'none', flexShrink: 0 }}>
                          {line.line_no_v2 || ''}
                        </span>
                        <span style={{ width: '20px', fontWeight: 800, userSelect: 'none', flexShrink: 0 }}>
                          {isAdded ? '+' : isRemoved ? '-' : ' '}
                        </span>
                        <span style={{ textDecoration: isRemoved ? 'line-through' : 'none', flex: 1, whiteSpace: 'pre-wrap' }}>
                          {line.text}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>

            <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' }}>
              <div style={{ display: 'flex', gap: '16px', fontSize: '12px' }}>
                <span style={{ color: '#059669', fontWeight: 700 }}>+ 추가된 문장</span>
                <span style={{ color: '#DC2626', fontWeight: 700 }}>- 삭제된 문장</span>
              </div>
              <button 
                onClick={() => setDiffModalOpen(false)}
                style={{ padding: '8px 18px', borderRadius: '8px', background: '#1E293B', color: '#fff', fontWeight: 700, fontSize: '13px', border: 'none', cursor: 'pointer' }}
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UX-201: Submit Confirm Modal */}
      {isSubmitConfirmOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'var(--bg-card)',
            padding: '24px 32px',
            borderRadius: 'var(--r-lg)',
            width: '400px',
            boxShadow: 'var(--shadow-xl)'
          }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '18px', color: 'var(--fg-1)' }}>원고 제출 확인</h3>
            <p style={{ margin: '0 0 24px', fontSize: '14px', color: 'var(--fg-2)', lineHeight: '1.5' }}>
              제출 후에는 기획자가 반려하기 전까지 원고를 직접 수정할 수 없습니다.<br/>
              <span style={{ fontWeight: 700, color: 'var(--primary)' }}>정말로 제출하시겠습니까?</span>
            </p>
            <div style={{ marginBottom: '24px', padding: '12px 16px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px' }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={isCopyrightChecked}
                  onChange={(e) => setIsCopyrightChecked(e.target.checked)}
                  style={{ marginTop: '2px' }}
                />
                <span style={{ fontSize: '12.5px', color: '#334155', lineHeight: '1.4' }}>
                  <b style={{ display: 'block', marginBottom: '4px', color: 'var(--fg-1)' }}>저작권·초상권을 확인했습니다 (필수)</b>
                  원고와 부속 자료에 들어간 타인의 이미지·영상·글에 대해 사용 허가를 받았으며, 문제가 생기면 제출자에게 책임이 있음에 동의합니다.
                </span>
              </label>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button 
                onClick={() => {
                  setIsSubmitConfirmOpen(false);
                  setIsCopyrightChecked(false);
                  setPendingSubmitType(null);
                  setPendingFile(null);
                }}
                style={{ padding: '10px 16px', border: '1px solid var(--border)', background: 'var(--bg-card)', borderRadius: 'var(--r-md)', cursor: 'pointer' }}
              >
                취소
              </button>
              <button 
                onClick={executeSubmit}
                disabled={!isCopyrightChecked}
                style={{ padding: '10px 16px', border: 'none', background: isCopyrightChecked ? 'var(--primary)' : 'var(--fg-4)', color: '#fff', borderRadius: 'var(--r-md)', cursor: isCopyrightChecked ? 'pointer' : 'not-allowed', fontWeight: 700 }}
              >
                확인 및 제출
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ScriptManage;
