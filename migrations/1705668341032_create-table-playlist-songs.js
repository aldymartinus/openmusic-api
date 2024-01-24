/* eslint-disable max-len */
exports.up = (pgm) => {
  pgm.createTable('playlist_songs', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    playlist_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    song_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
  });

  pgm.addConstraint(
      'playlist_songs',
      'unique_playlist_and_song_id',
      'UNIQUE(playlist_id, song_id)',
  );
  pgm.addConstraint(
      'playlist_songs',
      'fk_playlist_songs.playlist_id_playlists_id',
      'FOREIGN KEY(playlist_id) REFERENCES playlists(id) ON DELETE CASCADE',
  );
  pgm.addConstraint(
      'playlist_songs',
      'fk_playlist_songs.song_id_songs_id',
      'FOREIGN KEY(song_id) REFERENCES songs(id) ON DELETE CASCADE',
  );
};

exports.down = (pgm) => {
  pgm.dropTable('playlist_songs');
};
