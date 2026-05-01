'use client'

import Link from "next/link";
import Image from 'next/image';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faCompass, faUserGroup, faLock, faEarthAmericas } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import { CreateGroupModal } from "@/components/CreateGroupModal";
import { JoinGroupModal } from "@/components/JoinGroupModal";

interface GroupsProps {
  signedin: boolean;
  userid: string;
  usergroups: any[];
  publicGroups: any[];
}

export default function GroupsClient({ signedin, userid, usergroups, publicGroups }: GroupsProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  return (
    <>
      <div className="min-h-screen bg-[#0a0a0a] text-slate-200 pt-[120px] md:pt-[80px] pb-20 px-4">
        <div className="max-w-6xl mx-auto space-y-12">
          
          {/* HEADER SECTION */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/[0.03] border border-white/5 rounded-3xl p-8">
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Community Groups</h1>
              <p className="text-slate-400 text-sm sm:text-base max-w-md font-medium leading-relaxed">
                Connect with others, share your rankings, and discover curated community content.
              </p>
            </div>
            <div className="flex items-center gap-3">
               <button 
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-2xl transition-all shadow-lg shadow-blue-600/20 active:scale-95"
               >
                <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
                <span>Create Group</span>
              </button>
              <button 
                onClick={() => setShowJoinModal(true)}
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-slate-200 font-bold px-6 py-3 rounded-2xl border border-white/10 transition-all active:scale-95"
              >
                <FontAwesomeIcon icon={faCompass} className="w-4 h-4" />
                <span>Join by Code</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* MY GROUPS SECTION */}
            <div className="lg:col-span-4 space-y-6">
              <div className="flex items-center gap-3 px-2">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
                  <FontAwesomeIcon icon={faUserGroup} className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-black text-white uppercase tracking-wider">My Groups</h2>
              </div>

              <div className="space-y-3">
                {!signedin ? (
                   <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-8 text-center space-y-4">
                    <p className="text-slate-400 text-xs font-medium">Sign in to manage your groups</p>
                    <Link href="/signin" className="inline-block bg-white text-black font-bold px-6 py-2 rounded-xl text-xs hover:bg-slate-200 transition-colors">Sign In</Link>
                  </div>
                ) : usergroups.length === 0 ? (
                  <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-8 text-center">
                    <p className="text-slate-400 text-xs font-medium">You haven't joined any groups yet.</p>
                  </div>
                ) : (
                  usergroups.map((group) => (
                    <Link href={`/group/${group.id}`} key={group.id} className="block group">
                      <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 flex items-center gap-4 group-hover:bg-white/[0.06] group-hover:border-white/10 transition-all">
                        <div className="w-10 h-10 rounded-lg bg-slate-800 border border-white/10 relative overflow-hidden flex-shrink-0">
                           {group.profileimg ? (
                            <Image src={`https://storage.googleapis.com/ranktop-i/${group.id}profile.png`} alt={group.name} fill sizes="40px" className="object-cover" />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-slate-600">RT</div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-slate-100 text-sm font-bold truncate group-hover:text-blue-400 transition-colors">{group.name}</h3>
                          <div className="flex items-center gap-2 text-[9px] text-slate-500 font-black uppercase tracking-tighter">
                            <span>{group.population} {group.population === 1 ? "Member" : "Members"}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <FontAwesomeIcon icon={group.private ? faLock : faEarthAmericas} className="w-2 h-2" />
                              {group.private ? "Private" : "Public"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>

            {/* EXPLORE SECTION */}
            <div className="lg:col-span-8 space-y-6">
              <div className="flex items-center gap-3 px-2">
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400 border border-violet-500/20">
                  <FontAwesomeIcon icon={faCompass} className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-black text-white uppercase tracking-wider">Explore Groups</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {publicGroups.map((group) => (
                  <Link href={`/group/${group.id}`} key={group.id} className="block group">
                    <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-6 h-full flex flex-col gap-6 group-hover:bg-white/[0.06] group-hover:border-violet-500/30 transition-all duration-300 relative overflow-hidden">
                      {/* Suble background glow */}
                      <div className="absolute -top-10 -right-10 w-32 h-32 bg-violet-600/5 blur-3xl rounded-full" />
                      
                      <div className="flex items-start justify-between relative z-10">
                        <div className="w-14 h-14 rounded-xl bg-slate-800 border border-white/10 relative overflow-hidden shadow-2xl">
                          {group.profileimg ? (
                            <Image src={`https://storage.googleapis.com/ranktop-i/${group.id}profile.png`} alt={group.name} fill sizes="56px" className="object-cover" />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-sm font-black text-slate-600">RT</div>
                          )}
                        </div>
                        <div className="bg-violet-500/10 border border-violet-500/20 rounded-full px-3 py-1 flex items-center gap-1.5">
                           <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                           <span className="text-[10px] font-black text-violet-400 uppercase tracking-widest">{group.population} {group.population === 1 ? "Member" : "Members"}</span>
                        </div>
                      </div>

                      <div className="space-y-2 relative z-10">
                        <h3 className="text-lg font-black text-white leading-tight group-hover:text-violet-400 transition-colors">{group.name}</h3>
                        <p className="text-slate-400 text-xs font-medium line-clamp-2 leading-relaxed opacity-80">
                          Join this community to share and explore the best rankings.
                        </p>
                      </div>

                      <div className="mt-auto pt-4 flex items-center text-slate-500 group-hover:text-slate-300 transition-colors relative z-10">
                        <span className="text-[10px] font-black uppercase tracking-widest">View Community</span>
                        <div className="flex-grow border-b border-dashed border-white/10 ml-4 group-hover:border-violet-500/30 transition-colors" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      {showCreateModal && (
        <CreateGroupModal userid={userid} onClose={() => setShowCreateModal(false)} />
      )}
      {showJoinModal && (
        <JoinGroupModal userid={userid} onClose={() => setShowJoinModal(false)} />
      )}
    </>
  );
}
