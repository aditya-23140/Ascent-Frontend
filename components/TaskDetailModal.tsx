"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, CheckCircle2, Loader, Calendar, Flag, AlignLeft, Clock, AlertCircle } from "lucide-react";
import { useTasks, useSubtasks, ITask, ISubtask } from "@/hooks/useTasks";
import { cn } from "@/lib/utils";

interface TaskDetailModalProps {
  task: ITask | null;
  isOpen: boolean;
  onClose: () => void;
  onTaskUpdated?: (task: ITask) => void;
  subtasks: ISubtask[];
}

export default function TaskDetailModal({
  task,
  isOpen,
  onClose,
  onTaskUpdated,
  subtasks,
}: TaskDetailModalProps) {
  const { updateTask } = useTasks();
  const { addSubtask: addSubtaskHook, updateSubtask } = useSubtasks();
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null);
  const [editingSubtaskTitle, setEditingSubtaskTitle] = useState("");
  const [editingSubtaskDuration, setEditingSubtaskDuration] = useState(30);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Edit form state
  const [editedTitle, setEditedTitle] = useState(task?.title || "");
  const [editedDescription, setEditedDescription] = useState(
    task?.description || ""
  );
  const [editedPriority, setEditedPriority] = useState<
    "low" | "medium" | "high"
  >(task?.priority || "medium");
  const [editedDeadline, setEditedDeadline] = useState(
    task?.deadline ? new Date(task.deadline).toISOString().split('T')[0] + 'T' + new Date(task.deadline).toISOString().split('T')[1].slice(0, 5) : ""
  );

  // Sync form state when task changes
  useEffect(() => {
    if (task) {
      setEditedTitle(task.title);
      setEditedDescription(task.description || "");
      setEditedPriority(task.priority);
      setEditedDeadline(
        task.deadline ? new Date(task.deadline).toISOString().split('T')[0] + 'T' + new Date(task.deadline).toISOString().split('T')[1].slice(0, 5) : ""
      );
      setIsEditing(false);
      setError(null);
    }
  }, [task, isOpen]);

  const [subtaskTitle, setSubtaskTitle] = useState("");
  const [subtaskDuration, setSubtaskDuration] = useState(30);

  useEffect(() => {
    if (!isAddingSubtask) {
      setSubtaskTitle("");
      setSubtaskDuration(30);
    }
  }, [isAddingSubtask]);

  if (!task) return null;

  const handleSaveEdit = async () => {
    if (!editedTitle.trim()) {
      setError("Task title is required");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const updatedTask = await updateTask(task._id, {
        title: editedTitle.trim(),
        description: editedDescription.trim(),
        priority: editedPriority,
        deadline: editedDeadline,
      });

      setIsEditing(false);
      onTaskUpdated?.(updatedTask);
    } catch (err) {
      setError("Failed to update task. Please try again.");
      console.error("Error updating task:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSubtask = async () => {
    if (!subtaskTitle.trim()) {
      setError("Subtask title is required");
      return;
    }

    if (subtaskDuration <= 0) {
      setError("Duration must be greater than 0");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const result = await addSubtaskHook(task._id, {
        title: subtaskTitle.trim(),
        duration: subtaskDuration,
      });
      setSubtaskTitle("");
      setSubtaskDuration(30);
      setIsAddingSubtask(false);

      onTaskUpdated?.(result.task);
    } catch (err) {
      setError("Failed to add subtask. Please try again.");
      console.error("Error adding subtask:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartEditSubtask = (subtask: ISubtask) => {
    setEditingSubtaskId(subtask._id);
    setEditingSubtaskTitle(subtask.title);
    setEditingSubtaskDuration(subtask.duration);
  };

  const handleSaveSubtaskEdit = async () => {
    if (!editingSubtaskId) return;
    if (!editingSubtaskTitle.trim()) {
      setError("Subtask title is required");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const updatedSubtask = await updateSubtask(editingSubtaskId, {
        title: editingSubtaskTitle.trim(),
        duration: editingSubtaskDuration,
      });

      // Update the task in parent to reflect changes if necessary
      // Since subtasks are passed as props, we might need to notify parent
      // but if the hook already updated the central state, onTaskUpdated might be needed if it fetches again.
      // For now, let's just close the edit mode.
      setEditingSubtaskId(null);
      // We trigger onTaskUpdated if we have the updated task.
      // But updateSubtask returns the subtask. We might need to refresh the task.
      const updatedTask = await updateTask(task._id, {}); // Trigger a silent refresh or just use the subtask
      onTaskUpdated?.(updatedTask);
    } catch (err) {
      setError("Failed to update subtask. Please try again.");
      console.error("Error updating subtask:", err);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-rum-950/40 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-card rounded-3xl shadow-premium-lg border border-border max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col pointer-events-auto">
              {/* Header */}
              <div className="px-8 py-6 border-b border-border flex items-center justify-between bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-primary rounded-xl">
                    <Flag className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-foreground">
                      {isEditing ? "Edit Task" : "Task Details"}
                    </h2>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-rum-600 hover:text-foreground hover:bg-muted rounded-xl transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                {error && (
                  <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-2xl text-red-600 dark:text-red-400 text-sm font-semibold flex items-center gap-3">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                  </div>
                )}

                {isEditing ? (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Task Title</label>
                      <input
                        type="text"
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                        className="w-full px-5 py-3.5 bg-muted border border-border rounded-2xl focus:ring-2 focus:ring-primary transition-all outline-none text-foreground font-semibold"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Scope & Description</label>
                      <textarea
                        value={editedDescription}
                        onChange={(e) => setEditedDescription(e.target.value)}
                        rows={4}
                        className="w-full px-5 py-3.5 bg-muted border border-border rounded-2xl focus:ring-2 focus:ring-primary transition-all outline-none text-foreground"
                        placeholder="Define the task objectives..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-muted-foreground uppercase">Priority</label>
                        <select
                          value={editedPriority}
                          onChange={(e) => setEditedPriority(e.target.value as "low" | "medium" | "high")}
                          className="w-full h-10 px-3 bg-muted border border-border rounded-md outline-none text-sm font-bold"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="urgent">Urgent</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-muted-foreground uppercase">Deadline</label>
                        <input
                          type="datetime-local"
                          value={editedDeadline}
                          onChange={(e) => setEditedDeadline(e.target.value)}
                          className="w-full h-10 px-3 bg-muted border border-border rounded-md outline-none text-sm font-bold"
                        />
                      </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button
                        onClick={() => setIsEditing(false)}
                        className="flex-1 h-12 bg-muted text-rum-600 dark:text-rum-400 rounded-xl font-bold hover:opacity-80 transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveEdit}
                        disabled={isLoading}
                        className="flex-1 h-12 bg-primary text-primary-foreground rounded-xl font-bold hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                      >
                        {isLoading ? <Loader className="w-5 h-5 animate-spin" /> : "Save Changes"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-10">
                    {/* Overview Metadata */}
                    <div className="grid grid-cols-3 gap-8">
                      <div className="space-y-1.5">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Priority</p>
                        <div className="flex items-center gap-2">
                          <div className={cn("w-2 h-2 rounded-full",
                            task.priority === 'low' ? 'bg-blue-400' :
                              task.priority === 'medium' ? 'bg-amber-400' : 'bg-rose-500'
                          )} />
                          <span className="text-sm font-bold text-foreground capitalize">{task.priority}</span>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Status</p>
                        <span className="text-sm font-bold text-foreground capitalize">{(task.status || "pending").replace('_', ' ')}</span>
                      </div>
                      <div className="space-y-1.5">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Deadline</p>
                        <div className="flex items-center gap-2 text-foreground">
                          <Calendar className="w-3.5 h-3.5 text-rum-600" />
                          <span className="text-sm font-bold">{task.deadline ? new Date(task.deadline).toLocaleDateString() : 'Unset'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-bold text-muted-foreground uppercase">Description</p>
                      <p className="text-foreground leading-relaxed">
                        {task.description || "No context provided for this task."}
                      </p>
                    </div>

                    {/* Subtasks Management */}
                    <div className="space-y-5">
                      <div className="flex items-center justify-between border-b border-border pb-2">
                        <h4 className="text-xs font-bold text-muted-foreground uppercase">Steps ({subtasks.length})</h4>
                        {!isAddingSubtask && (
                          <button
                            onClick={() => setIsAddingSubtask(true)}
                            className="text-xs font-bold text-primary hover:underline flex items-center gap-1.5"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Add Step
                          </button>
                        )}
                      </div>

                      {isAddingSubtask && (
                        <div className="p-5 bg-muted border border-border rounded-2xl space-y-4">
                          <input
                            type="text"
                            value={subtaskTitle}
                            onChange={(e) => setSubtaskTitle(e.target.value)}
                            placeholder="Objective label..."
                            className="w-full px-4 py-2.5 bg-card border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary text-sm font-semibold"
                          />
                          <div className="flex items-center gap-4">
                            <div className="flex-1 relative">
                              <Clock className="absolute left-3 top-2.5 w-4 h-4 text-rum-600" />
                              <input
                                type="number"
                                value={subtaskDuration}
                                onChange={(e) => setSubtaskDuration(parseInt(e.target.value) || 0)}
                                className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary text-sm font-semibold"
                              />
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => setIsAddingSubtask(false)} className="px-4 py-2.5 text-xs font-bold text-rum-600 hover:text-rum-700">Discard</button>
                              <button onClick={handleAddSubtask} className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:opacity-90 transition-all">Add Objective</button>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        {subtasks.length > 0 ? (
                          subtasks.map((st, i) => (
                            <div key={st._id || `gen-st-${i}`} className="group flex items-center gap-4 p-3 bg-card border border-border rounded-md">
                              {editingSubtaskId === st._id ? (
                                <div className="space-y-3 w-full">
                                  <input
                                    type="text"
                                    value={editingSubtaskTitle}
                                    onChange={(e) => setEditingSubtaskTitle(e.target.value)}
                                    className="w-full h-9 px-3 bg-muted border border-border rounded text-sm font-medium outline-none"
                                  />
                                  <div className="flex items-center gap-3">
                                    <input
                                      type="number"
                                      value={editingSubtaskDuration}
                                      onChange={(e) => setEditingSubtaskDuration(parseInt(e.target.value) || 0)}
                                      className="w-20 h-9 px-3 bg-muted border border-border rounded text-sm font-medium outline-none"
                                    />
                                    <div className="ml-auto flex gap-2">
                                      <button onClick={() => setEditingSubtaskId(null)} className="text-xs font-bold text-rum-600">Cancel</button>
                                      <button onClick={handleSaveSubtaskEdit} className="px-3 py-1.5 bg-primary text-primary-foreground rounded text-xs font-bold">Save</button>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <div className={cn(
                                    "w-4 h-4 rounded border flex items-center justify-center shrink-0",
                                    st.completed ? "bg-emerald-500 border-emerald-500" : "border-border"
                                  )}>
                                    {st.completed && <CheckCircle2 className="w-3 h-3 text-white" />}
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <p className={cn("text-sm font-bold truncate", st.completed ? "text-rum-600 line-through" : "text-foreground")}>
                                      {st.title}
                                    </p>
                                    <p className="text-[10px] font-bold text-rum-600 uppercase">{st.duration}m</p>
                                  </div>

                                  <button
                                    onClick={() => handleStartEditSubtask(st)}
                                    className="opacity-0 group-hover:opacity-100 text-[10px] font-bold text-primary uppercase"
                                  >
                                    Edit
                                  </button>
                                </>
                              )}
                            </div>
                          )))
                          : (
                            <div className="py-10 text-center border-2 border-dashed border-border rounded-3xl">
                              <p className="text-xs font-bold text-rum-600 uppercase tracking-widest">No achievement steps defined</p>
                            </div>
                          )}
                      </div>
                    </div>

                    <div className="pt-4 flex gap-4">
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex-1 h-12 bg-card border border-border text-foreground rounded-xl font-bold hover:bg-muted transition-all flex items-center justify-center gap-2"
                      >
                        Edit Workflow
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}









