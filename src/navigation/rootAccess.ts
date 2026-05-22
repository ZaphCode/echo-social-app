export function getRootStackAccess(authenticated: boolean) {
  return {
    canShowMain: authenticated,
    canShowAuth: !authenticated,
  };
}
