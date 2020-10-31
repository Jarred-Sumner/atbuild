
// 🤖🤖🤖🤖🤖🤖🤖🤖🤖🤖🤖🤖🤖🤖🤖🤖🤖🤖🤖🤖🤖🤖🤖🤖🤖🤖🤖🤖🤖🤖🤖🤖🤖🤖🤖🤖🤖🤖🤖🤖🤖🤖🤖🤖🤖🤖🤖🤖
//                          Auto-generated by AtBuild
//                               at 1604136841062
// 🤖🤖🤖🤖🤖🤖🤖🤖🤖🤖🤖🤖🤖🤖🤖🤖🤖🤖🤖🤖🤖🤖🤖🤖🤖🤖🤖🤖🤖🤖🤖🤖🤖🤖🤖🤖🤖🤖🤖🤖🤖🤖🤖🤖🤖🤖🤖🤖



declare type BaseType = {
    id: number;
};
export declare type Post = BaseType & {
    object: "post";
};
export declare function buildPostFromJSON(json: Object): Post;
export declare function fetchPostById(id: number): Promise<Post>;
export declare type User = BaseType & {
    object: "user";
};
export declare function buildUserFromJSON(json: Object): User;
export declare function fetchUserById(id: number): Promise<User>;
export declare type Like = BaseType & {
    object: "like";
};
export declare function buildLikeFromJSON(json: Object): Like;
export declare function fetchLikeById(id: number): Promise<Like>;
export declare type PasswordResetToken = BaseType & {
    object: "password-reset-token";
    used: boolean;
    expiry: Date;
};
export declare function buildPasswordResetTokenFromJSON(json: Object): PasswordResetToken;
export declare function fetchPasswordResetTokenById(id: number): Promise<PasswordResetToken>;
export {};