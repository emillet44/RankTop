'use server'

import { prisma } from "@/lib/prisma";

export async function AddToGroup(userid: string, groupid: string) {
  const updatedGroup = await prisma.groups.update({
    where: { id: groupid },
    data: {
      members: {
        connect: { id: userid }
      },
      population: {
        increment: 1
      }
    },
  });
  return updatedGroup;
}

export async function AddToGroupPass(userid: string, groupid: string, password: string) {
  try {
    const group = await prisma.groups.findUnique({
      where: { id: groupid },
      select: { password: true }
    });
    if (!group) {
      return { success: false, error: 'Group not found' };
    }
    if (group.password !== password) {
      return { success: false, error: 'Incorrect password' };
    }

    const updatedGroup = await prisma.groups.update({
      where: { id: groupid },
      data: {
        members: {
          connect: { id: userid }
        },
        population: {
          increment: 1
        }
      },
    });
    
    return { success: true, group: updatedGroup };
  } catch (error) {
    console.error('Error joining group:', error);
    return { success: false, error: 'Failed to join group' };
  }
}

export async function FindGroup(formData: FormData) {

  const data = JSON.stringify(Object.fromEntries(formData));
  const formDataObj = JSON.parse(data);

  const groups = await prisma.groups.findMany({
    where: {
      name: formDataObj.groupname,
      password: formDataObj.password,
    },
    include: {
      members: {
        where: { id: formDataObj.userid }
      },
      admins: {
        where: { id: formDataObj.userid }
      }
    }
  });
  if(groups.length < 1) {
    return "none";
  }
  else if(groups.length === 1) {
    const group = groups[0];
    
    if (group.members.length > 0 || group.admins.length > 0) {
      return "member";
    }
    else if (await AddToGroup(formDataObj.userid, group.id)) {
      return "success" + group.id;
    } 
    else {
      return "fail";
    }
  }
  else {
    return "multiple";
  }
}