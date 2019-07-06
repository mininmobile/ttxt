if (!process.stdin.isTTY) {
	throw new Error("stdin is not a tty");
}

process.stdin.setRawMode(true);
process.stdin.resume();

let data = "";
let cursor = 0;

render();

process.stdin.on("data", (key) => {
	for (let i = 0; i < Buffer.byteLength(key); i++) {
		onkey(key.slice(i, i + 1));
	}
});

function onkey(key) {
	let hex = parseInt(key.toString("hex"), 16);

	switch (hex) {
		case 0x3: { // EOL
			console.log("bye :c");
			process.exit();
		} break;

		case 0x7F: {
			data = data.substring(0, data.length - 1);
		} break;

		default: {
			if ((hex >= 0x20 && hex <= 0x7e) || hex == 0x9) {
				data += key.toString();
			} else if (hex == 0xD) {
				data += "\n";
			}
		} break;
	}

	render();
}

function render() {
	process.stdout.write('\x1b[2J');
	process.stdout.write('\x1b[0f');

	process.stdout.write(data);
}
