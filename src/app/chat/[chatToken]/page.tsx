import { notFound } from "next/navigation";

import { getChatState } from "@/lib/chat-api";
import ChatScreen from "./ChatScreen";

interface PageProps {
  params: Promise<{ chatToken: string }>;
}

// Server component: fetch initial state on the server so the first paint
// has real data (no spinner-flash for users on cold loads).
//
// If the token is invalid (404 from backend), surface notFound() — Next
// renders our 404 page instead of a broken chat shell.
export default async function ChatPage({ params }: PageProps) {
  const { chatToken } = await params;

  let initialState;
  try {
    initialState = await getChatState(chatToken);
  } catch {
    // 404 token OR backend down. Either way, we don't have what we need.
    // Client-side ChatScreen also retries via its own polling, but the
    // bootstrap miss is fatal — render the 404 page.
    notFound();
  }

  return <ChatScreen chatToken={chatToken} initialState={initialState} />;
}
