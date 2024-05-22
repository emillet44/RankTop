import { Header } from "@/components/headers/NewPostHeader";
import { CSForm }  from "../../components/CSForm";
import { Footer } from "@/components/Footer";
import { SignState } from "@/components/serverActions/signinstate";

//This page displays under the /newpost url, and calls the header and CSForm functions. Due to the way that Nextjs renders components, this page
//had to work like this to avoid the fetch waterfall error, which happens when server actions are called during the initial render of a client component.
//Importing CSForm, a client component, allows the page to be rendered as a server component, which can safely call server actions during the initial render, while
//still employing client interactivity from CSForm.
export default async function NewPost() {

  const states: any[] = await SignState();

  return (
    <>
      <Header />
      <CSForm signedin={states[0]}/>
      <Footer />
    </>
  )
}