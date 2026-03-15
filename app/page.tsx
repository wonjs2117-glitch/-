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

  const handleSave = async () => {
    if (isCreating) await supabase.from('news').insert([editForm]);
    else if (isEditing && selectedNews) await supabase.from('news').update(editForm).eq('id', selectedNews.id);
    setIsEditing(false); setIsCreating(false); setSelectedNews(null); fetchNews();
  };

  return (
    <div className="bg-white min-h-screen font-serif text-[#121212] antialiased">
      {/* 🚀 상단 정보 바 */}
      <div className="border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 h-9 flex justify-between items-center text-[11px] font-sans font-bold text-[#666]">
          <div className="flex gap-4 items-center">
            <span>{mounted ? currentTime.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }) : "---"}</span>
            <span className="w-[1px] h-3 bg-gray-300"></span>
            <span>오늘의 신문</span>
          </div>
          <div className="flex gap-4 items-center">
             <span>{mounted ? currentTime.toLocaleTimeString('ko-KR', { hour12: false }) : "--:--"}</span>
             <button onClick={() => setIsBreakingMode(true)} className="hover:text-black">속보 설정</button>
          </div>
        </div>
      </div>

      <header className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <h1 className="text-5xl md:text-6xl font-black tracking-[-0.04em] leading-tight cursor-default select-none">
            매일의 주요 기사
          </h1>
        </div>

        <div className="border-y border-black py-2 flex justify-between items-center px-1">
          <div className="flex-1 text-[11px] font-sans font-bold text-gray-400 uppercase tracking-widest hidden md:block">
            발행인 원준식
          </div>
          <nav className="flex gap-12 font-sans text-[14px] font-black tracking-tighter">
            <button className="hover:underline underline-offset-4">정치</button>
            <button className="hover:underline underline-offset-4">경제</button>
            <button className="hover:underline underline-offset-4">사회</button>
            <button className="hover:underline underline-offset-4">오피니언</button>
          </nav>
          <div className="flex-1 text-right text-[11px] font-sans font-bold text-gray-400 uppercase tracking-widest hidden md:block">
            서울 18.5°C ☀️
          </div>
        </div>
        <div className="border-b border-black mt-[2px]"></div>
      </header>

      {/* 🚀 속보창 */}
      <div className="max-w-6xl mx-auto px-4 mb-10">
        <div className="bg-[#f7f7f7] px-4 py-2 flex items-center gap-4 text-[13px] border-l-4 border-red-700 font-sans">
          <span className="font-black text-red-700 shrink-0 tracking-tighter">속보</span>
          <div className="overflow-hidden relative flex-1 h-5">
            <div className="absolute animate-marquee-slow whitespace-nowrap flex gap-20 font-bold tracking-tight">
              {breakingNews.map((text, i) => <span key={i}>{text}</span>)}
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          <div className="md:col-span-8 md:border-r border-gray-200 md:pr-10">
            <div className="border-b-2 border-black mb-6 flex justify-between items-end pb-1">
              <h3 className="text-xl font-black font-sans">정치</h3>
            </div>
            <div className="space-y-12">
              {getNewsByCategory('정치').map((news, idx) => (
                <article key={news.id} className="group relative cursor-pointer" onClick={() => setSelectedNews(news)}>
                  <div className="absolute -top-4 right-0 opacity-0 group-hover:opacity-100 font-sans text-[10px] font-bold text-gray-400 hover:text-black">
                    <button onClick={(e) => {e.stopPropagation(); setIsEditing(true); setSelectedNews(news); setEditForm(news);}} className="underline">수정</button>
                  </div>
                  <h4 className={`${idx === 0 ? 'text-4xl font-black' : 'text-2xl font-bold'} leading-tight mb-3 group-hover:underline underline-offset-4 decoration-1`}>
                    {news.title}
                  </h4>
                  {idx === 0 && <p className="text-[#333] text-lg leading-relaxed text-justify mb-4 line-clamp-2">{news.content}</p>}
                  <div className="text-[11px] font-sans font-bold text-gray-400 tracking-tighter uppercase">
                    원준식 기자 · {new Date(news.created_at).toLocaleDateString('ko-KR')}
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="md:col-span-4">
            <div className="border-b-2 border-black mb-6 flex justify-between items-end pb-1">
              <h3 className="text-xl font-black font-sans">경제</h3>
            </div>
            <div className="space-y-8">
              {getNewsByCategory('경제').map((news) => (
                <article key={news.id} className="group cursor-pointer border-b border-gray-100 pb-6 last:border-0" onClick={() => setSelectedNews(news)}>
                  <h4 className="text-xl font-bold leading-tight mb-2 group-hover:text-gray-500 transition-colors">
                    {news.title}
                  </h4>
                  <div className="text-[10px] font-sans font-bold text-gray-400">
                    {new Date(news.created_at).toLocaleDateString('ko-KR')}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* 🏛️ 하단 푸터 */}
      <footer className="border-t-4 border-double border-black max-w-6xl mx-auto px-4 py-12 mb-20 mt-10">
        <div className="text-center">
          <h2 className="text-3xl font-black mb-6 font-serif tracking-tighter uppercase">매일의 주요 기사</h2>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-[12px] font-sans font-black text-gray-400 mb-10 border-b border-gray-100 pb-8 uppercase">
            {[
                { name: '조선일보', url: 'https://www.chosun.com' },
                { name: '동아일보', url: 'https://www.donga.com' },
                { name: '중앙일보', url: 'https://www.joongang.co.kr' },
                { name: '한겨레', url: 'https://www.hani.co.kr' },
                { name: '경향신문', url: 'https://www.khan.co.kr' },
                { name: '매일경제', url: 'https://www.mk.co.kr' },
                { name: '한국경제', url: 'https://www.hankyung.com' }
            ].map(media => (
              <a key={media.name} href={media.url} target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors">
                {media.name}
              </a>
            ))}
          </div>
          <div className="font-sans">
            <p className="text-[11px] font-black tracking-[0.4em] mb-4 text-gray-800 uppercase italic">The Daily Major News</p>
            <div className="text-[10px] text-gray-400 leading-loose font-bold uppercase tracking-widest">
              발행인 원준식 | SEOUL, KOREA <br />
              Copyright &copy; 2026 원준식. All rights reserved. <br />
              All articles are the property of the publisher.
            </div>
          </div>
        </div>
      </footer>

      {/* ➕ 작성 버튼 */}
      <button onClick={() => {setIsCreating(true); setEditForm({title:'', category:'정치', content:''});}} className="fixed bottom-10 right-10 w-12 h-12 bg-black text-white flex items-center justify-center text-xl z-40 shadow-lg hover:scale-110 transition-transform">✎</button>

      {/* 기사 뷰어 */}
      {(selectedNews || isCreating) && (
        <div className="fixed inset-0 bg-white z-[90] overflow-y-auto" onClick={() => { if(!isEditing && !isCreating) setSelectedNews(null); }}>
          <div className="max-w-2xl mx-auto px-6 py-20 min-h-screen relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => { setSelectedNews(null); setIsEditing(false); setIsCreating(false); }} className="fixed top-10 right-10 text-4xl font-light">&times;</button>
            {isEditing || isCreating ? (
              <div className="flex flex-col gap-10 font-serif">
                <textarea className="text-4xl font-black outline-none w-full h-24 resize-none border-b border-gray-100" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} placeholder="제목을 입력하세요" />
                <select className="font-sans font-black text-xs uppercase border border-black w-32 p-1" value={editForm.category} onChange={e => setEditForm({...editForm, category: e.target.value})}>
                  <option value="정치">정치</option>
                  <option value="경제">경제</option>
                </select>
                <textarea className="h-[500px] text-lg leading-relaxed outline-none w-full" value={editForm.content} onChange={e => setEditForm({...editForm, content: e.target.value})} placeholder="본문을 입력하세요..." />
                <button onClick={handleSave} className="bg-black text-white p-4 font-sans font-black uppercase text-sm tracking-widest">기사 발행</button>
              </div>
            ) : (
              selectedNews && (
                <article>
                  <div className="mb-10 text-center">
                    <span className="text-[11px] font-sans font-black uppercase tracking-[0.2em] border-b border-black pb-1 mb-8 inline-block">{selectedNews.category}</span>
                    <h1 className="text-4xl md:text-5xl font-black leading-tight mb-6">{selectedNews.title}</h1>
                    <div className="font-sans text-[12px] font-bold text-gray-500 mb-8 uppercase tracking-widest">
                      발행인 원준식 · {new Date(selectedNews.created_at).toLocaleString('ko-KR')}
                    </div>
                  </div>
                  <div className="text-[#121212] leading-[1.9] text-justify whitespace-pre-line text-lg md:text-xl font-serif">
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
        <div className="fixed inset-0 bg-white/95 z-[100] flex justify-center items-center p-6">
          <div className="max-w-md w-full font-sans">
            <h2 className="text-xl font-black mb-8 border-b border-black pb-2 italic">편집국: 실시간 속보 설정</h2>
            <div className="space-y-6 mb-10">
              {breakingNews.map((text, i) => (
                <div key={i}>
                  <p className="text-[10px] font-black text-gray-400 mb-1 uppercase tracking-widest">속보 헤드라인 0{i+1}</p>
                  <input className="w-full border-b border-gray-300 py-1 outline-none focus:border-black font-serif text-lg" value={text} onChange={(e) => {
                    const newBreaking = [...breakingNews];
                    newBreaking[i] = e.target.value;
                    setBreakingNews(newBreaking);
                  }} />
                </div>
              ))}
            </div>
            <button onClick={() => setIsBreakingMode(false)} className="w-full bg-black text-white py-4 font-black text-sm uppercase tracking-widest">업데이트 완료</button>
          </div>
        </div>
      )}

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;700;900&family=Noto+Sans+KR:wght@400;700;900&display=swap');
        body { color: #121212; word-break: keep-all; }
        @keyframes marquee-slow { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-marquee-slow { display: flex; animation: marquee-slow 50s linear infinite; }
        .animate-marquee-slow:hover { animation-play-state: paused; }
      `}</style>
    </div>
  );
}