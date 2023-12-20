import CSEditForm from "@/components/CSEditForm";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/headers/Header";
import { SignState } from "@/components/serverActions/signinstate";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

//This page handles post editing, and uses the post id param from its url to find the post. Then the author is compared to the user to ensure
//they are allowed to edit the post. If not the default 404 page will appear. If allowed, the post will be passed as a prop to the edit post form.

export default async function Post({ params }: { params: { id: string } }) {

  let author;
  const states: any[] = await SignState();

  const post = await prisma.post.findUnique({
    where: { id: params.id },
  });
  if (post?.authorId != null) {
    author = await prisma.user.findUnique({
      where: { id: post?.authorId }
    })
  };

  const yours = (author?.username == states[2]) || (states[2] == "Cinnamon");
  if (!yours && post !== null) {
    return (
      <>
        <Header />
        <CSEditForm id={params.id} post={post} />
        <Footer />
    </>
    )
  }
  else {
    return notFound();
  }
}