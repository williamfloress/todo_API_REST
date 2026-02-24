// Tipos que reflejan la tabla categories (y los DTOs de entrada).
export interface Category {
    category_id: string; // UUID
    name: string;
    description: string | null;
    color: string; // hex #RRGGBB
}

export interface CreateCategoryInput {
    name: string;
    description?: string;
    color: string;
}

export interface UpdateCategoryInput {
    name?: string;
    description?: string;
    color?: string;
}