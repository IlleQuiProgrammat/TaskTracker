const express = require('express');
const socket = require('socket.io');
const exit_hook = require('exit-hook');

const fs = require('fs');

const port = 3000;

let app = express();
let server = app.listen(port);

app.use(express.static('public'));

console.log(`Express is now serving ./public/ as a static library and is running on port ${port}`)

globalData = JSON.parse(fs.readFileSync('storage.json', 'utf8'));
console.log("Successfully parsed JSON 'database'!")

// TODO: realtime update between clients using broadcast?
let io = socket(server);
io.sockets.on('connection', (socket) => {
	console.log(`New socket connection: ${socket.id}`);
	socket.on('update', (data) => {
		console.log(`Data from ${socket.id}: ${JSON.stringify(data)}`);
		if (data.full) {
			socket.emit('update', {
				full: true,
				changes: globalData.tasks,
				colourRef: globalData.colourRef,
				colourDef: globalData.colourDef
			});
		}
	});
	socket.on('save', (data) => {
		// slightly ironic that this is supposed to help me become good at algorithmy things but im doing O(n) lookup and modification :/
		// TODO: fix
		globalData.tasks.find(x => x.id === data.id).state = data.state;
	})
});
console.log("WebSockets initialised for communication.");

function save() {
	fs.writeFileSync('storage.json', JSON.stringify(globalData));
	console.log("Saved!")
}

setTimeout(save, 20000);
exit_hook(save);