function buildPostFromJSON(json) {
  return json;
}
async function fetchPostById(id) {
  const body = (await fetch("http://example.com/posts/" + id)).body();
  const json = await body.json();
  return buildPostFromJSON(json);
}
function buildUserFromJSON(json) {
  return json;
}
async function fetchUserById(id) {
  const body = (await fetch("http://example.com/users/" + id)).body();
  const json = await body.json();
  return buildUserFromJSON(json);
}
function buildLikeFromJSON(json) {
  return json;
}
async function fetchLikeById(id) {
  const body = (await fetch("http://example.com/likes/" + id)).body();
  const json = await body.json();
  return buildLikeFromJSON(json);
}
function buildPasswordResetTokenFromJSON(json) {
  return json;
}
async function fetchPasswordResetTokenById(id) {
  const body = (await fetch("http://example.com/password-reset-tokens/" + id)).body();
  const json = await body.json();
  return buildPasswordResetTokenFromJSON(json);
}
export {
  buildLikeFromJSON,
  buildPasswordResetTokenFromJSON,
  buildPostFromJSON,
  buildUserFromJSON,
  fetchLikeById,
  fetchPasswordResetTokenById,
  fetchPostById,
  fetchUserById
};
