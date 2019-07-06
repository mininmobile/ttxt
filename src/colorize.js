const colors = {
	black: "\x1b[30m",
	red: "\x1b[31m",
	green: "\x1b[32m",
	yellow: "\x1b[33m",
	blue: "\x1b[34m",
	magenta: "\x1b[35m",
	cyan: "\x1b[36m",
	white: "\x1b[37m",
}

function colorize(text, color) {
	return `${colors[color]}${text}\x1b[0m`;
}

module.exports = {
	colorize: colorize,
	black: (x) => colorize(x, "black"),
	red: (x) => colorize(x, "red"),
	green: (x) => colorize(x, "green"),
	yellow: (x) => colorize(x, "yellow"),
	blue: (x) => colorize(x, "blue"),
	magenta: (x) => colorize(x, "magenta"),
	cyan: (x) => colorize(x, "cyan"),
	white: (x) => colorize(x, "white"),
}
