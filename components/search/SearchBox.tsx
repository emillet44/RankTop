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

//For next time: Make the search box a little wider and format it better, then work on the script to update
//Algolia.

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
    <div className="outline outline-2 outline-slate-700 rounded-md flex flex-row w-[300px]">

  <select 
    onChange={changeType} 
    className="h-9 bg-transparent text-offwhite text-sm outline-none"
  >
    <option className="bg-slate-900 text-offwhite">Posts</option>
    <option className="bg-slate-900 text-offwhite">Users</option>
    <option className="bg-slate-900 text-offwhite">Groups</option>
  </select>

  <div className="flex-grow">
    <InstantSearch searchClient={searchClient} indexName={type}>
      <SearchBox placeholder="Search" classNames={{
        root: '',
        form: '',
        input: 'w-full h-9 bg-transparent outline-none indent-2 text-offwhite placeholder-offwhite',
        reset: '',
        submitIcon: 'hidden',
        resetIcon: 'hidden',
      }} onInput={saveQuery} onKeyDown={checkEnter} />

      <div className="relative">
        <EmptyQueryBoundary fallback={null}>
          <div className="absolute grid grid-cols-1 z-10 outline outline-2 outline-slate-700 empty:outline-none rounded-md bg-slate-900 text-offwhite">
            <CustomHits />
            <Link href={`/search/${search}`} className="block max-w-full w-[300px] hover:bg-slate-800">Search for {search}</Link>
            <div className="p-1 w-full border-t-2 border-slate-700 flex justify-end">
              <div className="w-36">
                <PoweredBy/>
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