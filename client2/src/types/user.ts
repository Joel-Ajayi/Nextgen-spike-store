export interface IUserInitailState {
  isAuthenticated?: boolean;
  email: string;
  fName: string;
  lName: string;
  username: string;
  role: number | null;
  avatar: string | null;
  contactNumber: string | null;
}
