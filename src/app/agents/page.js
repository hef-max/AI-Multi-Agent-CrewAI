// pages/agents.js
"use client";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast, Toaster } from "react-hot-toast";
import { PlusCircle, X, Edit, Trash } from "lucide-react";

export default function Agents() {
  const [agents, setAgents] = useState([]);
  const [status, setStatus] = useState("");
  const [selectedAgent, setSelectedAgent] = useState(null);
  
  // States for create modal
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createDomain, setCreateDomain] = useState("");
  const [createGoal, setCreateGoal] = useState("");
  const [createBackstory, setCreateBackstory] = useState("");
  const [createModel, setCreateModel] = useState("gemini/gemini-1.5-flash");
  const [createTasks, setCreateTasks] = useState([]);
  const [createTaskDescription, setCreateTaskDescription] = useState("");
  const [createTaskExpectedOutput, setCreateTaskExpectedOutput] = useState("");
  
  // States for update modal
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [goal, setGoal] = useState("");
  const [backstory, setBackstory] = useState("");
  const [model, setModel] = useState("gemini/gemini-1.5-flash");
  const [tasks, setTasks] = useState([]);
  const [taskDescription, setTaskDescription] = useState("");
  const [taskExpectedOutput, setTaskExpectedOutput] = useState("");
  
  // States for knowledge modal
  const [isKnowledgeDialogOpen, setIsKnowledgeDialogOpen] = useState(false);
  const [documentFile, setDocumentFile] = useState(null);
  const [documentName, setDocumentName] = useState("");
  const [documentDescription, setDocumentDescription] = useState("");

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const res = await fetch("http://localhost:5000/agents");
      const data = await res.json();
      setAgents(data.agents);
    } catch (error) {
      console.error("Error fetching agents:", error);
    }
  };

  const handleAddCreateTask = () => {
    if (createTaskDescription.trim()) {
      const newTask = {
        description: createTaskDescription,
        expected_output: createTaskExpectedOutput || ""
      };
      setCreateTasks([...createTasks, newTask]);
      setCreateTaskDescription("");
      setCreateTaskExpectedOutput("");
    }
  };

  const handleRemoveCreateTask = (index) => {
    setCreateTasks(createTasks.filter((_, i) => i !== index));
  };

  const handleAddTask = () => {
    if (taskDescription.trim()) {
      const newTask = {
        description: taskDescription,
        expected_output: taskExpectedOutput || ""
      };
      setTasks([...tasks, newTask]);
      setTaskDescription("");
      setTaskExpectedOutput("");
    }
  };

  const handleRemoveTask = (index) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const resetCreateForm = () => {
    setCreateDomain("");
    setCreateGoal("");
    setCreateBackstory("");
    setCreateModel("gemini/gemini-1.5-flash");
    setCreateTasks([]);
    setCreateTaskDescription("");
    setCreateTaskExpectedOutput("");
  };

  const handleCreateAgent = async () => {
    if (!createDomain.trim()) {
      toast.error("Domain is required");
      return;
    }
    
    try {
      const res = await fetch("http://localhost:5000/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          domain: createDomain, 
          model: createModel,
          goal: createGoal,
          backstory: createBackstory,
          tasks: createTasks
        }),
      });
      
      const data = await res.json();
      if (res.ok) {
        await fetchAgents();
        resetCreateForm();
        setIsCreateDialogOpen(false);
        toast.success("Agent created successfully!");
      } else {
        toast.error(data.error || "Failed to create agent.");
      }
    } catch (error) {
      console.error("Error creating agent:", error);
      toast.error("Something went wrong while creating the agent.");
    }
  };

  const handleDelete = async (agentId) => {
    try {
      const res = await fetch(`http://localhost:5000/agents/${agentId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Agent deleted successfully!");
        await fetchAgents();
        setSelectedAgent(null);
      } else {
        toast.error(data.error || "Failed to delete agent.");
      }
    } catch (error) {
      console.error("Error deleting agent:", error);
      toast.error("Something went wrong while deleting the agent.");
    }
  };

  const handleUpdate = async () => {
    if (!selectedAgent?.id) return;

    try {
      const updatedData = {
        goal,
        backstory,
        model,
        tasks
      };

      const res = await fetch(
        `http://localhost:5000/agents/${selectedAgent.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedData),
        }
      );

      if (res.ok) {
        toast.success("Agent updated successfully!");
        await fetchAgents();
        setIsUpdateDialogOpen(false);
      } else {
        toast.error("Failed to update agent.");
      }
    } catch (error) {
      console.error("Error updating agent:", error);
      toast.error("Something went wrong while updating the agent.");
    }
  };

  const handleOpenDeleteDialog = (agent) => {
    setSelectedAgent(agent);
  };

  const handleOpenUpdateDialog = (agent) => {
    setSelectedAgent(agent);
    setGoal(agent.goal || "");
    setBackstory(agent.backstory || "");
    setModel(agent.model || "gemini/gemini-1.5-flash");
    
    // Convert string tasks to object format if needed
    const formattedTasks = Array.isArray(agent.tasks) 
      ? agent.tasks.map(task => {
          if (typeof task === 'string') {
            return { description: task, expected_output: "" };
          }
          return task;
        }) 
      : [];
    
    setTasks(formattedTasks);
    setIsUpdateDialogOpen(true);
  };

  const handleOpenKnowledgeDialog = (agent) => {
    setSelectedAgent(agent);
    setIsKnowledgeDialogOpen(true);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setDocumentFile(e.target.files[0]);
    }
  };

  const handleUploadKnowledge = async () => {
    if (!documentFile || !selectedAgent?.id) return;

    try {
      // Create FormData to send file
      const formData = new FormData();
      formData.append("file", documentFile);
      formData.append("name", documentName);
      formData.append("description", documentDescription);
      
      const res = await fetch(
        `http://localhost:5000/agents/${selectedAgent.id}/knowledge`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (res.ok) {
        toast.success("Knowledge document added successfully!");
        setIsKnowledgeDialogOpen(false);
        setDocumentFile(null);
        setDocumentName("");
        setDocumentDescription("");
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to add knowledge document.");
      }
    } catch (error) {
      console.error("Error uploading knowledge:", error);
      toast.error("Something went wrong while uploading the document.");
    }
  };

  // Helper function to format task for display
  const formatTaskForDisplay = (task) => {
    if (typeof task === 'string') {
      return task;
    }
    return task.description;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 flex flex-col">
      <Toaster />
      <div className="max-w-6xl mx-auto py-10 px-6 flex-grow">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          Manage Agents
        </h1>
        
        {/* Create Agent Button and Dialog */}
        <div className="mb-8 flex justify-end">
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center">
                <PlusCircle size={18} className="mr-2" /> Create New Agent
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create New Agent</DialogTitle>
                <DialogDescription>
                  Fill in the details to create a new agent
                </DialogDescription>
              </DialogHeader>
              
              {/* Create Agent Form */}
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="col-span-1">Domain/Role</label>
                  <input
                    type="text"
                    value={createDomain}
                    onChange={(e) => setCreateDomain(e.target.value)}
                    placeholder="Enter domain (e.g., Chemistry)"
                    className="col-span-3 border px-2 py-1 rounded"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="col-span-1">Model</label>
                  <select
                    value={createModel}
                    onChange={(e) => setCreateModel(e.target.value)}
                    className="col-span-3 border px-2 py-1 rounded"
                  >
                    <option value="gemini/gemini-1.5-flash">gemini/gemini-1.5-flash</option>
                    <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
                    <option value="gpt-4">gpt-4</option>
                  </select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="col-span-1">Goal</label>
                  <textarea
                    value={createGoal}
                    onChange={(e) => setCreateGoal(e.target.value)}
                    placeholder="What is the agent's main goal?"
                    rows={3}
                    className="col-span-3 border px-2 py-1 rounded"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="col-span-1">Backstory</label>
                  <textarea
                    value={createBackstory}
                    onChange={(e) => setCreateBackstory(e.target.value)}
                    placeholder="Provide a backstory for the agent"
                    rows={3}
                    className="col-span-3 border px-2 py-1 rounded"
                  />
                </div>
                
                {/* Task management for creation with description and expected output */}
                <div className="grid grid-cols-4 items-start gap-4">
                  <label className="col-span-1">Tasks</label>
                  <div className="col-span-3">
                    <div className="mb-2">
                      <textarea
                        value={createTaskDescription}
                        onChange={(e) => setCreateTaskDescription(e.target.value)}
                        placeholder="Task description (e.g., 'Continuously monitor and analyze market data for the selected stock ({stock_selection})...')"
                        rows={3}
                        className="w-full border px-2 py-1 rounded mb-2"
                      />
                      <textarea
                        value={createTaskExpectedOutput}
                        onChange={(e) => setCreateTaskExpectedOutput(e.target.value)}
                        placeholder="Expected output (e.g., 'Insights and alerts about significant market opportunities or threats for {stock_selection}.')"
                        rows={2}
                        className="w-full border px-2 py-1 rounded mb-2"
                      />
                      <button
                        onClick={handleAddCreateTask}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded flex items-center"
                      >
                        <PlusCircle size={16} className="mr-1" /> Add Task
                      </button>
                    </div>
                    <div className="max-h-60 overflow-y-auto border rounded p-2">
                      {createTasks.length > 0 ? (
                        <ul className="space-y-4">
                          {createTasks.map((task, index) => (
                            <li key={index} className="border-b pb-3">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="font-semibold text-sm text-gray-600 mb-1">Description:</div>
                                  <div className="mb-2">{task.description}</div>
                                  {task.expected_output && (
                                    <>
                                      <div className="font-semibold text-sm text-gray-600 mb-1">Expected Output:</div>
                                      <div className="mb-1 text-gray-700">{task.expected_output}</div>
                                    </>
                                  )}
                                </div>
                                <button
                                  onClick={() => handleRemoveCreateTask(index)}
                                  className="text-red-500 hover:text-red-700 ml-2"
                                >
                                  <X size={16} />
                                </button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-500 italic text-sm">No tasks defined</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  type="submit" 
                  onClick={handleCreateAgent}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  Create Agent
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Agent List */}
        <div className="bg-white rounded-lg shadow-lg p-6 text-gray-700">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">
            Agent List
          </h2>
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-200">
                  <th className="px-4 py-3 border text-center">Agent ID</th>
                  <th className="px-4 py-3 border text-center">Role</th>
                  <th className="px-4 py-3 border text-center">Model</th>
                  <th className="px-4 py-3 border text-center">Goal</th>
                  <th className="px-4 py-3 border text-center">Backstory</th>
                  <th className="px-4 py-3 border text-center">Tasks</th>
                  <th className="px-4 py-3 border text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {agents.map(([id, role, model, goal, backstory, tasks = []]) => (
                  <tr key={id} className="hover:bg-gray-100">
                    <td className="px-4 py-3 border">{id}</td>
                    <td className="px-4 py-3 border">{role}</td>
                    <td className="px-4 py-3 border">{model}</td>
                    <td className="px-4 py-3 border">{goal}</td>
                    <td className="px-4 py-3 border">{backstory}</td>
                    <td className="px-4 py-3 border">
                      {Array.isArray(tasks) && tasks.length > 0 ? (
                        <ul className="list-disc pl-5">
                          {tasks.slice(0, 2).map((task, idx) => (
                            <li key={idx}>
                              {typeof task === 'string' ? task : task.description?.substring(0, 60) + '...'}
                            </li>
                          ))}
                          {tasks.length > 2 && (
                            <li className="text-blue-500">+{tasks.length - 2} more</li>
                          )}
                        </ul>
                      ) : (
                        <span className="text-gray-400 italic">No tasks defined</span>
                      )}
                    </td>
                    <td className="px-4 py-3 border">
                      <div className="flex space-x-2">
                        {/* Dialog for Confirmation Delete */}
                        <Dialog>
                          <DialogTrigger asChild>
                            <button
                              onClick={() => handleOpenDeleteDialog({ id })}
                              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition duration-200 flex items-center"
                            >
                              <Trash size={16} className="mr-1" /> Delete
                            </button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[600px]">
                            <DialogHeader>
                              <DialogTitle>Delete agent</DialogTitle>
                              <DialogDescription>
                                Are you sure you want to delete the agent{" "}
                                <strong>{selectedAgent?.id}</strong>?
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <Button
                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition duration-200"
                                onClick={() => handleDelete(selectedAgent?.id)}
                                type="submit"
                              >
                                Delete
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        
                        {/* Dialog for Update */}
                        <Dialog
                          open={isUpdateDialogOpen}
                          onOpenChange={setIsUpdateDialogOpen}
                        >
                          <DialogTrigger asChild>
                            <button
                              onClick={() => handleOpenUpdateDialog({ 
                                id, 
                                goal, 
                                backstory, 
                                model,
                                tasks: tasks || [] 
                              })}
                              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition duration-200 flex items-center"
                            >
                              <Edit size={16} className="mr-1" /> Update
                            </button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[600px]">
                            <DialogHeader>
                              <DialogTitle>Update Agent</DialogTitle>
                              <DialogDescription>
                                Make changes to your agent
                              </DialogDescription>
                            </DialogHeader>

                            {/* Update Form */}
                            <div className="grid gap-4 py-4">
                              <div className="grid grid-cols-4 items-center gap-4">
                                <label className="col-span-1">Agent ID</label>
                                <input
                                  type="text"
                                  value={id}
                                  className="col-span-3 border px-2 py-1 rounded cursor-not-allowed"
                                  readOnly
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <label className="col-span-1">Role</label>
                                <input
                                  type="text"
                                  value={role}
                                  className="col-span-3 border px-2 py-1 rounded cursor-not-allowed"
                                  readOnly
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <label className="col-span-1">Goal</label>
                                <textarea
                                  defaultValue={goal}
                                  rows={3}
                                  onChange={(e) => setGoal(e.target.value)}
                                  className="col-span-3 border px-2 py-1 rounded"
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <label className="col-span-1">Backstory</label>
                                <textarea
                                  defaultValue={backstory}
                                  rows={3}
                                  onChange={(e) => setBackstory(e.target.value)}
                                  className="col-span-3 border px-2 py-1 rounded"
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <label className="col-span-1">Model</label>
                                <select
                                  defaultValue={model}
                                  onChange={(e) => setModel(e.target.value)}
                                  className="col-span-3 border px-2 py-1 rounded"
                                >
                                  <option value="gemini/gemini-1.5-flash">
                                    gemini/gemini-1.5-flash
                                  </option>
                                  <option value="gpt-3.5-turbo">
                                    gpt-3.5-turbo
                                  </option>
                                  <option value="gpt-4">gpt-4</option>
                                </select>
                              </div>
                              
                              {/* Task management section for updating with description and expected output */}
                              <div className="grid grid-cols-4 items-start gap-4">
                                <label className="col-span-1">Tasks</label>
                                <div className="col-span-3">
                                  <div className="mb-2">
                                    <textarea
                                      value={taskDescription}
                                      onChange={(e) => setTaskDescription(e.target.value)}
                                      placeholder="Task description (e.g., 'Continuously monitor and analyze market data for the selected stock ({stock_selection})...')"
                                      rows={3}
                                      className="w-full border px-2 py-1 rounded mb-2"
                                    />
                                    <textarea
                                      value={taskExpectedOutput}
                                      onChange={(e) => setTaskExpectedOutput(e.target.value)}
                                      placeholder="Expected output (e.g., 'Insights and alerts about significant market opportunities or threats for {stock_selection}.')"
                                      rows={2}
                                      className="w-full border px-2 py-1 rounded mb-2"
                                    />
                                    <button
                                      onClick={handleAddTask}
                                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded flex items-center"
                                    >
                                      <PlusCircle size={16} className="mr-1" /> Add Task
                                    </button>
                                  </div>
                                  <div className="max-h-60 overflow-y-auto border rounded p-2">
                                    {tasks.length > 0 ? (
                                      <ul className="space-y-4">
                                        {tasks.map((task, index) => (
                                          <li key={index} className="border-b pb-3">
                                            <div className="flex justify-between items-start">
                                              <div className="flex-1">
                                                <div className="font-semibold text-sm text-gray-600 mb-1">Description:</div>
                                                <div className="mb-2">
                                                  {typeof task === 'string' ? task : task.description}
                                                </div>
                                                {task.expected_output && (
                                                  <>
                                                    <div className="font-semibold text-sm text-gray-600 mb-1">Expected Output:</div>
                                                    <div className="mb-1 text-gray-700">{task.expected_output}</div>
                                                  </>
                                                )}
                                              </div>
                                              <button
                                                onClick={() => handleRemoveTask(index)}
                                                className="text-red-500 hover:text-red-700 ml-2"
                                              >
                                                <X size={16} />
                                              </button>
                                            </div>
                                          </li>
                                        ))}
                                      </ul>
                                    ) : (
                                      <p className="text-gray-500 italic text-sm">No tasks defined</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button type="submit" onClick={handleUpdate}>
                                Save Changes
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        
                        {/* Dialog for Knowledge Upload */}
                        <Dialog
                          open={isKnowledgeDialogOpen}
                          onOpenChange={setIsKnowledgeDialogOpen}
                        >
                          <DialogTrigger asChild>
                            <button
                              onClick={() => handleOpenKnowledgeDialog({ id })}
                              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition duration-200"
                            >
                              Add Knowledge
                            </button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[600px]">
                            <DialogHeader>
                              <DialogTitle>Add Knowledge Document</DialogTitle>
                              <DialogDescription>
                                Upload documents to enhance this agent's knowledge base for RAG
                              </DialogDescription>
                            </DialogHeader>

                            {/* Knowledge Upload Form */}
                            <div className="grid gap-4 py-4">
                              <div className="grid grid-cols-4 items-center gap-4">
                                <label className="col-span-1">Agent ID</label>
                                <input
                                  type="text"
                                  value={selectedAgent?.id || ""}
                                  className="col-span-3 border px-2 py-1 rounded cursor-not-allowed"
                                  readOnly
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <label className="col-span-1">Document Name</label>
                                <input
                                  type="text"
                                  value={documentName}
                                  onChange={(e) => setDocumentName(e.target.value)}
                                  placeholder="Enter a name for this document"
                                  className="col-span-3 border px-2 py-1 rounded"
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <label className="col-span-1">Description</label>
                                <textarea
                                  value={documentDescription}
                                  onChange={(e) => setDocumentDescription(e.target.value)}
                                  placeholder="Enter a brief description of this document"
                                  rows={3}
                                  className="col-span-3 border px-2 py-1 rounded"
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <label className="col-span-1">File Upload</label>
                                <div className="col-span-3">
                                  <input
                                    type="file"
                                    onChange={handleFileChange}
                                    className="w-full border px-3 py-2 rounded"
                                    accept=".pdf,.doc,.docx,.txt,.csv,.md"
                                  />
                                  <p className="text-xs text-gray-500 mt-1">
                                    Supported formats: PDF, DOC, DOCX, TXT, CSV, MD
                                  </p>
                                </div>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button 
                                type="submit" 
                                onClick={handleUploadKnowledge}
                                disabled={!documentFile || !documentName}
                                className="bg-green-500 hover:bg-green-600 text-white disabled:bg-gray-300"
                              >
                                Upload Document
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <footer className="text-center py-4 text-gray-600">
        &copy; {new Date().getFullYear()} Agent Orchestrator
      </footer>
    </div>
  );
}