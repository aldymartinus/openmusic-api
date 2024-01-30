exports.up = (pgm) => {
  pgm.createTable('songs', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    title: {
      type: 'TEXT',
      notNull: true,
    },
    year: {
      type: 'SMALLINT',
      notNull: true,
    },
    genre: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    performer: {
      type: 'VARCHAR(50)',
      notNull: 'true',
    },
    duration: {
      type: 'SMALLINT',
    },
    albumId: {
      type: 'VARCHAR(50)',
    },
  });

  pgm.addConstraint(
      'songs',
      'fk_song.album_id_album.id',
      'FOREIGN KEY("albumId") REFERENCES albums(id) ON DELETE CASCADE',
  );
};

exports.down = (pgm) => {
  pgm.dropTable('songs');
};
