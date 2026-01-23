import { ApiResponse, PaginatedResponse, SearchParams } from "../types/api";
import { Prompt, SavePromptDTO } from "../types/prompt";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/aicache';

async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro na API: ${response.status} ${response.statusText} - ${errorText}`);
    }
    return response.json() as Promise<ApiResponse<T>>;
}

function buildQueryString(params: SearchParams): string {
    const query = new URLSearchParams();

    if (params.query) query.append('query', params.query);
    if (params.page) query.append('page', params.page.toString());
    if (params.pageSize) query.append('pageSize', params.pageSize.toString());
    if (params.tags) {
        params.tags.forEach(tag => query.append('tags', tag));
    }
    if (params.techStack) {
        params.techStack.forEach(stack => query.append('techStack', stack));
    }

    const queryString = query.toString();
    return queryString ? `?${queryString}` : '';
}

export const savePrompt = async (dto: SavePromptDTO): Promise<ApiResponse<Prompt>> => {
    const response = await fetch(`${API_BASE_URL}/save`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(dto),
    });
    return handleResponse<Prompt>(response);
};

export const getAllPrompts = async (params: SearchParams = {}): Promise<ApiResponse<PaginatedResponse<Prompt>>> => {
    const queryString = buildQueryString(params);
    const response = await fetch(`${API_BASE_URL}/all${queryString}`);
    return handleResponse<PaginatedResponse<Prompt>>(response);
};

export const searchPrompts = async (params: SearchParams): Promise<ApiResponse<PaginatedResponse<Prompt>>> => {
    if (!params.query && !params.tags && !params.techStack) {
        return getAllPrompts(params);
    }
    const queryString = buildQueryString(params);
    const response = await fetch(`${API_BASE_URL}/search${queryString}`);
    return handleResponse<PaginatedResponse<Prompt>>(response);
};

export const getPromptByHash = async (hash: string): Promise<ApiResponse<Prompt>> => {
    const encodedHash = encodeURIComponent(hash);
    const response = await fetch(`${API_BASE_URL}/hash/${encodedHash}`);
    return handleResponse<Prompt>(response);
};

export const promptApiService = {
    savePrompt,
    getAllPrompts,
    searchPrompts,
    getPromptByHash,
};