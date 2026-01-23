import { ApiResponse, PaginatedResponse, SearchParams } from "../types/api";
import { Prompt, SavePromptDTO } from "../types/prompt";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/AICache';

// The API returns a different shape, let's call it AIResponse, which is internal to this service
interface AIResponse {
  id: number;
  prompt: string;
  response: string;
  tags: string; // Comes as a comma-separated string
  techStack: string; // Comes as a comma-separated string
  fileName: string;
  createdAt: string;
  updatedAt?: string;
  hash: string;
}


function transformApiToPrompt(apiResponse: AIResponse): Prompt {
    return {
        ...apiResponse,
        tags: apiResponse.tags ? apiResponse.tags.split(',').map(tag => tag.trim()) : [],
        techStack: apiResponse.techStack ? apiResponse.techStack.split(',').map(tech => tech.trim()) : [],
    };
}

async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro na API: ${response.status} ${response.statusText} - ${errorText}`);
    }
    // The raw response is not yet transformed
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
    const apiResponse = await handleResponse<AIResponse>(response);
    
    if (apiResponse.success && apiResponse.data) {
        return {
            ...apiResponse,
            data: transformApiToPrompt(apiResponse.data),
        };
    }
    return apiResponse as ApiResponse<any>;
};

export const getAllPrompts = async (params: SearchParams = {}): Promise<ApiResponse<PaginatedResponse<Prompt>>> => {
    const queryString = buildQueryString(params);
    const response = await fetch(`${API_BASE_URL}/all${queryString}`);
    const apiResponse = await handleResponse<PaginatedResponse<AIResponse>>(response);

    if (apiResponse.success && apiResponse.data) {
        return {
            ...apiResponse,
            data: {
                ...apiResponse.data,
                items: apiResponse.data.items.map(transformApiToPrompt),
            }
        };
    }
    return apiResponse as ApiResponse<any>;
};

export const searchPrompts = async (params: SearchParams): Promise<ApiResponse<PaginatedResponse<Prompt>>> => {
    if (!params.query && !params.tags && !params.techStack) {
        return getAllPrompts(params);
    }
    const queryString = buildQueryString(params);
    const response = await fetch(`${API_BASE_URL}/search${queryString}`);
    const apiResponse = await handleResponse<PaginatedResponse<AIResponse>>(response);
    
    if (apiResponse.success && apiResponse.data) {
        return {
            ...apiResponse,
            data: {
                ...apiResponse.data,
                items: apiResponse.data.items.map(transformApiToPrompt),
            }
        };
    }
    return apiResponse as ApiResponse<any>;
};

export const getPromptByHash = async (hash: string): Promise<ApiResponse<Prompt>> => {
    const encodedHash = encodeURIComponent(hash);
    const response = await fetch(`${API_BASE_URL}/hash/${encodedHash}`);
    const apiResponse = await handleResponse<AIResponse>(response);

    if (apiResponse.success && apiResponse.data) {
        return {
            ...apiResponse,
            data: transformApiToPrompt(apiResponse.data),
        };
    }
    return apiResponse as ApiResponse<any>;
};

export const promptApiService = {
    savePrompt,
    getAllPrompts,
    searchPrompts,
    getPromptByHash,
};