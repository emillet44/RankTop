'use client'

import algoliasearch from "algoliasearch";
import { InstantSearch, PoweredBy, SearchBox, useInstantSearch, Configure } from "react-instantsearch"
import { CustomHits } from "./HitsDisplay";
import { useRouter } from "next/navigation"
import { useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faXmark } from "@fortawesome/free-solid-svg-icons";


//This function holds the entire search box, with the Instant Search react widget, the searchbox itself with custom CSS, and the hits display with custom
//CSS. The hits display shows results as buttons with the title and two ranks, and they are aligned and formatted with a div in this file. On click of the
//result or the "Search for" button, users are redirected to a dynamic search result.

const searchClient = algoliasearch('PL301U4XAW', '29040181c146c8aadf2e332b7fe43db9');

export function Search() {

  const [search, setSearch] = useState("");
  const [type, setType] = useState("Posts");
  const [isOpen, setIsOpen] = useState(false);

  const router = useRouter();

  const saveQuery = (e: any) => {
    setSearch(e.target.value);
  };

  const checkEnter = (e: any) => {
    if (e.key === "Enter") {
      router.push(`/search/${type.toLowerCase()}/${search}`);
    }
  };

  const changeType = (selectedType: string) => {
    setType(selectedType);
    setIsOpen(false);
  };
  const closeMenu = () => {
    setIsOpen(false);
  }

  return (
    <div className="border border-white/10 rounded-md flex flex-row w-full bg-white/5 transition-colors focus-within:border-white/20">
      {isOpen &&
        <div onClick={closeMenu} className="fixed inset-0 z-20" />
      }
      <div className="h-[34px] flex items-center px-2 sm:px-3 border-r border-white/10 z-30 relative cursor-pointer hover:bg-white/5 transition-colors shrink-0" onClick={() => setIsOpen(!isOpen)}>
        <span className="text-[12px] font-bold text-slate-400  capitalize min-w-[42px] sm:min-w-[48px] text-center">
          <span className="hidden sm:inline">{type}</span>
          <span className="sm:hidden">{type.charAt(0)}</span>
        </span>
        <FontAwesomeIcon icon={faChevronDown} className="ml-1 sm:ml-2 text-slate-500 w-[8px] sm:w-[10px]" />
        {isOpen &&
        <>
          <div className="absolute top-full left-0 z-40 mt-1.5 bg-black border border-white/10 rounded-md min-w-[120px] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="px-4 py-2 hover:bg-white/5 text-slate-300 text-[11px] font-bold  capitalize transition-colors cursor-pointer" onClick={() => changeType("Posts")}>Posts</div>
            <div className="px-4 py-2 hover:bg-white/5 text-slate-300 text-[11px] font-bold  capitalize transition-colors cursor-pointer" onClick={() => changeType("Users")}>Users</div>
            <div className="px-4 py-2 hover:bg-white/5 text-slate-300 text-[11px] font-bold  capitalize transition-colors cursor-pointer" onClick={() => changeType("Groups")}>Groups</div>
          </div>
        </>
      }
      </div>
      <div className="flex-grow min-w-0">
        <InstantSearch searchClient={searchClient} indexName={type}>
          <Configure hitsPerPage={10} />
          <SearchBox placeholder={`Search ${type}...`} classNames={{
            input: 'peer h-[34px] w-full bg-transparent outline-none px-2 sm:px-3 text-offwhite placeholder-slate-600 text-[13px] font-medium [&::-webkit-search-cancel-button]:hidden [&::-ms-clear]:hidden',
            submitIcon: 'hidden',
            reset: 'flex items-center justify-center pr-2 peer-placeholder-shown:hidden relative z-10',
            root: 'w-full',
            form: 'flex items-center',
          }} 
          resetIconComponent={({ classNames }) => (
            <div className={classNames.resetIcon}>
              <FontAwesomeIcon icon={faXmark} className="text-slate-500 w-3 hover:text-offwhite transition-colors cursor-pointer" />
            </div>
          )}
          onInput={saveQuery} onKeyDown={checkEnter} />

          <div className="relative">
            <EmptyQueryBoundary fallback={null}>
              <div className="absolute grid grid-cols-1 z-30 mt-1.5 border border-white/10 empty:outline-none rounded-md bg-black text-offwhite w-full shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
                <CustomHits />
                <Link href={`/search/${type.toLowerCase()}/${search}`} className="block w-full hover:bg-white/5 p-3 text-[12px] font-bold  capitalize border-t border-white/10 text-blue-400 transition-colors">
                  Search for &quot;{search}&quot;
                </Link>
                <div className="p-2 w-full border-t border-white/10 bg-black/40 flex justify-end">
                  <div className="w-20 opacity-40 hover:opacity-100 transition-opacity">
                    <PoweredBy />
                  </div>
                </div>
              </div>
            </EmptyQueryBoundary>
          </div>
        </InstantSearch>
      </div>
    </div>
  )
}

function EmptyQueryBoundary({ children, fallback }: any) {
  const { indexUiState } = useInstantSearch();

  if (!indexUiState.query) {
    return fallback;
  }

  return children;
}