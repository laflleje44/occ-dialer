
export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: 'user' | 'admin';
}

export interface Contact {
  id: string;
  user_id: string;
  lastName: string;
  firstName: string;
  phone: string;
  email: string;
  comments: string;
  attending: "yes" | "no";
  call_session_id?: string;
}

export interface CallSession {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  updated_at: string;
  contact_count: number;
}
