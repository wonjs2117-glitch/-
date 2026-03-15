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
  const [breakingNews, setBreakingNews] = useState(['오늘의 시선: 깊이 있는 분석과 신뢰의 저널리즘', '실시간 정치 경제 현안 심층 분석', '원준식 뉴스룸에 오신 것을 환영합니다']);

  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', category: '정치', content: '' });

  // 🔐 관리자 설정
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
    <div className="bg-white min-h-screen font-serif text-[#1a1a1a] antialiased">
      {/* 상단 정보 바 */}
      <div className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-10 flex justify-between items-center text-[10px] md:text-[11px] font-sans font-semibold text-[#888]">
          <div className="flex gap-4 items-center">
            <span>{mounted ? currentTime.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }) : "---"}</span>
            <span className="w-[1px] h-3 bg-gray-200 hidden md:block"></span>
            <span className="hidden md:block tracking-widest uppercase">Digital Edition</span>
          </div>
          <div className="flex gap-4 items-center">
             <span>{mounted ? currentTime.toLocaleTimeString('ko-KR', { hour12: false, hour: '2-digit', minute: '2-digit' }) : "--:--"}</span>
             <button onClick={() => { if(checkAuth()) setIsBreakingMode(true); }} className="hover:text-black transition-all underline underline-offset-2">Editor</button>
          </div>
        </div>
      </div>

      <header className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-20">
        <div className="text-center mb-12">
          <h1 className="text-6xl md:text-8xl font-bold tracking-[-0.05em] leading-tight cursor-default select-none transition-all">
            오늘의 시선
          </h1>
        </div>

        <div className="border-t-4 border-b border-black py-3 md:py-4 flex justify-between items-center px-1">
          <div className="flex-1 text-[11px] font-sans font-bold text-gray-400 uppercase tracking-[0.2em] hidden md:block">
            발행인 원준식
          </div>
          <nav className="flex gap-8 md:gap-16 font-sans text-[14px] md:text-[15px] font-bold tracking-tighter mx-auto md:mx-0">
            {['정치', '경제', '사회', '오피니언'].map(menu => (
              <button key={menu} className="hover:text-gray-400 transition-colors duration-300">{menu}</button>
            ))}
          </nav>
          <div className="flex-1 text-right text-[11px] font-sans font-bold text-gray-400 uppercase tracking-[0.2em] hidden md:block">
            SEOUL {mounted ? "18.5°C ☀️" : ""}
          </div>
        </div>
      </header>

      {/* 속보창 */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 mb-12">
        <div className="border-y-2 border-black py-3.5 flex items-center gap-4 text-[13px] md:text-[14px] font-sans">
          <span className="font-bold text-red-700 shrink-0 tracking-tighter border-r border-gray-300 pr-4">속보</span>
          <div className="overflow-hidden relative flex-1 h-5">
            <div className="absolute animate-marquee-slow whitespace-nowrap flex gap-10 md:gap-24 font-medium">
              {breakingNews.map((text, i) => <span key={i}>{text}</span>)}
            </div>
          </div>
        </div>
      </div>

      {/* 메인 3단 레이아웃 */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          
          {/* 정치 & 경제 (9단 점유) */}
          <div className="md:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-14 md:border-r md:border-gray-200 md:pr-12">
            {/* 정치 섹션 */}
            <div>
              <div className="border-b border-black mb-8 pb-1 flex justify-between items-center">
                <h3 className="text-xl font-bold font-sans">정치</h3>
              </div>
              <div className="space-y-14">
                {getNewsByCategory('정치').map((news) => (
                  <article key={news.id} className="group relative cursor-pointer" onClick={() => setSelectedNews(news)}>
                    <div className="absolute -top-7 right-0 opacity-0 group-hover:opacity-100 font-sans text-[10px] flex gap-3 transition-opacity">
                      <button onClick={(e) => { e.stopPropagation(); if(checkAuth()) { setIsEditing(true); setSelectedNews(news); setEditForm(news); } }} className="underline text-gray-400 hover:text-black">수정</button>
                    </div>
                    <h4 className="text-2xl md:text-[26px] font-bold leading-tight mb-4 group-hover:text-gray-600 transition-colors underline-offset-8 group-hover:underline decoration-gray-200">{news.title}</h4>
                    <p className="text-gray-600 text-[16px] leading-relaxed line-clamp-3 mb-5 text-justify">{news.content}</p>
                    <div className="text-[11px] font-sans font-bold text-gray-400 uppercase tracking-widest">Won Jun-sik</div>
                  </article>
                ))}
              </div>
            </div>

            {/* 경제 섹션 */}
            <div className="md:border-l md:border-gray-100 md:pl-12 pt-10 md:pt-0 border-t md:border-t-0 border-gray-100">
              <div className="border-b border-black mb-8 pb-1">
                <h3 className="text-xl font-bold font-sans">경제</h3>
              </div>
              <div className="space-y-14">
                {getNewsByCategory('경제').map((news) => (
                  <article key={news.id} className="group relative cursor-pointer" onClick={() => setSelectedNews(news)}>
                    <div className="absolute -top-7 right-0 opacity-0 group-hover:opacity-100 font-sans text-[10px] flex gap-3 transition-opacity">
                      <button onClick={(e) => { e.stopPropagation(); if(checkAuth()) { setIsEditing(true); setSelectedNews(news); setEditForm(news); } }} className="underline text-gray-400 hover:text-black">수정</button>
                    </div>
                    <h4 className="text-2xl md:text-[26px] font-bold leading-tight mb-4 group-hover:text-gray-600 transition-colors underline-offset-8 group-hover:underline decoration-gray-200">{news.title}</h4>
                    <p className="text-gray-600 text-[16px] leading-relaxed line-clamp-3 mb-5 text-justify">{news.content}</p>
                    <div className="text-[11px] font-sans font-bold text-gray-400 uppercase tracking-widest">Won Jun-sik</div>
                  </article>
                ))}
              </div>
            </div>
          </div>

          {/* 오피니언 (3단 점유) */}
          <div className="md:col-span-3">
            <div className="border-b border-black mb-8 pb-1">
              <h3 className="text-xl font-bold font-sans">오피니언</h3>
            </div>
            <div className="space-y-10">
              {getNewsByCategory('오피니언').map((news) => (
                <article key={news.id} className="group cursor-pointer border-b border-gray-100 pb-8 last:border-0" onClick={() => setSelectedNews(news)}>
                  <h4 className="text-[18px] font-bold leading-snug mb-3 group-hover:text-red-800 transition-colors italic">
                    "{news.title}"
                  </h4>
                  <div className="text-[11px] font-sans font-bold text-gray-400 uppercase tracking-tighter">칼럼 · 발행인 원준식</div>
                </article>
              ))}
              {getNewsByCategory('오피니언').length === 0 && (
                <p className="text-sm text-gray-400 italic">등록된 시선이 없습니다.</p>
              )}
            </div>
          </div>

        </div>
      </main>

      <footer className="border-t border-black max-w-7xl mx-auto px-4 md:px-6 py-16 mb-24 mt-10">
        <div className="text-center">
          <div className="flex flex-wrap justify-center gap-x-10 gap-y-4 text-[12px] font-sans font-bold text-gray-400 mb-10 uppercase">
            {['조선', '동아', '중앙', '한겨레', '경향', '매경', '한경'].map(name => (
              <span key={name} className="hover:text-black cursor-pointer transition-colors border-b border-transparent hover:border-black">{name}</span>
            ))}
          </div>
          <div className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em] leading-loose">
            발행인 원준식 | SEOUL, KOREA <br />
            Copyright &copy; 2026 WON JUN SIK. All Rights Reserved.
          </div>
        </div>
      </footer>

      {/* 플로팅 작성 버튼 */}
      <button onClick={() => { if(checkAuth()) { setIsCreating(true); setEditForm({title:'', category:'정치', content:''}); } }} className="fixed bottom-10 right-10 w-14 h-14 bg-black text-white flex items-center justify-center text-2xl z-40 shadow-2xl hover:bg-gray-800 transition-all rounded-full">✎</button>

      {/* 기사 모달 */}
      {(selectedNews || isCreating) && (
        <div className="fixed inset-0 bg-white z-[90] overflow-y-auto" onClick={() => { if(!isEditing && !isCreating) setSelectedNews(null); }}>
          <div className="max-w-4xl mx-auto px-6 py-16 md:py-24 min-h-screen relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => { setSelectedNews(null); setIsEditing(false); setIsCreating(false); }} className="fixed top-8 right-8 text-3xl md:text-5xl font-light hover:rotate-90 transition-transform duration-300">&times;</button>
            {isEditing || isCreating ? (
              <div className="flex flex-col gap-10 font-serif">
                <textarea className="text-3xl md:text-5xl font-bold outline-none w-full h-32 resize-none border-b border-gray-100 focus:border-black transition-colors" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} placeholder="제목을 입력하세요" />
                <div className="flex gap-4 items-center">
                  <select className="font-sans font-bold border-2 border-black w-40 p-2 text-sm" value={editForm.category} onChange={e => setEditForm({...editForm, category: e.target.value})}>
                    <option value="정치">정치</option>
                    <option value="경제">경제</option>
                    <option value="사회">사회</option>
                    <option value="오피니언">오피니언</option>
                  </select>
                </div>
                <textarea className="h-[600px] text-lg md:text-xl leading-relaxed outline-none w-full text-gray-800" value={editForm.content} onChange={e => setEditForm({...editForm, content: e.target.value})} placeholder="본문 내용을 입력하세요..." />
                <div className="flex gap-4">
                  <button onClick={handleSave} className="flex-1 bg-black text-white py-4 md:py-5 font-sans font-black uppercase text-sm tracking-[0.2em] hover:bg-gray-800 transition-all">기사 발행</button>
                  {isEditing && (
                    <button onClick={() => handleDelete(selectedNews!.id)} className="bg-red-800 text-white px-8 md:px-12 font-sans font-bold uppercase text-sm hover:bg-red-900 transition-all">삭제</button>
                  )}
                </div>
              </div>
            ) : (
              selectedNews && (
                <article>
                  <div className="mb-16 text-center border-b border-gray-100 pb-16">
                    <span className="text-[11px] font-sans font-black uppercase tracking-[0.3em] mb-8 inline-block text-gray-400 border-b-2 border-black pb-1">{selectedNews.category}</span>
                    <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-8 tracking-tight">{selectedNews.title}</h1>
                    <div className="font-sans text-[12px] font-bold text-gray-500 uppercase tracking-[0.2em]">
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
            <h2 className="text-2xl font-black mb-12 border-b-4 border-black pb-4 italic uppercase tracking-tighter text-center italic">Editor Console</h2>
            <div className="space-y-8 mb-12">
              {breakingNews.map((text, i) => (
                <div key={i}>
                  <p className="text-[10px] font-black text-gray-400 mb-2 uppercase tracking-[0.2em]">Headline 0{i+1}</p>
                  <input className="w-full border-b-2 border-gray-100 py-2 outline-none focus:border-black font-serif text-xl transition-all" value={text} onChange={(e) => {
                    const newBreaking = [...breakingNews];
                    newBreaking[i] = e.target.value;
                    setBreakingNews(newBreaking);
                  }} />
                </div>
              ))}
            </div>
            <button onClick={() => setIsBreakingMode(false)} className="w-full bg-black text-white py-5 font-black text-sm uppercase tracking-widest hover:bg-gray-800 transition-all">Update Site</button>
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