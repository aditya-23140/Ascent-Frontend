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
    task?.deadline ? new Date(task.deadline).toISOString().slice(0, 16) : ""
  );

  // Sync form state when task changes
  useEffect(() => {
    if (task) {
      setEditedTitle(task.title);
      setEditedDescription(task.description || "");
      setEditedPriority(task.priority);
      setEditedDeadline(
        task.deadline ? new Date(task.deadline).toISOString().slice(0, 16) : ""
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
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white dark:bg-slate-950 rounded-3xl shadow-premium-lg border border-slate-200 dark:border-slate-800 max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col pointer-events-auto">
              {/* Header */}
              <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-900 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/20">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-600 rounded-xl">
                    <Flag className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight leading-none">
                      {isEditing ? "Modify Task" : "Task Details"}
                    </h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">
                      {isEditing ? "Editing mode" : `Ref: ${task._id.slice(-8)}`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
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
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Task Title</label>
                      <input
                        type="text"
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                        className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-600 transition-all outline-none text-slate-900 dark:text-white font-semibold"
                      />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Scope & Description</label>
                        <textarea
                            value={editedDescription}
                            onChange={(e) => setEditedDescription(e.target.value)}
                            rows={4}
                            className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-600 transition-all outline-none text-slate-900 dark:text-white"
                            placeholder="Define the task objectives..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Priority Level</label>
                        <select
                          value={editedPriority}
                          onChange={(e) => setEditedPriority(e.target.value as "low" | "medium" | "high")}
                          className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-600 transition-all outline-none text-slate-900 dark:text-white font-semibold"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Target Deadline</label>
                        <input
                          type="datetime-local"
                          value={editedDeadline}
                          onChange={(e) => setEditedDeadline(e.target.value)}
                          className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-600 transition-all outline-none text-slate-900 dark:text-white font-semibold"
                        />
                      </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button
                        onClick={() => setIsEditing(false)}
                        className="flex-1 h-12 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveEdit}
                        disabled={isLoading}
                        className="flex-1 h-12 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
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
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Priority</p>
                          <div className="flex items-center gap-2">
                             <div className={cn("w-2 h-2 rounded-full", 
                                task.priority === 'low' ? 'bg-blue-400' : 
                                task.priority === 'medium' ? 'bg-amber-400' : 'bg-rose-500'
                             )} />
                             <span className="text-sm font-bold text-slate-900 dark:text-white capitalize">{task.priority}</span>
                          </div>
                       </div>
                       <div className="space-y-1.5">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</p>
                          <span className="text-sm font-bold text-slate-900 dark:text-white capitalize">{task.status.replace('_', ' ')}</span>
                       </div>
                       <div className="space-y-1.5">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Deadline</p>
                          <div className="flex items-center gap-2 text-slate-900 dark:text-white">
                             <Calendar className="w-3.5 h-3.5 text-slate-400" />
                             <span className="text-sm font-bold">{task.deadline ? new Date(task.deadline).toLocaleDateString() : 'Unset'}</span>
                          </div>
                       </div>
                    </div>

                    <div className="space-y-3">
                       <h4 className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                          <AlignLeft className="w-3 h-3" />
                          Context
                       </h4>
                       <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                          {task.description || "No context provided for this task."}
                       </p>
                    </div>

                    {/* Subtasks Management */}
                    <div className="space-y-5">
                       <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-900 pb-4">
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Achievement Steps ({subtasks.length})</h4>
                          {!isAddingSubtask && (
                             <button
                               onClick={() => setIsAddingSubtask(true)}
                               className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5"
                             >
                               <Plus className="w-3.5 h-3.5 underline" />
                               New Step
                             </button>
                          )}
                       </div>

                       {isAddingSubtask && (
                          <div className="p-5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
                             <input
                               type="text"
                               value={subtaskTitle}
                               onChange={(e) => setSubtaskTitle(e.target.value)}
                               placeholder="Objective label..."
                               className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-600 text-sm font-semibold"
                             />
                             <div className="flex items-center gap-4">
                               <div className="flex-1 relative">
                                  <Clock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                  <input
                                    type="number"
                                    value={subtaskDuration}
                                    onChange={(e) => setSubtaskDuration(parseInt(e.target.value) || 0)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-600 text-sm font-semibold"
                                  />
                               </div>
                               <div className="flex gap-2">
                                  <button onClick={() => setIsAddingSubtask(false)} className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-700">Discard</button>
                                  <button onClick={handleAddSubtask} className="px-6 py-2.5 bg-slate-900 dark:bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-black dark:hover:bg-indigo-700 transition-all">Add Objective</button>
                               </div>
                             </div>
                          </div>
                       )}

                       <div className="space-y-3">
                          {subtasks.length > 0 ? (
                             subtasks.map((st) => (
                                <div key={st._id} className="group flex flex-col gap-4 p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900 rounded-2xl transition-all">
                                   {editingSubtaskId === st._id ? (
                                      <div className="space-y-4 w-full">
                                         <input
                                           type="text"
                                           value={editingSubtaskTitle}
                                           onChange={(e) => setEditingSubtaskTitle(e.target.value)}
                                           className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-600 text-sm font-semibold"
                                         />
                                         <div className="flex items-center gap-3">
                                            <div className="flex-1 relative">
                                               <Clock className="absolute left-3 top-2 w-4 h-4 text-slate-400" />
                                               <input
                                                 type="number"
                                                 value={editingSubtaskDuration}
                                                 onChange={(e) => setEditingSubtaskDuration(parseInt(e.target.value) || 0)}
                                                 className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-600 text-sm font-semibold"
                                               />
                                            </div>
                                            <div className="flex gap-2">
                                               <button onClick={() => setEditingSubtaskId(null)} className="px-3 py-2 text-xs font-bold text-slate-500">Cancel</button>
                                               <button onClick={handleSaveSubtaskEdit} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold transition-all">Save</button>
                                            </div>
                                         </div>
                                      </div>
                                   ) : (
                                      <div className="flex items-center gap-4 w-full">
                                         <button className={cn(
                                            "w-5 h-5 rounded-md border flex items-center justify-center transition-all",
                                            st.completed ? "bg-emerald-500 border-emerald-500 shadow-sm" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                                         )}>
                                            {st.completed && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                                         </button>
                                         
                                         <div className="flex-1 min-w-0">
                                            <p className={cn("text-sm font-semibold truncate transition-all", st.completed ? "text-slate-400 line-through" : "text-slate-900 dark:text-white")}>
                                               {st.title}
                                            </p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{st.duration} mins allocation</p>
                                         </div>

                                         <button 
                                            onClick={() => handleStartEditSubtask(st)}
                                            className="opacity-0 group-hover:opacity-100 p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-lg transition-all"
                                         >
                                            <span className="text-[10px] font-bold uppercase tracking-widest">Adjust</span>
                                         </button>
                                      </div>
                                   )}
                                </div>
                             ))
                          ) : (
                             <div className="py-10 text-center border-2 border-dashed border-slate-100 dark:border-slate-900 rounded-3xl">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No achievement steps defined</p>
                             </div>
                          )}
                       </div>
                    </div>

                    <div className="pt-4 flex gap-4">
                       <button
                         onClick={() => setIsEditing(true)}
                         className="flex-1 h-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
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
