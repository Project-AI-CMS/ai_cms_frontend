"use client";

import { UserProfile } from "@/components/UserProfile";
import type { UserInfo } from "@/types";

const UserProfilePage = () => {
  const currentUser: UserInfo = {
    name: "Li Wei",
    role: "Maintenance Manager",
    email: "li.wei@example.com",
  };

  return (
    <div className="p-6">
      <UserProfile user={currentUser} />
    </div>
  );
};

export default UserProfilePage;
