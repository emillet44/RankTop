import { Header } from "@/components/NewPostHeader";
import { CSForm } from "../../components/CSForm";
import ReactGA from "react-ga4";

export default function NewPost() {

  ReactGA.initialize('G-JGMST5F7CL');
  ReactGA.send({hitType: "pageview", page: "/newpost"});

  return (
    <>
      <Header />
      <CSForm></CSForm>
    </>
  )
}