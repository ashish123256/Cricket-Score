import mongoose from "mongoose";
import NewBallEvent, { NewBallEventPayload } from "../models/newBallModel";

export const saveNewBall = async ({
  scoreboardId,
  type,
  payload,
}: {
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
  payload: NewBallEventPayload;
}) => {
  try {
    // Validate scoreboardId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(scoreboardId)) {
      throw new Error("Invalid scoreboardId");
    }

    // Validate required fields in the payload
    const { bowler, onstrike } = payload;
    if (!bowler || !onstrike) {
      throw new Error("Bowler and Onstrike are required fields.");
    }

    // Create and save the new ball event
    const newBallEvent = new NewBallEvent({
      scoreboardId,
      type,
      payload,
    });

    await newBallEvent.save();
    console.log("New ball event saved successfully");

  } catch (error) {
    console.error("Error saving new ball event:", error);
    throw error;
  }
};
