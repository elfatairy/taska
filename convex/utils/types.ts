import { Doc } from "@convex/_generated/dataModel";

type Success<T> = {
  data: T;
  error: null;
};

type Failure<E> = {
  data: null;
  error: E;
};

export type Result<T, E = never> = Promise<[E] extends [never] ? Success<T> : Success<T> | Failure<E>>;

export function isSuccess<T, E = never>(result: Success<T> | Failure<E> | undefined): result is Success<T> {
  if (result === undefined) {
    return false;
  }
  return result.error == null;
}

export function isFailure<T, E = never>(result: Success<T> | Failure<E> | undefined): result is Failure<E> {
  if (result === undefined) {
    return false;
  }
  return result.error !== null;
}