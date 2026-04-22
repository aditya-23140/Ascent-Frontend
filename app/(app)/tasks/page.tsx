"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTasks, ITask } from "@/hooks/useTasks";
import TaskDetailModal from "@/components/TaskDetailModal";
import {
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Circle,
  AlertCircle,
  Search,
  Loader,
  Sparkles,
  Calendar,
  Layers,
  Clock,
  ChevronRight,
  Layout,
  X
} from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedApiClient } from "@/lib/api";
import { cn } from "@/lib/utils";

/**
 * Task Item Component - Professional Design
 */
interface TaskItemProps {
  task: ITask;
  index: number;
  onEdit: (task: ITask) => void;
  onDelete: (id: string) => void;
}

function TaskItem({ task, index, onEdit, onDelete }: TaskItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const subtasks = (task.subtasks as any || []) as { _id: string, title: string, completed: boolean, duration?: number }[];
  const totalSubtasks = subtasks.length;
  const completedSubtasks = subtasks.filter(s => s.completed).length;
  const progress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  const priorityConfigs = {
    low: { label: "Low", color: "text-blue-600", dot: "bg-blue-400" },
    medium: { label: "Medium", color: "text-amber-600", dot: "bg-amber-400" },
    high: { label: "High", color: "text-orange-600", dot: "bg-orange-500" },
    urgent: { label: "Urgent", color: "text-rose-600", dot: "bg-rose-500" },
  };

  const statusConfigs = {
    pending: { icon: Circle, color: "text-slate-300" },
    todo: { icon: Circle, color: "text-slate-300" },
    in_progress: { icon: Clock, color: "text-indigo-500" },
    completed: { icon: CheckCircle2, color: "text-emerald-500" },
  };

  const priority = priorityConfigs[task.priority as keyof typeof priorityConfigs] || priorityConfigs.medium;
  const status = statusConfigs[task.status as keyof typeof statusConfigs] || statusConfigs.pending;
  const StatusIcon = status.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group"
    >
      <div
        className="p-5 flex items-center gap-5 cursor-pointer"
        onClick={() => totalSubtasks > 0 && setIsExpanded(!isExpanded)}
      >
        <div className={cn("p-2 rounded-xl transition-colors bg-slate-50 dark:bg-slate-800 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/30")}>
          <StatusIcon className={cn("w-5 h-5", status.color)} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight truncate">
              {task.title}
            </h3>
            <div className="flex items-center gap-1.5 ml-2">
              <div className={cn("w-1.5 h-1.5 rounded-full", priority.dot)} />
              <span className={cn("text-[10px] font-bold uppercase tracking-wider", priority.color)}>
                {priority.label}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3 h-3" />
              {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No deadline'}
            </div>
            <div className="flex items-center gap-1.5">
              <Layers className="w-3 h-3" />
              {totalSubtasks} Objectives
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(task); }}
            className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-lg transition-all"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(task._id); }}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <div className="ml-2">
            <ChevronRight className={cn("w-4 h-4 text-slate-300 transition-transform", isExpanded && "rotate-90")} />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50"
          >
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <span>Achievement Status</span>
                <span>{Math.round(progress)}% Completed</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-indigo-600 rounded-full"
                />
              </div>

              <div className="flex flex-col gap-3 mt-4">
                {subtasks.map((subtask, idx: number) => (
                  <div key={subtask._id || idx} className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
                    <CheckCircle2 className={cn("w-4 h-4", subtask.completed ? "text-emerald-500" : "text-slate-200")} />
                    <span className={cn("text-sm font-semibold truncate", subtask.completed ? "text-slate-400 line-through" : "text-slate-700 dark:text-slate-300")}>
                      {subtask.title}
                    </span>
                    {subtask.duration && <span className="ml-auto text-[10px] font-bold text-slate-400 uppercase">{subtask.duration}m</span>}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/**
 * Create Task Modal - Enterprise Design
 */
function CreateTaskModal({
  isOpen,
  onClose,
  onTaskCreated,
}: {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated?: () => void;
}) {
  const { getToken } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [deadline, setDeadline] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingSubtasks, setIsGeneratingSubtasks] = useState(false);
  const [generatedSubtasks, setGeneratedSubtasks] = useState<
    Array<{ title: string; duration: number; id: string }>
  >([]);
  const [selectedSubtaskIds, setSelectedSubtaskIds] = useState<Set<string>>(new Set());
  const { createTask, fetchTasks } = useTasks();

  const handleGenerateSubtasks = async () => {
    if (!title.trim()) return;
    try {
      setIsGeneratingSubtasks(true);
      const token = await getToken();
      if (!token) return;

      const apiClient = await createAuthenticatedApiClient(token);
      const response = await apiClient.post("/api/tasks/generate-subtasks", { title, description });

      if (response.data?.success && response.data?.data?.subtasks) {
        const subtasksWithIds = response.data.data.subtasks.map((s: { title: string, duration: number }, idx: number) => ({
          ...s, id: `gen-${idx}-${Date.now()}`
        }));
        setGeneratedSubtasks(subtasksWithIds);
        setSelectedSubtaskIds(new Set(subtasksWithIds.map((s: { id: string }) => s.id)));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsGeneratingSubtasks(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !deadline) return;

    try {
      setIsSubmitting(true);
      await createTask({
        title,
        description,
        priority: priority as "low" | "medium" | "high",
        deadline,
        status: "pending",
        subtasks: generatedSubtasks
          .filter(s => selectedSubtaskIds.has(s.id))
          .map(({ title, duration }) => ({ title, duration })),
      });

      setTitle(""); setDescription(""); setPriority("medium"); setDeadline(""); setGeneratedSubtasks([]);
      onTaskCreated?.();
      onClose();
      await fetchTasks();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40" />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-950 rounded-3xl shadow-premium-lg border border-slate-200 dark:border-slate-800 max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col pointer-events-auto">
              <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-900 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-600 rounded-xl"><Plus className="w-5 h-5 text-white" /></div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Initialize Objective</h2>
                </div>
                <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl transition-all"><X className="w-5 h-5" /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Objective Title</label>
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Project name or task label..." className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none transition-all font-semibold" />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Context & Description</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Provide additional details or context for this objective..." className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none transition-all font-semibold min-h-[100px] resize-none" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Priority Level</label>
                    <select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl font-semibold outline-none focus:ring-2 focus:ring-indigo-600">
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Goal Deadline</label>
                    <input type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl font-semibold outline-none focus:ring-2 focus:ring-indigo-600" />
                  </div>
                </div>

                <button type="button" onClick={handleGenerateSubtasks} disabled={isGeneratingSubtasks || !title.trim()} className="w-full h-12 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-100 dark:hover:bg-indigo-950/50 transition-all">
                  {isGeneratingSubtasks ? <Loader className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  Decompose with AI Intelligence
                </button>

                {generatedSubtasks.length > 0 && (
                  <div className="space-y-3 bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Segmented Goals</h3>
                    <div className="space-y-2">
                      {generatedSubtasks.map((st) => (
                        <div key={st.id} className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
                          <input type="checkbox" checked={selectedSubtaskIds.has(st.id)} onChange={() => {
                            const newSet = new Set(selectedSubtaskIds);
                            if (newSet.has(st.id)) {
                              newSet.delete(st.id);
                            } else {
                              newSet.add(st.id);
                            }
                            setSelectedSubtaskIds(newSet);
                          }} className="w-4 h-4 accent-indigo-600" />
                          <span className="text-sm font-semibold flex-1">{st.title}</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">{st.duration}m</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="px-8 py-6 border-t border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-900/20 flex gap-4">
                <button onClick={onClose} className="flex-1 h-12 font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all">Discard</button>
                <button onClick={handleSubmit} disabled={isSubmitting || !title.trim()} className="flex-2 h-12 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
                  {isSubmitting ? <Loader className="w-5 h-5 animate-spin" /> : "Initiate Workspace"}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default function TasksPage() {
  const { tasks, loading, error, deleteTask, fetchTasks } = useTasks();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<ITask | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const filteredTasks = tasks?.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || task.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 min-h-screen">
      <div className="bg-indigo-600 text-white p-8 lg:p-12">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto w-full space-y-2">
          <h1 className="text-4xl lg:text-5xl font-black tracking-tight">Objective Management</h1>
          <p className="text-white/70 text-lg font-medium">Strategize, track, and execute your professional goals.</p>
        </motion.div>
      </div>

      <div className="p-6 lg:p-10 max-w-7xl mx-auto w-full -mt-10 space-y-8">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-premium flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Filter objectives..." className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 font-semibold" />
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-4 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none font-bold text-sm">
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">Active</option>
              <option value="completed">Finalized</option>
            </select>
            <button onClick={() => setIsCreateModalOpen(true)} className="flex-1 md:flex-none h-[48px] px-6 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-100 dark:shadow-none transition-all">
              <Plus className="w-4 h-4" />
              Initialize
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader className="w-10 h-10 text-indigo-600 animate-spin" /></div>
        ) : error ? (
          <div className="bg-rose-50 text-rose-600 p-10 rounded-3xl border border-rose-100 text-center space-y-4">
            <AlertCircle className="w-10 h-10 mx-auto" />
            <p className="font-bold text-lg">Failed to synchronize tasks</p>
            <p className="text-sm opacity-70">{error}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{filteredTasks?.length || 0} Entities Found</h3>
              <div className="flex gap-4">
                <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Active Focus</button>
                <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Archived</button>
              </div>
            </div>

            <AnimatePresence mode="popLayout">
              {filteredTasks?.length ? (
                filteredTasks.map((t, i) => (
                  <TaskItem key={t._id} task={t} index={i} onEdit={(task) => { setSelectedTask(task); setIsDetailModalOpen(true); }} onDelete={async (id) => { if (confirm("Confirm deletion?")) await deleteTask(id); }} />
                ))
              ) : (
                <div className="py-32 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] space-y-6">
                  <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center mx-auto text-slate-200"><Layout className="w-10 h-10" /></div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold tracking-tight">Empty Workspace</h3>
                    <p className="text-slate-500 max-w-sm mx-auto text-sm">Your objective list is currently empty. Initialize a new task to begin your tracking workflow.</p>
                  </div>
                  <button onClick={() => setIsCreateModalOpen(true)} className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all">Create First Task</button>
                </div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      <CreateTaskModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
      <TaskDetailModal
        task={selectedTask}
        isOpen={isDetailModalOpen}
        onClose={() => { setIsDetailModalOpen(false); setSelectedTask(null); }}
        onTaskUpdated={(updatedTask) => { setSelectedTask(updatedTask); fetchTasks(); }}
        subtasks={(selectedTask?.subtasks as any) || []}
      />
    </div>
  );
}
