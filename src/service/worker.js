import { Worker } from "bullmq";
import { connection } from "./queue.js";

const emailWorker = new Worker(
  "emails",
  async () => {
    console.log("Queue job has started...");
    await new Promise((resolve) =>
      setTimeout(() => {
        resolve;
      }, 1500),
    );
  },
  { connection },
);


emailWorker.on("completed", (job)=>{
    console.log("Job completed")
})

emailWorker.on("failed", (job, error)=>{
    console.log("Job failed..", error)
})