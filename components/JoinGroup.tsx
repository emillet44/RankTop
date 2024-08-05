'use client'

import { useState } from "react";
import { AddToGroup } from "./serverActions/addtogroup"

export function JoinGroup({ userid, groupid }: { userid: string, groupid: string }) {

  const [loading, setLoading] = useState<boolean | null>(null);

  const addToGroup = async () => {
    setLoading(true);
    const loaded = await AddToGroup(userid, groupid);
    if (loaded) {
      setLoading(false);
    }
  }

  return (
    <>
    {loading === null &&
      <button onClick={addToGroup} className="outline outline-2 outline-slate-700 rounded-md p-2 bg-slate-50 hover:bg-opacity-10 bg-opacity-5 text-slate-400 mt-4">Join</button>
    }
    {loading &&
      <button disabled className="outline outline-2 outline-slate-700 rounded-md p-2 bg-slate-50 hover:bg-opacity-10 bg-opacity-5 text-slate-400 mt-4">Joining</button>
    }
    {loading === false &&
      <button disabled className="outline outline-2 outline-slate-700 rounded-md p-2 bg-slate-50 hover:bg-opacity-10 bg-opacity-5 text-slate-400 mt-4">Joined!</button>
    }
    </>
  )
}
