import mongoose, { Document, Schema } from "mongoose";

// Interface for the payload
interface Payload {
  runs: number;
  balls: number;
  extras: {
    wide: number;
    no_ball: number;
    bye: number;
    legbye: number;
  };
  overthrow: number;
  wicket: number;
  onstrike: string;
  bowler: string;
}

// Interface for BallEvent document
export interface BallEventDocument extends Document {
  scoreboardId: mongoose.Types.ObjectId;
  type: 
    | "run"
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
    | "wide_overthrow"
    | "wide_bye"
    | "wide_bye_overthrow"
    | "wide_legbye"
    | "wide_legbye_overthrow"
    | "wicket";
  payload: Payload;
}

// Schema definition for BallEvent
const ballEventSchema = new Schema<BallEventDocument>(
  {
    scoreboardId: {
      type: Schema.Types.ObjectId,
      ref: "Scoreboard",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "run",
        "normal",
        "normal_overthrow",
        "bye",
        "bye_overthrow",
        "legbye",
        "legbye_overthrow",
        "noball",
        "noball_overthrow",
        "noball_bye",
        "noball_bye_overthrow",
        "noball_legbye",
        "noball_legbye_overthrow",
        "wide",
        "wide_overthrow",
        "wide_bye",
        "wide_bye_overthrow",
        "wide_legbye",
        "wide_legbye_overthrow",
        "wicket",
      ],
      required: true,
    },
    payload: {
      runs: { type: Number, default: 0 },
      balls: { type: Number, default: 0 }, 
      extras: {
        type: {
          wide: { type: Number, default: 0 },
          no_ball: { type: Number, default: 0 },
          bye: { type: Number, default: 0 },
          legbye: { type: Number, default: 0 },
        },
        default: {},
      },
      overthrow: { type: Number, default: 0 },
      wicket: { type: Number, default: 0 },
      onstrike: { type: String },
      bowler: { type: String},
    },
  },
  { timestamps: true }
);


const MatchEvent = mongoose.model<BallEventDocument>("BallEvent", ballEventSchema);
export default MatchEvent;
