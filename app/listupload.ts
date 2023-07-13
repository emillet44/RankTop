'use server'

import prisma from "@/lib/prisma"

export async function newList(formData: FormData) {
    const data = JSON.stringify(Object.fromEntries(formData));
    const formDataObj = JSON.parse(data);
    console.log(formDataObj.title);
    const newList = await prisma.post.create({
        data: {
          title: formDataObj.title,
          rank1: formDataObj.r1,
          rank2: formDataObj.r2,
          rank3: formDataObj.r3,
          rank4: formDataObj.r4,
          rank5: formDataObj.r5,
          explain: formDataObj.explain 
        }
    })  
}