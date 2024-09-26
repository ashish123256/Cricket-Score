import mongoose, { Document, Schema } from "mongoose";

// Interface for the payload in NewBallEvent
export interface NewBallEventPayload {
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
}

export interface  NewBallEventDocument extends Document {
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
    payload: NewBallEventPayload;
}


const newBallEventSchema = new Schema<NewBallEventDocument>(  {
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
      onstrike: { type: String, required: true },
      bowler: { type: String, required: true },
    },
  },
  { timestamps: true }
)


const NewBallEvent = mongoose.model<NewBallEventDocument>("NewBallEvent", newBallEventSchema);
export default NewBallEvent;
