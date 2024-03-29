exports.up = (pgm) => {
  pgm.createTable('albums', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    name: {
      type: 'TEXT',
      notNull: true,
    },
    year: {
      type: 'SMALLINT',
      notNull: true,
    },
    coverUrl: {
      type: 'TEXT',
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('albums');
};
