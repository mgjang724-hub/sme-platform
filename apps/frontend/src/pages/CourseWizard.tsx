import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUi } from '../context/UiContext';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Layers, 
  Plus, 
  X, 
  Calendar
} from 'lucide-react';

interface Chapter {
  lesson_no: number;
  title: string;
  lessonCode: string;
  smeName: string; // display helper
}

const CourseWizard: React.FC = () => {
  const { apiFetch } = useAuth();
  const { toast } = useUi();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(0);
  const [courseName, setCourseName] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [devType, setDevType] = useState('신규 개발');
  const [vendor, setVendor] = useState('i-Scream 원격교육연수원');
  const [overview, setOverview] = useState('');
  
  // Milestones dates
  const [kickoffDate, setKickoffDate] = useState('2026-07-01');
  const [scriptDeadline, setScriptDeadline] = useState('2026-07-20');
  const [reviewDate, setReviewDate] = useState('2026-07-23');
  const [confirmDate, setConfirmDate] = useState('2026-07-25');
  const [shootDate, setShootDate] = useState('2026-07-28');

  // Chapters list
  const [chapters, setChapters] = useState<Chapter[]>([
    { lesson_no: 1, title: '오프닝 — 과정 소개', lessonCode: 'LSN-001', smeName: '홍길동 강사' },
    { lesson_no: 2, title: '기초 개념 확립', lessonCode: 'LSN-002', smeName: '홍길동 강사' },
    { lesson_no: 3, title: '심화 사례 연구', lessonCode: 'LSN-003', smeName: '홍길동 강사' },
    { lesson_no: 4, title: '종합 질의응답 및 퀴즈', lessonCode: 'LSN-004', smeName: '홍길동 강사' },
  ]);

  const [bulkInputOpen, setBulkInputOpen] = useState(false);
  const [bulkText, setBulkText] = useState('');

  // UX-601: Invite SME states
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitedSmes, setInvitedSmes] = useState<string[]>([]);

  const handleBulkParse = () => {
    if (!bulkText.trim()) return;
    const lines = bulkText.split('\n').filter(l => l.trim() !== '');
    const newChapters = lines.map((line, i) => {
      const lesson_no = i + 1;
      const lessonCode = `LSN-${String(lesson_no).padStart(3, '0')}`;
      // Basic sanitization to remove numbers like "1. ", "1차시 ", etc. at the start
      const cleanTitle = line.replace(/^(\d+[\.차시\s]+)+/, '').trim();
      return {
        lesson_no,
        title: cleanTitle || `차시 ${lesson_no}`,
        lessonCode,
        smeName: '홍길동 강사'
      };
    });
    setChapters(newChapters);
    setBulkText('');
    setBulkInputOpen(false);
  };

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddChapter = () => {
    const nextNo = chapters.length + 1;
    const nextNoPad = String(nextNo).padStart(3, '0');
    setChapters([
      ...chapters,
      { 
        lesson_no: nextNo, 
        title: '', 
        lessonCode: `LSN-${nextNoPad}`, 
        smeName: '홍길동 강사' 
      }
    ]);
  };

  const handleRemoveChapter = (index: number) => {
    if (chapters.length <= 1) return;
    const updated = chapters.filter((_, i) => i !== index).map((chap, i) => ({
      ...chap,
      lesson_no: i + 1,
      lessonCode: `LSN-${String(i + 1).padStart(3, '0')}`
    }));
    setChapters(updated);
  };

  const handleEditTitle = (index: number, val: string) => {
    const updated = [...chapters];
    updated[index].title = val;
    setChapters(updated);
  };

  const handleEditSme = (index: number, val: string) => {
    const updated = [...chapters];
    updated[index].smeName = val;
    setChapters(updated);
  };

  const handleSubmit = async () => {
    setError(null);
    setSubmitting(true);

    const milestones = {
      kickoff: kickoffDate,
      script_deadline: scriptDeadline,
      review_complete: reviewDate,
      confirm_complete: confirmDate,
      shoot: shootDate,
    };

    const payload = {
      course_name: courseName || '새 과정',
      courseCode: courseCode || `CRS-${Date.now().toString().slice(-6)}`,
      vendor: vendor || 'i-Scream 원격교육연수원',
      dev_type: devType,
      overview,
      milestones,
      lessons: chapters.map(c => ({
        lesson_no: c.lesson_no,
        title: c.title || `${c.lesson_no}차시 강의`,
        lessonCode: c.lessonCode,
      }))
    };

    try {
      await apiFetch('/courses', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      navigate('/courses');
    } catch (err: any) {
      setError(err.message || '과정을 생성하는 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const labels = ['기본 정보', '일정 · 마일스톤', '차시 구성', '담당자 배정'];

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{
        height: '66px',
        padding: '0 32px',
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        flexShrink: 0
      }}>
        <button 
          onClick={() => navigate('/courses')}
          style={{
            width: '36px',
            height: '36px',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-md)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--fg-3)',
            boxShadow: 'var(--shadow-xs)'
          }}
        >
          <ArrowLeft size={17} />
        </button>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700 }}>새 과정 만들기</div>
      </header>

      {/* Main Wizard Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px 40px' }}>
        <div style={{ maxWidth: 'min(760px, 100%)', margin: '0 auto' }}>
          
          {/* Stepper progress */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '26px' }}>
            {labels.map((label, i) => {
              const done = i < step;
              const cur = i === step;
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i === labels.length - 1 ? 'none' : 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                    <div style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '50%',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '13px',
                      fontWeight: 800,
                      background: done ? 'var(--success)' : cur ? 'var(--primary)' : 'var(--bg-card)',
                      color: done || cur ? '#fff' : 'var(--fg-4)',
                      border: `2px solid ${done ? 'var(--success)' : cur ? 'var(--primary)' : 'var(--border-strong)'}`
                    }}>
                      {done ? <Check size={14} /> : i + 1}
                    </div>
                    <span style={{
                      fontSize: '13px',
                      fontWeight: cur ? 700 : 500,
                      color: cur ? 'var(--fg-1)' : done ? 'var(--fg-2)' : 'var(--fg-4)',
                      whiteSpace: 'nowrap'
                    }}>
                      {label}
                    </span>
                  </div>
                  {i < labels.length - 1 && (
                    <div style={{
                      flex: 1,
                      height: '2px',
                      margin: '0 12px',
                      background: done ? 'var(--success)' : 'var(--border-strong)'
                    }}></div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Form Card */}
          <div className="page-pad" style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-xl)',
            boxShadow: 'var(--shadow-md)',
            padding: '28px 30px'
          }}>
            {error && (
              <div style={{
                marginBottom: '20px',
                padding: '10px 12px',
                backgroundColor: 'var(--error-bg)',
                color: 'var(--error-fg)',
                borderRadius: 'var(--r-sm)',
                fontSize: '13px',
                border: '1px solid var(--error)'
              }}>
                {error}
              </div>
            )}

            {/* STEP 1: Basic Info */}
            {step === 0 && (
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>기본 정보</div>
                <div style={{ fontSize: '13px', color: 'var(--fg-3)', marginBottom: '22px' }}>과정명과 차시 수, 진행 유형을 정하세요.</div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                  <div>
                    <label style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--fg-3)', marginBottom: '6px', display: 'block' }}>과정명</label>
                    <input 
                      type="text" 
                      value={courseName}
                      onChange={(e) => setCourseName(e.target.value)}
                      placeholder="예: 학교자율시간 교육과정 개발 실무"
                      style={{
                        width: '100%',
                        height: '42px',
                        padding: '0 12px',
                        border: '1px solid var(--border-strong)',
                        borderRadius: 'var(--r-md)',
                        fontSize: '13.5px',
                        outline: 'none',
                        background: 'var(--bg-card)'
                      }}
                    />
                  </div>

                  <div className="rgrid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--fg-3)', marginBottom: '6px', display: 'block' }}>과정 코드</label>
                      <input 
                        type="text" 
                        value={courseCode}
                        onChange={(e) => setCourseCode(e.target.value)}
                        placeholder={`예: CRS-${Date.now().toString().slice(-6)}`}
                        style={{ width: '100%', height: '42px', padding: '0 12px', border: '1px solid var(--border-strong)', borderRadius: 'var(--r-md)', fontSize: '13.5px', outline: 'none', background: 'var(--bg-card)' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--fg-3)', marginBottom: '6px', display: 'block' }}>개발 유형</label>
                      <select 
                        value={devType} 
                        onChange={(e) => setDevType(e.target.value)}
                        style={{ width: '100%', height: '42px', padding: '0 12px', border: '1px solid var(--border-strong)', borderRadius: 'var(--r-md)', fontSize: '13.5px', outline: 'none', background: 'var(--bg-card)' }}
                      >
                        <option value="신규 개발">신규 개발</option>
                        <option value="개정 개발">개정 개발</option>
                        <option value="원고 검수">원고 검수</option>
                        <option value="자사">자사</option>
                        <option value="공동개발">공동개발</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--fg-3)', marginBottom: '6px', display: 'block' }}>위탁 / 개발사</label>
                    <input 
                      type="text" 
                      value={vendor}
                      onChange={(e) => setVendor(e.target.value)}
                      placeholder="예: AX 교육기술연구소"
                      style={{ width: '100%', height: '42px', padding: '0 12px', border: '1px solid var(--border-strong)', borderRadius: 'var(--r-md)', fontSize: '13.5px', outline: 'none', background: 'var(--bg-card)' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--fg-3)', marginBottom: '6px', display: 'block' }}>과정 설명</label>
                    <textarea 
                      rows={3} 
                      value={overview}
                      onChange={(e) => setOverview(e.target.value)}
                      placeholder="학습 대상, 목표를 간단히 적어주세요"
                      style={{
                        width: '100%',
                        padding: '11px 12px',
                        border: '1px solid var(--border-strong)',
                        borderRadius: 'var(--r-md)',
                        fontSize: '13.5px',
                        resize: 'vertical',
                        outline: 'none',
                        background: 'var(--bg-card)'
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Timeline Milestones */}
            {step === 1 && (
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>일정 · 마일스톤</div>
                <div style={{ fontSize: '13px', color: 'var(--fg-3)', marginBottom: '22px' }}>원고 작성부터 촬영까지의 주요 일정을 정하세요.</div>
                
                <div className="rgrid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {[
                    { label: '킥오프', val: kickoffDate, setter: setKickoffDate, color: 'var(--stage-plan-fg)' },
                    { label: '원고 제출 마감', val: scriptDeadline, setter: setScriptDeadline, color: 'var(--stage-script-fg)' },
                    { label: '검수 완료', val: reviewDate, setter: setReviewDate, color: 'var(--stage-qa-fg)' },
                    { label: '최종 확정', val: confirmDate, setter: setConfirmDate, color: 'var(--stage-done-fg)' },
                    { label: '촬영 예정일', val: shootDate, setter: setShootDate, color: 'var(--stage-film-fg)' },
                  ].map((m, idx) => (
                    <div key={idx}>
                      <label style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--fg-3)', marginBottom: '6px', display: 'block' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ width: '9px', height: '9px', borderRadius: '3px', background: m.color }}></span>
                          {m.label}
                        </span>
                      </label>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        height: '42px',
                        padding: '0 12px',
                        border: '1px solid var(--border-strong)',
                        borderRadius: 'var(--r-md)',
                        background: 'var(--bg-card)'
                      }}>
                        <Calendar size={16} style={{ color: 'var(--fg-4)' }} />
                        <input 
                          type="date"
                          value={m.val} 
                          onChange={(e) => m.setter(e.target.value)}
                          style={{
                            flex: 1,
                            border: 'none',
                            outline: 'none',
                            background: 'none',
                            fontSize: '13.5px'
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 3: Lessons Layout */}
            {step === 2 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '4px' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700 }}>차시 구성</div>
                  <span style={{ fontSize: '13px', color: 'var(--fg-4)', fontWeight: 600 }}>총 {chapters.length}차시</span>
                </div>
                <div style={{ fontSize: '13px', color: 'var(--fg-3)', marginBottom: '20px' }}>차시명을 정하세요. 각 차시마다 SCRIPT 슬롯이 1개씩 생성돼요.</div>

                <div style={{
                  padding: '16px 18px',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--r-lg)',
                  backgroundColor: 'var(--bg-page)',
                  marginBottom: '18px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <span style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: 'var(--r-md)',
                      backgroundColor: 'var(--stage-done-bg)',
                      color: 'var(--stage-done-fg)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Layers size={20} />
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13.5px', fontWeight: 700 }}>차시 대량 텍스트 생성</div>
                      <div style={{ fontSize: '12px', color: 'var(--fg-3)', marginTop: '2px' }}>줄바꿈 단위로 수십 개의 차시를 한번에 생성할 수 있습니다.</div>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setBulkInputOpen(!bulkInputOpen)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '7px',
                        padding: '9px 14px',
                        border: '1px solid var(--border-strong)',
                        borderRadius: 'var(--r-md)',
                        backgroundColor: bulkInputOpen ? 'var(--primary-tint)' : 'var(--bg-card)',
                        color: bulkInputOpen ? 'var(--primary-hover)' : 'var(--fg-2)',
                        fontSize: '13px',
                        fontWeight: 700
                      }}>
                      <Plus size={15} /> 텍스트 붙여넣기
                    </button>
                  </div>
                  
                  {bulkInputOpen && (
                    <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                      <textarea
                        value={bulkText}
                        onChange={(e) => setBulkText(e.target.value)}
                        placeholder="예:&#10;1차시 오프닝 - 과정 소개&#10;2차시 기초 개념 확립&#10;3차시 실무 적용 사례&#10;..."
                        style={{
                          width: '100%',
                          height: '140px',
                          padding: '14px',
                          border: '1px solid var(--border-strong)',
                          borderRadius: 'var(--r-md)',
                          backgroundColor: 'var(--bg-card)',
                          fontSize: '13px',
                          outline: 'none',
                          resize: 'none',
                          lineHeight: '1.6'
                        }}
                      />
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                        <button
                          type="button"
                          onClick={handleBulkParse}
                          style={{
                            padding: '9px 20px',
                            backgroundColor: 'var(--primary)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 'var(--r-md)',
                            fontSize: '13px',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          차시 일괄 생성 적용
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {chapters.map((c, i) => (
                    <div 
                      key={i} 
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '8px 14px',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--r-md)',
                        backgroundColor: 'var(--bg-card)'
                      }}
                    >
                      <span style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: 'var(--r-sm)',
                        backgroundColor: 'var(--primary-tint)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 800,
                        color: 'var(--primary-hover)'
                      }}>{c.lesson_no}</span>
                      <input 
                        type="text"
                        value={c.title} 
                        onChange={(e) => handleEditTitle(i, e.target.value)}
                        placeholder={`${c.lesson_no}차시 제목`} 
                        style={{
                          flex: 1,
                          border: 'none',
                          outline: 'none',
                          background: 'none',
                          fontSize: '13.5px',
                          fontWeight: 600
                        }}
                      />
                      <button 
                        type="button"
                        onClick={() => handleRemoveChapter(i)} 
                        style={{
                          width: '28px',
                          height: '28px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--fg-4)'
                        }}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}

                  <button 
                    type="button"
                    onClick={handleAddChapter}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '7px',
                      alignSelf: 'flex-start',
                      padding: '9px 14px',
                      border: '1px dashed var(--border-strong)',
                      borderRadius: 'var(--r-md)',
                      background: 'none',
                      color: 'var(--fg-3)',
                      fontSize: '13px',
                      fontWeight: 700
                    }}
                  >
                    <Plus size={15} /> 차시 추가
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: Assignment */}
            {step === 3 && (
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>담당자 배정</div>
                <div style={{ fontSize: '13px', color: 'var(--fg-3)', marginBottom: '20px' }}>검수 담당 기획자와 차시별 강사(SME)를 지정하세요.</div>
                
                <div style={{ marginBottom: '22px' }}>
                  <label style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--fg-3)', marginBottom: '6px', display: 'block' }}>검수 담당 기획자</label>
                  <select style={{
                    width: '280px',
                    height: '42px',
                    padding: '0 12px',
                    border: '1px solid var(--border-strong)',
                    borderRadius: 'var(--r-md)',
                    fontSize: '13.5px',
                    outline: 'none',
                    background: 'var(--bg-card)'
                  }}>
                    <option>김기획 기획자 (나)</option>
                    <option>최관리 어드민</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                    <div style={{ display: 'flex', gap: '12px', fontSize: '11.5px', fontWeight: 700, color: 'var(--fg-4)', padding: '0 4px', flex: 1 }}>
                      <span style={{ flex: 1 }}>차시</span>
                      <span style={{ width: '240px' }}>SME 강사 지정</span>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <input 
                        type="email" 
                        placeholder="초대할 강사 이메일" 
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        style={{
                          width: '180px',
                          height: '32px',
                          padding: '0 10px',
                          border: '1px solid var(--border-strong)',
                          borderRadius: 'var(--r-md)',
                          fontSize: '12.5px',
                          outline: 'none',
                          background: 'var(--bg-card)'
                        }}
                      />
                      <button
                        onClick={() => {
                          const newEmail = inviteEmail.trim();
                          if (!newEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
                            toast.error('이메일 주소를 확인해 주세요', 'name@example.com 형식으로 입력해 주세요.');
                            return;
                          }
                          if (invitedSmes.includes(newEmail)) {
                            toast.info('이미 초대 목록에 있는 강사입니다.', newEmail);
                            setInviteEmail('');
                            return;
                          }
                          setInvitedSmes([...invitedSmes, newEmail]);
                          toast.success('초대 메일을 보냈습니다', `${newEmail} 님이 수락하면 과정에 참여합니다.`);
                          setInviteEmail('');
                        }}
                        style={{
                          padding: '0 12px',
                          height: '32px',
                          border: 'none',
                          borderRadius: 'var(--r-md)',
                          background: 'var(--primary)',
                          color: '#fff',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        초대 발송
                      </button>
                    </div>
                  </div>
                  {chapters.map((c, i) => (
                    <div 
                      key={i} 
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '10px 14px',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--r-md)'
                      }}
                    >
                      <span style={{ flex: 1, minWidth: 0, fontSize: '13.5px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {c.lesson_no}차시 — {c.title || '강의 제목 없음'}
                      </span>
                      <select 
                        value={c.smeName}
                        onChange={(e) => handleEditSme(i, e.target.value)}
                        style={{
                          width: '240px',
                          height: '38px',
                          padding: '0 12px',
                          border: '1px solid var(--border-strong)',
                          borderRadius: 'var(--r-md)',
                          fontSize: '13.5px',
                          outline: 'none',
                          background: 'var(--bg-card)'
                        }}
                      >
                        <option value="홍길동 강사">홍길동 강사 (sme@test.com)</option>
                        {invitedSmes.map((email, idx) => (
                          <option key={`inv-${idx}`} value={email}>{email} (초대됨)</option>
                        ))}
                        <option value="미배정">미배정 (나중에 지정)</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stepper Navigation */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '26px',
              padding: '20px 0 0',
              borderTop: '1px solid var(--border)'
            }}>
              <button
                type="button"
                onClick={() => setStep(Math.max(0, step - 1))}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 16px',
                  border: '1px solid var(--border-strong)',
                  borderRadius: 'var(--r-md)',
                  backgroundColor: 'var(--bg-card)',
                  color: 'var(--fg-2)',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  visibility: step === 0 ? 'hidden' : 'visible'
                }}
              >
                <ArrowLeft size={15} /> 이전
              </button>
              
              <span style={{ fontSize: '12.5px', color: 'var(--fg-4)' }}>{step + 1} / 4 단계</span>

              {step < 3 ? (
                <button
                  type="button"
                  onClick={() => setStep(Math.min(3, step + 1))}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '10px 18px',
                    borderRadius: 'var(--r-md)',
                    backgroundColor: 'var(--primary)',
                    color: '#fff',
                    fontSize: '13.5px',
                    fontWeight: 700
                  }}
                >
                  다음 <ArrowRight size={15} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '10px 18px',
                    borderRadius: 'var(--r-md)',
                    backgroundColor: 'var(--success)',
                    color: '#fff',
                    fontSize: '13.5px',
                    fontWeight: 700,
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    opacity: submitting ? 0.7 : 1
                  }}
                >
                  과정 만들기 <Check size={16} />
                </button>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseWizard;
