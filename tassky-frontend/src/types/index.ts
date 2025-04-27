export interface User {
  id: string;
  username: string;
  email: string;
}

export interface Team {
  id: string;
  name: string;
  members?: User[];
}
