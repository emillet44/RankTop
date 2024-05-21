import Link from 'next/link';
import { useHits, UseHitsProps } from 'react-instantsearch';

//This function displays hits when the user types in the search bar as buttons that direct to the posts themselves
export function CustomHits(props: UseHitsProps) {
  const { hits } = useHits(props);
  
  return (
    <>
      
        {hits?.map((list: any) => (
          <div key={list.id}>
            <Link href={`/post/${list.id}`}>
              <button>
                <div className="h-28 w-[330px] text-left even:bg-gray-50 hover:bg-slate-800">
                  <header className="capitalize text-xl line-clamp-2">{list.title}</header>
                  <ul className="list-inside list-decimal">
                    <li className="capitalize text-sm truncate">{list.rank1}</li>
                    <li className="capitalize text-sm truncate">{list.rank2}</li>
                  </ul>
                </div>
              </button>
            </Link>
          </div>
        ))}
        
      
    </>
  )
}