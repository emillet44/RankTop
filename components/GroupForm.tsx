'use client'

import { faEye, faEyeSlash } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { newGroup } from "./serverActions/groupupload";
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react";
import { faAngleDown, faAngleUp, faCircleXmark, faCloudArrowUp } from "@fortawesome/free-solid-svg-icons";
import Image from 'next/image';

export function GroupForm({ signedin, userid }: { signedin: boolean, userid: string }) {

  const [security, setSecurity] = useState("none");
  const [submitted, setSubmitted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [passwordType, setPasswordType] = useState("password");
  const [profileimage, setProfileImage] = useState<File | null>(null);
  const [profiletoggle, setProfileToggle] = useState(false);
  const [bannerimage, setBannerImage] = useState<File | null>(null);
  const [bannertoggle, setBannerToggle] = useState(false);
  const router = useRouter();

  const toggleVisibility = (e: any) => {
    e.preventDefault();
    setVisible(!visible);
    setPasswordType(prev => prev === "password" ? "text" : "password");
  }

  const toggleBanner = (e: any) => {
    e.preventDefault();
    setBannerToggle(!bannertoggle);
  };

  const toggleProfile = (e: any) => {
    e.preventDefault();
    setProfileToggle(!profiletoggle);
  };

  const handleFileChange = (e: any) => {
    const file = e.target.files?.[0];
    if (file) {
      if (e.target.id === "banner") {
        setBannerImage(file);
      }
      else {
        setProfileImage(file);
      }
    }
  }

  const subHandler = (e: any) => {
    e.preventDefault();
    setSubmitted(true);
    const formData = new FormData(e.currentTarget);

    formData.append("userid", userid);
    if (profileimage !== null) {
      formData.append("profileimage", new Blob([profileimage], { type: profileimage.type }));
    }
    if (bannerimage !== null) {
      formData.append("bannerimage", new Blob([bannerimage], { type: bannerimage.type }));
    }

    newGroup(formData).then((result) => {
      router.push(`/group/${result}`);
    });
  }
  if (signedin) {
    if (!submitted) {
      return (
        <form id="newgroup" onSubmit={subHandler} className="flex justify-center pt-[70px] md:pt-[22px] px-6 pb-10">
          <div className="grid grid-cols-1 gap-6 p-6 rounded-xl shadow-black shadow-lg bg-slate-500 bg-opacity-20 w-full max-w-2xl">
            <header className="text-3xl font-bold text-center">New Group</header>
            <div className="space-y-2">
              <label htmlFor="groupname" className="text-xl font-semibold">Group name</label>
              <input name="groupname" className="w-full px-3 py-2 text-lg bg-slate-600 bg-opacity-30 rounded-md outline-none focus:ring-2 focus:ring-blue-500" required pattern=".*\S.*" maxLength={40} />
            </div>
            <div className="space-y-2">
              <fieldset className="flex flex-wrap items-center">
                <legend className="text-xl font-semibold w-full mb-2">Visibility</legend>
                <input type="radio" className="w-5 h-5 mr-1 peer/public" name="visibility" value="public" defaultChecked />
                <label className="text-md mr-4">Public</label>
                <input type="radio" className="w-5 h-5 mr-1 peer/private" name="visibility" value="private" />
                <label className="text-md">Private</label>
                <header className="hidden peer-checked/public:block text-sm w-full mt-2">Your group is visible to everyone</header>
                <header className="hidden peer-checked/private:block text-sm w-full mt-2">Your group is hidden and can only be joined through the join tab</header>
              </fieldset>
            </div>
            <div className="space-y-2">
              <fieldset className="flex flex-wrap items-center">
                <legend className="text-xl font-semibold w-full mb-2">Security</legend>
                <input type="radio" className="w-5 h-5 mr-1" name="security" value="none" defaultChecked onChange={(e) => setSecurity(e.target.value)} />
                <label className="text-md mr-4">None</label>
                <input type="radio" className="w-5 h-5 mr-1" name="security" value="password" onChange={(e) => setSecurity(e.target.value)} />
                <label className="text-md">Password</label>
              </fieldset>
            </div>
            {security === "password" &&
              <div className="space-y-2">
                <label htmlFor="password" className="block text-xl font-semibold">Password</label>
                <div className="relative">
                  <input name="password" type={passwordType} className="w-full px-3 py-2 pr-10 text-lg bg-slate-600 bg-opacity-30 rounded-md outline-none focus:ring-2 focus:ring-blue-500" required pattern="\S+" maxLength={24} />
                  <button onClick={toggleVisibility} className="absolute inset-y-0 right-0 px-3 flex items-center" type="button">
                    <FontAwesomeIcon icon={visible ? faEye : faEyeSlash} className="w-5" />
                  </button>
                </div>
              </div>
            }
            <button onClick={toggleBanner} className="flex justify-between items-center p-1 outline outline-2 outline-slate-700 rounded-md bg-slate-50 bg-opacity-5 hover:bg-opacity-10 w-full text-xl">
              Banner Image
              <FontAwesomeIcon icon={bannertoggle ? faAngleUp : faAngleDown} style={{ color: "#ffffff" }} className="h-7 flex pr-2" />
            </button>
            {bannertoggle &&
             <div className="space-y-2">
             <div className="group w-full h-40 bg-slate-600 bg-opacity-30 rounded-md relative flex flex-col items-center justify-center">
               {bannerimage === null &&
                 <>
                   <input id="banner" type="file" accept="image/*" className="absolute inset-0 text-[0px] -indent-10 cursor-pointer rounded-md z-10" onChange={handleFileChange} />
                   <FontAwesomeIcon icon={faCloudArrowUp} className="text-4xl mb-2" />
                   <label>Upload image</label>
                 </>
               }
               {bannerimage !== null &&
                 <>
                   <Image src={URL.createObjectURL(bannerimage)} alt="Banner image" fill className="absolute inset-0 rounded-md object-cover object-center" />
                   <button className="invisible group-hover:visible absolute top-1 right-1" onClick={() => setBannerImage(null)}>
                     <FontAwesomeIcon icon={faCircleXmark} color="#000000" className="w-6 h-6" />
                   </button>
                 </>
               }
             </div>
             <header className="text-sm">Ideal dimensions are 1920 x 1080</header>
           </div> 
            }
            <button onClick={toggleProfile} className="flex justify-between items-center p-1 outline outline-2 outline-slate-700 rounded-md bg-slate-50 bg-opacity-5 hover:bg-opacity-10 w-full text-xl">
              Profile Picture
              <FontAwesomeIcon icon={profiletoggle ? faAngleUp : faAngleDown} style={{ color: "#ffffff" }} className="h-7 flex pr-2" />
            </button>
            {profiletoggle &&
              <div className="space-y-2">
                <div className="flex items-center space-x-4">
                  <div className="group w-24 h-24 bg-slate-600 bg-opacity-30 rounded-full relative flex flex-col items-center justify-center">
                    {profileimage === null &&
                      <>
                        <input id="profile" type="file" accept="image/*" className="absolute inset-0 text-[0px] -indent-10 cursor-pointer rounded-full z-10" onChange={handleFileChange} />
                        <FontAwesomeIcon icon={faCloudArrowUp} className="text-2xl mb-1" />
                        <label className="text-xs">Upload image</label>
                      </>
                    }
                    {profileimage !== null &&
                      <>
                        <Image src={URL.createObjectURL(profileimage)} alt="Profile picture" fill className="absolute inset-0 rounded-full object-cover object-center" />
                        <button className="invisible group-hover:visible absolute top-1 right-1" onClick={() => setProfileImage(null)}>
                          <FontAwesomeIcon icon={faCircleXmark} color="#000000" className="w-6 h-6" />
                        </button>
                      </>
                    }
                  </div>
                </div>
                <header className="text-sm">Ideal dimensions are 800 x 800</header>
              </div>
            }
            <button type="submit" className="w-full py-2 px-4 bg-blue-900 hover:bg-blue-800 text-lg font-semibold rounded-md">Create Group</button>
          </div>
        </form>
      )
    }
    else {
      return (
        <div className="flex justify-center pt-[130px] md:pt-[82px] px-6 pb-10">
          <header className="text-offwhite text-3xl">Redirecting to your new group!</header>
        </div>
      )
    }
  }
  else {
    return (
      <div className="flex justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-4xl bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="p-8 text-center outline">
            <h2 className="text-xl sm:text-2xl font-semibold mb-4">Sign in to create a group</h2>
            <button onClick={() => signIn(undefined, { callbackUrl: `/newgroup` })} className="inline-block px-6 py-3 bg-green-500 rounded-md hover:bg-green-600">Sign In</button>
          </div>
        </div>
      </div>
    )
  }
}