'use client'

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { faHeart } from '@fortawesome/free-regular-svg-icons';
import { RerankItem } from './RerankItem';

export function RerankList({ rerankings, postId, userid }: { rerankings: any[], postId: string, userid: string | null }) {
  const [isSectionExpanded, setIsSectionExpanded] = useState(false);

  return (
    <div className="pb-8">
      <div className="border border-white/10 rounded-2xl bg-black/20 backdrop-blur-sm overflow-hidden transition-all">
        {/* Main Collapsible Header */}
        <div 
          className={`flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors border-b ${isSectionExpanded ? 'border-white/10' : 'border-transparent'}`}
          onClick={() => setIsSectionExpanded(!isSectionExpanded)}
        >
          <div className="flex items-center space-x-3">
            <header className="text-xl sm:text-2xl text-slate-100 font-bold tracking-tight">Re-rankings</header>
            <FontAwesomeIcon 
              icon={isSectionExpanded ? faChevronUp : faChevronDown} 
              className="w-3.5 h-3.5 text-slate-500"
            />
          </div>
          
          <div className="text-slate-500 text-xs font-bold capitalize">
            {rerankings.length} Total
          </div>
        </div>

        {/* Collapsible Content */}
        {isSectionExpanded && (
          <div className="p-2 space-y-2 bg-black/10">
            {rerankings.map((rerank) => (
              <RerankItem key={rerank.id} rerank={rerank} postId={postId} userid={userid} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
