import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard with profile tab
    router.push('/dashboard?tab=profile');
  }, [router]);

  return (
    <Layout title="Profile">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Profile</h1>
          <p>Redirecting to your profile...</p>
        </div>
      </div>
    </Layout>
  );
} 