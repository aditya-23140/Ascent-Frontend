"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion, Reorder } from "framer-motion";
import { useTasks, useSubtasks, ITask, ISubtask } from "@/hooks/useTasks";
import TaskDetailModal from "@/components/TaskDetailModal";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedApiClient } from "@/lib/api";
import { cn } from "@/lib/utils";
import { v4 as uuidv4 } from "uuid";
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
  Clock,
  ChevronDown,
  X,
  GripVertical
} from "lucide-react";

// ─── Task Row ────────────────────────────────────────────────────────────────

interface TaskItemProps {
  task: ITask;
  onEdit: (task: ITask) => void;
  onDelete: (id: string) => void;
}

function TaskItem({ task, onEdit, onDelete }: TaskItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { reorderSubtasks } = useSubtasks();
  const [localSubtasks, setLocalSubtasks] = useState<ISubtask[]>(task.subtasks || []);

  useEffect(() => {
    setLocalSubtasks(task.subtasks || []);
  }, [task.subtasks]);

  const total = localSubtasks.length;
  const done = localSubtasks.filter((s) => s.completed).length;
  const progress = total > 0 ? (done / total) * 100 : 0;

  const priorityColor: Record<string, string> = {
    low: "text-rum-600",
    medium: "text-amber-600",
    high: "text-orange-600",
    urgent: "text-rose-600",
  };

  const isOverdue =
    task.deadline && new Date(task.deadline) < new Date() && task.status !== "completed";

  const handleSubtaskReorder = (newOrder: ISubtask[]) => {
    setLocalSubtasks(newOrder);
    reorderSubtasks(task._id, newOrder.map(s => s._id));
  };

  return (
    <Reorder.Item
      value={task}
      id={task._id}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileDrag={{ scale: 1.02, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)" }}
      className="bg-card dark:bg-card border border-border dark:border-border rounded-md overflow-hidden relative group"
    >
      {/* Main row */}
      <div className="flex items-center gap-4 px-5 py-4">
        {/* Drag Handle */}
        <div className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-rum-600 transition-colors">
          <GripVertical className="w-4 h-4" />
        </div>

        {/* Status icon */}
        {task.status === "completed" ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
        ) : task.status === "in_progress" ? (
          <Clock className="w-5 h-5 text-primary shrink-0" />
        ) : (
          <Circle className="w-5 h-5 text-slate-300 shrink-0" />
        )}

        {/* Title + meta */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-foreground truncate">
            {task.title}
          </h3>
          <div className="flex items-center gap-3 mt-0.5 text-[11px] text-rum-600 font-medium">
            <span className={cn("font-bold uppercase", priorityColor[task.priority] ?? "text-rum-600")}>
              {task.priority}
            </span>
            <span>·</span>
            <span className={cn(isOverdue ? "text-rose-500" : "")}>
              {task.deadline
                ? new Date(task.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                : "No date"}
            </span>
            {total > 0 && (
              <>
                <span>·</span>
                <span>{done}/{total} steps</span>
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(task); }}
            className="p-2 text-rum-600 hover:text-rum-700 dark:hover:text-border rounded transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(task._id); }}
            className="p-2 text-rum-600 hover:text-rose-600 rounded transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          {total > 0 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 text-rum-600 rounded transition-colors"
            >
              <ChevronDown className={cn("w-4 h-4 transition-transform", isExpanded && "rotate-180")} />
            </button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <div className="h-0.5 bg-border dark:bg-border mx-5">
          <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
        </div>
      )}

      {/* Expanded subtasks */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <Reorder.Group 
              axis="y" 
              values={localSubtasks} 
              onReorder={handleSubtaskReorder}
              className="px-5 py-4 space-y-2 border-t border-border dark:border-border"
            >
              {localSubtasks.map((st) => (
                <Reorder.Item 
                  key={st._id} 
                  value={st}
                  className="flex items-center gap-3 py-1.5 group/sub"
                >
                  <GripVertical className="w-3 h-3 text-border cursor-grab active:cursor-grabbing opacity-0 group-hover/sub:opacity-100 transition-opacity" />
                  <CheckCircle2
                    className={cn("w-4 h-4 shrink-0", st.completed ? "text-emerald-500" : "text-border")}
                  />
                  <span className={cn("text-sm flex-1 truncate", st.completed ? "text-rum-600 line-through" : "text-rum-700 dark:text-slate-300")}>
                    {st.title}
                  </span>
                  {st.duration && (
                    <span className="text-[10px] font-bold text-rum-600 uppercase shrink-0">
                      {st.duration}m
                    </span>
                  )}
                </Reorder.Item>
              ))}
            </Reorder.Group>
          </motion.div>
        )}
      </AnimatePresence>
    </Reorder.Item>
  );
}

// ─── Create Task Modal ────────────────────────────────────────────────────────

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
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSubtasks, setGeneratedSubtasks] = useState<
    Array<{ title: string; duration: number; id: string }>
  >([]);
  const [selectedSubtaskIds, setSelectedSubtaskIds] = useState<Set<string>>(new Set());
  const { createTask, fetchTasks } = useTasks();

  const handleGenerate = async () => {
    if (!title.trim()) return;
    try {
      setIsGenerating(true);
      const token = await getToken();
      if (!token) return;
      const client = await createAuthenticatedApiClient(token);
      const res = await client.post("/api/tasks/generate-subtasks", { title, description });
      if (res.data?.success && res.data?.data?.subtasks) {
        const withIds = res.data.data.subtasks.map(
          (s: { title: string; duration: number }, idx: number) => ({
            ...s,
            id: uuidv4()
          })
        );
        setGeneratedSubtasks([]);
        setTimeout(() => setGeneratedSubtasks(withIds), 0);
        setSelectedSubtaskIds(new Set(withIds.map((s: { id: string }) => s.id)));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
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
          .filter((s) => selectedSubtaskIds.has(s.id))
          .map(({ title, duration }) => ({ title, duration })),
      });
      setTitle(""); setDescription(""); setPriority("medium"); setDeadline(""); setGeneratedSubtasks([]);
      onTaskCreated?.();
      onClose();
      await fetchTasks();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleSubtask = (id: string) => {
    const next = new Set(selectedSubtaskIds);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedSubtaskIds(next);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-card/50 z-40"
          />

          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.97, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-card dark:bg-slate-950 border border-border dark:border-border rounded-lg shadow-xl max-w-xl w-full max-h-[90vh] overflow-hidden flex flex-col pointer-events-auto">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-border dark:border-card">
                <h2 className="text-base font-bold text-foreground">New Task</h2>
                <button onClick={onClose} className="p-1.5 text-muted-foreground hover:text-foreground rounded transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="What do you need to do?"
                    className="w-full h-10 px-3 bg-muted/50 dark:bg-card border border-border dark:border-border rounded-md text-sm outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Optional details..."
                    className="w-full px-3 py-2 bg-muted/50 dark:bg-card border border-border dark:border-border rounded-md text-sm outline-none focus:ring-1 focus:ring-primary min-h-[80px] resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Priority</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="w-full h-10 px-3 bg-muted/50 dark:bg-card border border-border dark:border-border rounded-md text-sm outline-none"
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
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="w-full h-10 px-3 bg-muted/50 dark:bg-card border border-border dark:border-border rounded-md text-sm outline-none"
                    />
                  </div>
                </div>

                {/* AI subtask generation */}
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={isGenerating || !title.trim()}
                  className="w-full h-10 border border-border dark:border-border rounded-md text-sm font-bold text-rum-600 dark:text-rum-600 flex items-center justify-center gap-2 hover:bg-muted/50 dark:hover:bg-card transition-colors disabled:opacity-40"
                >
                  {isGenerating ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  Break into steps with AI
                </button>

                {generatedSubtasks.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-muted-foreground uppercase">Suggested steps</p>
                    {generatedSubtasks.map((st, i) => (
                      <label
                        key={st.id || `gen-st-${i}`}
                        className="flex items-center gap-3 p-3 border border-border dark:border-border rounded-md cursor-pointer hover:bg-muted/50 dark:hover:bg-card transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedSubtaskIds.has(st.id)}
                          onChange={() => toggleSubtask(st.id)}
                          className="w-4 h-4 accent-primary"
                        />
                        <span className="text-sm flex-1">{st.title}</span>
                        <span className="text-[10px] font-bold text-rum-600 uppercase">{st.duration}m</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border dark:border-card">
                <button
                  onClick={onClose}
                  className="h-10 px-4 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !title.trim() || !deadline}
                  className="h-10 px-6 bg-primary text-primary-foreground rounded-md text-sm font-bold disabled:opacity-40 flex items-center gap-2 shadow-lg shadow-primary/20"
                >
                  {isSubmitting && <Loader className="w-4 h-4 animate-spin" />}
                  Add Task
                </button>
              </div>
            </div>
          </motion.div>
        </>)
      }
    </AnimatePresence>
  )

}

// ─── Tasks Page ───────────────────────────────────────────────────────────────

export default function TasksPage() {
  const { tasks, loading, error, deleteTask, fetchTasks, getTaskWithSubtasks, reorderTasks } = useTasks();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<ITask | null>(null);
  const [selectedSubtasks, setSelectedSubtasks] = useState<any[]>([]);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const handleEditTask = async (task: ITask) => {
    setIsLoadingDetail(true);
    try {
      const populated = await getTaskWithSubtasks(task._id);
      setSelectedTask(populated as any);
      setSelectedSubtasks((populated.subtasks as any[]) || []);
      setIsDetailModalOpen(true);
    } catch {
      // Fall back to raw task with no subtasks
      setSelectedTask(task);
      setSelectedSubtasks([]);
      setIsDetailModalOpen(true);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const filteredTasks = tasks?.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || task.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleTaskReorder = (newOrder: ITask[]) => {
    // Note: Reordering usually only makes sense when not filtering
    reorderTasks(newOrder.map(t => t._id));
  };

  return (
    <div className="p-6 md:p-10 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tasks</h1>
          <p className="text-sm text-rum-600 mt-0.5">
            {tasks?.length ?? 0} task{tasks?.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="h-10 px-4 bg-primary text-primary-foreground rounded-md text-sm font-bold flex items-center gap-2 shadow-lg shadow-primary/20"
        >
          <Plus className="w-4 h-4" /> Add Task
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-rum-600" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks..."
            className="w-full h-9 pl-9 pr-3 bg-card dark:bg-card border border-border dark:border-border rounded-md text-sm outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="h-9 px-3 bg-card dark:bg-card border border-border dark:border-border rounded-md text-sm font-medium outline-none"
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Done</option>
        </select>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader className="w-6 h-6 text-rum-600 animate-spin" />
        </div>
      ) : error ? (
        <div className="p-6 border border-rose-200 bg-rose-50 rounded-md text-rose-600 text-sm font-medium flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      ) : filteredTasks?.length ? (
        <div className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <p className="text-[11px] font-bold text-rum-600 uppercase tracking-wider">
              {filteredTasks.length} result{filteredTasks.length !== 1 ? "s" : ""}
            </p>
            {filterStatus === 'all' && !searchQuery && (
              <span className="text-[10px] text-rum-600 font-medium italic">Drag handles to reorder</span>
            )}
          </div>
          
          <Reorder.Group 
            axis="y" 
            values={filteredTasks} 
            onReorder={handleTaskReorder}
            className="space-y-3"
          >
            <AnimatePresence mode="popLayout">
              {filteredTasks.map((task) => (
                <TaskItem
                  key={task._id}
                  task={task}
                  onEdit={(t) => handleEditTask(t)}
                  onDelete={async (id) => {
                    if (confirm("Delete this task?")) await deleteTask(id);
                  }}
                />
              ))}
            </AnimatePresence>
          </Reorder.Group>
        </div>
      ) : (
        <div className="py-20 text-center border border-dashed border-border dark:border-border rounded-md">
          <p className="text-rum-600 text-sm font-medium mb-4">No tasks yet.</p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="h-10 px-6 bg-primary text-primary-foreground rounded-md text-sm font-bold shadow-lg shadow-primary/20"
          >
            Add your first task
          </button>
        </div>
      )}

      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onTaskCreated={fetchTasks}
      />
      <TaskDetailModal
        task={selectedTask}
        isOpen={isDetailModalOpen}
        onClose={() => { setIsDetailModalOpen(false); setSelectedTask(null); setSelectedSubtasks([]); }}
        onTaskUpdated={async (updated) => { setSelectedTask(updated); await handleEditTask(updated); fetchTasks(); }}
        subtasks={selectedSubtasks}
      />
    </div>
  );
}








