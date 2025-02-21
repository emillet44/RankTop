'use client'

import algoliasearch from "algoliasearch";
import { Configure, InstantSearch, PoweredBy, SearchBox, useInstantSearch } from "react-instantsearch"
import { CustomHits } from "./HitsDisplay";
import { useRouter } from "next/navigation"
import { useState } from "react";
import Link from "next/link";


//This function holds the entire search box, with the Instant Search react widget, the searchbox itself with custom CSS, and the hits display with custom
//CSS. The hits display shows results as buttons with the title and two ranks, and they are aligned and formatted with a div in this file. On click of the
//result or the "Search for" button, users are redirected to a dynamic search result.

const searchClient = algoliasearch('PL301U4XAW', '29040181c146c8aadf2e332b7fe43db9');

export function Search() {

  const [search, setSearch] = useState("");
  const [type, setType] = useState("Posts");
  
  const router = useRouter();

  const saveQuery = (e: any) => {
    setSearch(e.target.value);
  };

  const checkEnter = (e: any) => {
    if (e.key === "Enter") {
      router.push(`/search/${type}/${search}`);
    }
  };

  const changeType = (e: any) => {
    setType(e.target.value);
    }

  return (
    <>
    <header>{type}</header>
    <select onChange={changeType}>
      <option>Posts</option>
      <option>Users</option>
      <option>Groups</option>
    </select>
    <InstantSearch searchClient={searchClient} indexName={type}>
      <SearchBox placeholder="Search" classNames={{
        root: 'z-20 outline outline-2 outline-slate-700 rounded-md',
        form: '',
        input: 'w-[300px] h-9 bg-transparent outline-none indent-1 text-offwhite placeholder-offwhite',
        reset: '',
        submitIcon: 'hidden',
        resetIcon: 'hidden',
      }} onInput={saveQuery} onKeyDown={checkEnter} />
      <EmptyQueryBoundary fallback={null}>
        <div className="absolute grid grid-cols-1 z-10 outline outline-2 outline-slate-700 empty:outline-none rounded-md pt-10 bg-slate-900 text-offwhite">
          <CustomHits />
          <Link href={`/search/${search}`} className="w-[300px] hover:bg-slate-800">Search for {search}</Link>
          <div className="p-1 w-full border-t-2 border-slate-700 flex justify-end">
            <div className="w-36">
              <PoweredBy/>
            </div>
          </div>
        </div>
      </EmptyQueryBoundary>
      <Configure hitsPerPage={4} />
    </InstantSearch>
    </>
    
  )
}

function EmptyQueryBoundary({ children, fallback }: any) {
  const { indexUiState } = useInstantSearch();

  if (!indexUiState.query) {
    return fallback;
  }

  return children;
}