-- DDL del proyecto. Define tablas: users, categories, tasks, task_category, commentaries. IDs con UUID.
-- Ejecutar en la BD (ej. todo_udo) para crear el esquema e índices.

-- Tabla USERS
CREATE TABLE users (
    user_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla CATEGORIES
CREATE TABLE categories (
    category_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    color VARCHAR(7) NOT NULL 
);

-- Tabla TASKS:
CREATE TABLE tasks (
    task_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL CHECK (status IN ('PENDING', 'IN_PROGRESS', 'IN_REVIEW', 'DONE')),
    story_points INTEGER,
    due_date DATE, 
    created_by uuid NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
    assigned_to uuid NOT NULL REFERENCES users(user_id) ON DElETE RESTRICT
);

-- Tabla de Relacion N:N entre task y categories
CREATE TABLE task_category (
    task_id uuid NOT NULL REFERENCES tasks(task_id) ON DELETE CASCADE,
    category_id uuid NOT NULL REFERENCES categories(category_id) ON DELETE CASCADE,
    PRIMARY KEY (task_id, category_id)
);


-- Tabla COMMENTARIES:
CREATE TABLE commentaries (
    comment_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
    task_id uuid NOT NULL REFERENCES tasks(task_id) ON DELETE RESTRICT,
    comment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    comment_content TEXT NOT NULL
);


-- INDICES para optimizar consultas:

CREATE INDEX idx_task_created_by ON tasks(created_by);
CREATE INDEX idx_task_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_task_status ON tasks(status);
CREATE INDEX idx_task_category_task_id ON task_category(task_id);
CREATE INDEX idx_commentaries_task_id ON commentaries(task_id);
CREATE INDEX idx_commentaries_user_id ON commentaries(user_id);
CREATE INDEX idx_users_email ON users(email);


