// store/scoreboard/scoreboardSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IData } from '../interface/index'; // Adjust the import path as needed

interface ScoreboardState {
    scoreboard: IData;
    striker: string;
    nonStriker: string;
    bowler:string;
}

const initialState: ScoreboardState = {
    scoreboard: {
        _id: "",
        __v: 0,
        team_scoreboard: {
            _id: "",
            total_runs: 0,
            total_wickets: 0,
            total_wide_balls: 0,
            total_no_balls: 0,
            total_balls: 0,
            total_byes: 0,
            total_legbyes: 0,
        },
        players: {},
    },
    striker: "",
    nonStriker: "",
    bowler:"",
};

const scoreboardSlice = createSlice({
    name: 'scoreboard',
    initialState,
    reducers: {
        setScoreboard: (state, action: PayloadAction<IData>) => {
            state.scoreboard = action.payload;
        },
        setStriker: (state, action: PayloadAction<string>) => {
            state.striker = action.payload;
        },
        setNonStriker: (state, action: PayloadAction<string>) => {
            state.nonStriker = action.payload;
        },
        setBowler: (state, action: PayloadAction<string>) => { // New action to set bowler
            state.bowler = action.payload;
        },
        swapPlayers: (state) => {
            [state.striker, state.nonStriker] = [state.nonStriker, state.striker];
        },
    },
});

export const {
    setScoreboard,
    setStriker,
    setNonStriker,
    swapPlayers,
    setBowler
} = scoreboardSlice.actions;

export default scoreboardSlice.reducer;
