import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useUi } from '../context/UiContext';
import GuideContent from '../components/GuideContent';
import { 
  Search, 
  Plus, 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Check,
  ChevronRight,
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
  const { toast, confirm } = useUi();
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

  // 안내 글 하단에서 남기는 문의. 문의함으로 실제 전송된다.
  const [inquiry, setInquiry] = useState('');
  const [sendingInquiry, setSendingInquiry] = useState(false);

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
      toast.error('안내 글을 열지 못했습니다', err.message || '잠시 후 다시 시도해 주세요.');
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
      toast.success(editId ? '안내 글을 수정했습니다.' : '안내 글을 등록했습니다.');
    } catch (err: any) {
      toast.error('안내 글을 저장하지 못했습니다', err.message || '입력한 내용을 확인한 뒤 다시 시도해 주세요.');
    } finally {
      setSaving(false);
    }
  };

  const handleSendInquiry = async () => {
    if (!selectedGuide || !inquiry.trim() || sendingInquiry) return;

    setSendingInquiry(true);
    try {
      await apiFetch('/inbox', {
        method: 'POST',
        body: JSON.stringify({
          subject: `[안내 문의] ${selectedGuide.title}`,
          category: selectedGuide.category,
          text: inquiry,
          contextFull: selectedGuide.title,
          contextHref: '/guide',
        }),
      });
      setInquiry('');
      toast.success('문의를 보냈습니다', '문의함에서 진행 상황을 확인할 수 있습니다.');
    } catch (err: any) {
      toast.error('문의를 보내지 못했습니다', err.message || '작성한 내용은 그대로 있습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setSendingInquiry(false);
    }
  };

  const handleDeleteGuide = async (id: string) => {
    const ok = await confirm({
      title: '이 안내 글을 삭제할까요?',
      message: '삭제한 글은 되돌릴 수 없습니다.\n강사에게도 더 이상 보이지 않습니다.',
      confirmLabel: '삭제',
      tone: 'danger',
    });
    if (!ok) return;

    try {
      await apiFetch(`/guides/${id}`, {
        method: 'DELETE'
      });
      setView('list');
      loadGuides();
      toast.success('안내 글을 삭제했습니다.');
    } catch (err: any) {
      toast.error('안내 글을 삭제하지 못했습니다', err.message || '잠시 후 다시 시도해 주세요.');
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
      <div className="page-pad" style={{ flex: 1, overflowY: 'auto', padding: '26px 32px 40px' }}>
        
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
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(360px, 100%), 1fr))',
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
          <div style={{ maxWidth: 'min(1040px, 100%)', margin: '0 auto', display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
            
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

              {/* 안내 본문 — 기획자가 안내 관리에서 저장한 내용을 그대로 보여 준다 */}
              <div className="doc-content" style={{ fontSize: '14.5px', color: 'var(--fg-2)' }}>
                <GuideContent content={selectedGuide.content} />
              </div>

              {/* Bottom Q&A Form (Matches S10 inquiry footer) */}
              <div className="page-pad" style={{ marginTop: '36px', padding: '22px 24px', borderRadius: 'var(--r-xl)', background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <HelpCircle size={18} style={{ color: 'var(--primary-hover)' }} />
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 700 }}>더 궁금한 점이 있으신가요?</span>
                </div>
                <div style={{ fontSize: '13px', color: 'var(--fg-3)', marginTop: '6px' }}>담당 기획자에게 바로 문의할 수 있어요.</div>
                
                <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', marginTop: '16px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '11px', padding: '12px 16px', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', background: 'var(--bg-page)' }}>
                    <span style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#FFD8C9', color: '#B7521F', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>김</span>
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: 700 }}>{selectedGuide.author}</div>
                      <div style={{ fontSize: '12px', color: 'var(--fg-3)' }}>이 안내를 작성한 담당자입니다</div>
                    </div>
                  </div>
                  
                  <div style={{ flex: 1, minWidth: '280px' }}>
                    <textarea
                      value={inquiry}
                      onChange={(e) => setInquiry(e.target.value)}
                      onKeyDown={(e) => {
                        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                          e.preventDefault();
                          void handleSendInquiry();
                        }
                      }}
                      placeholder="문의 내용을 남겨주세요. 담당 기획자에게 전달됩니다."
                      rows={2}
                      style={{ width: '100%', padding: '11px 13px', border: '1px solid var(--border-strong)', borderRadius: 'var(--r-md)', fontSize: '13.5px', resize: 'vertical', outline: 'none', background: 'var(--bg-card)' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
                      <span style={{ marginRight: 'auto', fontSize: '11.5px', color: 'var(--fg-4)' }}>
                        보낸 문의는 [문의함]에서 이어서 대화할 수 있습니다
                      </span>
                      <button
                        type="button"
                        onClick={handleSendInquiry}
                        disabled={sendingInquiry || !inquiry.trim()}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 16px',
                          border: 'none', borderRadius: 'var(--r-md)',
                          background: (sendingInquiry || !inquiry.trim()) ? 'var(--border-strong)' : 'var(--primary)',
                          color: '#fff', fontSize: '13.5px', fontWeight: 700,
                          cursor: (sendingInquiry || !inquiry.trim()) ? 'not-allowed' : 'pointer',
                        }}
                      >
                        <Send size={15} /> {sendingInquiry ? '보내는 중…' : '문의 보내기'}
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
          <div style={{ maxWidth: 'min(720px, 100%)', margin: '0 auto' }}>
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
