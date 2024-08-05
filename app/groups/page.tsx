import { Header } from "@/components/headers/GroupHeader";
import { Footer } from "@/components/Footer";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SignState } from "@/components/serverActions/signinstate";

export default async function Groups() {

  const states: any[] = await SignState();
  const usergroups = await prisma.groups.findMany({
    where: {
      OR: [
        {
          members: {
            some: {
              id: states[2],
            },
          },
        },
        {
          admins: {
            some: {
              id: states[2],
            },
          },
        },
      ],
    },
  });

  return (
    <>
      <Header />
      <div className="min-h-[calc(100vh-64px)] bg-gradient-radial from-gray-950 to-stone-950 bg-fixed">
        <div className="flex justify-center pt-[130px] md:pt-[82px] pb-10">
          <ul className="flex flex-row">
            <li>
              <Link href="/groups" aria-current="page" className="px-4 py-2 rounded-md text-xl font-medium text-white bg-gray-700">My Groups</Link>
            </li>
            <li>
              <Link href="/newgroup" className="px-4 py-2 rounded-md text-xl font-medium text-gray-300 hover:text-white hover:bg-gray-700 transition-colors duration-200">Create</Link>
            </li>
            <li>
              <Link href="/groupsearch" className="px-4 py-2 rounded-md text-xl font-medium text-gray-300 hover:text-white hover:bg-gray-700 transition-colors duration-200">Search</Link>
            </li>
          </ul>
        </div>
        <div className="flex justify-center px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-4xl bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            {states[0] && usergroups.length !== 0 && usergroups?.map((group: any) => (
              <div className="border-b border-gray-700 last:border-none" key={group.id}>
                <Link href={`/group/${group.id}`}>
                  <div className="flex items-center p-4 hover:bg-gray-700 transition duration-300 ease-in-out">
                    <div className="w-16 h-16 bg-gray-600 mr-4 rounded-full flex items-center justify-center text-white">Profile</div>
                    <div className="flex-grow">
                      <h2 className="text-xl sm:text-2xl font-semibold text-white truncate">{group.name}</h2>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-300">
                        <p>Type: {group.visibility || "Public"}</p>
                        <p>Members: {group.population}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
            {states[0] && usergroups.length === 0 &&
              <div className="p-8 text-center">
                <h2 className="text-xl sm:text-2xl font-semibold text-white mb-4">No groups yet!</h2>
                <p className="text-gray-300 mb-6">Check out the search tab to find groups you might be interested in.</p>
                <Link href="/groupsearch" className="inline-block px-6 py-3 bg-blue-800 text-white rounded-md hover:bg-blue-900 transition duration-300 ease-in-out">Search Groups</Link>
              </div>
            }
            {!states[0] &&
              <div className="p-8 text-center">
                <h2 className="text-xl sm:text-2xl font-semibold text-white mb-4">Sign in to view your groups</h2>
                <Link href="/api/auth/signin" className="inline-block px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-300 ease-in-out">Sign In</Link>
              </div>
            }
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}