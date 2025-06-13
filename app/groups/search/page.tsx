import { Header } from "@/components/headers/GroupHeader";
import { Footer } from "@/components/Footer";
import Link from "next/link";
import { JoinGroupForm } from "@/components/JoinGroupForm";
import { SignState } from "@/components/serverActions/signinstate";

export default async function SearchGroups() {

  const states: any[] = await SignState();

  return (
    <>
      <Header />
      <div className="min-h-[calc(100vh-64px)] bg-gradient-radial from-gray-950 to-stone-950 bg-fixed text-offwhite">
        <div className="flex justify-center pt-[130px] md:pt-[82px] pb-10">
        <ul className="flex flex-row">
            <li>
              <Link href="/groups" className="px-4 py-2 rounded-md text-xl font-medium text-gray-300 hover:text-white hover:bg-gray-700 transition-colors duration-200">My Groups</Link>
            </li>
            <li>
              <Link href="/groups/new" className="px-4 py-2 rounded-md text-xl font-medium text-gray-300 hover:text-white hover:bg-gray-700 transition-colors duration-200">Create</Link>
            </li>
            <li>
              <Link href="/groups/search" aria-current="page" className="px-4 py-2 rounded-md text-xl font-medium text-white bg-gray-700">Join</Link>
            </li>
          </ul>
        </div>
        <JoinGroupForm signedin={states[0]} userid={states[2]} />
      </div>
      <Footer />
    </>
  )
}