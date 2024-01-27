/* eslint-disable max-len */
const CollaborationsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'collaborations',
  version: '1.0.0',
  register: async (server, {service, playlists, user}) => {
    const collaborationsHandler = new CollaborationsHandler(
        service, playlists, user,
    );
    server.route(routes(collaborationsHandler));
  },
};
