import { notFound } from "next/navigation";

import { getConsultState } from "@/lib/consult-api";
import ConsultScreen from "./ConsultScreen";

interface PageProps {
  params: Promise<{ token: string }>;
}

// Server component: fetch the session on the server so the first paint already
// has the conversation. An unknown token is a 404 from the backend — render the
// 404 page rather than an empty chat shell that looks broken.
export default async function ConsultPage({ params }: PageProps) {
  const { token } = await params;

  let initialState;
  try {
    initialState = await getConsultState(token);
  } catch {
    notFound();
  }

  return <ConsultScreen token={token} initialState={initialState} />;
}
