import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "presence sweep",
  { seconds: 5 },
  internal.scheduled.checkPresence,
  {},
);

crons.interval(
  "cleanup stale games",
  { hours: 1 },
  internal.scheduled.cleanupStaleGames,
  {},
);

export default crons;
