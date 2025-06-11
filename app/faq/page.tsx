import { Header } from "@/components/headers/Header";
import { Footer } from "@/components/Footer";

//Simple FAQ page with common questions. FYI do not remove the curly braces and quotes, it's to avoid a react/no-unescaped-entities error during build(because of the apostrophes)

export default async function FAQ() {

  return (
    <>
      <Header />
      <div className="min-h-[calc(100vh-64px)] bg-gradient-radial from-gray-950 to-stone-950 bg-fixed flex items-center justify-center pt-14">
        <div className="p-5 rounded-xl outline outline-slate-700 bg-slate-50 bg-opacity-5 max-w-5xl w-full h-fit text-xl text-slate-400 space-y-6">
          <dl>
            <dt>{"Q: What can I do on this site if I'm not signed in?"}</dt>
            <dd>{"A: Even if you aren't signed in, you can still freely browse and create posts, however you cannot like or comment, or add images to your posts."}</dd>
          </dl>
          <dl>
            <dt>Q: Is this website still being updated?</dt>
            <dd>A: The website is in active development, and updates are being worked on frequently. Upcoming features: notifications,
              video ranking, private posts, and as always, performance improvements.</dd>
          </dl>
          <dl>
            <dt>{"Q: Is my data secure if I sign in with my Google account? There's a warning that shows up from Google when I sign in."}</dt>
            <dd>{"A: Your password is safe, because it isn't stored on this website. Ranktop uses Google as an intermediary to verify sign in details, which allows secure sign in without password storage. The only information stored about you is your email, name(to be removed), profile picture and what posts/comments/replies you've made using that email."}</dd>
          </dl>
        </div>

      </div>
      <Footer />
    </>
  )
}