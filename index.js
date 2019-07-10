const colorize = require("./src/colorize");

if (!process.stdin.isTTY) {
	throw new Error("stdin is not a tty");
}

process.stdin.setRawMode(true);
process.stdin.resume();

let cache = {
	// ui lines
	line0: undefined,
	line1: undefined,
	line2: undefined,
	line3: undefined,
	lineEmpty: undefined,
}

let pregap = "lorem\nips";
let postgap = "um\nmotherfucker";

render(true);

{ // event listeners
	process.stdin.on("data", (key) => {
		let recache = false;

		switch (key.toString("ascii")) {
			case "\x1b[3~": {
				postgap = postgap.substring(1);
				recache = true;
			} break;

			case "\x1b[D": { // LEFT ARROW
				postgap = pregap[pregap.length - 1] + postgap;
				pregap = pregap.substring(0, pregap.length - 1);
				recache = true;
			} break;

			case "\x1b[C": { // RIGHT ARROW
				pregap += postgap[0];
				postgap = postgap.substring(1);
				recache = true;
			} break;
	
			default: {
				for (let i = 0; i < Buffer.byteLength(key); i++) {
					recache = onkey(key.slice(i, i + 1));
				}
			} break;
		}

		render(recache);
	});

	process.stdout.on("resize", () => {
		render(true);
	});
}

function onkey(key) {
	let recache = false;

	let hex = parseInt(key.toString("hex"), 16);

	switch (hex) {
		case 0x3: { // EOL
			process.stdout.write("\x1b[2J");
			process.stdout.write("\x1b[0f");
			process.exit();
		} break;

		case 0x7F: { // BS
			if (pregap.substring(pregap.length - 1) == "\n")
				recache = true;

			pregap = pregap.substring(0, pregap.length - 1);
		} break;

		default: {
			if ((hex >= 0x20 && hex <= 0x7e) || hex == 0x9) {
				pregap += key.toString();
			} else if (hex == 0xD) {
				pregap += "\n";
				recache = true;
			}
		} break;
	}

	return recache;
}

function render(recache = false) {
	let prelines = pregap.toString().split("\n");
	let postlines = postgap.toString().split("\n");

	let slinecount = (prelines.length + postlines.length - 1).toString().length;
	let margin = slinecount + 4;

	if (recache) {
		// first ui line
		let _line0 = `${"─".repeat(margin)}┬${"─".repeat(process.stdout.columns - margin - 1)}`;
		cache.line0 = colorize.black(_line0);

		// second ui line
		let _line1 = colorize.black(`${" ".repeat(margin)}│`);
		cache.line1 = `${_line1} editing: ${"untitled"}\n`;

		// third ui line
		let _line2 = `${"─".repeat(margin)}┼${"─".repeat(process.stdout.columns - margin - 1)}`;
		cache.line2 = colorize.black(_line2);

		// fourth ui line
		let _line3 = `${"─".repeat(margin)}┴${"─".repeat(process.stdout.columns - margin - 1)}`;
		cache.line3 = colorize.black(_line3);

		// empty line
		cache.lineEmpty = colorize.black(`${" ".repeat(margin)}│\n`);
	}

	process.stdout.write("\x1b[2J");
	process.stdout.write("\x1b[0f");

	process.stdout.write(cache.line0 + cache.line1 + cache.line2);

	let cursorx = 0;
	let cursory = 0;

	let height = process.stdout.rows - 4;
	let start = prelines.length > height / 2 ?
		prelines.length - Math.ceil(height / 2) : 0;

	for (let i = start; i < start + height; i++) {
		if (prelines[i] != undefined && i != prelines.length - 1) {
			let left = " ".repeat((slinecount - (i + 1).toString().length) + 2);
			process.stdout.write(`${colorize.black(`${left}${i + 1}  │`)} ${prelines[i]}\n`);
		} else if (i == prelines.length - 1) {
			let left = " ".repeat((slinecount - (i + 1).toString().length) + 2);
			process.stdout.write(`${colorize.black(`${left}${i + 1}  │`)} ${prelines[i]}${postlines[i - (prelines.length - 1)]}\n`);

			cursorx = prelines[i].length;
			cursory = i - start;
		} else if (postlines[i - (prelines.length - 1)] != undefined) {
			let j = i - (prelines.length - 1);

			let left = " ".repeat((postlines.length.toString().length - (j + 1).toString().length) + 2);
			process.stdout.write(`${colorize.black(`${left}${i + 1}  │`)} ${postlines[j]}\n`);
		} else {
			process.stdout.write(cache.lineEmpty);
		}
	}

	process.stdout.write(cache.line3);

	process.stdout.cursorTo(cursorx + margin + 2, cursory + 3);
}
