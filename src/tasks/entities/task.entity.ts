/**
 * Interfaces de tarea: Task (base), CreateTaskInput y TaskWithRelations (con creator, assignee, comments, categories).
 */
export interface Task {
    task_id: string; //UUID
    name: string;
    description: string | null;
    status: 'PENDING' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
    story_points: number | null;
    due_date: Date | null;
    created_by: string; //UUID
    assigned_to: string; //UUID
}

export interface CreateTaskInput {
    name?: string;
    description?: string;
    status?: 'PENDING' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
    story_points?: number;
    due_date?: Date;
    assigned_to: string; //UUID
    category_ids: string[]; //UUIDs
}

export interface TaskWithRelations extends Task {
    creator_name?: string;
    assignee_name?: string;
    category_id?: string[]; //UUIDs
    comments?: Array<{
        comment_id: string; //UUID
        user_id: string; //UUID
        comment_date: Date;
        comment_content: string;
        creator_name: string;
    }>;

    categories?: Array<{
        category_id: string; //UUID
        name: string;
        description: string | null;
        color: string;
    }>;
}