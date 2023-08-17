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
                <div className="h-24 w-[330px] text-left hover:bg-slate-300">
                  <header className="capitalize text-2xl">{list.title}</header>
                  <ul className="list-inside list-decimal">
                    <li className="capitalize">{list.rank1}</li>
                    <li className="capitalize">{list.rank2}</li>
                  </ul>
                </div>
              </button>
            </Link>
          </div>
        ))}
        
      
    </>
  )
}