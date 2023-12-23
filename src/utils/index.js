/* eslint-disable camelcase */
const mapDBToModel = ({
  id, title, year, genre, performer, duration, albumId,
}) => ({
  id,
  title,
  performer,
});

module.exports = mapDBToModel;
