class Post {
  constructor() {
    this.object = "post";
  }
  static async fromAPI(response) {
    const result = await (await response.body()).json();
    return new Post(result);
  }
}
function fetchPostById(id) {
  return Post.fromAPI(fetch("http://example.com/posts/" + id));
}
class User {
  constructor() {
    this.object = "user";
  }
  static async fromAPI(response) {
    const result = await (await response.body()).json();
    return new User(result);
  }
}
function fetchUserById(id) {
  return User.fromAPI(fetch("http://example.com/users/" + id));
}
class Like {
  constructor() {
    this.object = "like";
  }
  static async fromAPI(response) {
    const result = await (await response.body()).json();
    return new Like(result);
  }
}
function fetchLikeById(id) {
  return Like.fromAPI(fetch("http://example.com/likes/" + id));
}
class PasswordResetToken {
  constructor() {
    this.object = "password-reset-token";
  }
  static async fromAPI(response) {
    const result = await (await response.body()).json();
    return new PasswordResetToken(result);
  }
}
function fetchPasswordResetTokenById(id) {
  return PasswordResetToken.fromAPI(fetch("http://example.com/password-reset-tokens/" + id));
}
export {
  Like,
  PasswordResetToken,
  Post,
  User,
  fetchLikeById,
  fetchPasswordResetTokenById,
  fetchPostById,
  fetchUserById
};
