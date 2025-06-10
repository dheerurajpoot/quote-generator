import express from "express";
import next from "next";
// import { startCronJobs } from "./src/lib/cron-config.js";
import https from "https";
import { certificateFor } from "devcert";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

// Global flag to track if cron jobs are started
global.cronJobsStarted = false;

const setupServer = async () => {
	try {
		await app.prepare();

		// Create Express server
		const server = express();

		// Increase the timeout for all routes
		server.use((req, res, next) => {
			req.setTimeout(60000); // 60 seconds
			res.setTimeout(60000);
			next();
		});

		// Add error handling middleware
		server.use((err, req, res, next) => {
			console.error("Server error:", err);
			res.status(500).json({ error: "Internal server error" });
		});

		// Handle all routes with Next.js
		server.all("*", (req, res) => {
			return handle(req, res);
		});

		// Start the server
		const port = process.env.PORT || 3000;

		if (dev) {
			try {
				// Get SSL certificate from devcert
				const ssl = await certificateFor("localhost");

				// Create HTTPS server with the certificate and proper options
				const httpsServer = https.createServer(
					{
						...ssl,
						keepAlive: true,
						timeout: 60000,
						requestTimeout: 60000,
					},
					server
				);

				httpsServer.listen(port, (err) => {
					if (err) throw err;
					console.log(`> Ready on https://localhost:${port}`);
				});
			} catch (error) {
				console.error("Error setting up HTTPS:", error);
				console.log("Falling back to HTTP server");

				// Fallback to HTTP if HTTPS setup fails
				server.listen(port, (err) => {
					if (err) throw err;
					console.log(`> Ready on http://localhost:${port}`);
				});
			}
		} else {
			// Production server (HTTP)
			server.listen(port, (err) => {
				if (err) throw err;
				console.log(`> Ready on http://localhost:${port}`);
			});
		}

		// // Start cron jobs after server is ready
		// if (!global.cronJobsStarted) {
		// 	startCronJobs();
		// 	global.cronJobsStarted = true;
		// }
	} catch (error) {
		console.error("Error starting server:", error);
		process.exit(1);
	}
};

// Start the server
setupServer();

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
	console.error("Uncaught Exception:", err);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
	console.error("Unhandled Rejection:", err);
});

console.log("Server started");
