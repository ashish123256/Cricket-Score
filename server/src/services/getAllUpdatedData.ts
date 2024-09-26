import Scoreboard from "../models/scoreboardModel";

export const getAllUpdatedData = async() =>{
   try {
     // Fetch the most recent scoreboard, assuming only one scoreboard should be active
     const data = await Scoreboard.find(); 
     if (!data) {
       throw new Error("No scoreboard data found.");
     }
     return data;
   } catch (error) {
    console.error("Error fetching updated scoreboard data:", error);
    throw error;
   }
}