// pages/profile.tsx
import ProfileForm from "@/components/ProfileForm";
import { Icons } from "@/components/ui/icons";

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8 flex items-center justify-center">
          <Icons.user className="mr-2 h-8 w-8" />
          Your Profile
        </h1>
        <div className="bg-white shadow-lg rounded-lg p-8">
          <ProfileForm />
        </div>
      </div>
    </div>
  );
}
