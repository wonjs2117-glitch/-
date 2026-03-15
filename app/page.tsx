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

  // 🔐 관리자 설정 (발행인님의 비밀번호로 유지하세요!)
  const adminPassword = "wonjs135@"; 

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
    <div className="bg-white min-h-screen font-serif text-[#1a1a1a] antialiased">
      {/* 🚀 상단 정보 바 */}
      <div className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-10 flex justify-between items-center text-[10px] md:text-[11px] font-sans font-semibold text-[#888]">
          <div className="flex gap-4 items-center">
            <span>{mounted ? currentTime.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }) : "---"}</span>
            <span className="w-[1px] h-3 bg-gray-200 hidden md:block"></span>
            <span className="hidden md:block tracking-widest uppercase">Digital Edition</span>
          </div>
          <div className="flex gap-4 items-center">
             <span>{mounted ? currentTime.toLocaleTimeString('ko-KR', { hour12: false, hour: '2-digit', minute: '2-digit' }) : "--:--"}</span>
             <button onClick={() => { if(checkAuth()) setIsBreakingMode(true); }} className="hover:text-black hover:underline transition-all">속보 설정</button>
          </div>
        </div>
      </div>

      <header className="max-w-7xl mx-auto px-4 md:px-6 py-10 md:py-16">
        <div className="text-center mb-10">
          <h1 className="text-5xl md:text-8xl font-black tracking-[-0.06em] leading-tight cursor-default select-none italic">
            매일의 주요 기사
          </h1>
          <p className="text-[10px] md:text-[12px] font-sans font-bold tracking-[0.5em] text-gray-400 mt-3 uppercase">Truth & Trust</p>
        </div>

        {/* 이중선(Double Line) 레이아웃 */}
        <div className="border-t-4 border-b border-black py-3 md:py-4 flex justify-between items-center px-1">
          <div className="flex-1 text-[11px] font-sans font-black text-gray-400 uppercase tracking-[0.2em] hidden md:block">
            발행인 원준식
          </div>
          <nav className="flex gap-8 md:gap-16 font-sans text-[14px] md:text-[16px] font-black tracking-tighter mx-auto md:mx-0">
            {['정치', '경제', '사회', '오피니언'].map(menu => (
              <button key={menu} className="hover:text-red-800 transition-colors duration-300">{menu}</button>
            ))}
          </nav>
          <div className="flex-1 text-right text-[11px] font-sans font-black text-gray-400 uppercase tracking-[0.2em] hidden md:block">
            SEOUL {mounted ? "18.5°C ☀️" : ""}
          </div>
        </div>
      </header>

      {/* 🚀 속보창 */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 mb-10 md:mb-14">
        <div className="border-y-2 border-black py-3 flex items-center gap-4 md:gap-8 text-[13px] md:text-[15px] font-sans">
          <span className="font-black text-red-700 shrink-0 tracking-tighter border-r border-gray-300 pr-4 md:pr-6">속보</span>
          <div className="overflow-hidden relative flex-1 h-5">
            <div className="absolute animate-marquee-slow whitespace-nowrap flex gap-10 md:gap-20 font-bold">
              {breakingNews.map((text, i) => <span key={i} className="hover:text-red-700 cursor-default">{text}</span>)}
            </div>
          </div>
        </div>
      </div>

      {/* 🏛️ 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20">
          
          {/* 정치 섹션 */}
          <div className="md:border-r md:border-gray-200 md:pr-16">
            <div className="border-b-2 border-black mb-10 pb-1">
              <h3 className="text-xl md:text-2xl font-black font-sans tracking-tight">정치</h3>
            </div>
            
            <div className="space-y-14 md:space-y-20">
              {getNewsByCategory('정치').map((news) => (
                <article key={news.id} className="group relative cursor-pointer" onClick={() => setSelectedNews(news)}>
                  <div className="absolute -top-7 right-0 opacity-100 md:opacity-0 group-hover:opacity-100 font-sans text-[11px] font-bold text-gray-400 flex gap-4 transition-all duration-300">
                    <button onClick={(e) => { e.stopPropagation(); if(checkAuth()) { setIsEditing(true); setSelectedNews(news); setEditForm(news); } }} className="hover:text-black underline">수정</button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(news.id); }} className="hover:text-red-700 underline">삭제</button>
                  </div>
                  <h4 className="text-2xl md:text-3xl font-bold leading-[1.2] mb-5 group-hover:text-[#333] transition-colors decoration-gray-300 group-hover:underline underline-offset-8">
                    {news.title}
                  </h4>
                  <p className="text-gray-600 text-[16px] md:text-[18px] leading-relaxed text-justify mb-6 line-clamp-3 font-serif">
                    {news.content}
                  </p>
                  <div className="text-[11px] font-sans font-black text-gray-400 uppercase tracking-[0.15em]">
                    By Won Jun-sik · {new Date(news.created_at).toLocaleDateString('ko-KR')}
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* 경제 섹션 */}
          <div className="md:pl-4">
            <div className="border-b-2 border-black mb-10 pb-1">
              <h3 className="text-xl md:text-2xl font-black font-sans tracking-tight">경제</h3>
            </div>
            
            <div className="space-y-14 md:space-y-20">
              {getNewsByCategory('경제').map((news) => (
                <article key={news.id} className="group relative cursor-pointer" onClick={() => setSelectedNews(news)}>
                  <div className="absolute -top-7 right-0 opacity-100 md:opacity-0 group-hover:opacity-100 font-sans text-[11px] font-bold text-gray-400 flex gap-4 transition-all duration-300">
                    <button onClick={(e) => { e.stopPropagation(); if(checkAuth()) { setIsEditing(true); setSelectedNews(news); setEditForm(news); } }} className="hover:text-black underline">수정</button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(news.id); }} className="hover:text-red-700 underline">삭제</button>
                  </div>
                  <h4 className="text-2xl md:text-3xl font-bold leading-[1.2] mb-5 group-hover:text-[#333] transition-colors decoration-gray-300 group-hover:underline underline-offset-8">
                    {news.title}
                  </h4>
                  <p className="text-gray-600 text-[16px] md:text-[18px] leading-relaxed text-justify mb-6 line-clamp-3 font-serif">
                    {news.content}
                  </p>
                  <div className="text-[11px] font-sans font-black text-gray-400 uppercase tracking-[0.15em]">
                    By Won Jun-sik · {new Date(news.created_at).toLocaleDateString('ko-KR')}
                  </div>
                </article>
              ))}
            </div>
          </div>

        </div>
      </main>

      <footer className="border-t-4 border-double border-black max-w-7xl mx-auto px-4 md:px-6 py-16 mb-20 mt-20">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-black mb-10 font-serif tracking-tighter uppercase italic">The Daily Major</h2>
          <div className="flex flex-wrap justify-center gap-x-8 md:gap-x-12 gap-y-4 text-[12px] md:text-[13px] font-sans font-black text-gray-500 mb-12 uppercase">
            {['조선', '동아', '중앙', '한겨레', '경향', '매경', '한경'].map(name => (
              <span key={name} className="hover:text-black cursor-pointer transition-colors border-b border-transparent hover:border-black">{name}</span>
            ))}
          </div>
          <div className="text-[10px] md:text-[11px] text-gray-400 font-bold uppercase tracking-[0.3em] leading-loose">
            발행인 원준식 | SEOUL, KOREA <br />
            Copyright &copy; 2026 WON JUN SIK. All Rights Reserved.
          </div>
        </div>
      </footer>

      <button onClick={() => { if(checkAuth()) { setIsCreating(true); setEditForm({title:'', category:'정치', content:''}); } }} className="fixed bottom-8 right-8 md:bottom-12 md:right-12 w-14 h-14 bg-black text-white flex items-center justify-center text-2xl z-40 shadow-2xl hover:bg-red-900 transition-all duration-300 rounded-full">✎</button>

      {/* 기사 뷰어 */}
      {(selectedNews || isCreating) && (
        <div className="fixed inset-0 bg-white z-[90] overflow-y-auto" onClick={() => { if(!isEditing && !isCreating) setSelectedNews(null); }}>
          <div className="max-w-4xl mx-auto px-6 md:px-10 py-16 md:py-24 min-h-screen relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => { setSelectedNews(null); setIsEditing(false); setIsCreating(false); }} className="fixed top-6 right-6 md:top-12 md:right-12 text-3xl md:text-5xl font-light hover:rotate-90 transition-transform duration-300">&times;</button>
            {isEditing || isCreating ? (
              <div className="flex flex-col gap-8 md:gap-12 font-serif">
                <textarea className="text-3xl md:text-5xl font-bold outline-none w-full h-32 resize-none border-b-2 border-gray-100 focus:border-black transition-all" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} placeholder="제목을 입력하세요" />
                <select className="font-sans font-black text-xs md:text-sm uppercase border-2 border-black w-40 p-2" value={editForm.category} onChange={e => setEditForm({...editForm, category: e.target.value})}>
                  <option value="정치">정치</option>
                  <option value="경제">경제</option>
                  <option value="사회">사회</option>
                  <option value="오피니언">오피니언</option>
                </select>
                <textarea className="h-[500px] md:h-[700px] text-lg md:text-xl leading-relaxed outline-none w-full text-gray-800" value={editForm.content} onChange={e => setEditForm({...editForm, content: e.target.value})} placeholder="본문 내용을 입력하세요..." />
                <div className="flex gap-4">
                  <button onClick={handleSave} className="flex-1 bg-black text-white py-4 md:py-5 font-sans font-black uppercase text-sm tracking-[0.2em] hover:bg-gray-800 transition-all">기사 발행</button>
                  {isEditing && (
                    <button onClick={() => handleDelete(selectedNews!.id)} className="bg-red-800 text-white px-8 md:px-12 font-sans font-black uppercase text-sm hover:bg-red-900 transition-all">삭제</button>
                  )}
                </div>
              </div>
            ) : (
              selectedNews && (
                <article>
                  <div className="mb-12 md:mb-20 text-center border-b border-gray-100 pb-12 md:pb-20">
                    <span className="text-[11px] font-sans font-black uppercase tracking-[0.3em] mb-6 md:mb-10 inline-block text-gray-400 border-b-2 border-black pb-1">{selectedNews.category}</span>
                    <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-8 tracking-tight">{selectedNews.title}</h1>
                    <div className="font-sans text-[12px] md:text-[13px] font-bold text-gray-500 uppercase tracking-[0.2em]">
                      발행인 원준식 · {new Date(selectedNews.created_at).toLocaleString('ko-KR', { dateStyle: 'full' })}
                    </div>
                  </div>
                  <div className="text-[#1a1a1a] leading-[1.9] md:leading-[2.1] text-justify whitespace-pre-line text-lg md:text-2xl font-serif max-w-3xl mx-auto px-2">
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
        <div className="fixed inset-0 bg-white/98 z-[100] flex justify-center items-center p-6">
          <div className="max-w-md w-full font-sans">
            <h2 className="text-2xl font-black mb-10 border-b-4 border-black pb-4 italic uppercase tracking-tighter text-center">Newsroom Editor</h2>
            <div className="space-y-8 mb-12">
              {breakingNews.map((text, i) => (
                <div key={i}>
                  <p className="text-[11px] font-black text-gray-400 mb-2 uppercase tracking-widest">Headline 0{i+1}</p>
                  <input className="w-full border-b-2 border-gray-100 py-2 outline-none focus:border-black font-serif text-xl transition-all" value={text} onChange={(e) => {
                    const newBreaking = [...breakingNews];
                    newBreaking[i] = e.target.value;
                    setBreakingNews(newBreaking);
                  }} />
                </div>
              ))}
            </div>
            <button onClick={() => setIsBreakingMode(false)} className="w-full bg-black text-white py-5 font-black text-sm uppercase tracking-widest hover:bg-gray-800 transition-all">Update Headlines</button>
          </div>
        </div>
      )}

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;700;900&family=Noto+Sans+KR:wght@400;700;900&display=swap');
        body { color: #1a1a1a; word-break: keep-all; overflow-x: hidden; }
        @keyframes marquee-slow { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-marquee-slow { display: flex; animation: marquee-slow 50s linear infinite; }
        @media (max-width: 768px) { .animate-marquee-slow { animation: marquee-slow 30s linear infinite; } }
      `}</style>
    </div>
  );
}