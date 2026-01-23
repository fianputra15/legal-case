'use client';
import { withAuthProtection } from "@/shared/HOC/withAuth";
import { MessagesPage } from "@/views/messages";

function Messages() {
  return <MessagesPage />;
}

export default withAuthProtection(Messages);