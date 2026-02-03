export interface Category {
    category_id: string // UUID
    name: string;
    description: string | null;
    color: string; //Hex color    
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