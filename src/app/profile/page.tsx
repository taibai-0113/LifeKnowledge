import { TopBar } from "@/components/layout/TopBar";
import { ProfileClient } from "./ProfileClient";

export default function ProfilePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <TopBar title="我的" />
      <div className="px-4 py-5">
        <ProfileClient />
      </div>
    </div>
  );
}
