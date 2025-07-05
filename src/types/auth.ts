
export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
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
  status?: "not called" | "called" | "busy" | "call failed" | "text sent";
  last_called?: string;
  status_updated_at?: string;
  call_initiated?: boolean;
}

export interface CallSession {
  id: string;
  user_id: string;
  name: string;
  contact_count: number;
  created_at: string;
  updated_at: string;
}
