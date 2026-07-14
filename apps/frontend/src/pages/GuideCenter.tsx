import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Search, 
  Plus, 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Check,
  ChevronRight,
  Info,
  MapPin,
  Download,
  HelpCircle,
  Send
} from 'lucide-react';

interface Guide {
  guide_id: string;
  title: string;
  category: string;
  content: string;
  author: string;
  created_at: string;
  updated_at: string;
}

const GuideCenter: React.FC = () => {
  const { apiFetch, user } = useAuth();
  const [viewRole, setViewRole] = useState<'PLANNER' | 'SME'>('PLANNER');

  useEffect(() => {
    if (user) {
      setViewRole(user.global_role === 'SME' ? 'SME' : 'PLANNER');
    }
  }, [user]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('전체');

  // View States: 'list' | 'detail' | 'form'
  const [view, setView] = useState<'list' | 'detail' | 'form'>('list');
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);
  
  // Form States
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('원고 작성 안내');
  const [formContent, setFormContent] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const isPlanner = user?.global_role === 'PLANNER' || user?.global_role === 'ADMIN';

  const loadGuides = async () => {
    try {
      const result = await apiFetch(`/guides?search=${search}&category=${categoryFilter}`);
      setGuides(result);
    } catch (err: any) {
      console.error(err.message || '가이드를 로딩하는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGuides();
  }, [categoryFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadGuides();
  };

  const handleOpenDetail = async (id: string) => {
    try {
      const result = await apiFetch(`/guides/${id}`);
      setSelectedGuide(result);
      setView('detail');
    } catch (err: any) {
      alert(err.message || '상세 보기를 가져올 수 없습니다.');
    }
  };

  const handleOpenCreateForm = () => {
    setEditId(null);
    setFormTitle('');
    setFormCategory('원고 작성 안내');
    setFormContent('');
    setView('form');
  };

  const handleOpenEditForm = (g: Guide) => {
    setEditId(g.guide_id);
    setFormTitle(g.title);
    setFormCategory(g.category);
    setFormContent(g.content);
    setView('form');
  };

  const handleSaveGuide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    setSaving(true);
    try {
      if (editId) {
        // Edit existing
        const result = await apiFetch(`/guides/${editId}`, {
          method: 'PUT',
          body: JSON.stringify({
            title: formTitle,
            category: formCategory,
            content: formContent
          })
        });
        setSelectedGuide(result);
        setView('detail');
      } else {
        // Create new
        await apiFetch('/guides', {
          method: 'POST',
          body: JSON.stringify({
            title: formTitle,
            category: formCategory,
            content: formContent
          })
        });
        setView('list');
      }
      loadGuides();
    } catch (err: any) {
      alert(err.message || '가이드 저장 실패');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteGuide = async (id: string) => {
    const confirm = window.confirm('정말로 이 가이드 글을 삭제하시겠습니까?');
    if (!confirm) return;

    try {
      await apiFetch(`/guides/${id}`, {
        method: 'DELETE'
      });
      setView('list');
      loadGuides();
    } catch (err: any) {
      alert(err.message || '가이드 삭제 실패');
    }
  };

  if (loading && view === 'list') {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--fg-3)' }}>
        안내센터 로딩 중...
      </div>
    );
  }

  const getCategoryBadgeColors = (cat: string) => {
    switch (cat) {
      case '촬영 안내':
        return { bg: 'var(--stage-film-bg)', fg: 'var(--stage-film-fg)' };
      case '원고 작성 안내':
        return { bg: 'var(--stage-script-bg)', fg: 'var(--stage-script-fg)' };
      default:
        return { bg: 'var(--stage-plan-bg)', fg: 'var(--stage-plan-fg)' };
    }
  };

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-sans)', color: 'var(--fg-1)' }}>
      
      {/* Header */}
      <header style={{
        height: '66px',
        padding: '0 32px',
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: '18px',
        flexShrink: 0
      }}>
        {view === 'list' ? (
          <>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700 }}>안내센터</div>
            </div>
            
            <form onSubmit={handleSearchSubmit} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              height: '40px',
              padding: '0 12px',
              width: '260px',
              border: '1px solid var(--border-strong)',
              borderRadius: 'var(--r-md)',
              background: 'var(--bg-card)'
            }}>
              <Search size={17} style={{ color: 'var(--fg-4)' }} />
              <input 
                placeholder="가이드 검색..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  background: 'none',
                  fontSize: '13.5px'
                }} 
              />
            </form>

            {isPlanner && (
              <button 
                onClick={handleOpenCreateForm}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '7px',
                  padding: '10px 16px',
                  borderRadius: 'var(--r-md)',
                  background: 'var(--primary)',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: 700,
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <Plus size={17} /> 가이드 추가
              </button>
            )}
          </>
        ) : view === 'detail' && selectedGuide ? (
          <>
            <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--fg-4)' }}>
              <button 
                onClick={() => setView('list')}
                style={{
                  border: 'none',
                  background: 'none',
                  color: 'var(--fg-4)',
                  cursor: 'pointer',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <ArrowLeft size={16} /> 안내센터
              </button>
              <ChevronRight size={14} style={{ color: 'var(--fg-4)' }} />
              <span style={{ color: 'var(--fg-2)', fontWeight: 700 }}>{selectedGuide.category}</span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px', borderRadius: '999px', background: 'var(--bg-sunken)' }}>
              <button 
                type="button"
                onClick={() => setViewRole('PLANNER')}
                style={{
                  padding: '6px 13px',
                  border: 'none',
                  borderRadius: '999px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: viewRole === 'PLANNER' ? 'var(--bg-card)' : 'transparent',
                  color: viewRole === 'PLANNER' ? 'var(--primary-hover)' : 'var(--fg-3)'
                }}
              >
                기획자
              </button>
              <button 
                type="button"
                onClick={() => setViewRole('SME')}
                style={{
                  padding: '6px 13px',
                  border: 'none',
                  borderRadius: '999px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: viewRole === 'SME' ? 'var(--bg-card)' : 'transparent',
                  color: viewRole === 'SME' ? 'var(--primary-hover)' : 'var(--fg-3)'
                }}
              >
                강사
              </button>
            </div>

            {viewRole === 'PLANNER' && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={() => handleOpenEditForm(selectedGuide)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '7px',
                    padding: '9px 15px',
                    border: '1px solid var(--border-strong)',
                    borderRadius: 'var(--r-md)',
                    background: 'var(--bg-card)',
                    color: 'var(--fg-2)',
                    fontSize: '13.5px',
                    fontWeight: 700
                  }}
                >
                  <Edit size={16} /> 이 안내 편집
                </button>
                <button 
                  onClick={() => handleDeleteGuide(selectedGuide.guide_id)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '9px 15px',
                    border: '1px solid var(--error)',
                    borderRadius: 'var(--r-md)',
                    background: 'var(--error-bg)',
                    color: 'var(--error-fg)',
                    fontSize: '13.5px',
                    fontWeight: 700
                  }}
                >
                  <Trash2 size={16} /> 삭제
                </button>
              </div>
            )}
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button 
              onClick={() => setView('list')}
              style={{
                width: '36px',
                height: '36px',
                border: '1px solid var(--border)',
                borderRadius: 'var(--r-md)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--fg-3)'
              }}
            >
              <ArrowLeft size={17} />
            </button>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700 }}>
              {editId ? '가이드 수정' : '새 가이드 작성'}
            </div>
          </div>
        )}
      </header>

      {/* Main Body Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '26px 32px 40px' }}>
        
        {/* VIEW 1: Guide List (S09) */}
        {view === 'list' && (
          <div>
            {/* Category tabs */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
              {['전체', '원고 작성 안내', '촬영 안내', '연수 공지'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  style={{
                    padding: '8px 15px',
                    borderRadius: '999px',
                    backgroundColor: categoryFilter === cat ? 'var(--fg-1)' : 'var(--bg-card)',
                    color: categoryFilter === cat ? '#fff' : 'var(--fg-2)',
                    border: categoryFilter === cat ? 'none' : '1px solid var(--border-strong)',
                    fontSize: '13px',
                    fontWeight: 700,
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Guides Cards Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
              gap: '18px'
            }}>
              {guides.map((g) => {
                const badge = getCategoryBadgeColors(g.category);
                return (
                  <div
                    key={g.guide_id}
                    onClick={() => handleOpenDetail(g.guide_id)}
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--r-xl)',
                      boxShadow: 'var(--shadow-sm)',
                      padding: '20px 22px',
                      cursor: 'pointer',
                      transition: 'transform 0.15s, box-shadow 0.15s'
                    }}
                    className="ccard"
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 800,
                        padding: '3px 8px',
                        borderRadius: 'var(--r-pill)',
                        backgroundColor: badge.bg,
                        color: badge.fg
                      }}>
                        {g.category}
                      </span>
                      <span style={{ fontSize: '11.5px', color: 'var(--fg-4)' }}>
                        {new Date(g.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div style={{
                      fontSize: '16.5px',
                      fontWeight: 700,
                      marginTop: '12px',
                      lineHeight: '1.4',
                      color: 'var(--fg-1)'
                    }}>
                      {g.title}
                    </div>

                    <div style={{
                      fontSize: '12.5px',
                      color: 'var(--fg-3)',
                      marginTop: '8px',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      lineHeight: '1.6'
                    }}>
                      {g.content.replace(/[#*`_-]/g, '')}
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: '16px',
                      paddingTop: '12px',
                      borderTop: '1px solid var(--border)',
                      fontSize: '12.5px',
                      color: 'var(--fg-4)'
                    }}>
                      <span>작성자: {g.author}</span>
                      <span style={{ color: 'var(--primary)', fontWeight: 700 }}>자세히 보기 →</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {guides.length === 0 && (
              <div style={{ padding: '60px', textAlign: 'center', color: 'var(--fg-3)', background: 'var(--bg-card)', borderRadius: 'var(--r-xl)', border: '1px solid var(--border)' }}>
                등록된 가이드라인 또는 연수 공지가 없습니다.
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: Guide Detail (S10) */}
        {view === 'detail' && selectedGuide && (
          <div style={{ maxWidth: '1040px', margin: '0 auto', display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
            
            {/* Sticky Table of Contents (TOC) */}
            <nav className="toc" style={{ position: 'sticky', top: '20px', width: '200px', flex: 'none', paddingTop: '6px' }}>
              <div style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--fg-4)', padding: '0 12px 6px' }}>목차</div>
              {selectedGuide.guide_id === 'guide-2' ? (
                <>
                  <button onClick={() => scrollTo('sec1')} style={{ display: 'block', width: '100%', padding: '8px 12px', borderRadius: 'var(--r-sm)', fontSize: '13px', color: 'var(--fg-2)', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}>1. 촬영 개요</button>
                  <button onClick={() => scrollTo('sec2')} style={{ display: 'block', width: '100%', padding: '8px 12px', borderRadius: 'var(--r-sm)', fontSize: '13px', color: 'var(--fg-2)', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}>2. 촬영 전 준비</button>
                  <button onClick={() => scrollTo('sec3')} style={{ display: 'block', width: '100%', padding: '8px 12px', borderRadius: 'var(--r-sm)', fontSize: '13px', color: 'var(--fg-2)', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}>3. 당일 진행 순서</button>
                  <button onClick={() => scrollTo('sec4')} style={{ display: 'block', width: '100%', padding: '8px 12px', borderRadius: 'var(--r-sm)', fontSize: '13px', color: 'var(--fg-2)', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}>4. 스튜디오 위치</button>
                  <button onClick={() => scrollTo('sec5')} style={{ display: 'block', width: '100%', padding: '8px 12px', borderRadius: 'var(--r-sm)', fontSize: '13px', color: 'var(--fg-2)', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}>5. 첨부 양식</button>
                  <button onClick={() => scrollTo('sec6')} style={{ display: 'block', width: '100%', padding: '8px 12px', borderRadius: 'var(--r-sm)', fontSize: '13px', color: 'var(--fg-2)', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}>6. 자주 묻는 질문</button>
                </>
              ) : selectedGuide.guide_id === 'guide-1' ? (
                <>
                  <button onClick={() => scrollTo('sec1_1')} style={{ display: 'block', width: '100%', padding: '8px 12px', borderRadius: 'var(--r-sm)', fontSize: '13px', color: 'var(--fg-2)', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}>1. 기본 규격</button>
                  <button onClick={() => scrollTo('sec1_2')} style={{ display: 'block', width: '100%', padding: '8px 12px', borderRadius: 'var(--r-sm)', fontSize: '13px', color: 'var(--fg-2)', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}>2. 작성 팁</button>
                  <button onClick={() => scrollTo('sec1_3')} style={{ display: 'block', width: '100%', padding: '8px 12px', borderRadius: 'var(--r-sm)', fontSize: '13px', color: 'var(--fg-2)', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}>3. 주의사항 및 제출</button>
                </>
              ) : (
                <button style={{ display: 'block', width: '100%', padding: '8px 12px', borderRadius: 'var(--r-sm)', fontSize: '13px', color: 'var(--fg-2)', textAlign: 'left', background: 'var(--primary-tint-2)', border: 'none' }}>본문 전체</button>
              )}
            </nav>

            {/* Document Article Body */}
            <article style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '12.5px', color: 'var(--fg-4)', fontWeight: 700 }}>
                {selectedGuide.category} · 공통 안내 문서
              </div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 700, margin: '8px 0 6px', color: 'var(--fg-1)' }}>
                {selectedGuide.title}
              </h1>
              <div style={{ fontSize: '12.5px', color: 'var(--fg-4)', marginBottom: '18px' }}>
                최종 수정: {new Date(selectedGuide.updated_at).toLocaleDateString()} · 작성자: {selectedGuide.author}
              </div>

              {/* Special Warning Banner (Only for filming guide 'guide-2') */}
              {selectedGuide.guide_id === 'guide-2' && (
                <div style={{ display: 'flex', gap: '12px', padding: '16px 18px', borderRadius: 'var(--r-lg)', background: 'var(--warning-bg)', border: '1px solid #F1DDB0', marginBottom: '24px' }}>
                  <Info size={20} style={{ color: 'var(--warning-fg)', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--warning-fg)' }}>이 과정 특이사항 — 직장 내 괴롭힘 예방</div>
                    <div style={{ fontSize: '13.5px', color: 'var(--warning-fg)', marginTop: '3px', lineHeight: '1.6' }}>
                      3차시 역할극은 별도 촬영이 필요합니다. 출연 강사 2인 일정 조율 후 스튜디오 B에서 진행합니다.{' '}
                      <span style={{ fontWeight: 700, textDecoration: 'underline', cursor: 'pointer' }}>과정 현황에서 보기</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Article content (High fidelity match per guide) */}
              <div className="doc-content" style={{ fontSize: '14.5px', lineHeight: '1.85', color: 'var(--fg-2)' }}>
                {selectedGuide.guide_id === 'guide-2' ? (
                  <div>
                    <section id="sec1" style={{ scrollMarginTop: '20px', marginBottom: '28px' }}>
                      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, color: 'var(--fg-1)', margin: '0 0 12px' }}>1. 촬영 개요</h2>
                      <p style={{ margin: '0 0 12px' }}>모든 이러닝 콘텐츠는 원고 최종 확정 이후 스튜디오 촬영으로 진행됩니다. 강사님은 확정된 원고를 바탕으로 촬영에 참여하시며, 촬영 분량은 차시당 약 8~15분입니다.</p>
                      <p style={{ margin: '0 0 12px' }}>촬영 일정은 원고 확정 후 담당 기획자가 강사님과 협의하여 확정합니다.</p>
                    </section>

                    <section id="sec2" style={{ scrollMarginTop: '20px', marginBottom: '28px' }}>
                      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, color: 'var(--fg-1)', margin: '0 0 12px' }}>2. 촬영 전 준비</h2>
                      <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--fg-1)', margin: '20px 0 8px' }}>복장</h3>
                      <p style={{ margin: '0 0 12px' }}>단색 계열의 상의를 권장하며, 잔무늬·로고가 큰 의상은 피해 주세요. 액세서리는 최소화합니다.</p>
                      
                      <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--fg-1)', margin: '20px 0 8px' }}>준비물 체크리스트</h3>
                      <table style={{ width: '100%', borderCollapse: 'collapse', margin: '8px 0', border: '1px solid var(--border)' }}>
                        <thead>
                          <tr style={{ backgroundColor: 'var(--bg-sunken)' }}>
                            <th style={{ border: '1px solid var(--border)', padding: '10px 12px', fontWeight: 700, fontSize: '13.5px', textAlign: 'left', width: '40%' }}>항목</th>
                            <th style={{ border: '1px solid var(--border)', padding: '10px 12px', fontWeight: 700, fontSize: '13.5px', textAlign: 'left' }}>비고</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td style={{ border: '1px solid var(--border)', padding: '10px 12px', fontSize: '13.5px' }}>확정 원고 (인쇄본)</td>
                            <td style={{ border: '1px solid var(--border)', padding: '10px 12px', fontSize: '13.5px' }}>대본용, 프롬프터 사용 시 파일도 지참</td>
                          </tr>
                          <tr>
                            <td style={{ border: '1px solid var(--border)', padding: '10px 12px', fontSize: '13.5px' }}>발표 보조자료</td>
                            <td style={{ border: '1px solid var(--border)', padding: '10px 12px', fontSize: '13.5px' }}>PPT·이미지가 있는 경우 사전 전달</td>
                          </tr>
                          <tr>
                            <td style={{ border: '1px solid var(--border)', padding: '10px 12px', fontSize: '13.5px' }}>신분증</td>
                            <td style={{ border: '1px solid var(--border)', padding: '10px 12px', fontSize: '13.5px' }}>스튜디오 출입 등록용</td>
                          </tr>
                        </tbody>
                      </table>
                    </section>

                    <section id="sec3" style={{ scrollMarginTop: '20px', marginBottom: '28px' }}>
                      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, color: 'var(--fg-1)', margin: '0 0 12px' }}>3. 당일 진행 순서</h2>
                      <ol style={{ margin: '0 0 12px', paddingLeft: '20px' }}>
                        <li style={{ marginBottom: '6px' }}>스튜디오 도착 및 출입 등록 (촬영 30분 전)</li>
                        <li style={{ marginBottom: '6px' }}>메이크업 · 마이크 세팅</li>
                        <li style={{ marginBottom: '6px' }}>리허설 1회 (분량·톤 점검)</li>
                        <li style={{ marginBottom: '6px' }}>본 촬영 (차시 단위)</li>
                        <li style={{ marginBottom: '6px' }}>모니터링 및 재촬영 여부 확인</li>
                      </ol>
                    </section>

                    <section id="sec4" style={{ scrollMarginTop: '20px', marginBottom: '28px' }}>
                      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, color: 'var(--fg-1)', margin: '0 0 12px' }}>4. 스튜디오 위치</h2>
                      <p style={{ margin: '0 0 12px' }}>i-Scream 원격교육연수원 미디어센터 3층 · 서울특별시 강남구 (상세 주소는 확정 시 안내)</p>
                      <div style={{ height: '180px', borderRadius: 'var(--r-md)', background: 'var(--bg-sunken)', border: '1px dashed var(--border-strong)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--fg-4)', gap: '8px', margin: '12px 0' }}>
                        <MapPin size={26} />
                        <span style={{ fontSize: '12.5px', fontWeight: 700 }}>약도 이미지 삽입 영역</span>
                      </div>
                    </section>

                    <section id="sec5" style={{ scrollMarginTop: '20px', marginBottom: '28px' }}>
                      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, color: 'var(--fg-1)', margin: '0 0 12px' }}>5. 첨부 양식</h2>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', background: 'var(--bg-card)' }}>
                          <Download size={18} style={{ color: 'var(--primary-hover)' }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--fg-1)' }}>촬영 준비물 체크리스트.pdf</div>
                            <div style={{ fontSize: '12px', color: 'var(--fg-4)' }}>124 KB</div>
                          </div>
                          <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--primary-hover)', cursor: 'pointer' }}>받기</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', background: 'var(--bg-card)' }}>
                          <Download size={18} style={{ color: 'var(--primary-hover)' }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--fg-1)' }}>초상권·촬영 동의서 양식.docx</div>
                            <div style={{ fontSize: '12px', color: 'var(--fg-4)' }}>38 KB</div>
                          </div>
                          <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--primary-hover)', cursor: 'pointer' }}>받기</span>
                        </div>
                      </div>
                    </section>

                    <section id="sec6" style={{ scrollMarginTop: '20px', marginBottom: '28px' }}>
                      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, color: 'var(--fg-1)', margin: '0 0 12px' }}>6. 자주 묻는 질문</h2>
                      <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--fg-1)', margin: '16px 0 8px' }}>촬영일에 개인 사정이 생기면 어떻게 하나요?</h3>
                      <p style={{ margin: '0 0 12px' }}>가능한 빨리 담당 기획자에게 연락 주세요. 스튜디오·인력 일정 조율이 필요하므로 최소 3일 전 통보를 권장합니다.</p>
                      <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--fg-1)', margin: '16px 0 8px' }}>원고를 외워야 하나요?</h3>
                      <p style={{ margin: '0' }}>프롬프터를 제공하므로 전부 암기하실 필요는 없습니다. 다만 자연스러운 전달을 위해 흐름은 숙지해 주세요.</p>
                    </section>
                  </div>
                ) : selectedGuide.guide_id === 'guide-1' ? (
                  <div>
                    <section id="sec1_1" style={{ scrollMarginTop: '20px', marginBottom: '28px' }}>
                      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, color: 'var(--fg-1)', margin: '0 0 12px' }}>1. 기본 규격</h2>
                      <ul style={{ margin: '0 0 12px', paddingLeft: '20px' }}>
                        <li style={{ marginBottom: '6px' }}><b>분량</b>: 1개 차시당 A4 용지 8~10쪽 내외</li>
                        <li style={{ marginBottom: '6px' }}><b>서체</b>: 맑은고딕 10pt (줄간격 160%)</li>
                        <li style={{ marginBottom: '6px' }}><b>제출 포맷</b>: Microsoft Word (.docx) 또는 구글 문서 링크</li>
                      </ul>
                    </section>

                    <section id="sec1_2" style={{ scrollMarginTop: '20px', marginBottom: '28px' }}>
                      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, color: 'var(--fg-1)', margin: '0 0 12px' }}>2. 작성 팁</h2>
                      <ul style={{ margin: '0 0 12px', paddingLeft: '20px' }}>
                        <li style={{ marginBottom: '6px' }}>연수 대상을 고려하여 어조는 존댓말로 서술해 주세요 (예: "~입니다", "~해 보세요").</li>
                        <li style={{ marginBottom: '6px' }}>복잡한 도해나 그림이 필요할 경우 지문에 구체적인 연출 묘사를 추가해 주세요.</li>
                      </ul>
                    </section>

                    <section id="sec1_3" style={{ scrollMarginTop: '20px', marginBottom: '28px' }}>
                      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, color: 'var(--fg-1)', margin: '0 0 12px' }}>3. 주의사항 및 제출</h2>
                      <p style={{ margin: '0 0 12px' }}>원고 작성이 완료되면 과정별 상세 페이지의 **원고 상세 관리** 화면을 통해 제출해 주세요. 기획자의 검수 피드백이 오면 우측 피드백 패널을 통해 답변 및 해결 표시를 진행해주시면 됩니다.</p>
                    </section>
                  </div>
                ) : (
                  <div style={{ whiteSpace: 'pre-wrap' }}>{selectedGuide.content}</div>
                )}
              </div>

              {/* Bottom Q&A Form (Matches S10 inquiry footer) */}
              <div style={{ marginTop: '36px', padding: '22px 24px', borderRadius: 'var(--r-xl)', background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <HelpCircle size={18} style={{ color: 'var(--primary-hover)' }} />
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 700 }}>더 궁금한 점이 있으신가요?</span>
                </div>
                <div style={{ fontSize: '13px', color: 'var(--fg-3)', marginTop: '6px' }}>담당 기획자에게 바로 문의할 수 있어요.</div>
                
                <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', marginTop: '16px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '11px', padding: '12px 16px', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', background: 'var(--bg-page)' }}>
                    <span style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#FFD8C9', color: '#B7521F', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>김</span>
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: 700 }}>{selectedGuide.author} 기획자</div>
                      <div style={{ fontSize: '12px', color: 'var(--fg-3)' }}>jsy@iscream.co.kr · 내선 214</div>
                    </div>
                  </div>
                  
                  <div style={{ flex: 1, minWidth: '280px' }}>
                    <textarea placeholder="문의 내용을 남겨주세요. 담당 기획자에게 전달됩니다." rows={2} style={{ width: '100%', padding: '11px 13px', border: '1px solid var(--border-strong)', borderRadius: 'var(--r-md)', fontSize: '13.5px', resize: 'vertical', outline: 'none', background: 'var(--bg-card)' }}></textarea>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                      <button type="button" onClick={() => alert('문의사항이 전송되었습니다.')} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 16px', border: 'none', borderRadius: 'var(--r-md)', background: 'var(--primary)', color: '#fff', fontSize: '13.5px', fontWeight: 700, cursor: 'pointer' }}>
                        <Send size={15} /> 문의 보내기
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </article>
          </div>
        )}

        {/* VIEW 3: Guide Create/Edit Form (S11) */}
        {view === 'form' && (
          <div style={{ maxWidth: '720px', margin: '0 auto' }}>
            <form onSubmit={handleSaveGuide} style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--r-xl)',
              boxShadow: 'var(--shadow-md)',
              padding: '28px 30px'
            }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--fg-3)', display: 'block', marginBottom: '6px' }}>
                    가이드 제목
                  </label>
                  <input 
                    type="text" 
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="제목을 입력하세요..."
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
                  <label style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--fg-3)', display: 'block', marginBottom: '6px' }}>
                    카테고리 분류
                  </label>
                  <select 
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    style={{
                      width: '280px',
                      height: '42px',
                      padding: '0 12px',
                      border: '1px solid var(--border-strong)',
                      borderRadius: 'var(--r-md)',
                      fontSize: '13.5px',
                      outline: 'none',
                      background: 'var(--bg-card)'
                    }}
                  >
                    <option value="원고 작성 안내">원고 작성 안내</option>
                    <option value="촬영 안내">촬영 안내</option>
                    <option value="연수 공지">연수 공지</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--fg-3)', display: 'block', marginBottom: '6px' }}>
                    상세 본문 내용
                  </label>
                  <textarea 
                    rows={12} 
                    required
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
                    placeholder="가이드라인 상세 내용을 마크다운 또는 텍스트 형식으로 서술하세요..."
                    style={{
                      width: '100%',
                      padding: '11px 12px',
                      border: '1px solid var(--border-strong)',
                      borderRadius: 'var(--r-md)',
                      fontSize: '13.5px',
                      outline: 'none',
                      resize: 'vertical',
                      lineHeight: '1.7',
                      background: 'var(--bg-card)'
                    }}
                  />
                </div>
              </div>

              {/* Form Footer Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '26px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
                <button 
                  type="button"
                  onClick={() => setView(editId ? 'detail' : 'list')}
                  style={{
                    padding: '10px 16px',
                    border: '1px solid var(--border-strong)',
                    borderRadius: 'var(--r-md)',
                    backgroundColor: 'var(--bg-card)',
                    color: 'var(--fg-2)',
                    fontSize: '13.5px',
                    fontWeight: 700
                  }}
                >
                  취소
                </button>
                <button 
                  type="submit"
                  disabled={saving}
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
                  <Check size={16} /> 저장하기
                </button>
              </div>

            </form>
          </div>
        )}

      </div>
    </div>
  );
};

export default GuideCenter;
