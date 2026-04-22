"use client";

import { FocusTimer } from "@/components/FocusTimer";

/**
 * Focus Timer Page - with task and subtask selection
 * Users can select tasks from dropdown and auto-start focus timer with subtasks
 */
export default function FocusPage() {
  return (
    <div className="w-full min-h-screen bg-gray-50">
      <FocusTimer />
    </div>
  );
}
