import { getUserOnboardingStatus } from '@/actions/user';
import { redirect } from 'next/navigation'; // ✅ Correct import
import React from 'react';

const Dashboard = async () => {
  const { isOnboarded } = await getUserOnboardingStatus();

  if (!isOnboarded) {
    redirect("/onboarding"); // ✅ This stops execution
  }

  return (
    <main>
      <div>Dashboard</div>
    </main>
  );
};

export default Dashboard;
