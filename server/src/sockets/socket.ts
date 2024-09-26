import { Server, Socket } from "socket.io";
import Scoreboard from "../models/scoreboardModel";
import { getAllUpdatedData } from "../services/getAllUpdatedData";
import { saveNewBall } from "../services/saveNewBall";

interface NewBallPayload {
  scoreboardId: string;
  type:
    | "run"
    | "run_wicket"
    | "normal"
    | "normal_overthrow"
    | "bye"
    | "bye_overthrow"
    | "legbye"
    | "legbye_overthrow"
    | "noball"
    | "noball_overthrow"
    | "noball_bye"
    | "noball_bye_overthrow"
    | "noball_legbye"
    | "noball_legbye_overthrow"
    | "wide"
    | "wide_ball_no_ball"
    | "no_ball_wide_ball"
    | "wicket_no_ball"
    | "wide_overthrow"
    | "wide_bye"
    | "wide_bye_overthrow"
    | "wide_legbye"
    | "wide_legbye_overthrow"
    | "wicket";
  payload: {
    runs: number;
    ball: number;
    wicket: number;
    no_ball: number;
    wide_ball: number;
    legbye: number;
    bye: number;
    overthrow: number;
    onstrike: string;
    bowler: string;
  };
}

interface SwapPlayersPayload {
  scoreboardId: string;
  striker: string;
  nonStriker: string;
}

export const addNewPlayerSocket = (io: Server, socket: Socket) => {
  socket.on(
    "add-new-player",
    async ({
      scoreboardId,
      newPlayer,
    }: {
      scoreboardId: string;
      newPlayer: Record<string, any>;
    }) => {
      try {
        await Scoreboard.updateOne(
          {
            _id: scoreboardId,
          },
          {
            $set: {
              [`players.${Object.keys(newPlayer)[0]}`]:
                Object.values(newPlayer)[0],
            },
          }
        );
        // sending updated  data to the client
        const updatedData = await getAllUpdatedData();
        io.to("all").emit("updatedScoreboard", updatedData);
      } catch (error) {
        io.to("all").emit("error", {
          error: error,
          message: "Add New  Player Failed",
        });
      }
    }
  );
};

export const cleanNonStrikerInputFieldOnRunWicket = (
  io: Server,
  socket: Socket
) => {
  socket.on("clear_non_striker_input", () => {
    try {
      // Broadcasting to all clients except the one who triggered the event
      socket.broadcast.to("all").emit("nonstriker_input_cleaned");
    } catch (error: any) {
      console.error(
        "Error in clear_non_striker_input event:",
        error.message || error
      );
      io.to("all").emit("error", {
        error: error,
        message: "Clear Non Striker Input Error!",
      });
    }
  });
};

export const clearStrikerInputFieldOnWicket = async (
  io: Server,
  socket: Socket
): Promise<void> => {
  socket.on("clear_striker_input", () => {
    try {
      // Broadcasting to all clients except the one who triggered the event
      socket.broadcast.to("all").emit("striker_input_cleaned");
    } catch (error: any) {
      console.error(
        "Error in clear_striker_input event:",
        error.message || error
      );

      // Emitting error to all connected clients
      io.to("all").emit("error", {
        error: error.message || error,
        message: "Clear Striker Input Error!",
      });
    }
  });
};

export const clearScoreboardSocket = (io: Server, socket: Socket): void => {
  socket.on("clear_scoreboard", async (id: string) => {
    try {
      // Check if the scoreboard exists before deleting
      const scoreboard = await Scoreboard.findById(id);
      if (!scoreboard) {
        throw new Error("Scoreboard not found.");
      }

      // Delete the existing scoreboard
      await Scoreboard.deleteOne({ _id: id });

      // Create a new scoreboard with initial values
      const newScoreboard = new Scoreboard({
        team_scoreboard: {
          total_runs: 0,
          total_wickets: 0,
          total_wide_balls: 0,
          total_no_balls: 0,
          total_balls: 0,
        },
        players: {},
        bowler: {},
      });
      await newScoreboard.save();

      // Sending updated data to the frontend
      const updatedData = await getAllUpdatedData();
      io.to("all").emit("updatedScoreboard", updatedData);
    } catch (error: any) {
      console.error("Error in clear-scoreboard event:", error.message || error);

      // Emit error to all clients in case of failure
      io.to("all").emit("error", {
        error: error.message || error,
        message: "Clear Scoreboard Error!",
      });
    }
  });
};

export const newBallSocket = (io: Server, socket: Socket): void => {
  socket.on(
    "new-ball",
    async ({ scoreboardId, type, payload }: NewBallPayload) => {
      try {
        // Saving new ball event to db
        await saveNewBall({ scoreboardId, type, payload });

        switch (type) {
          case "run":
            await Scoreboard.updateOne(
              { _id: scoreboardId },
              {
                $inc: {
                  "team_scoreboard.total_runs": payload.runs,
                  "team_scoreboard.total_balls": 1,
                  [`players.${payload.onstrike}.runs`]: payload.runs,
                },
              }
            );
            break;

          case "wicket":
            await Scoreboard.updateOne(
              { _id: scoreboardId },
              {
                $inc: {
                  "team_scoreboard.total_wickets": 1,
                  "team_scoreboard.total_balls": 1,
                },
                $set: {
                  [`players.${payload.onstrike}.review`]: "played",
                },
              }
            );
            break;

          case "run_wicket":
            await Scoreboard.updateOne(
              { _id: scoreboardId },
              {
                $inc: {
                  "team_scoreboard.total_runs": payload.runs,
                  "team_scoreboard.total_wickets": 1,
                  "team_scoreboard.total_balls": 1,
                },
                $set: {
                  [`players.${payload.onstrike}.runs`]: payload.runs,
                  [`players.${payload.onstrike}.review`]: "played",
                },
              }
            );
            break;

          case "normal":
            // Additional logic for normal ball
            await Scoreboard.updateOne(
              { _id: scoreboardId },
              {
                $inc: {
                  "team_scoreboard.total_balls": 1,
                  [`players.${payload.onstrike}.runs`]: 0,
                },
              }
            );
            break;

          case "normal_overthrow":
            await Scoreboard.updateOne(
              { _id: scoreboardId },
              {
                $inc: {
                  "team_scoreboard.total_runs": payload.runs,
                  "team_scoreboard.total_balls": 1,
                  [`players.${payload.onstrike}.runs`]: payload.runs,
                  [`players.${payload.bowler}.overthrows`]:
                    payload.overthrow || 0, // Assuming an `overthrows` field exists
                },
              }
            );
            break;

          case "bye":
            await Scoreboard.updateOne(
              { _id: scoreboardId },
              {
                $inc: {
                  "team_scoreboard.total_runs": payload.bye,
                  "team_scoreboard.total_balls": 1,
                },
              }
            );
            break;

          case "bye_overthrow":
            await Scoreboard.updateOne(
              { _id: scoreboardId },
              {
                $inc: {
                  "team_scoreboard.total_runs": payload.bye,
                  "team_scoreboard.total_balls": 1,
                  [`players.${payload.bowler}.overthrows`]:
                    payload.overthrow || 0,
                },
              }
            );
            break;

          case "legbye":
            await Scoreboard.updateOne(
              { _id: scoreboardId },
              {
                $inc: {
                  "team_scoreboard.total_runs": payload.legbye,
                  "team_scoreboard.total_balls": 1,
                },
              }
            );
            break;

          case "legbye_overthrow":
            await Scoreboard.updateOne(
              { _id: scoreboardId },
              {
                $inc: {
                  "team_scoreboard.total_runs": payload.legbye,
                  "team_scoreboard.total_balls": 1,
                  [`players.${payload.bowler}.overthrows`]:
                    payload.overthrow || 0,
                },
              }
            );
            break;

          case "noball":
            await Scoreboard.updateOne(
              { _id: scoreboardId },
              {
                $inc: {
                  "team_scoreboard.total_runs": payload.runs,
                  "team_scoreboard.total_no_balls": 1,
                  [`players.${payload.onstrike}.runs`]: payload.runs,
                },
              }
            );
            break;

          case "noball_overthrow":
            await Scoreboard.updateOne(
              { _id: scoreboardId },
              {
                $inc: {
                  "team_scoreboard.total_runs": payload.runs,
                  "team_scoreboard.total_no_balls": 1,
                  [`players.${payload.onstrike}.runs`]: payload.runs,
                  [`players.${payload.bowler}.overthrows`]:
                    payload.overthrow || 0,
                },
              }
            );
            break;

          case "noball_bye":
            await Scoreboard.updateOne(
              { _id: scoreboardId },
              {
                $inc: {
                  "team_scoreboard.total_runs": payload.bye,
                  "team_scoreboard.total_no_balls": 1,
                },
              }
            );
            break;

          case "noball_bye_overthrow":
            await Scoreboard.updateOne(
              { _id: scoreboardId },
              {
                $inc: {
                  "team_scoreboard.total_runs": payload.bye,
                  "team_scoreboard.total_no_balls": 1,
                  [`players.${payload.bowler}.overthrows`]:
                    payload.overthrow || 0,
                },
              }
            );
            break;

          case "noball_legbye":
            await Scoreboard.updateOne(
              { _id: scoreboardId },
              {
                $inc: {
                  "team_scoreboard.total_runs": payload.legbye,
                  "team_scoreboard.total_no_balls": 1,
                },
              }
            );
            break;

          case "noball_legbye_overthrow":
            await Scoreboard.updateOne(
              { _id: scoreboardId },
              {
                $inc: {
                  "team_scoreboard.total_runs": payload.legbye,
                  "team_scoreboard.total_no_balls": 1,
                  [`players.${payload.bowler}.overthrows`]:
                    payload.overthrow || 0,
                },
              }
            );
            break;

          case "wide":
            await Scoreboard.updateOne(
              { _id: scoreboardId },
              {
                $inc: {
                  "team_scoreboard.total_runs": payload.runs,
                  "team_scoreboard.total_wide_balls": 1,
                  [`players.${payload.onstrike}.runs`]: payload.runs,
                },
              }
            );
            break;

          case "wide_overthrow":
            await Scoreboard.updateOne(
              { _id: scoreboardId },
              {
                $inc: {
                  "team_scoreboard.total_runs": payload.runs,
                  "team_scoreboard.total_wide_balls": 1,
                  [`players.${payload.onstrike}.runs`]: payload.runs,
                  [`players.${payload.bowler}.overthrows`]:
                    payload.overthrow || 0,
                },
              }
            );
            break;

          case "wide_bye":
            await Scoreboard.updateOne(
              { _id: scoreboardId },
              {
                $inc: {
                  "team_scoreboard.total_runs": payload.bye,
                  "team_scoreboard.total_wide_balls": 1,
                },
              }
            );
            break;

          case "wide_bye_overthrow":
            await Scoreboard.updateOne(
              { _id: scoreboardId },
              {
                $inc: {
                  "team_scoreboard.total_runs": payload.bye,
                  "team_scoreboard.total_wide_balls": 1,
                  [`players.${payload.bowler}.overthrows`]:
                    payload.overthrow || 0,
                },
              }
            );
            break;

          case "wide_legbye":
            await Scoreboard.updateOne(
              { _id: scoreboardId },
              {
                $inc: {
                  "team_scoreboard.total_runs": payload.legbye,
                  "team_scoreboard.total_wide_balls": 1,
                },
              }
            );
            break;
          case "wide_legbye_overthrow":
            await Scoreboard.updateOne(
              { _id: scoreboardId },
              {
                $inc: {
                  "team_scoreboard.total_runs": payload.legbye,
                  "team_scoreboard.total_wide_balls": 1,
                  [`players.${payload.bowler}.overthrows`]:
                    payload.overthrow || 0,
                },
              }
            );
            break;

          case "wide_ball_no_ball":
          case "no_ball_wide_ball":
            await Scoreboard.updateOne(
              { _id: scoreboardId },
              {
                $inc: {
                  "team_scoreboard.total_runs": payload.runs,
                  "team_scoreboard.total_no_balls": 1,
                  "team_scoreboard.total_wide_balls": 1,
                  [`players.${payload.onstrike}.runs`]: payload.runs,
                },
              }
            );
            break;

          case "wicket_no_ball":
            await Scoreboard.updateOne(
              { _id: scoreboardId },
              {
                $inc: {
                  "team_scoreboard.total_wickets": 1,
                  "team_scoreboard.total_no_balls": 1,
                  [`players.${payload.onstrike}.runs`]: payload.runs,
                },
              }
            );
            break;

          default:
            throw new Error("Unknown ball type");
        }

        // Send updated data to the frontend
        const updatedData = await getAllUpdatedData();
        io.to("all").emit("updatedScoreboard", updatedData);
      } catch (error: any) {
        io.to("all").emit("error", {
          error: error.message || error,
          message: "New Ball Error!",
        });
      }
    }
  );
};

export const swapStrikerNonStriker = (io: Server, socket: Socket): void => {
  socket.on(
    "set_swap_players",
    async ({ scoreboardId, striker, nonStriker }: SwapPlayersPayload) => {
      try {
        console.log(
          `Swapping players for scoreboard: ${scoreboardId}, Striker: ${striker}, NonStriker: ${nonStriker}`
        );

        // Fetch the scoreboard to ensure both players exist
        const scoreboard = await Scoreboard.findById(scoreboardId);
        if (!scoreboard) {
          throw new Error("Scoreboard not found");
        }

        const players: Map<string, any> = scoreboard.player;

        // Ensure both striker and nonStriker exist in the players list
        if (!players.has(striker) || !players.has(nonStriker)) {
          throw new Error("One or both players not found");
        }

        // Swap the striker and non-striker roles
        await Scoreboard.updateOne(
          { _id: scoreboardId },
          {
            $set: {
              [`players.${striker}.review`]: "nonstriker",
              [`players.${nonStriker}.review`]: "striker",
            },
          }
        );

        // Sending updated data to the frontend
        const updatedData = await getAllUpdatedData();
        io.to("all").emit("updatedScoreboard", updatedData);
      } catch (error:any) {
        console.error("Swap Striker Non Striker Error:", error.message);
        io.to("all").emit("error", {
          error: error.message || error,
          message: "Swap Striker Non Striker Error!",
        });
      }
    }
  );
};
