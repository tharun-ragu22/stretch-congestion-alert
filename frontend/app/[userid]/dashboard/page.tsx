import React from 'react';

interface DashboardProps {
  params: {
    userid: string;
  };
}

const UserDashboardPage: React.FC<DashboardProps> = async ({ params } : DashboardProps) => {
  const { userid } = await params;

  return (
    <div>
      Current user: {userid}
    </div>
  )
}

export default UserDashboardPage;