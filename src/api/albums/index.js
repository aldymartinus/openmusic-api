const AlbumHandler = require('./handler');
const routes = require('./routes');


module.exports = {
  name: 'albums',
  version: '1.0.0',
  register: async (server,
      {
        service,
        validator,
        uploadValidator,
        storageService,
      }) => {
    const albumHandler = new AlbumHandler(
        service,
        validator,
        uploadValidator,
        storageService);
    server.route(routes(albumHandler));
  },
};
