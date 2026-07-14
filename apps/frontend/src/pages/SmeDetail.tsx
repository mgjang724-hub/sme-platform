import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronRight, 
  Mail, 
  Phone, 
  Calendar as CalendarIcon, 
  Clapperboard, 
  Layers, 
  CheckCircle, 
  Clock, 
  Flag,
  FileText,
  MessageSquare,
  Upload,
  CornerDownRight
} from 'lucide-react';

const SmeDetail: React.FC = () => {
  const navigate = useNavigate();

  const courses = [
    { category: '법정의무교육', title: '직장 내 괴롭힘 예방', status: 'progress', statusLabel: '진행중', chapters: '1·3·5차시', pct: 60, pctW: '60%', barColor: 'var(--primary)', due: '7.20' },
    { category: '법정의무교육', title: '장애인 인식개선', status: 'done', statusLabel: '완료', chapters: '4차시', pct: 100, pctW: '100%', barColor: 'var(--success)', due: '확정 완료' },
  ];

  const stats = [
    { icon: Layers, label: '배정 차시', value: '3', unit: '차시', sub: '1·3·5차시', fg: 'var(--fg-3)' },
    { icon: CheckCircle, label: '확정 완료', value: '1', unit: '차시', sub: '1차시 최종확정', fg: 'var(--success-fg)' },
    { icon: Clock, label: '평균 응답', value: '4', unit: '시간', sub: '피드백 회신 속도', fg: 'var(--info-fg)' },
    { icon: Flag, label: '마감 준수율', value: '92', unit: '%', sub: '최근 3개월', fg: 'var(--primary-hover)' },
  ];

  const scripts = [
    { title: '1차시 — 오프닝 스크립트', meta: 'v2 · 이서연 제출', status: '승인완료', due: '확정 완료', dueColor: 'var(--success-fg)', bg: 'var(--success-bg)', fg: 'var(--success-fg)' },
    { title: '3차시 — 역할극 시나리오', meta: 'v2 · 미반영 피드백 1', status: '수정요청', due: '오늘 마감', dueColor: 'var(--error-fg)', bg: 'var(--error-bg)', fg: 'var(--error-fg)' },
    { title: '5차시 — 사례 분석 2', meta: 'v1 · 검수 대기', status: '검수중', due: '7.16 (목)', dueColor: 'var(--fg-2)', bg: 'var(--info-bg)', fg: 'var(--info-fg)' },
  ];

  const activity = [
    { icon: Upload, iconBg: 'var(--primary-tint)', iconFg: 'var(--primary-hover)', text: '3차시 역할극 시나리오 v2를 제출했어요', time: '3시간 전' },
    { icon: MessageSquare, iconBg: 'var(--info-bg)', iconFg: 'var(--info-fg)', text: '‘Google Docs 링크 제출 방법’ 문의를 남겼어요', time: '어제' },
    { icon: CheckCircle, iconBg: 'var(--success-bg)', iconFg: 'var(--success-fg)', text: '1차시 오프닝 스크립트가 최종확정 되었어요', time: '3일 전' },
    { icon: CornerDownRight, iconBg: 'var(--bg-sunken)', iconFg: 'var(--fg-3)', text: '3차시 v1 수정요청에 회신했어요', time: '5일 전' },
  ];

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
        gap: '8px',
        flexShrink: 0
      }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--fg-4)' }}>
          <span style={{ color: 'var(--fg-4)' }}>참여자</span>
          <ChevronRight size={14} />
          <span style={{ color: 'var(--fg-2)', fontWeight: 700 }}>홍길동 강사</span>
        </div>
        <button 
          onClick={() => navigate('/inbox')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '7px',
            padding: '9px 14px',
            border: '1px solid var(--border-strong)',
            borderRadius: 'var(--r-md)',
            background: 'var(--bg-card)',
            color: 'var(--fg-2)',
            fontSize: '13px',
            fontWeight: 700
          }}
        >
          <MessageSquare size={16} /> 문의 보내기
        </button>
      </header>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '26px 32px 44px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          
          {/* Profile Card */}
          <div style={{
            display: 'flex',
            gap: '20px',
            alignItems: 'center',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-xl)',
            boxShadow: 'var(--shadow-sm)',
            padding: '24px 26px',
            marginBottom: '20px'
          }}>
            <span style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              backgroundColor: '#D5E3F2',
              color: '#245C92',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              fontWeight: 800,
              flexShrink: 0
            }}>
              홍
            </span>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700 }}>홍길동</div>
                <span style={{ fontSize: '11.5px', fontWeight: 800, padding: '4px 9px', borderRadius: '6px', backgroundColor: '#E8F1FB', color: '#245C92' }}>
                  SME
                </span>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  fontWeight: 700,
                  padding: '4px 10px',
                  borderRadius: '999px',
                  backgroundColor: 'var(--success-bg)',
                  color: 'var(--success-fg)'
                }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981' }}></span> 활성
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px', fontSize: '12.5px', color: 'var(--fg-3)', flexWrap: 'wrap' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Mail size={15} style={{ color: 'var(--fg-4)' }} /> sme@test.com</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Phone size={15} style={{ color: 'var(--fg-4)' }} /> 010-2314-5xxx</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><CalendarIcon size={15} style={{ color: 'var(--fg-4)' }} /> 2026.06.20 참여</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--fg-4)' }}>참여 과정 2</span>
                <span style={{ fontSize: '12.5px', fontWeight: 700, padding: '4px 11px', borderRadius: '999px', backgroundColor: 'var(--stage-story-bg)', color: 'var(--stage-story-fg)' }}>
                  직장 내 괴롭힘 예방
                </span>
                <span style={{ fontSize: '12.5px', fontWeight: 700, padding: '4px 11px', borderRadius: '999px', backgroundColor: 'var(--stage-done-bg)', color: 'var(--stage-done-fg)' }}>
                  장애인 인식개선
                </span>
              </div>
            </div>

            <div style={{ flexShrink: 0, textAlign: 'center', padding: '0 8px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: 'var(--stage-film-fg)' }}>
                <Clapperboard size={16} /> 촬영날까지
              </div>
              <div style={{ fontFamily: 'var(--font-num)', fontSize: '30px', fontWeight: 800, marginTop: '4px' }}>D-22</div>
              <div style={{ fontSize: '11.5px', color: 'var(--fg-4)' }}>7.30 (목) · 역할극</div>
            </div>
          </div>

          {/* Workload Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '24px' }}>
            {stats.map((s, idx) => (
              <div key={idx} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-xs)', padding: '16px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px', color: s.fg }}>
                  <s.icon size={16} />
                  <span style={{ fontSize: '12px', fontWeight: 700 }}>{s.label}</span>
                </div>
                <div style={{ fontFamily: 'var(--font-num)', fontSize: '26px', fontWeight: 800, marginTop: '8px', color: 'var(--fg-1)' }}>
                  {s.value}
                  <span style={{ fontSize: '13px', color: 'var(--fg-4)', fontWeight: 600, marginLeft: '2px' }}>{s.unit}</span>
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--fg-4)', marginTop: '2px' }}>{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Courses Grid */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>
              참여 과정 <span style={{ fontSize: '13px', color: 'var(--fg-4)', fontWeight: 600 }}>2개</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              {courses.map((c, idx) => (
                <div 
                  key={idx} 
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--r-lg)',
                    boxShadow: 'var(--shadow-xs)',
                    padding: '18px 20px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '11.5px', color: 'var(--fg-4)', fontWeight: 700 }}>{c.category}</div>
                      <div style={{ fontSize: '15px', fontWeight: 700, marginTop: '3px' }}>{c.title}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--fg-3)', marginTop: '12px' }}>담당 {c.chapters}</div>
                  <div style={{ height: '6px', borderRadius: '999px', backgroundColor: 'var(--bg-sunken)', overflow: 'hidden', marginTop: '8px' }}>
                    <div style={{ height: '100%', borderRadius: '999px', backgroundColor: c.barColor, width: c.pctW }}></div>
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--fg-4)', marginTop: '6px' }}>진행 {c.pct}% · 마감 {c.due}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Scripts list and activity */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px', alignItems: 'start' }}>
            {/* Assigned scripts */}
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>
                배정 원고 <span style={{ fontSize: '13px', color: 'var(--fg-4)', fontWeight: 600 }}>3건</span>
              </div>
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
                {scripts.map((s, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      padding: '15px 20px',
                      borderBottom: '1px solid var(--border)',
                    }}
                  >
                    <span style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: 'var(--r-md)',
                      backgroundColor: 'var(--primary-tint-2)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--primary-hover)',
                      flexShrink: 0
                    }}>
                      <FileText size={17} />
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--fg-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.title}</div>
                      <div style={{ fontSize: '12px', color: 'var(--fg-4)', marginTop: '2px' }}>{s.meta}</div>
                    </div>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      padding: '3px 8px',
                      borderRadius: 'var(--r-pill)',
                      backgroundColor: s.bg,
                      color: s.fg,
                    }}>{s.status}</span>
                    <span style={{ width: '78px', textAlign: 'right', fontSize: '12px', color: s.dueColor }}>{s.due}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent activity log */}
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>최근 활동</div>
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', boxShadow: 'var(--shadow-sm)', padding: '6px 20px 14px' }}>
                {activity.map((a, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '12px', padding: '13px 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '50%',
                      backgroundColor: a.iconBg,
                      color: a.iconFg,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <a.icon size={15} />
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '12.5px', color: 'var(--fg-2)', lineHeight: '1.5' }}>{a.text}</div>
                      <div style={{ fontSize: '11px', color: 'var(--fg-4)', marginTop: '3px' }}>{a.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SmeDetail;
