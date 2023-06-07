import server from '../http/server';

const PORT = 9123;

console.log('Starting server...');
server.listen(PORT, (err: Error) => {
	if (err) throw err;
	console.log(`Server now running on localhost:${PORT}`);
});
