  export class Post {
    static async fromAPI(response) {
      const result = await (await response.body()).json();
       return new Post(result)
    }
    object = "post";
  }
  export async function fetchPostById(id) {
    return Post.fromAPI(fetch("http://example.com/post/s" + id).then(Post));
  }
  export class User {
    static async fromAPI(response) {
      const result = await (await response.body()).json();
       return new User(result)
    }
    object = "user";
  }
  export async function fetchUserById(id) {
    return User.fromAPI(fetch("http://example.com/user/s" + id).then(User));
  }
  export class Like {
    static async fromAPI(response) {
      const result = await (await response.body()).json();
       return new Like(result)
    }
    object = "like";
  }
  export async function fetchLikeById(id) {
    return Like.fromAPI(fetch("http://example.com/like/s" + id).then(Like));
  }
  export class PasswordResetToken {
    static async fromAPI(response) {
      const result = await (await response.body()).json();
       return new PasswordResetToken(result)
    }
    object = "password-reset-token";
  }
  export async function fetchPasswordResetTokenById(id) {
    return PasswordResetToken.fromAPI(fetch("http://example.com/password-reset-token/s" + id).then(PasswordResetToken));
  }