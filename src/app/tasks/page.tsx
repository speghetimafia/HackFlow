"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    KanbanSquare,
    Plus,
    GripVertical,
    MoreHorizontal,
    Calendar,
    Tag,
    Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useQuery, useMutation } from "@tanstack/react-query";

interface Task {
    id: string;
    title: string;
    description?: string;
    priority: "low" | "medium" | "high";
    status: "todo" | "in-progress" | "completed";
    dueDate?: string;
}

interface Column {
    id: string;
    title: string;
    tasks: Task[];
    color: string;
}

export default function TaskBoard() {
    const { data: tasks = [], isLoading, refetch } = useQuery({
        queryKey: ["tasks"],
        queryFn: async () => {
            const res = await fetch("/api/tasks");
            if (!res.ok) throw new Error("Failed to fetch tasks");
            return res.json() as Promise<Task[]>;
        },
    });

    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [addingToColumn, setAddingToColumn] = useState<string | null>(null);
    const [draggedTask, setDraggedTask] = useState<{ task: Task; columnId: string } | null>(null);

    const createTaskMutation = useMutation({
        mutationFn: async ({ title, status }: { title: string; status: string }) => {
            const res = await fetch("/api/tasks", {
                method: "POST",
                body: JSON.stringify({ title, status, priority: "medium" }),
            });
            if (!res.ok) throw new Error("Failed to create task");
            return res.json();
        },
        onSuccess: () => {
            refetch();
            toast.success("Task added!");
            setNewTaskTitle("");
            setAddingToColumn(null);
        },
    });

    const updateTaskMutation = useMutation({
        mutationFn: async ({ id, ...data }: Partial<Task> & { id: string }) => {
            const res = await fetch(`/api/tasks/${id}`, {
                method: "PUT",
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Failed to update task");
            return res.json();
        },
        onSuccess: () => {
            refetch();
        },
    });

    const deleteTaskMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/tasks/${id}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Failed to delete task");
        },
        onSuccess: () => {
            refetch();
            toast.success("Task deleted");
        },
    });

    const handleAddTask = (columnId: string) => {
        if (!newTaskTitle.trim()) return;
        createTaskMutation.mutate({ title: newTaskTitle, status: columnId });
    };

    const handleDeleteTask = (taskId: string) => {
        deleteTaskMutation.mutate(taskId);
    };

    const handleDragStart = (task: Task, columnId: string) => {
        setDraggedTask({ task, columnId });
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (targetColumnId: string) => {
        if (!draggedTask || draggedTask.columnId === targetColumnId) {
            setDraggedTask(null);
            return;
        }

        updateTaskMutation.mutate({
            id: draggedTask.task.id,
            status: targetColumnId as "todo" | "in-progress" | "completed",
        });
        setDraggedTask(null);
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "high":
                return "bg-red-500/10 text-red-500 border-red-500/20";
            case "medium":
                return "bg-accent/10 text-accent border-accent/20";
            default:
                return "bg-muted text-muted-foreground border-border";
        }
    };

    const columns: Column[] = [
        {
            id: "todo",
            title: "To Do",
            color: "bg-muted-foreground",
            tasks: tasks.filter((t) => t.status === "todo"),
        },
        {
            id: "in-progress",
            title: "In Progress",
            color: "bg-accent",
            tasks: tasks.filter((t) => t.status === "in-progress"),
        },
        {
            id: "completed",
            title: "Completed",
            color: "bg-green-500",
            tasks: tasks.filter((t) => t.status === "completed"),
        },
    ];

    if (isLoading) {
        return (
            <div className="p-8 flex justify-center">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-3xl lg:text-4xl font-bold font-display flex items-center gap-3">
                    <KanbanSquare className="h-8 w-8 text-primary" />
                    Task Board
                </h1>
                <p className="text-muted-foreground text-lg">
                    Organize your hackathon tasks with drag-and-drop simplicity
                </p>
            </div>

            {/* Kanban Board */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
                {columns.map((column) => (
                    <div
                        key={column.id}
                        className="rounded-xl border border-border bg-card/50 p-4 space-y-4"
                        onDragOver={handleDragOver}
                        onDrop={() => handleDrop(column.id)}
                    >
                        {/* Column Header */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className={`h-3 w-3 rounded-full ${column.color}`} />
                                <h3 className="font-semibold">{column.title}</h3>
                                <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium">
                                    {column.tasks.length}
                                </span>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setAddingToColumn(column.id)}
                                className="h-8 w-8 p-0"
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Add Task Input */}
                        {addingToColumn === column.id && (
                            <div className="space-y-2 animate-scale-in">
                                <Input
                                    placeholder="Task title..."
                                    value={newTaskTitle}
                                    onChange={(e) => setNewTaskTitle(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleAddTask(column.id)}
                                    autoFocus
                                    className="bg-secondary"
                                />
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        onClick={() => handleAddTask(column.id)}
                                        className="flex-1"
                                    >
                                        Add
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                            setAddingToColumn(null);
                                            setNewTaskTitle("");
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Tasks */}
                        <div className="space-y-2 min-h-[200px]">
                            {column.tasks.map((task) => (
                                <div
                                    key={task.id}
                                    draggable
                                    onDragStart={() => handleDragStart(task, column.id)}
                                    className="group rounded-lg border border-border bg-card p-3 cursor-grab active:cursor-grabbing hover:border-primary/30 transition-all"
                                >
                                    <div className="flex items-start gap-2">
                                        <GripVertical className="h-4 w-4 text-muted-foreground/50 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="flex-1 space-y-2">
                                            <p className="font-medium text-sm">{task.title}</p>
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className={`rounded-full border px-2 py-0.5 text-xs font-medium ${getPriorityColor(
                                                        task.priority
                                                    )}`}
                                                >
                                                    {task.priority}
                                                </span>
                                                {task.dueDate && (
                                                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                                        <Calendar className="h-3 w-3" />
                                                        {new Date(task.dueDate).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                                                >
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => updateTaskMutation.mutate({ id: task.id, priority: "high" })}>
                                                    <Tag className="mr-2 h-4 w-4" />
                                                    High Priority
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => updateTaskMutation.mutate({ id: task.id, priority: "medium" })}>
                                                    <Tag className="mr-2 h-4 w-4" />
                                                    Medium Priority
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleDeleteTask(task.id)}
                                                    className="text-destructive"
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
