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
              <button className="w-full h-8 text-xl line-clamp-2 text-left even:bg-gray-50 hover:bg-slate-800">{list.title}</button>
            </Link>
          </div>
        ))}
    </>
  )
}