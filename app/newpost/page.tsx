import { Header } from "@/components/headers/NewPostHeader";
import { CSForm } from "../../components/CSForm";
import { Footer } from "@/components/Footer";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/auth";

//This page displays under the /newpost url, and calls the header and CSForm functions. Due to the way that Nextjs renders components, this page
//had to work like this to avoid the fetch waterfall error, which happens when server actions are called during the initial render of a client component.
//Importing CSForm, a client component, allows the page to be rendered as a server component, which can safely call server actions during the initial render, while
//still employing client interactivity from CSForm.


export default async function NewPost() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    // User not signed in
    return (
      <>
        <Header />
        <CSForm signedin={false} username="" userid="" usergroups={null} />
        <Footer />
      </>
    );
  }

  // Single query to get everything
  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id
    },
    select: {
      username: true,
      memberGroups: {
        select: {
          id: true,
          name: true,
        }
      },
      adminGroups: {
        select: {
          id: true,
          name: true,
        }
      }
    }
  });

  const usergroups = (user?.memberGroups.length || user?.adminGroups.length) 
    ? user 
    : null;

  return (
    <>
      <Header />
      <CSForm 
        signedin={true} 
        username={user?.username || session.user.name || ''} 
        userid={session.user.id} 
        usergroups={usergroups} 
      />
      <Footer />
    </>
  );
}