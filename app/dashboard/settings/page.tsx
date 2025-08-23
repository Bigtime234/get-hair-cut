
import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import SettingsCard from "./settings-card"
import { Session } from "next-auth";

export default async function settings() {
    const session = await auth();
    if(!session) redirect("/");
    if(session)
         return(
            <SettingsCard session={session} />
        )
}