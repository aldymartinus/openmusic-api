/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
const autoBind = require('auto-bind');
class CollaborationsHandler {
  constructor(service, playlistService, userService) {
    this._service = service;
    this._playlistService = playlistService;
    this._userService = userService;
    autoBind(this);
  }

  async postCollaborationHandler(request, h) {
    const {id: credentialId} = request.auth.credentials;
    const {playlistId, userId} = request.payload;
    await this._userService.getUserById(userId);
    await this._playlistService.verifyPlaylistOwner(credentialId, playlistId);
    const collaborationId = await this._service.addCollaboration(playlistId, userId);

    const response = h.response({
      status: 'success',
      message: 'Kolaborasi berhasil ditambahkan',
      data: {
        collaborationId,
      },
    });
    response.code(201);
    return response;
  }

  async deleteCollaborationHandler(request) {
    const {id: credentialId} = request.auth.credentials;
    const {playlistId, userId} = request.payload;

    await this._playlistService.verifyPlaylistOwner(credentialId, playlistId);
    await this._service.deleteCollaboration(playlistId, userId);

    return {
      status: 'success',
      message: 'Kolaborasi berhasil dihapus',
    };
  }
}

module.exports = CollaborationsHandler;
