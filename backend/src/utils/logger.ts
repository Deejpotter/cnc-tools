/**
 * Logger Configuration
 * Updated: 29/05/25
 * Author: Deej Potter
 * Description: Centralized logger configuration for the application
 */

import winston from "winston";

// Configure logging to log into app.log file with debug level
export const logger = winston.createLogger({
	level: "debug",
	format: winston.format.simple(),
	transports: [new winston.transports.File({ filename: "app.log" })],
});
