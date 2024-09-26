import mongoose, { Document, Schema } from "mongoose";

// Interface for Team Scoreboard
interface TeamScoreboard {
  total_runs: number;
  total_wickets: number;
  total_wide_balls: number;
  total_no_balls: number;
  total_byes: number;
  total_legbyes: number;
  total_balls: number;
}

// Interface for Player Schema
interface Player {
  runs: number;
  balls_faced: number;
  wickets_taken: number;
  overs_bowled: number;
  runs_conceded: number;
  extras_conceded: number;
  review: "striker" | "nonstriker" | "bowler" | "unplayed" | "played";
}

// Interface for Extras
interface Extras {
  wides: number;
  no_balls: number;
  byes: number;
  legbyes: number;
}

// Interface for Scoreboard document
interface ScoreboardDocument extends Document {
  team_scoreboard: TeamScoreboard;
  player: Map<string, Player>;
  bowler: Map<string, Player>;
  extras: Extras;
  total_overs: number;
}

// Schema for Team Scoreboard
const teamScoreboardSchema = new Schema<TeamScoreboard>({
  total_runs: { type: Number, default: 0 },
  total_wickets: { type: Number, default: 0 },
  total_wide_balls: { type: Number, default: 0 },
  total_no_balls: { type: Number, default: 0 },
  total_byes: { type: Number, default: 0 },
  total_legbyes: { type: Number, default: 0 },
  total_balls: { type: Number, default: 0 },
});

// Schema for Player
const playerSchema = new Schema<Player>({
  runs: { type: Number, default: 0 },
  balls_faced: { type: Number, default: 0 },
  wickets_taken: { type: Number, default: 0 },
  overs_bowled: { type: Number, default: 0 },
  runs_conceded: { type: Number, default: 0 },
  extras_conceded: { type: Number, default: 0 },
  review: {
    type: String,
    enum: ["striker", "nonstriker", "bowler", "unplayed", "played"],
    default: "unplayed",
  },
});

// Schema for Scoreboard
const scoreboardSchema = new Schema<ScoreboardDocument>({
  team_scoreboard: { type: teamScoreboardSchema, required: true },
  player: { type: Map, of: playerSchema, default: {} },
  bowler: { type: Map, of: playerSchema, default: {} },
  extras: {
    type: {
      wides: { type: Number, default: 0 },
      no_balls: { type: Number, default: 0 },
      byes: { type: Number, default: 0 },
      legbyes: { type: Number, default: 0 },
    },
    default: {},
  },
  total_overs: { type: Number, default: 0 },
});

// Creating and exporting the Scoreboard model
const Scoreboard = mongoose.model<ScoreboardDocument>("Scoreboard", scoreboardSchema);
export default Scoreboard;
