export type Message = {
  message: string;
};

export type Pagination<T> = {
  skip: number;
  page: number;
  numPages: number;
  count: number;
  take: number;
  list: T[];
};
