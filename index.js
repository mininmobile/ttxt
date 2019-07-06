if (!process.stdin.isTTY) {
	throw new Error("stdin is not a tty");
}

process.stdin.setRawMode(true);
process.stdin.resume();

process.stdin.on("data", (key) => {
	let hex = parseInt(key.toString("hex"), 16);
	switch (hex) {
		case 0x3: { // EOL
			console.log("bye :c");
			process.exit();
		} break;
	}
});
