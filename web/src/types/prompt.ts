export interface Prompt {
  id: number;
  prompt: string;
  response: string;
  tags: string[];
  techStack: string[];
  fileName: string;
  createdAt: string;
  updatedAt?: string;
  hash: string;
}

export interface SavePromptDTO {
  prompt: string;
  response: string;
  tags?: string;
  techStack?: string;
  fileName: string;
}