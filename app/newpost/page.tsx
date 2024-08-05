import { Header } from "@/components/headers/NewPostHeader";
import { CSForm } from "../../components/CSForm";
import { Footer } from "@/components/Footer";
import { SignState } from "@/components/serverActions/signinstate";
import { prisma } from "@/lib/prisma";

//This page displays under the /newpost url, and calls the header and CSForm functions. Due to the way that Nextjs renders components, this page
//had to work like this to avoid the fetch waterfall error, which happens when server actions are called during the initial render of a client component.
//Importing CSForm, a client component, allows the page to be rendered as a server component, which can safely call server actions during the initial render, while
//still employing client interactivity from CSForm.


export default async function NewPost() {

  const states: any[] = await SignState();
  const user = await prisma.user.findUnique({
    where: {
      id: states[2]
    },
    select: {
      memberGroups: {
        select: {
          id: true
        }
      },
      adminGroups: {
        select: {
          id: true
        }
      }
    }
  });
  const useringroup = !!user && (user.memberGroups.length > 0 || user.adminGroups.length > 0);
  if(useringroup) {
    const usergroups = await prisma.user.findUnique({
      where: {
        id: states[2],
      },
      select: {
        memberGroups: {
          select: {
            id: true,
            name: true,
          },
        },
        adminGroups: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    return (
      <>
        <Header />
        <CSForm signedin={states[0]} username={states[1]} userid={states[2]} usergroups={usergroups} />
        <Footer />
      </>
    )
  }
  else {
    return (
      <>
        <Header />
        <CSForm signedin={states[0]} username={states[1]} userid={states[2]} usergroups="" />
        <Footer />
      </>
    )
  }
}