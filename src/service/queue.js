import { Queue } from "bullmq";

export const connection = {
  host: "localhost",
  port: 6380,
};

export const emailQueue = new Queue("emails", { connection });

