import Link from 'next/link';
import { useHits, UseHitsProps } from 'react-instantsearch';

//This function displays hits when the user types in the search bar as buttons that direct to the posts themselves
export function CustomHits(props: UseHitsProps) {
  const { items } = useHits(props);
  
  return (
    <>
      {items?.map((item: any) => {
        let linkPath = '';
        let displayText = '';
        
        if (item.title) {
          linkPath = `/post/${item.objectID}`;
          displayText = item.title;
        } 
        else if (item.username) {
          linkPath = `/user/${item.username}`;
          displayText = item.username;
        } 
        else if (item.name) {
          linkPath = `/group/${item.objectID}`;
          displayText = item.name;
        } 
        return (
          <div key={item.objectID}>
            <Link href={linkPath}>
              <button className="w-full px-2 py-1 border-b border-slate-700 text-xl line-clamp-2 flex items-center text-left even:bg-gray-50 hover:bg-slate-800">
                {displayText}
              </button>
            </Link>
          </div>
        );
      })}
    </>
  )
}