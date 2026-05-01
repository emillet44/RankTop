import { prisma } from "@/lib/prisma";
import { getSessionData } from "@/lib/auth-helpers";
import { LoadPublicGroups } from "@/components/serverActions/loadposts";
import GroupsClient from "./GroupsClient";
import { Header } from "@/components/headers/GroupHeader";
import { Footer } from "@/components/Footer";

export default async function Groups() {
  const { signedin, userid } = await getSessionData();

  const usergroups = signedin ? await prisma.groups.findMany({
    where: {
      OR: [
        { members: { some: { id: userid } } },
        { admins: { some: { id: userid } } }
      ]
    }
  }) : [];

  const publicGroups = await LoadPublicGroups();

  return (
    <>
      <Header />
      <GroupsClient 
        signedin={signedin} 
        userid={userid} 
        usergroups={usergroups} 
        publicGroups={publicGroups} 
      />
      <Footer />
    </>
  );
}
