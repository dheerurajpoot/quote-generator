import express from "express";
import next from "next";
import { startCronJobs } from "./src/lib/cron-config.js";
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
	// Start the cron jobs
	startCronJobs();
	console.log("Cron jobs started successfully");

	// Create Express server
	const server = express();

	// Handle all routes with Next.js
	server.all("*", (req, res) => {
		return handle(req, res);
	});

	// Start the server
	const port = process.env.PORT || 3000;
	server.listen(port, (err) => {
		if (err) throw err;
		console.log(`> Ready on http://localhost:${port}`);
	});
});

// This file is used to start the cron jobs when the server starts
// It should be run alongside the Next.js server
console.log("Server started");
