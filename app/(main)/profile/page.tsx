import { Suspense } from "react";
import { ProfileData } from "./ProfileData";
import { ProfileSkeleton } from "@/components/skeletons/ProfileSkeleton";

export default function ProfilePage() {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <ProfileData />
    </Suspense>
  );
}
