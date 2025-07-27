import React from 'react'
import RoutinesHeader from '../components/routines/RoutinesHeader';
import RoutineGrid from '../components/routines/RoutineGrid';
import RoutineBuilder from '../components/routines/RoutineBuilder';

const Routines = () => {
    return (
        <>
            <RoutinesHeader />
            <RoutineGrid />
            <RoutineBuilder />
        </>
    )
}

export default Routines;