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
}

let data = "";

render(true);

{ // event listeners
	process.stdin.on("data", (key) => {
		for (let i = 0; i < Buffer.byteLength(key); i++) {
			onkey(key.slice(i, i + 1));
		}
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
			console.log("bye :c");
			process.exit();
		} break;

		case 0x7F: { // BS
			if (data.substring(data.length - 1) == "\n")
				recache = true;

			data = data.substring(0, data.length - 1);
		} break;

		default: {
			if ((hex >= 0x20 && hex <= 0x7e) || hex == 0x9) {
				data += key.toString();
			} else if (hex == 0xD) {
				data += "\n";
				recache = true;
			}
		} break;
	}

	render(recache);
}

function render(recache = false) {
	let lines = data.split("\n");
	let margin = 4 + lines.length.toString().length;

	process.stdout.write("\x1b[2J");
	process.stdout.write("\x1b[0f");

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
	}

	process.stdout.write(cache.line0 + cache.line1 + cache.line2);

	let cursorx = 0;
	let cursory = 0;

	for (let i = 0; i < process.stdout.rows - 4; i++) {
		if (lines[i] != undefined) {
			let left = " ".repeat((lines.length.toString().length - (i + 1).toString().length) + 2);
			process.stdout.write(`${colorize.black(`${left}${i + 1}  │`)} ${lines[i]}\n`);

			cursorx = margin + 2 + lines[i].length;
			cursory = i + 3;
		} else {
			process.stdout.write(colorize.black(`${" ".repeat(margin)}│\n`));
		}
	}

	process.stdout.write(cache.line3);

	process.stdout.cursorTo(cursorx, cursory);
}
