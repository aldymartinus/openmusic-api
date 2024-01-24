const routes = (handler) => [
  {
    method: 'POST',
    path: '/playlists',
    handler: handler.postPlaylistHandler,
    options: {
      auth: 'playlist_jwt',
    },
  },
  {
    method: 'GET',
    path: '/playlists',
    handler: handler.getPlaylistsHandler,
    options: {
      auth: 'playlist_jwt',
    },
  },
  {
    method: 'DELETE',
    path: '/playlists/{id}',
    handler: handler.deletePlaylistByIdHandler,
    options: {
      auth: 'playlist_jwt',
    },
  },
  {
    method: 'POST',
    path: '/playlists/{id}/songs',
    handler: handler.postPlaylistSongHandler,
    options: {
      auth: 'playlist_jwt',
    },
  },
  {
    method: 'GET',
    path: '/playlist/{id}/songs',
    handler: handler.getPlaylistsSongsHandler,
    options: {
      auth: 'playlist_jwt',
    },
  },
  {
    method: 'DELETE',
    path: '/playlists/{id}/songs',
    handler: handler.deletePlaylistSongHandler,
    options: {
      auth: 'playlist_jwt',
    },
  },
];

module.exports = routes;
