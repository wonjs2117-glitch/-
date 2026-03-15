'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface News {
  id: number;
  title: string;
  category: string;
  content: string;
  created_at: string;
}

export default function Home() {
  const [newsList, setNewsList] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNews, setSelectedNews] = useState<News | null>(null);
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const [isBreakingMode, setIsBreakingMode] = useState(false);
  const [breakingNews, setBreakingNews] = useState(['원준식 뉴스룸: 신뢰와 진실을 향한 발걸음', '실시간 정치 경제 현안 심층 분석', '오늘의 주요 헤드라인을 확인하세요']);

  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', category: '정치', content: '' });

  // 🔐 관리자 설정 (발행인님의 비밀번호를 입력하세요!)
  const adminPassword = "내비밀번호123"; 

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchNews = async () => {
    const { data, error } = await supabase.from('news').select('*').order('created_at', { ascending: false });
    if (!error && data) setNewsList(data);
    setLoading(false);
  };

  useEffect(() => { fetchNews(); }, []);

  const getNewsByCategory = (cat: string) => newsList.filter(n => n.category === cat);

  const checkAuth = () => {
    const password = prompt("관리자 인증이 필요합니다. 비밀번호를 입력하세요:");
    if (password !== adminPassword) {
      alert("비밀번호가 올바르지 않습니다.");
      return false;
    }
    return true;
  };

  const handleDelete = async (id: number) => {
    if (!checkAuth()) return;
    if (confirm("정말로 이 기사를 삭제하시겠습니까?")) {
      const { error } = await supabase.from('news').delete().eq('id', id);
      if (error) alert("삭제 오류 발생");
      else { alert("삭제되었습니다."); fetchNews(); setSelectedNews(null); }
    }
  };

  const handleSave = async () => {
    if (isCreating) await supabase.from('news').insert([editForm]);
    else if (isEditing && selectedNews) await supabase.from('news').update(editForm).eq('id', selectedNews.id);
    setIsEditing(false); setIsCreating(false); setSelectedNews(null); fetchNews();
    alert("처리가 완료되었습니다.");
  };

  return (
    <div className="bg-white min-h-screen font-serif text-[#121212] antialiased">
      {/* 🚀 상단 정보 바 (모바일에서 일부 숨김) */}
      <div className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-10 flex justify-between items-center text-[10px] md:text-[11px] font-sans font-medium text-[#888]">
          <div className="flex gap-2 md:gap-4 items-center">
            <span>{mounted ? currentTime.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' }) : "---"}</span>
            <span className="w-[1px] h-3 bg-gray-200 hidden md:block"></span>
            <span className="hidden md:block">디지털 에디션</span>
          </div>
          <div className="flex gap-4 items-center">
             <span>{mounted ? currentTime.toLocaleTimeString('ko-KR', { hour12: false, hour: '2-digit', minute: '2-digit' }) : "--:--"}</span>
             <button onClick={() => { if(checkAuth()) setIsBreakingMode(true); }} className="hover:text-black">속보 설정</button>
          </div>
        </div>
      </div>

      <header className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-4xl md:text-7xl font-bold tracking-[-0.05em] leading-tight cursor-default select-none">
            매일의 주요 기사
          </h1>
        </div>

        <div className="border-y border-black py-2 md:py-3 flex justify-between items-center px-1">
          <div className="flex-1 text-[10px] font-sans font-bold text-gray-400 uppercase tracking-widest hidden md:block">
            발행인 원준식
          </div>
          <nav className="flex gap-6 md:gap-16 font-sans text-[13px] md:text-[15px] font-bold tracking-tighter mx-auto md:mx-0">
            {['정치', '경제', '사회', '오피니언'].map(menu => (
              <button key={menu} className="hover:text-gray-400 transition-colors">{menu}</button>
            ))}
          </nav>
          <div className="flex-1 text-right text-[10px] font-sans font-bold text-gray-400 uppercase tracking-widest hidden md:block">
            SEOUL {mounted ? "18.5°C ☀️" : ""}
          </div>
        </div>
      </header>

      {/* 🚀 속보창 (모바일 대응) */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 mb-8 md:mb-12">
        <div className="border-y-2 border-black py-2 md:py-2.5 flex items-center gap-3 md:gap-6 text-[12px] md:text-[14px] font-sans">
          <span className="font-bold text-red-600 shrink-0 tracking-tighter border-r border-gray-300 pr-3 md:pr-4">속보</span>
          <div className="overflow-hidden relative flex-1 h-5">
            <div className="absolute animate-marquee-slow whitespace-nowrap flex gap-10 md:gap-20 font-medium">
              {breakingNews.map((text, i) => <span key={i}>{text}</span>)}
            </div>
          </div>
        </div>
      </div>

      {/* 🏛️ 메인 콘텐츠 (모바일은 1열, 노트북은 2열) */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
          
          {/* 정치 섹션 */}
          <div className="md:border-r md:border-gray-100 md:pr-16">
            <div className="border-b border-black mb-6 md:mb-8 pb-1">
              <h3 className="text-lg md:text-xl font-bold font-sans">정치</h3>
            </div>
            
            <div className="space-y-10 md:space-y-12">
              {getNewsByCategory('정치').map((news) => (
                <article key={news.id} className="group relative cursor-pointer" onClick={() => setSelectedNews(news)}>
                  <div className="absolute -top-6 right-0 opacity-100 md:opacity-0 group-hover:opacity-100 font-sans text-[10px] font-bold text-gray-400 flex gap-3 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); if(checkAuth()) { setIsEditing(true); setSelectedNews(news); setEditForm(news); } }} className="underline">수정</button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(news.id); }} className="underline">삭제</button>
                  </div>
                  <h4 className="text-xl md:text-2xl font-bold leading-tight mb-3 md:mb-4 group-hover:underline underline-offset-4 decoration-1">
                    {news.title}
                  </h4>
                  <p className="text-[#555] text-[15px] md:text-[16px] leading-relaxed text-justify mb-4 line-clamp-3 font-serif">
                    {news.content}
                  </p>
                  <div className="text-[10px] md:text-[11px] font-sans font-bold text-gray-400 uppercase tracking-widest">
                    By 원준식 · {new Date(news.created_at).toLocaleDateString('ko-KR')}
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* 경제 섹션 */}
          <div className="md:pl-0">
            <div className="border-b border-black mb-6 md:mb-8 pb-1">
              <h3 className="text-lg md:text-xl font-bold font-sans">경제</h3>
            </div>
            
            <div className="space-y-10 md:space-y-12">
              {getNewsByCategory('경제').map((news) => (
                <article key={news.id} className="group relative cursor-pointer" onClick={() => setSelectedNews(news)}>
                  <div className="absolute -top-6 right-0 opacity-100 md:opacity-0 group-hover:opacity-100 font-sans text-[10px] font-bold text-gray-400 flex gap-3 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); if(checkAuth()) { setIsEditing(true); setSelectedNews(news); setEditForm(news); } }} className="underline">수정</button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(news.id); }} className="underline">삭제</button>
                  </div>
                  <h4 className="text-xl md:text-2xl font-bold leading-tight mb-3 md:mb-4 group-hover:underline underline-offset-4 decoration-1">
                    {news.title}
                  </h4>
                  <p className="text-[#555] text-[15px] md:text-[16px] leading-relaxed text-justify mb-4 line-clamp-3 font-serif">
                    {news.content}
                  </p>
                  <div className="text-[10px] md:text-[11px] font-sans font-bold text-gray-400 uppercase tracking-widest">
                    By 원준식 · {new Date(news.created_at).toLocaleDateString('ko-KR')}
                  </div>
                </article>
              ))}
            </div>
          </div>

        </div>
      </main>

      {/* 푸터 (모바일 글자 크기 축소) */}
      <footer className="border-t border-black max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-16 mb-20 mt-10">
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 font-serif tracking-tighter uppercase">The Daily Major News</h2>
          <div className="flex flex-wrap justify-center gap-x-6 md:gap-x-12 gap-y-3 text-[11px] md:text-[12px] font-sans font-bold text-gray-400 mb-8 md:mb-12 uppercase">
            {['조선', '동아', '중앙', '한겨레', '경향', '매경', '한경'].map(name => (
              <span key={name} className="hover:text-black cursor-pointer transition-colors">{name}</span>
            ))}
          </div>
          <div className="text-[9px] md:text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] leading-loose">
            발행인 원준식 | SEOUL, KOREA <br />
            Copyright &copy; 2026 WON JUN SIK.
          </div>
        </div>
      </footer>

      {/* ➕ 작성 버튼 (모바일에서 약간 작게) */}
      <button onClick={() => { if(checkAuth()) { setIsCreating(true); setEditForm({title:'', category:'정치', content:''}); } }} className="fixed bottom-6 right-6 md:bottom-12 md:right-12 w-12 h-12 md:w-14 md:h-14 bg-black text-white flex items-center justify-center text-xl md:text-2xl z-40 shadow-xl hover:scale-110 transition-transform">✎</button>

      {/* 기사 뷰어 모달 (모바일에서 여백 조정) */}
      {(selectedNews || isCreating) && (
        <div className="fixed inset-0 bg-white z-[90] overflow-y-auto" onClick={() => { if(!isEditing && !isCreating) setSelectedNews(null); }}>
          <div className="max-w-4xl mx-auto px-5 md:px-8 py-12 md:py-24 min-h-screen relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => { setSelectedNews(null); setIsEditing(false); setIsCreating(false); }} className="fixed top-6 right-6 md:top-12 md:right-12 text-3xl md:text-5xl font-light">&times;</button>
            {isEditing || isCreating ? (
              <div className="flex flex-col gap-6 md:gap-10 font-serif">
                <textarea className="text-2xl md:text-4xl font-bold outline-none w-full h-24 md:h-32 resize-none border-b border-gray-100" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} placeholder="제목" />
                <select className="font-sans font-bold text-xs md:text-sm uppercase border border-black w-32 p-1" value={editForm.category} onChange={e => setEditForm({...editForm, category: e.target.value})}>
                  <option value="정치">정치</option>
                  <option value="경제">경제</option>
                  <option value="사회">사회</option>
                  <option value="오피니언">오피니언</option>
                </select>
                <textarea className="h-[400px] md:h-[600px] text-base md:text-lg leading-relaxed outline-none w-full" value={editForm.content} onChange={e => setEditForm({...editForm, content: e.target.value})} placeholder="본문..." />
                <div className="flex gap-4">
                  <button onClick={handleSave} className="flex-1 bg-black text-white py-3 md:py-4 font-sans font-bold uppercase text-xs md:text-sm tracking-widest">발행</button>
                  {isEditing && (
                    <button onClick={() => handleDelete(selectedNews!.id)} className="bg-red-700 text-white px-6 md:px-8 font-sans font-bold uppercase text-xs md:text-sm">삭제</button>
                  )}
                </div>
              </div>
            ) : (
              selectedNews && (
                <article>
                  <div className="mb-8 md:mb-12 text-center border-b border-gray-100 pb-8 md:pb-12">
                    <span className="text-[10px] md:text-[11px] font-sans font-bold uppercase tracking-[0.2em] mb-4 md:mb-8 inline-block text-gray-500">{selectedNews.category}</span>
                    <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4 md:mb-6">{selectedNews.title}</h1>
                    <div className="font-sans text-[11px] md:text-[12px] font-bold text-gray-400 uppercase tracking-widest">
                      발행인 원준식 · {new Date(selectedNews.created_at).toLocaleString('ko-KR', { dateStyle: 'long' })}
                    </div>
                  </div>
                  <div className="text-[#222] leading-[1.7] md:leading-[1.8] text-justify whitespace-pre-line text-base md:text-xl font-serif max-w-2xl mx-auto">
                    {selectedNews.content}
                  </div>
                </article>
              )
            )}
          </div>
        </div>
      )}

      {/* 속보 편집 모달 */}
      {isBreakingMode && (
        <div className="fixed inset-0 bg-white/95 z-[100] flex justify-center items-center p-4">
          <div className="max-w-md w-full font-sans">
            <h2 className="text-lg md:text-xl font-bold mb-6 md:mb-8 border-b border-black pb-2 italic">편집국: 속보 설정</h2>
            <div className="space-y-4 md:space-y-6 mb-8 md:mb-10">
              {breakingNews.map((text, i) => (
                <div key={i}>
                  <p className="text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-widest">속보 0{i+1}</p>
                  <input className="w-full border-b border-gray-200 py-1 outline-none focus:border-black font-serif text-base md:text-lg" value={text} onChange={(e) => {
                    const newBreaking = [...breakingNews];
                    newBreaking[i] = e.target.value;
                    setBreakingNews(newBreaking);
                  }} />
                </div>
              ))}
            </div>
            <button onClick={() => setIsBreakingMode(false)} className="w-full bg-black text-white py-3 md:py-4 font-bold text-sm uppercase tracking-widest">업데이트 완료</button>
          </div>
        </div>
      )}

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;700&family=Noto+Sans+KR:wght@400;700&display=swap');
        body { color: #121212; word-break: keep-all; overflow-x: hidden; }
        @keyframes marquee-slow { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-marquee-slow { display: flex; animation: marquee-slow 40s linear infinite; }
        @media (max-width: 768px) { .animate-marquee-slow { animation: marquee-slow 25s linear infinite; } }
      `}</style>
    </div>
  );
}