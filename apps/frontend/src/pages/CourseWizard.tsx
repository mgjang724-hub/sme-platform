import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Layers, 
  Download, 
  Plus, 
  X, 
  Calendar,
  Sliders,
  GraduationCap,
  Users
} from 'lucide-react';

interface Chapter {
  lesson_no: number;
  title: string;
  lessonCode: string;
  smeName: string; // display helper
}

const CourseWizard: React.FC = () => {
  const { apiFetch } = useAuth();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(0);
  const [courseName, setCourseName] = useState('');
  const [devType, setDevType] = useState('실습형');
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
      courseCode: `CRS-${Date.now().toString().slice(-6)}`,
      vendor: 'i-Scream 원격교육연수원',
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
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          
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
          <div style={{
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

                  <div>
                    <label style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--fg-3)', marginBottom: '6px', display: 'block' }}>교육 유형</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                      {[
                        { id: '실습형', label: '실습형', desc: '학습자가 직접 따라 하는 실습 중심', icon: Sliders },
                        { id: '강의형', label: '강의형', desc: '강사 설명 중심의 정통 강의', icon: GraduationCap },
                        { id: '청중형', label: '청중형', desc: '사례·토론·역할극 등 참여 유도', icon: Users },
                      ].map((t) => {
                        const active = devType === t.id;
                        return (
                          <button
                            type="button"
                            key={t.id}
                            onClick={() => setDevType(t.id)}
                            style={{
                              textAlign: 'left',
                              cursor: 'pointer',
                              padding: '16px',
                              borderRadius: 'var(--r-lg)',
                              border: `1.5px solid ${active ? 'var(--primary)' : 'var(--border)'}`,
                              background: active ? 'var(--primary-tint-2)' : 'var(--bg-card)',
                              transition: 'border-color 0.12s, background 0.12s'
                            }}
                          >
                            <span style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: 'var(--r-md)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: active ? 'var(--primary)' : 'var(--bg-sunken)',
                              color: active ? '#fff' : 'var(--fg-3)'
                            }}>
                              <t.icon size={19} />
                            </span>
                            <div style={{ fontSize: '14px', fontWeight: 700, marginTop: '10px', color: 'var(--fg-1)' }}>{t.label}</div>
                            <div style={{ fontSize: '11.5px', color: 'var(--fg-3)', marginTop: '3px', lineHeight: 1.5 }}>{t.desc}</div>
                          </button>
                        );
                      })}
                    </div>
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
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '16px 18px',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--r-lg)',
                  backgroundColor: 'var(--bg-page)',
                  marginBottom: '18px'
                }}>
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
                    <div style={{ fontSize: '13.5px', fontWeight: 700 }}>차시 대량 생성/업로드</div>
                    <div style={{ fontSize: '12px', color: 'var(--fg-3)', marginTop: '2px' }}>엑셀 템플릿 양식을 이용해 한번에 입력할 수 있습니다.</div>
                  </div>
                  <button type="button" style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '7px',
                    padding: '9px 14px',
                    border: '1px solid var(--border-strong)',
                    borderRadius: 'var(--r-md)',
                    backgroundColor: 'var(--bg-card)',
                    fontSize: '13px',
                    fontWeight: 700
                  }}>
                    <Download size={15} /> 템플릿
                  </button>
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

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', gap: '12px', fontSize: '11.5px', fontWeight: 700, color: 'var(--fg-4)', padding: '0 4px' }}>
                    <span style={{ flex: 1 }}>차시</span>
                    <span style={{ width: '240px' }}>SME 강사 지정</span>
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
