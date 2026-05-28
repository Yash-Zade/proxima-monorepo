import React, { useEffect, useState } from "react";
import apiClient from "../Auth/ApiClient";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "../ui/card";
import { Briefcase, Mail, Building, Globe } from "lucide-react";
// import WalletComponent from "../Wallet/Wallet";

const EmployerProfile = () => {
  const [employerProfile, setEmployerProfile] = useState({});

  useEffect(() => {
    // async function GetProfile(){
    //   const currProfile=await apiClient.get(`/employers/profile/${id}`)
    //   setEmployerProfile(currProfile)
    // }
    // GetProfile()
  }, [])

  const dummyProfile = {
    name: "Sarah Johnson",
    email: "sarah.johnson@techcorp.com",
    company: "TechCorp Industries",
    website: "www.techcorp.com",
  };

  return (
    <div className="w-full max-w-2xl mx-auto py-12 px-4 selection:bg-zinc-800 selection:text-white">
      <Card className="bg-zinc-950 border-zinc-800 shadow-2xl">
        <CardHeader className="border-b border-zinc-800 pb-6">
          <CardTitle className="text-2xl font-bold text-zinc-100 tracking-tight flex items-center gap-2">
            <Building className="w-6 h-6 text-zinc-400" />
            Enterprise Node Profile
          </CardTitle>
          <CardDescription className="text-zinc-500 uppercase tracking-widest text-xs mt-2">
            Authorized Corporate Operator
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-8 space-y-6">
          <div className="space-y-4">
            {/* Operator Details */}
            <div className="flex items-center space-x-4 p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
              <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700">
                <span className="text-xl font-bold text-zinc-300">
                  {dummyProfile.name.charAt(0)}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-zinc-100">{dummyProfile.name}</h3>
                <div className="flex items-center text-zinc-400 mt-1 gap-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  <span className="text-sm">{dummyProfile.email}</span>
                </div>
              </div>
            </div>

            {/* Corporate Details */}
            <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg space-y-3">
              <div className="flex items-center gap-2 text-zinc-100 font-semibold mb-2 line-clamp-1 pb-2 border-b border-zinc-800 last:mb-0">
                <Briefcase className="w-4 h-4 text-zinc-500" />
                {dummyProfile.company}
              </div>
              <div className="flex items-center gap-2 text-zinc-400">
                <Globe className="w-4 h-4 text-zinc-500" />
                <a
                  href={`https://${dummyProfile.website}`}
                  className="text-sm hover:text-zinc-100 transition-colors cursor-pointer"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {dummyProfile.website}
                </a>
              </div>
            </div>

            {/* <WalletComponent /> */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployerProfile;