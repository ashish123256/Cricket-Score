
import Scoreboard from "../models/scoreboardModel";
import  { NextFunction, Request, Response } from "express";


export const scoreboardController = async(req:Request, res:Response,next:NextFunction)=>{
    try {
        let scoreboard = await Scoreboard.findOne();
        if(!scoreboard) {
            const newScoreboard = new Scoreboard({
                team_scoreboard: {
                  total_runs: 0,
                  total_wickets: 0,
                  total_wide_balls: 0,
                  total_no_balls: 0,
                  total_balls: 0,
                  total_byes:0,
                  total_legbyes:0,
                },
                players: {},  
                bowlers: {},
            });
            await newScoreboard.save();

            res.json({
                code:200,
                message:"New scoreboard created",
                data:newScoreboard
            })
        }else{
               res.json({
                code: 200,
                error: "",
                message: "Scoreboard found",
                data: scoreboard,
              });
        }
    } catch (error) {
        next(error)
    }

}