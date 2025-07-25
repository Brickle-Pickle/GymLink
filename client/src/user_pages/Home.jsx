import React from 'react'
import DashboardHeader from '../components/dashboard/DashboardHeader';
import RecentWorkouts from '../components/dashboard/RecentWorkouts';
import ProgressChart from '../components/dashboard/ProgressChart';
import FriendActivity from '../components/dashboard/FriendActivity';

const Home = () => {
    return (
        <>
            <DashboardHeader />
            <RecentWorkouts />
            <ProgressChart />
            <FriendActivity />
        </>
    )
}

export default Home;