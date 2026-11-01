import { MyProfile } from '@/components/profile/my-profile';
import { ProfileDetail } from '@/components/profile/profile-detail';

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ user?: string; preview?: string }>;
}) {
  const params = await searchParams;
  return params.user ? (
    <ProfileDetail id={params.user} />
  ) : (
    <MyProfile initialPreview={params.preview === 'true'} />
  );
}
