'use client'

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function FeedbackForm() {

  const [submitted, setSubmitted] = useState(false);
  const [redirectSeconds, setRedirectSeconds] = useState(5);
  const router = useRouter();

  useEffect(() => {
    if (submitted && redirectSeconds > 0) {
      setTimeout(() => {
        setRedirectSeconds((prevRedirectSeconds) => prevRedirectSeconds - 1);
      }, 1000);
    }
    else if(submitted) {
      router.push("/");
    }

  }, [submitted, redirectSeconds]);

  //Add this back into subhandler later formData: FormData

  const subHandler = () => {
    //The implementation should be similar to this commented code when an email service or something similar is set up.

    //newList(formData).then((result) => {
    //  router.push(`/post/${result}`);
    //});
    setSubmitted(true);
  }

  //Work on storing bug reports in an email address(site bookmarked to help with this)
  return (
    <div className="min-h-[calc(100vh-116px)] pb-16 bg-gradient-radial from-gray-950 to-stone-950 bg-fixed">
      {!submitted &&
        <form id="newpost" action={subHandler} className="flex justify-center pt-32 px-6">
          <div className="grid grid-cols-1 grid-flow-row auto-rows-auto gap-6 w-full max-w-2xl">
            <header className="text-3xl text-slate-400 justify-self-left">Site Feedback</header>
            <textarea className="rounded-xl outline focus:outline-4 outline-slate-700 max-h-96 h-52 p-5 text-slate-400 bg-slate-50 bg-opacity-5" required placeholder="Share your thoughts, suggestions, or report any issues with the site..."></textarea>
            <div className="max-w-2xl w-full h-10 flex justify-end space-x-5">
              <button type="submit" className="outline outline-2 outline-slate-700 rounded-md p-2 text-slate-400 bg-slate-50 bg-opacity-5 hover:bg-opacity-10">Submit</button>
            </div>
          </div>
        </form>
      }
      {submitted &&
        <div className="flex justify-center pt-80">
          <div className="grid grid-cols-1 grid-rows-2 gap-3">
            <header className="text-3xl text-slate-400">Your input is appreciated. Thank you!</header>
            <header className="flex justify-end text-slate-400">Redirecting in {redirectSeconds}</header>
          </div>
        </div>
      }
    </div>
  )
}

