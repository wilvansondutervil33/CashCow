import {Grid} from '@mui/material';
import AtmCard from './AtmCard.jsx';

function AtmList({atms}) {
    return (
        <Grid container spacing = {2}>
            {/**
             * The map function is used to iterate over the 'robots' array and render
             * a RobotCard component for each robot
             */}
             {atms.map((a)=> (
            <Grid item key={a.id}>
                <AtmCard atm={a} />
            </Grid>
        ))}
        </Grid>
    );
}

export default AtmList;