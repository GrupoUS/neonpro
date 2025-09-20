import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/signup")({
  loader: () => {
    throw redirect({ to: "/" });
  },
});
