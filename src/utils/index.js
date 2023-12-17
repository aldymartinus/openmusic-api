/* eslint-disable camelcase */
const mapDBToModel = ({
  id, title, body, tags, created_at, updated_at,
}) => ({
  id,
  title,
  body,
  tags,
  CreatedAt: created_at,
  UpdatedAt: updated_at,
});

module.exports = mapDBToModel;
