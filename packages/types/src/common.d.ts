export type BaseEntity = {
    id: string;
    created_at: string;
    updated_at: string;
};
export type PaginationParams = {
    page?: number;
    limit?: number;
};
export type ApiResponse<T> = {
    data: T;
    message?: string;
    success: boolean;
};
