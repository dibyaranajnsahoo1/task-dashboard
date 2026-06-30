export interface User {
  id: number;
  username: string;
  password_hash: string;
  created_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'To Do' | 'In Progress' | 'Done';
  due_date: string | null;
  assignee_name: string | null;
  assignee_initials: string | null;
  tags: string; // JSON string of string[]
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface JwtPayload {
  userId: number;
  username: string;
}

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}

// Extend Express Request to include authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
