
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
}
