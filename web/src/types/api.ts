export interface ApiResponse<T>{
    data: T;
    success: boolean;
    message?: string;
    error?: string;
}

export interface PaginatedResponse<T> {
    items: T[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

export interface SearchParams {
    query?: string;
    page?: number;
    pageSize?: number;
    tags?: string[];
    techStack?: string[];
}