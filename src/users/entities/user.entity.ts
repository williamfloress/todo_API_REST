/**
 * Interfaces del usuario: User (entidad), CreateUserInput y UpdateUserInput para alta/actualización.
 */

export interface User {
    user_id: string; //UUID
    full_name: string;
    email: string;
    password?: string; // Para no exponer en respuestas
    created_at: Date;
    updated_at: Date;
}

export interface CreateUserInput{
    full_name: string;
    email: string;
    password: string;
}

export interface UpdateUserInput{
    full_name?: string;
    email?: string;
    password?: string;
}

