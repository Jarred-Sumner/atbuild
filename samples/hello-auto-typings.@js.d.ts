export declare class Post {
    static fromAPI(response: any): Promise<Post>;
    object: string;
}
export declare function fetchPostById(id: any): Promise<Post>;
export declare class User {
    static fromAPI(response: any): Promise<User>;
    object: string;
}
export declare function fetchUserById(id: any): Promise<User>;
export declare class Like {
    static fromAPI(response: any): Promise<Like>;
    object: string;
}
export declare function fetchLikeById(id: any): Promise<Like>;
export declare class PasswordResetToken {
    static fromAPI(response: any): Promise<PasswordResetToken>;
    object: string;
}
export declare function fetchPasswordResetTokenById(id: any): Promise<PasswordResetToken>;