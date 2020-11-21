/*** Code-generated with AtBuild *********************
-> api-endpoints.tsb v6ac47f79213e3d236a21724346a1a2d2
******************************************************
// @ts-ignore
/* eslint-disable */
type BaseType = {
  id: number;
}

export type Post = BaseType & {
        object: "post";

        }

      export function buildPostFromJSON(json: Object): Post {
        return json;
      }

      export async function fetchPostById(id: number): Promise<Post> {
        const body = (await fetch("http://example.com/posts/" + id)).body()
        const json = await body.json()
        return buildPostFromJSON(json);
      }
    export type User = BaseType & {
        object: "user";

        }

      export function buildUserFromJSON(json: Object): User {
        return json;
      }

      export async function fetchUserById(id: number): Promise<User> {
        const body = (await fetch("http://example.com/users/" + id)).body()
        const json = await body.json()
        return buildUserFromJSON(json);
      }
    export type Like = BaseType & {
        object: "like";

        }

      export function buildLikeFromJSON(json: Object): Like {
        return json;
      }

      export async function fetchLikeById(id: number): Promise<Like> {
        const body = (await fetch("http://example.com/likes/" + id)).body()
        const json = await body.json()
        return buildLikeFromJSON(json);
      }
    export type PasswordResetToken = BaseType & {
        object: "password-reset-token";

        used: boolean;
              expiry: Date;
            }

      export function buildPasswordResetTokenFromJSON(json: Object): PasswordResetToken {
        return json;
      }

      export async function fetchPasswordResetTokenById(id: number): Promise<PasswordResetToken> {
        const body = (await fetch("http://example.com/password-reset-tokens/" + id)).body()
        const json = await body.json()
        return buildPasswordResetTokenFromJSON(json);
      }
    