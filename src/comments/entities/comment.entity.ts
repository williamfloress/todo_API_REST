// Tipos de la tabla commentaries; CommentWithRelations incluye creator_name y task_name (JOINs).

export interface Comment {
  comment_id: string;
  user_id: string;
  task_id: string;
  comment_date: Date;
  comment_content: string;
}

export interface CommentWithRelations extends Comment {
  creator_name?: string;
  task_name?: string;
}

export interface CreateCommentInput {
  comment_content: string;
  task_id?: string;
}
