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
    <div className="outline outline-2 outline-slate-700 rounded-md flex flex-row w-[350px]">
      {isOpen &&
        <div onClick={closeMenu} className="fixed top-0 right-0 w-screen h-screen" />
      }
      <div className="h-9 bg-transparent text-offwhite text-sm flex items-center px-2 border-r-2 border-slate-700 z-10 relative cursor-default" onClick={() => setIsOpen(!isOpen)}>
        <span>{type}</span>
        <FontAwesomeIcon icon={faChevronDown} className="ml-2 text-offwhite w-[14px]" />
        {isOpen &&
        <>
          <div className="absolute top-full left-0 z-20 mt-0.5 bg-slate-900 rounded-md outline outline-2 outline-slate-700">
            <div className="px-3 py-2 hover:bg-slate-800 text-offwhite text-sm" onClick={() => changeType("Posts")}>Posts</div>
            <div className="px-3 py-2 hover:bg-slate-800 text-offwhite text-sm" onClick={() => changeType("Users")}>Users</div>
            <div className="px-3 py-2 hover:bg-slate-800 text-offwhite text-sm" onClick={() => changeType("Groups")}>Groups</div>
          </div>
        </>
      }
      </div>
      <div className="w-[350px]">
        <InstantSearch searchClient={searchClient} indexName={type}>
          <Configure hitsPerPage={10} />
          <SearchBox placeholder="Search" classNames={{
            input: 'peer h-9 w-full bg-transparent outline-none indent-2 text-offwhite placeholder-offwhite [&::-webkit-search-cancel-button]:hidden [&::-ms-clear]:hidden',
            submitIcon: 'hidden',
            reset: 'flex items-center justify-center ml-2 peer-placeholder-shown:hidden relative z-10',
            root: 'w-full',
            form: 'flex items-center',
          }} 
          resetIconComponent={({ classNames }) => (
            <div className={classNames.resetIcon}>
              <FontAwesomeIcon icon={faXmark} className="text-offwhite mr-1" />
            </div>
          )}
          onInput={saveQuery} onKeyDown={checkEnter} />

          <div className="relative">
            <EmptyQueryBoundary fallback={null}>
              <div className="absolute grid grid-cols-1 z-10 mt-0.5 outline outline-2 outline-slate-700 empty:outline-none rounded-md bg-slate-900 text-offwhite w-full">
                <CustomHits />
                <Link href={`/search/${type.toLowerCase()}/${search}`} className="block w-full hover:bg-slate-800 p-2">Search for {search}</Link>
                <div className="p-1 w-full border-t-2 border-slate-700 flex justify-end">
                  <div className="w-36">
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