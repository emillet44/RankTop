'use server'

import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { prisma } from "@/lib/prisma";

let userid: any = null;

export async function newReport(formData: FormData) {

  const data = JSON.stringify(Object.fromEntries(formData));
  const formDataObj = JSON.parse(data);

  const session = await getServerSession(authOptions);

  if (session?.user?.email != null) {
    const authorid1 = await prisma.user.findUnique({
      where: { email: session.user?.email }
    })
    userid = authorid1?.id;
  }

  if(userid !== null) {
    const List = await prisma.reports.create({
      data: {
        report: formDataObj.report,
        userId: userid,
        }
    });
    return List.reportID;
  }
  else {
    const List = await prisma.reports.create({
      data: {
        report: formDataObj.report,
      }
    });
    return List.reportID;
  }

  
}