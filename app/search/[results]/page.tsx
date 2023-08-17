import { Footer } from "@/components/Footer";
import { Header } from "@/components/headers/Header";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function Results({ params }: { params: { results: string } }) {

  const results = await prisma.post.findMany({
    where: { title: { contains: params.results } },
  });

  return (
    <>
      <Header />
      <div className="min-h-[calc(100vh-116px)]">
        <header className="text-3xl pl-16 pt-16">Results</header>
        <div className=" pt-4 px-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-10"> {results?.map((list: any) => (
          <div className="outline rounded-md p-5 pb-4" key={list.id}>
            <Link href={`/post/${list.id}`}>
              <button className="h-40 w-full">
                <div className="h-40 text-left">
                  <header className="capitalize text-2xl">{list.title}</header>
                  <ul className="list-inside list-decimal">
                    <li className="capitalize">{list.rank1}</li>
                    <li className="capitalize">{list.rank2}</li>
                    <li className="capitalize empty:hidden">{list.rank3}</li>
                    <li className="capitalize empty:hidden">{list.rank4}</li>
                    <li className="capitalize empty:hidden">{list.rank5}</li>
                  </ul>
                </div>
              </button>
            </Link>
          </div>
        ))}
        </div>
      </div>

      <Footer />
    </>
  )
}