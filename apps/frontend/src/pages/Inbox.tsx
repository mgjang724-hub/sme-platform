import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Send, 
  Paperclip, 
  Plus, 
  PlusCircle,
  X
} from 'lucide-react';

interface InboxMessage {
  message_id: string;
  sender_id: string;
  sender_name: string;
  sender_role: string;
  text: string;
  created_at: string;
}

interface QnaThread {
  thread_id: string;
  subject: string;
  category: string;
  creator_name: string;
  creator_role: string;
  created_at: string;
  updated_at: string;
  status: string;
  tagIcon: string;
  messages: InboxMessage[];
}

const Inbox: React.FC = () => {
  const { apiFetch, user } = useAuth();

  const [threads, setThreads] = useState<QnaThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [viewRole, setViewRole] = useState<'PLANNER' | 'SME'>('PLANNER');

  // Compose / forms
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [showNewThread, setShowNewThread] = useState(false);

  // New thread form
  const [newSubject, setNewSubject] = useState('');
  const [newCategory, setNewCategory] = useState('원고 작성 가이드');
  const [newText, setNewText] = useState('');
  const [creatingThread, setCreatingThread] = useState(false);

  useEffect(() => {
    if (user) {
      setViewRole(user.global_role === 'SME' ? 'SME' : 'PLANNER');
    }
  }, [user]);

  const loadInbox = async () => {
    try {
      const list = await apiFetch('/inbox');
      setThreads(list);
    } catch (err) {
      console.error('Failed to load inbox threads', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInbox();
  }, []);

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const curThread = threads[selectedIdx];
    if (!curThread || !replyText.trim()) return;

    setSendingReply(true);
    try {
      await apiFetch(`/inbox/${curThread.thread_id}/reply`, {
        method: 'POST',
        body: JSON.stringify({ text: replyText })
      });
      setReplyText('');
      await loadInbox();
    } catch (err) {
      alert('전송 중 오류가 발생했습니다.');
    } finally {
      setSendingReply(false);
    }
  };

  const handleCreateThread = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !newText.trim()) return;

    setCreatingThread(true);
    try {
      await apiFetch('/inbox', {
        method: 'POST',
        body: JSON.stringify({
          subject: newSubject,
          category: newCategory,
          text: newText
        })
      });
      setNewSubject('');
      setNewText('');
      setShowNewThread(false);
      await loadInbox();
      setSelectedIdx(0);
    } catch (err) {
      alert('문의 등록 중 오류가 발생했습니다.');
    } finally {
      setCreatingThread(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--fg-3)' }}>
        문의함 로딩 중...
      </div>
    );
  }

  const cur = threads[selectedIdx];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
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
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700 }}>문의함</div>
        </div>

        {/* View Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px', borderRadius: '999px', background: 'var(--bg-sunken)' }}>
          <button 
            onClick={() => setViewRole('PLANNER')}
            style={{
              padding: '6px 13px',
              border: 'none',
              borderRadius: '999px',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer',
              backgroundColor: viewRole === 'PLANNER' ? 'var(--bg-card)' : 'transparent',
              color: viewRole === 'PLANNER' ? 'var(--primary-hover)' : 'var(--fg-3)'
            }}
          >
            기획자
          </button>
          <button 
            onClick={() => setViewRole('SME')}
            style={{
              padding: '6px 13px',
              border: 'none',
              borderRadius: '999px',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer',
              backgroundColor: viewRole === 'SME' ? 'var(--bg-card)' : 'transparent',
              color: viewRole === 'SME' ? 'var(--primary-hover)' : 'var(--fg-3)'
            }}
          >
            강사
          </button>
        </div>

        {viewRole === 'SME' && (
          <button 
            onClick={() => setShowNewThread(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 15px',
              borderRadius: 'var(--r-md)',
              background: 'var(--primary)',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 700
            }}
          >
            <Plus size={16} /> 새 문의 작성
          </button>
        )}
      </header>

      {/* Main Split-Pane */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0, overflow: 'hidden' }}>
        
        {/* Left Side: Threads list */}
        <div style={{
          width: '360px',
          flexShrink: 0,
          borderRight: '1px solid var(--border)',
          background: 'var(--bg-card)',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0
        }}>
          <div style={{ flexShrink: 0, padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13.5px', fontWeight: 700 }}>
              {viewRole === 'PLANNER' ? '받은 문의' : '내 문의'}
            </span>
            <span style={{ fontSize: '11px', fontWeight: 800, padding: '2px 8px', borderRadius: '999px', background: 'var(--primary-tint)', color: 'var(--primary-hover)' }}>
              {threads.length}건
            </span>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {threads.map((t, idx) => {
              const on = idx === selectedIdx;
              const initial = t.creator_name.charAt(0);
              const lastMsg = t.messages[t.messages.length - 1];

              return (
                <button
                  key={t.thread_id}
                  onClick={() => setSelectedIdx(idx)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    display: 'flex',
                    gap: '12px',
                    padding: '15px 18px',
                    border: 'none',
                    borderBottom: '1px solid var(--border)',
                    borderLeft: `3px solid ${on ? 'var(--primary)' : 'transparent'}`,
                    backgroundColor: on ? 'var(--primary-tint-2)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'background 0.12s'
                  }}
                  className="inq"
                >
                  <span style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: '#D5E3F2',
                    color: '#245C92',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '13px',
                    fontWeight: 700,
                    flexShrink: 0
                  }}>
                    {initial}
                  </span>
                  
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--fg-1)' }}>{t.creator_name}</span>
                      <span style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--fg-4)' }}>
                        {new Date(t.updated_at).toLocaleDateString([], { month: 'numeric', day: 'numeric' })}
                      </span>
                    </div>
                    <div style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--fg-2)', marginTop: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {t.subject}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--fg-4)', marginTop: '2px', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {lastMsg?.text}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '7px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        fontSize: '10.5px',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '999px',
                        backgroundColor: 'var(--stage-script-bg)',
                        color: 'var(--stage-script-fg)'
                      }}>
                        {t.category}
                      </span>
                      <span style={{
                        fontSize: '10.5px',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: '999px',
                        backgroundColor: t.status === 'ANSWERED' ? 'var(--success-bg)' : 'var(--warning-bg)',
                        color: t.status === 'ANSWERED' ? 'var(--success-fg)' : 'var(--warning-fg)'
                      }}>
                        {t.status === 'ANSWERED' ? '답변완료' : '답변대기'}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Message Thread Chat */}
        {cur ? (
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', minHeight: 0, backgroundColor: 'var(--bg-page)' }}>
            <div style={{ flexShrink: 0, padding: '20px 30px', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-card)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  backgroundColor: '#E0D6F5',
                  color: '#5B45A8',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  fontWeight: 700,
                  flexShrink: 0
                }}>
                  {cur.creator_name.charAt(0)}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: 700 }}>{cur.subject}</div>
                  <div style={{ fontSize: '12.5px', color: 'var(--fg-3)', marginTop: '2px' }}>
                    {cur.creator_name} · {cur.creator_role}
                  </div>
                </div>
              </div>
            </div>

            {/* Messages bubbles scroll area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '26px 30px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {cur.messages.map((m) => {
                const mine = m.sender_role === viewRole;
                return (
                  <div 
                    key={m.message_id}
                    style={{
                      display: 'flex',
                      gap: '11px',
                      maxWidth: '78%',
                      alignSelf: mine ? 'flex-end' : 'flex-start',
                      flexDirection: mine ? 'row-reverse' : 'row'
                    }}
                  >
                    <span style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: mine ? 'var(--primary-tint)' : '#CFE6E2',
                      color: mine ? 'var(--primary-hover)' : '#1E7E73',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 700,
                      flexShrink: 0
                    }}>
                      {m.sender_name.charAt(0)}
                    </span>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '5px', flexDirection: mine ? 'row-reverse' : 'row' }}>
                        <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--fg-1)' }}>{m.sender_name}</span>
                        <span style={{ fontSize: '11px', color: 'var(--fg-4)' }}>
                          {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      
                      <div style={{
                        padding: '12px 15px',
                        borderRadius: mine ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                        backgroundColor: mine ? 'var(--primary)' : 'var(--bg-card)',
                        border: '1px solid ' + (mine ? 'var(--primary)' : 'var(--border)'),
                        fontSize: '13.5px',
                        color: mine ? '#fff' : 'var(--fg-2)',
                        lineHeight: 1.7
                      }}>
                        {m.text}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Compose reply message bar */}
            <form onSubmit={handleReplySubmit} style={{ flexShrink: 0, padding: '16px 30px', borderTop: '1px solid var(--border)', backgroundColor: 'var(--bg-card)' }}>
              <div style={{ border: '1px solid var(--border-strong)', borderRadius: 'var(--r-md)', padding: '12px 14px' }}>
                <textarea 
                  placeholder={viewRole === 'PLANNER' ? '답변을 입력하세요. 강사에게 알림으로 전달됩니다...' : '기획자에게 물어볼 추가 내용을 남겨보세요...'}
                  rows={2}
                  required
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  style={{
                    width: '100%',
                    border: 'none',
                    outline: 'none',
                    resize: 'none',
                    fontSize: '13.5px',
                    background: 'none'
                  }}
                />
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
                  <button type="button" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 11px', border: '1px solid var(--border-strong)', borderRadius: 'var(--r-sm)', backgroundColor: 'var(--bg-card)', color: 'var(--fg-3)', fontSize: '12px', fontWeight: 700 }}>
                    <Paperclip size={14} /> 파일 첨부
                  </button>
                  <button 
                    type="submit"
                    disabled={sendingReply}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 16px',
                      border: 'none',
                      borderRadius: 'var(--r-sm)',
                      backgroundColor: 'var(--primary)',
                      color: '#fff',
                      fontSize: '13px',
                      fontWeight: 700
                    }}
                  >
                    <Send size={14} /> {viewRole === 'PLANNER' ? '답변 보내기' : '문의 보내기'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fg-4)', fontSize: '13.5px' }}>
            목록에서 문의 스레드를 선택하거나 새 문의를 개설하세요.
          </div>
        )}

      </div>

      {/* New Thread Modal Overlay */}
      {showNewThread && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(17, 24, 39, 0.4)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50
        }}>
          <form onSubmit={handleCreateThread} style={{
            width: '480px',
            maxWidth: '100%',
            backgroundColor: 'var(--bg-card)',
            borderRadius: 'var(--r-xl)',
            boxShadow: 'var(--shadow-lg)',
            padding: '24px 28px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ fontSize: '17px', fontWeight: 700, color: 'var(--fg-1)' }}>새 문의 작성</div>
              <button type="button" onClick={() => setShowNewThread(false)} style={{ border: 'none', background: 'none', color: 'var(--fg-3)' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--fg-3)', display: 'block', marginBottom: '6px' }}>분류 카테고리</label>
                <select 
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  style={{ width: '100%', height: '40px', padding: '0 12px', border: '1px solid var(--border-strong)', borderRadius: 'var(--r-md)', outline: 'none', fontSize: '13.5px', background: 'var(--bg-card)' }}
                >
                  <option value="원고 작성 가이드">원고 작성 가이드</option>
                  <option value="촬영 안내">촬영 안내</option>
                  <option value="원고 상세관리">원고 상세관리</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--fg-3)', display: 'block', marginBottom: '6px' }}>문의 제목</label>
                <input 
                  type="text"
                  required
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="제목을 입력하세요..."
                  style={{ width: '100%', height: '40px', padding: '0 12px', border: '1px solid var(--border-strong)', borderRadius: 'var(--r-md)', outline: 'none', fontSize: '13.5px', background: 'var(--bg-card)' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--fg-3)', display: 'block', marginBottom: '6px' }}>문의 내용</label>
                <textarea 
                  rows={4}
                  required
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  placeholder="상세 문의 내용을 남겨주시면 담당 기획자가 확인하는 대로 회신드립니다..."
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-strong)', borderRadius: 'var(--r-md)', outline: 'none', fontSize: '13.5px', resize: 'vertical', background: 'var(--bg-card)' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
              <button type="button" onClick={() => setShowNewThread(false)} style={{ padding: '9px 15px', border: '1px solid var(--border-strong)', borderRadius: 'var(--r-md)', background: 'var(--bg-card)', color: 'var(--fg-2)', fontSize: '13px', fontWeight: 700 }}>
                취소
              </button>
              <button 
                type="submit"
                disabled={creatingThread}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 18px',
                  borderRadius: 'var(--r-md)',
                  backgroundColor: 'var(--primary)',
                  color: '#fff',
                  fontSize: '13px',
                  fontWeight: 700
                }}
              >
                <PlusCircle size={15} /> 작성하기
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};

export default Inbox;
