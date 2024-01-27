/* eslint-disable max-len */
require('dotenv').config();
const Hapi = require('@hapi/hapi');
const ClientError = require('./exceptions/ClientError');
const Jwt = require('@hapi/jwt');

// Album
const albums = require('./api/albums');
const AlbumService = require('./services/postgres/AlbumService');

// Songs
const songs = require('./api/songs');
const SongService = require('./services/postgres/SongsService');

const {AlbumValidator, SongValidator} = require('./validator/musics');

// Users
const users = require('./api/users');
const UserValidator = require('./validator/users');
const UserService = require('./services/postgres/UserService');

// Authentications
const authentications = require('./api/authentications');
const AuthenticationsService = require('./services/postgres/AuthenticationsService');
const TokenManager = require('./tokenize/TokenManager');
const AuthenticationsValidator = require('./validator/authentications');
const AuthenticationError = require('./exceptions/AuthenticationError');

// Playlists
const PlaylistsService = require('./services/postgres/PlaylistService');
const playlistValidator = require('./validator/playlists');
const playlists = require('./api/playlists');

// Collaborations
const CollaborationService = require('./services/postgres/CollaborationsService');
const collaborations = require('./api/collaborations');

const init = async () => {
  const albumService = new AlbumService();
  const songService = new SongService();
  const usersService = new UserService();
  const authenticationsService = new AuthenticationsService();
  const collaborationService = new CollaborationService();
  const playlistsService = new PlaylistsService(songService, collaborationService);

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST !== 'production' ? 'localhost' : '0.0.0.0',
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  await server.register([
    {
      plugin: Jwt,
    },
  ]);

  server.auth.strategy('playlist_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

  await server.register([
    {
      plugin: albums,
      options: {
        service: albumService,
        validator: AlbumValidator,
      },
    },
    {
      plugin: songs,
      options: {
        service: songService,
        validator: SongValidator,
      },
    },
    {
      plugin: users,
      options: {
        service: usersService,
        validator: UserValidator,
      },
    },
    {
      plugin: authentications,
      options: {
        authenticationsService,
        usersService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator,
      },
    },
    {
      plugin: playlists,
      options: {
        service: playlistsService,
        validator: playlistValidator,
      },
    },
    {
      plugin: collaborations,
      options: {
        service: collaborationService,
        playlists: playlistsService,
        user: usersService,
      },
    },
  ]);

  server.ext('onPreResponse', (req, h) => {
    const {response} = req;
    if (response instanceof Error) {
      if (response instanceof ClientError) {
        const newResponse = h.response({
          status: 'fail',
          message: response.message,
        });
        newResponse.code(response.statusCode);
        return newResponse;
      }

      if (response instanceof AuthenticationError) {
        const newResponse = h.response({
          status: 'fail',
          message: response.message,
        });
        newResponse.code(response.statusCode);
        return newResponse;
      }

      if (!response.isServer) {
        return h.continue;
      }

      const newResponse = h.response({
        status: 'error',
        message: 'telah terjadi kegagalan pada server kami',
      });
      newResponse.code(500);
      console.log(response);
      return newResponse;
    }

    return h.continue;
  });

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
