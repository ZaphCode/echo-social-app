import EmptyState from "./ui/EmptyState";

export function ProfileError({ message = "No encontramos este perfil." }: { message?: string }) {
  return <EmptyState tone="error" icon="user-x" title="No se pudo cargar el perfil" message={message} />;
}
