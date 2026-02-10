// Entidad e interfaces del comentario (tabla commentaries). Mapea comment_id, user_id, task_id, comment_date, comment_content y tipos para crear/listar con relaciones.

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
