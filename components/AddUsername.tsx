'use client'

import { useState } from "react";
import { CreateUsername, UniqueUsername } from "@/components/serverActions/username";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface UsernameFormProps {
  userid: string;
  currentUsername: string;
}

export default function UsernameForm({ userid, currentUsername }: UsernameFormProps) {
  const [confirmopen, setConfirmation] = useState(false);
  const [notunique, setNotunique] = useState(false);
  const [isReserved, setIsReserved] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [disabled, setDisabled] = useState(true);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { data: session, update } = useSession();

  const checkChars = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 1. Apply your regex
    const result = e.target.value.replace(/[^a-zA-Z0-9-_]/g, '');
    setInputValue(result);

    // 2. Check if it matches "Guest" (case insensitive)
    const reserved = result.toLowerCase() === "guest";
    setIsReserved(reserved);

    // 3. Enable button only if valid length and not reserved
    setDisabled(result.length < 3 || reserved);
  };

  const checkUnique = async (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled || loading) return;

    setLoading(true);
    const isTaken = await UniqueUsername(inputValue);

    if (isTaken) {
      setNotunique(true);
      setConfirmation(false);
    } else {
      setNotunique(false);
      setConfirmation(true);
    }
    setLoading(false);
  };

  const back = () => {
    setNotunique(false);
    setConfirmation(false);
  };

  const handleFinalSubmit = async () => {
    setLoading(true);
    const success = await CreateUsername(inputValue, userid);

    if (success) {
      await update();
      router.push(`/user/${inputValue.toLowerCase()}`); // Changed to lowercase
      router.refresh();
    } else {
      setConfirmation(false);
      setNotunique(true);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-radial from-gray-950 to-stone-950 flex items-center justify-center p-4">
      <div className="outline outline-slate-700 bg-slate-900 rounded-xl w-full max-w-sm p-8 shadow-2xl">

        {!confirmopen && !notunique && (
          <form onSubmit={checkUnique} className="flex flex-col gap-6">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-offwhite">Change Handle</h1>
              <p className="text-slate-400 text-sm">
                Current: <span className="text-blue-400">@{currentUsername || 'none'}</span>
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-slate-500 text-xs font-bold uppercase">New Username</label>
              <input
                autoFocus
                value={inputValue}
                onChange={checkChars}
                className={`outline outline-2 rounded-md bg-slate-950 p-3 text-offwhite transition-all text-lg outline-slate-800 focus:outline-blue-600 ${isReserved ? 'focus:outline-red-500' : ''}`}
                maxLength={16}
                placeholder="new_handle"
              />
              {isReserved && (
                <p className="text-red-500 text-xs italic">&quot;Guest&quot; is a reserved name.</p>
              )}
            </div>

            <button
              type="submit"
              disabled={disabled || loading}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-30 rounded-md py-3 text-white font-bold transition-all"
            >
              {loading ? 'Checking...' : 'Check Availability'}
            </button>
          </form>
        )}

        {/* Taken State */}
        {notunique && (
          <div className="flex flex-col gap-6 text-center">
            <h2 className="text-xl font-bold text-white">Already Taken</h2>
            <p className="text-slate-400 text-sm">Someone else is already using <span className="text-red-400">@{inputValue}</span>.</p>
            <button onClick={back} className="outline outline-2 outline-slate-700 rounded-md py-3 text-slate-300 font-bold">Try Another</button>
          </div>
        )}

        {/* Confirmation State */}
        {confirmopen && (
          <div className="flex flex-col gap-6 text-center">
            <span className="text-blue-400 font-mono text-3xl font-bold italic">@{inputValue}</span>
            <p className="text-slate-400 text-sm">This is permanent. Once you confirm, all your previous posts and comments will update to this handle.</p>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={back} className="outline outline-2 outline-slate-700 rounded-md py-3 text-slate-400">Back</button>
              <button onClick={handleFinalSubmit} disabled={loading} className="bg-green-600 hover:bg-green-500 rounded-md py-3 text-white font-bold">
                {loading ? 'Updating...' : 'Confirm'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}