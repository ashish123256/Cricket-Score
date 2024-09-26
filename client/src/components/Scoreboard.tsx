import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";
import  { useEffect, useRef } from "react";
import { setNonStriker, setScoreboard, setStriker, setBowler } from "../redux/scoreboardSlice";
import { socket } from "../services/socket";
import EventButton from "./EventButton";

const Scoreboard = () => {
    const dispatch = useDispatch();
    const scoreboard = useSelector((state: RootState) => state.scoreboard.scoreboard);
    const striker = useSelector((state: RootState) => state.scoreboard.striker);
    const nonStriker = useSelector((state: RootState) => state.scoreboard.nonStriker);
    const bowler = useSelector((state: RootState) => state.scoreboard.bowler);

    // Use useRef to keep track of the current action
    const currAction = useRef({
        type: "",
        scoreboardId: scoreboard?._id,
        payload: {
            runs: 0,
            ball: 0,
            wicket: 0,
            wide_ball: 0,
            no_ball: 0,
            onstrike: striker,
        },
    });

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const response = await fetch("http://localhost:8000/api/scoreboard");
                const data = await response.json();
                console.log(data);

                if (data.data && data.data.length > 0) {
                    dispatch(setScoreboard(data.data[0]));

                    // Set striker, non-striker, and bowler
                    Object.keys(data.data[0].players).forEach((player) => {
                        if (data.data[0].players[player].review === "striker") {
                            dispatch(setStriker(player));
                        }
                        if (data.data[0].players[player].review === "nonstriker") {
                            dispatch(setNonStriker(player));
                        }
                        if (data.data[0].players[player].review === "bowler") {
                            dispatch(setBowler(player));
                        }
                    });
                }
            } catch (error) {
                console.error("Error fetching initial data:", error);
            }
        };

        fetchInitialData();
    }, [dispatch]);

    // Function to update scoreboard and emit new ball event
    const updateScoreboard = () => {
        if (!currAction.current.type) {
          alert("Please select some event first!");
          return;
        }
      
        // Emit the action through the socket
        socket.emit("new-ball", currAction.current);
      
        // Example: manually update local Redux state (optional)
        dispatch(setScoreboard({
          ...scoreboard,
          team_scoreboard: {
            ...scoreboard.team_scoreboard,
            total_balls:scoreboard.team_scoreboard.total_balls,
            total_runs: scoreboard.team_scoreboard.total_runs + currAction.current.payload.runs,
            total_wide_balls: scoreboard.team_scoreboard.total_wide_balls + currAction.current.payload.wide_ball,
            total_no_balls: scoreboard.team_scoreboard.total_no_balls + currAction.current.payload.no_ball,
            total_wickets: scoreboard.team_scoreboard.total_wickets + currAction.current.payload.wicket,
          },
        }));
      
        currAction.current.type = "";
      };
      

    const clearScoreBoard = () => {
        socket.emit("clear-scoreboard", scoreboard._id);
        dispatch(setScoreboard({})); // Reset scoreboard state
        dispatch(setStriker(""));
        dispatch(setNonStriker(""));
        dispatch(setBowler(""));
    };

    // List of buttons to be rendered using EventButton
    const buttons = [
        { type: "run", value: 1, title: "1 Run" },
        { type: "run", value: 4, title: "4 Runs" },
        { type: "run", value: 6, title: "6 Runs" },
        { type: "wicket", title: "Wicket" },
        { type: "wide_ball", title: "Wide Ball" },
        { type: "no_ball", title: "No Ball" },
    ];

    
    return (
        <div className="w-full flex md:flex-col">
            <div className="w-4/6">
                {/* Player Inputs */}
                <div className="flex gap-5 w-4/6">
                    <div className="flex flex-col">
                        <label htmlFor="Striker">Batsman (Striker)</label>
                        <input
                            className="max-w-[200px] border border-blue-100"
                            type="text"
                            id="Striker"
                            value={striker}
                            onChange={(e) => dispatch(setStriker(e.target.value))}
                        />
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="nonStriker">Batsman (Non Striker)</label>
                        <input
                            className="max-w-[200px] border border-blue-100"
                            type="text"
                            id="nonStriker"
                            value={nonStriker}
                            onChange={(e) => dispatch(setNonStriker(e.target.value))}
                        />
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="bowler">Bowler</label>
                        <input
                            className="max-w-[200px] border border-blue-100"
                            type="text"
                            id="bowler"
                            value={bowler}
                            onChange={(e) => dispatch(setBowler(e.target.value))}
                        />
                    </div>
                </div>

                {/* Scoreboard Info */}
                <h3>Score: {scoreboard.team_scoreboard?.total_runs}</h3>
                <h3>Extras: {scoreboard.team_scoreboard?.total_wide_balls}</h3>

                {/* Event Buttons */}
                <div className="flex flex-col gap-2">
                    {buttons.map((button, index) => (
                        <EventButton key={index} button={button} currAction={currAction} />
                    ))}

                    {/* Control Buttons */}
                    <div className="flex gap-2">
                        <button
                            className="bg-green-900 max-w-[250px] w-full h-[80px] flex items-center justify-center text-xl text-white rounded-lg"
                            onClick={updateScoreboard}
                        >
                            New Ball
                        </button>
                        <button
                            className="bg-red-900 max-w-[250px] w-full h-[80px] flex items-center justify-center text-xl text-white rounded-lg"
                            onClick={clearScoreBoard}
                        >
                            Clear Scoreboard
                        </button>
                    </div>
                </div>
            </div>

            {/* Scoreboard Summary */}
            <div className="w-2/6 flex flex-col gap-5 md:w-full">
                <h1 className="text-xl flex justify-center">Scoreboard</h1>
                <div className="flex flex-col gap-2 justify-between">
                    {/* Team Stats */}
                    <div className="flex gap-2 bg-zinc-200 justify-between">
                        <span>Total Runs</span>
                        <span>Total Balls</span>
                        <span>Total Wide Balls</span>
                        <span>Total No Balls</span>
                        <span>Total Wicket</span>
                    </div>
                    <div className="flex gap-2 justify-between">
                        <span>{scoreboard.team_scoreboard?.total_runs}</span>
                        <span>{scoreboard.team_scoreboard?.total_balls}</span>
                        <span>{scoreboard.team_scoreboard?.total_wide_balls}</span>
                        <span>{scoreboard.team_scoreboard?.total_no_balls}</span>
                        <span>{scoreboard.team_scoreboard?.total_wickets}</span>
                    </div>

                    {/* Player Scoreboard */}
                    <h2 className="text-xl flex justify-center">Player Scoreboard</h2>
                    <div className="flex flex-col gap-2 justify-between">
                        <h1 className="bg-zinc-300 p-1 w-full">Batsman</h1>
                        <h2 className="bg-green-400 p-1">{striker}</h2>
                        <h2 className="bg-yellow-400 p-1">{nonStriker}</h2>
                    </div>
                    <div className="flex flex-col gap-2 justify-between">
                        <h1 className="bg-zinc-300 p-1 w-full">Bowler</h1>
                        <h2 className="bg-blue-400 p-1">{bowler}</h2>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Scoreboard;
