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

  // 🔐 관리자 설정 (발행인님의 비밀번호로 수정하세요!)
  const adminPassword = "wonjs509173"; 

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
      {/* 🚀 상단 정보 바 - 가로폭 확장 */}
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 h-10 flex justify-between items-center text-[11px] font-sans font-bold text-[#666]">
          <div className="flex gap-4 items-center">
            <span>{mounted ? currentTime.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }) : "---"}</span>
            <span className="w-[1px] h-3 bg-gray-300"></span>
            <span>디지털 에디션</span>
          </div>
          <div className="flex gap-4 items-center">
             <span>{mounted ? currentTime.toLocaleTimeString('ko-KR', { hour12: false }) : "--:--"}</span>
             <button onClick={() => { if(checkAuth()) setIsBreakingMode(true); }} className="hover:text-black hover:underline">속보 설정</button>
          </div>
        </div>
      </div>

      {/* 헤더 영역 - 가로폭 확장 */}
      <header className="max-w-7xl mx-auto px-6 py-10">
        <div className="text-center mb-8">
          <h1 className="text-6xl md:text-8xl font-black tracking-[-0.05em] leading-tight cursor-default select-none py-4">
            매일의 주요 기사
          </h1>
        </div>

        <div className="border-y-4 border-black py-3 flex justify-between items-center px-1">
          <div className="flex-1 text-[12px] font-sans font-black text-gray-500 uppercase tracking-widest hidden md:block">
            발행인 원준식
          </div>
          <nav className="flex gap-16 font-sans text-[16px] font-black tracking-tighter">
            {['정치', '경제', '사회', '오피니언'].map(menu => (
              <button key={menu} className="hover:text-gray-500 transition-colors">{menu}</button>
            ))}
          </nav>
          <div className="flex-1 text-right text-[12px] font-sans font-black text-gray-500 uppercase tracking-widest hidden md:block">
            SEOUL {mounted ? "18.5°C ☀️" : ""}
          </div>
        </div>
      </header>

      {/* 속보창 - 가로폭 확장 */}
      <div className="max-w-7xl mx-auto px-6 mb-12">
        <div className="bg-[#121212] text-white px-5 py-3 flex items-center gap-6 text-[14px] font-sans">
          <span className="font-black text-red-500 shrink-0 tracking-tighter blink">BREAKING</span>
          <div className="overflow-hidden relative flex-1 h-5">
            <div className="absolute animate-marquee-slow whitespace-nowrap flex gap-20 font-bold">
              {breakingNews.map((text, i) => <span key={i}>{text}</span>)}
            </div>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 레이아웃 - 가로폭 확장 (7:5 혹은 8:4 비율) */}
      <main className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          
          {/* 왼쪽: 주요 뉴스 영역 (8칸) */}
          <div className="md:col-span-8 md:border-r md:border-gray-200 md:pr-12">
            <div className="border-b-2 border-black mb-8 flex justify-between items-end pb-2">
              <h3 className="text-2xl font-black font-sans uppercase">Top Stories</h3>
            </div>
            
            <div className="space-y-16">
              {getNewsByCategory('정치').map((news, idx) => (
                <article key={news.id} className="group relative cursor-pointer" onClick={() => setSelectedNews(news)}>
                  <div className="absolute -top-6 right-0 opacity-0 group-hover:opacity-100 font-sans text-[11px] font-bold text-gray-400 flex gap-3 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); if(checkAuth()) { setIsEditing(true); setSelectedNews(news); setEditForm(news); } }} className="hover:text-black underline">수정</button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(news.id); }} className="hover:text-red-600 underline">삭제</button>
                  </div>
                  <h4 className={`${idx === 0 ? 'text-5xl font-black' : 'text-3xl font-bold'} leading-[1.1] mb-5 group-hover:underline underline-offset-8 decoration-1`}>
                    {news.title}
                  </h4>
                  <p className="text-[#444] text-xl leading-relaxed text-justify mb-6 line-clamp-3 font-serif">
                    {news.content}
                  </p>
                  <div className="text-[12px] font-sans font-bold text-gray-500 uppercase tracking-widest">
                    By Won Jun-sik · {new Date(news.created_at).toLocaleDateString('ko-KR')}
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* 오른쪽: 사이드바 영역 (4칸) */}
          <div className="md:col-span-4">
            <div className="border-b-2 border-black mb-8 flex justify-between items-end pb-2">
              <h3 className="text-2xl font-black font-sans uppercase">Business</h3>
            </div>
            <div className="space-y-10">
              {getNewsByCategory('경제').map((news) => (
                <article key={news.id} className="group relative cursor-pointer border-b border-gray-100 pb-8 last:border-0" onClick={() => setSelectedNews(news)}>
                  <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 font-sans text-[10px] font-bold text-gray-400 flex gap-2">
                    <button onClick={(e) => { e.stopPropagation(); if(checkAuth()) { setIsEditing(true); setSelectedNews(news); setEditForm(news); } }} className="underline">수정</button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(news.id); }} className="underline">삭제</button>
                  </div>
                  <h4 className="text-2xl font-bold leading-snug mb-3 group-hover:text-gray-600 transition-colors">
                    {news.title}
                  </h4>
                  <div className="text-[11px] font-sans font-bold text-gray-400">
                    {new Date(news.created_at).toLocaleDateString('ko-KR')}
                  </div>
                </article>
              ))}
            </div>
            
            {/* 광고 혹은 알림창 영역 추가 */}
            <div className="mt-16 p-8 bg-gray-50 border border-gray-100 text-center">
              <p className="text-[11px] font-sans font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">Notice</p>
              <p className="text-sm font-bold text-gray-600">원준식 뉴스룸의 모든 기사는 독자 여러분의 제보로 완성됩니다.</p>
            </div>
          </div>
        </div>
      </main>

      {/* 푸터 - 가로폭 확장 */}
      <footer className="border-t-8 border-double border-black max-w-7xl mx-auto px-6 py-16 mb-20">
        <div className="text-center">
          <h2 className="text-4xl font-black mb-8 font-serif tracking-tighter uppercase">The Daily Major News</h2>
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-4 text-[13px] font-sans font-black text-gray-500 mb-12 border-b border-gray-100 pb-10 uppercase">
            {['조선일보', '동아일보', '중앙일보', '한겨레', '경향신문', '매일경제', '한국경제'].map(name => (
              <span key={name} className="hover:text-black cursor-pointer transition-colors">{name}</span>
            ))}
          </div>
          <div className="text-[11px] text-gray-400 font-bold uppercase tracking-[0.3em] leading-loose">
            발행인 원준식 | SEOUL, KOREA | CONTACT: INFO@NEWSROOM.COM <br />
            Copyright &copy; 2026 WON JUN SIK. All Rights Reserved.
          </div>
        </div>
      </footer>

      {/* ➕ 작성 버튼 */}
      <button onClick={() => { if(checkAuth()) { setIsCreating(true); setEditForm({title:'', category:'정치', content:''}); } }} className="fixed bottom-12 right-12 w-14 h-14 bg-black text-white flex items-center justify-center text-2xl z-40 shadow-2xl hover:scale-110 transition-transform">✎</button>

      {/* 기사 뷰어 모달 - 넓게 보기 대응 */}
      {(selectedNews || isCreating) && (
        <div className="fixed inset-0 bg-white z-[90] overflow-y-auto" onClick={() => { if(!isEditing && !isCreating) setSelectedNews(null); }}>
          <div className="max-w-4xl mx-auto px-8 py-24 min-h-screen relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => { setSelectedNews(null); setIsEditing(false); setIsCreating(false); }} className="fixed top-12 right-12 text-5xl font-light hover:rotate-90 transition-transform">&times;</button>
            {isEditing || isCreating ? (
              <div className="flex flex-col gap-12 font-serif">
                <textarea className="text-5xl font-black outline-none w-full h-32 resize-none border-b-2 border-gray-100 focus:border-black transition-colors" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} placeholder="Enter Headline..." />
                <div className="flex items-center gap-6">
                  <select className="font-sans font-black text-sm uppercase border-2 border-black px-4 py-2" value={editForm.category} onChange={e => setEditForm({...editForm, category: e.target.value})}>
                    <option value="정치">정치 (Politics)</option>
                    <option value="경제">경제 (Business)</option>
                    <option value="사회">사회 (Society)</option>
                    <option value="오피니언">오피니언 (Opinion)</option>
                  </select>
                </div>
                <textarea className="h-[600px] text-xl leading-[1.8] outline-none w-full font-serif" value={editForm.content} onChange={e => setEditForm({...editForm, content: e.target.value})} placeholder="Start writing..." />
                <div className="flex gap-6">
                  <button onClick={handleSave} className="flex-1 bg-black text-white py-5 font-sans font-black uppercase text-sm tracking-[0.2em] hover:bg-gray-800 transition-colors">Publish Article</button>
                  {isEditing && (
                    <button onClick={() => handleDelete(selectedNews!.id)} className="bg-red-700 text-white px-12 font-sans font-black uppercase text-sm hover:bg-red-800 transition-colors">Delete</button>
                  )}
                </div>
              </div>
            ) : (
              selectedNews && (
                <article>
                  <div className="mb-16 text-center border-b border-gray-100 pb-16">
                    <span className="text-[12px] font-sans font-black uppercase tracking-[0.3em] bg-black text-white px-3 py-1 mb-10 inline-block">{selectedNews.category}</span>
                    <h1 className="text-5xl md:text-7xl font-black leading-[1.1] mb-8 tracking-tight">{selectedNews.title}</h1>
                    <div className="font-sans text-[13px] font-bold text-gray-500 uppercase tracking-widest">
                      By Won Jun-sik · Published {new Date(selectedNews.created_at).toLocaleString('ko-KR')}
                    </div>
                  </div>
                  <div className="text-[#121212] leading-[2] text-justify whitespace-pre-line text-xl md:text-2xl font-serif max-w-3xl mx-auto">
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
          <div className="max-w-xl w-full font-sans">
            <h2 className="text-3xl font-black mb-10 border-b-4 border-black pb-4 italic uppercase">Newsroom Editor</h2>
            <div className="space-y-8 mb-12">
              {breakingNews.map((text, i) => (
                <div key={i}>
                  <p className="text-[11px] font-black text-gray-400 mb-2 uppercase tracking-widest">Headline 0{i+1}</p>
                  <input className="w-full border-b-2 border-gray-200 py-2 outline-none focus:border-black font-serif text-xl" value={text} onChange={(e) => {
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
        body { color: #121212; word-break: keep-all; }
        .blink { animation: blink-animation 1s steps(5, start) infinite; }
        @keyframes blink-animation { to { visibility: hidden; } }
        @keyframes marquee-slow { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-marquee-slow { display: flex; animation: marquee-slow 60s linear infinite; }
        .animate-marquee-slow:hover { animation-play-state: paused; }
      `}</style>
    </div>
  );
}