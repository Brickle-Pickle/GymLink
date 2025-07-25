import React from 'react'
import DashboardHeader from '../components/dashboard/DashboardHeader';
import RecentWorkouts from '../components/dashboard/RecentWorkouts';

const Home = () => {
    return (
        <>
            <DashboardHeader />
            <RecentWorkouts />
        </>
    )
}

export default Home;