'use client'

import algoliasearch from "algoliasearch";
import { InstantSearch, PoweredBy, SearchBox, SortBy, useInstantSearch } from "react-instantsearch"
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
  
  const router = useRouter();

  const saveQuery = (e: any) => {
    setSearch(e.target.value);
  };

  const checkEnter = (e: any) => {
    if (e.key === "Enter") {
      router.push(`/search/${search}`);
    }
  };

  return (
    <InstantSearch searchClient={searchClient} indexName="posts">
      <SearchBox placeholder="Search" classNames={{
        root: 'z-20 outline outline-2 rounded-md',
        form: '',
        input: 'w-[330px] h-9 bg-slate-500 outline-none indent-1',
        reset: '',
        submitIcon: 'hidden',
        resetIcon: 'hidden',
      }} onInput={saveQuery} onKeyDown={checkEnter} />
      <EmptyQueryBoundary fallback={null}>
        <div className="absolute grid grid-cols-1 z-10 outline outline-2 empty:outline-none rounded-md pt-10 bg-white">
          <CustomHits />
          <Link href={`/search/${search}`} className="w-[330px] hover:bg-slate-300">Search for {search}</Link>
          <div className="p-1 w-full border-t-2 border-black flex justify-end">
            <div className="w-36">
              <PoweredBy/>
            </div>
          </div>
        </div>
      </EmptyQueryBoundary>
    </InstantSearch>
  )
}

function EmptyQueryBoundary({ children, fallback }: any) {
  const { indexUiState } = useInstantSearch();

  if (!indexUiState.query) {
    return fallback;
  }

  return children;
}