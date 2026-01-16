import { getSessionData } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";
import { Header } from "@/components/headers/Header";
import { Footer } from "@/components/Footer";
import UsernameForm from "@/components/AddUsername"; // Ensure file name matches

export default async function UsernameSetupPage() {
  const { signedin, userid, username } = await getSessionData();

  if (!signedin) {
    redirect("/signin");
  }

  return (
    <>
      <Header />
      <UsernameForm userid={userid} currentUsername={username} />
      <Footer />
    </>
  );
}