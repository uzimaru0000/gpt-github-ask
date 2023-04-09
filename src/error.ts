export type TypedError<T extends string, P extends {} = {}> = {
  type: T;
} & P;

export interface Show {
  show(): string;
}

export const isImplementsShow = (x: unknown): x is Show => {
  return (x as any)['show'];
};
