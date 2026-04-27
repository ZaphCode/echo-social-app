export function throwIfError(
  error: { message: string } | null
): asserts error is null {
  if (error) {
    throw new Error(error.message);
  }
}
