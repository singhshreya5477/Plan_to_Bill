import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiX, 
  FiUpload, 
  FiCalendar, 
  FiUser, 
  FiFolder,
  FiAlignLeft,
  FiSave,
  FiTrash2,
  FiClock,
  FiInfo,
  FiPlus
} from 'react-icons/fi';

const TaskCreate = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    assignee: '',
    project: '',
    tags: [],
    deadline: '',
    images: [],
    description: '',
    timesheets: [],
    taskInfo: {
      status: 'new',
      priority: 'medium',
      estimatedHours: '',
      actualHours: '',
      lastChange: new Date().toISOString(),
      totalWorkingHours: 0
    }
  });
  const [tagInput, setTagInput] = useState('');
  const [activeTab, setActiveTab] = useState('description');

  // Mock data
  const teamMembers = [
    { id: 1, name: 'drashti pateliya', role: 'Developer' },
    { id: 2, name: 'rizz_lord', role: 'Designer' },
    { id: 3, name: 'John Doe', role: 'Developer' },
    { id: 4, name: 'Swift Mallard', role: 'Project Manager' },
    { id: 5, name: 'Gaurav B Damor', role: 'Developer' }
  ];

  const projects = [
    { id: 1, name: 'Super Rabbit', color: '#9333ea' },
    { id: 2, name: 'Neon', color: '#ec4899' },
    { id: 3, name: 'Uncommon Hippopotamus', color: '#3b82f6' },
    { id: 4, name: 'Swift Mallard', color: '#06b6d4' },
    { id: 5, name: 'Beautiful Wolf', color: '#10b981' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTaskInfoChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      taskInfo: {
        ...prev.taskInfo,
        [name]: value,
        lastChange: new Date().toISOString()
      }
    }));
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags.includes(tagInput.trim())) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, tagInput.trim()]
        }));
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  const handleRemoveImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleAddTimesheet = () => {
    const newTimesheet = {
      id: Date.now(),
      employee: '',
      timeLogged: 0
    };
    setFormData(prev => ({
      ...prev,
      timesheets: [...prev.timesheets, newTimesheet]
    }));
  };

  const handleTimesheetChange = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      timesheets: prev.timesheets.map(ts => 
        ts.id === id ? { ...ts, [field]: value } : ts
      )
    }));
  };

  const handleRemoveTimesheet = (id) => {
    setFormData(prev => ({
      ...prev,
      timesheets: prev.timesheets.filter(ts => ts.id !== id)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Task data:', formData);
    // In production, send to API
    navigate('/tasks');
  };

  const handleDiscard = () => {
    navigate('/tasks');
  };

  return (
    <div className="min-h-screen py-6 px-4" style={{ backgroundColor: 'rgb(var(--bg-primary))' }}>
      <div className="max-w-6xl mx-auto">
        <div className="rounded-2xl shadow-xl overflow-hidden" 
          style={{ backgroundColor: 'rgb(var(--bg-secondary))' }}>
          
          {/* Header */}
          <div className="px-6 py-4 border-b flex items-center justify-between" 
            style={{ borderColor: 'rgb(var(--border))' }}>
            <div>
              <h2 className="text-2xl font-bold" style={{ color: 'rgb(var(--text-primary))' }}>
                Task create/edit view
              </h2>
              <p className="text-sm mt-1" style={{ color: 'rgb(var(--text-secondary))' }}>
                Projects &gt; New Task
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleDiscard}
                className="px-5 py-2 rounded-lg font-medium transition-all hover:opacity-80"
                style={{ 
                  backgroundColor: 'rgb(var(--bg-tertiary))',
                  color: 'rgb(var(--text-secondary))'
                }}
              >
                Discard
              </button>
              <button
                onClick={handleSubmit}
                className="px-5 py-2 rounded-lg font-medium transition-all hover:opacity-90 flex items-center"
                style={{ 
                  backgroundColor: '#10b981',
                  color: 'white'
                }}
              >
                <FiSave className="mr-2" />
                Save
              </button>
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              
              {/* Left Column */}
              <div className="space-y-5">
                
                {/* Task Title */}
                <div>
                  <label className="block text-sm font-medium mb-2" 
                    style={{ color: 'rgb(var(--text-primary))' }}>
                    Task Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Enter task title"
                    required
                  />
                </div>

                {/* Assignee - Single Selection Dropdown */}
                <div>
                  <label className="block text-sm font-medium mb-2" 
                    style={{ color: 'rgb(var(--text-primary))' }}>
                    Assignee *
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2" 
                      style={{ color: 'rgb(var(--text-tertiary))' }} />
                    <select
                      name="assignee"
                      value={formData.assignee}
                      onChange={handleChange}
                      className="input-field pl-10"
                      required
                    >
                      <option value="">Select assignee</option>
                      {teamMembers.map(member => (
                        <option key={member.id} value={member.name}>
                          {member.name} ({member.role})
                        </option>
                      ))}
                    </select>
                  </div>
                  <p className="text-xs mt-1" style={{ color: 'rgb(var(--text-tertiary))' }}>
                    <span className="font-medium">Single Selection Dropdown</span>
                  </p>
                </div>

                {/* Project - Dropdown */}
                <div>
                  <label className="block text-sm font-medium mb-2" 
                    style={{ color: 'rgb(var(--text-primary))' }}>
                    Project *
                  </label>
                  <div className="relative">
                    <FiFolder className="absolute left-3 top-1/2 transform -translate-y-1/2" 
                      style={{ color: 'rgb(var(--text-tertiary))' }} />
                    <select
                      name="project"
                      value={formData.project}
                      onChange={handleChange}
                      className="input-field pl-10"
                      required
                    >
                      <option value="">Select project</option>
                      {projects.map(project => (
                        <option key={project.id} value={project.name}>
                          {project.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <p className="text-xs mt-1" style={{ color: 'rgb(var(--text-tertiary))' }}>
                    <span className="font-medium">A field that lets us store selection of the project</span>
                  </p>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium mb-2" 
                    style={{ color: 'rgb(var(--text-primary))' }}>
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2 p-3 rounded-lg border min-h-[48px]" 
                    style={{ 
                      borderColor: 'rgb(var(--border))',
                      backgroundColor: 'rgb(var(--bg-tertiary))'
                    }}>
                    {formData.tags.map((tag, index) => (
                      <span 
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                        style={{ 
                          backgroundColor: '#ef4444',
                          color: 'white'
                        }}
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-2 hover:opacity-70"
                        >
                          <FiX className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleAddTag}
                      placeholder={formData.tags.length === 0 ? "Type and press Enter" : "Add more..."}
                      className="flex-1 min-w-[150px] bg-transparent border-none outline-none"
                      style={{ color: 'rgb(var(--text-primary))' }}
                    />
                  </div>
                </div>

                {/* Deadline */}
                <div>
                  <label className="block text-sm font-medium mb-2" 
                    style={{ color: 'rgb(var(--text-primary))' }}>
                    Deadline *
                  </label>
                  <div className="relative">
                    <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2" 
                      style={{ color: 'rgb(var(--text-tertiary))' }} />
                    <input
                      type="date"
                      name="deadline"
                      value={formData.deadline}
                      onChange={handleChange}
                      className="input-field pl-10"
                      required
                    />
                  </div>
                </div>

              </div>

              {/* Right Column */}
              <div className="space-y-5">
                
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium mb-2" 
                    style={{ color: 'rgb(var(--text-primary))' }}>
                    Images
                  </label>
                  
                  <label className="inline-flex items-center px-4 py-2 rounded-lg cursor-pointer transition-all hover:opacity-80"
                    style={{ 
                      backgroundColor: 'rgb(var(--primary))',
                      color: 'white'
                    }}>
                    <FiUpload className="mr-2" />
                    Upload Image
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>

                  {formData.images.length > 0 && (
                    <div className="mt-3 grid grid-cols-3 gap-3">
                      {formData.images.map((image, index) => (
                        <div 
                          key={index}
                          className="relative group rounded-lg overflow-hidden"
                          style={{ 
                            backgroundColor: 'rgb(var(--bg-tertiary))',
                            aspectRatio: '1/1'
                          }}
                        >
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-2 right-2 p-1 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Info Box - Swift Mallard */}
                <div className="p-4 rounded-lg border-2"
                  style={{ 
                    borderColor: '#10b981',
                    backgroundColor: 'rgb(var(--bg-tertiary))'
                  }}>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: '#06b6d4' }}>
                      SM
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1" style={{ color: 'rgb(var(--text-primary))' }}>
                        Swift Mallard
                      </h4>
                      <p className="text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>
                        A field that lets us store selection of the project
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Tabs Section */}
            <div className="mt-8 border-t pt-6" style={{ borderColor: 'rgb(var(--border))' }}>
              
              {/* Tab Navigation */}
              <div className="flex items-center space-x-6 border-b" 
                style={{ borderColor: 'rgb(var(--border))' }}>
                <button
                  type="button"
                  onClick={() => setActiveTab('description')}
                  className={`pb-3 px-2 text-sm font-medium transition-colors relative ${
                    activeTab === 'description' ? 'border-b-2' : ''
                  }`}
                  style={activeTab === 'description' ? {
                    color: 'rgb(var(--primary))',
                    borderColor: 'rgb(var(--primary))'
                  } : {
                    color: 'rgb(var(--text-secondary))'
                  }}
                >
                  <FiAlignLeft className="inline mr-2" />
                  Description
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('timesheets')}
                  className={`pb-3 px-2 text-sm font-medium transition-colors relative ${
                    activeTab === 'timesheets' ? 'border-b-2' : ''
                  }`}
                  style={activeTab === 'timesheets' ? {
                    color: 'rgb(var(--primary))',
                    borderColor: 'rgb(var(--primary))'
                  } : {
                    color: 'rgb(var(--text-secondary))'
                  }}
                >
                  <FiClock className="inline mr-2" />
                  Timesheets
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('taskinfo')}
                  className={`pb-3 px-2 text-sm font-medium transition-colors relative ${
                    activeTab === 'taskinfo' ? 'border-b-2' : ''
                  }`}
                  style={activeTab === 'taskinfo' ? {
                    color: 'rgb(var(--primary))',
                    borderColor: 'rgb(var(--primary))'
                  } : {
                    color: 'rgb(var(--text-secondary))'
                  }}
                >
                  <FiInfo className="inline mr-2" />
                  Task Info
                </button>
              </div>

              {/* Tab Content */}
              <div className="mt-6">
                
                {/* Description Tab */}
                {activeTab === 'description' && (
                  <div>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={10}
                      className="input-field resize-none"
                      placeholder="Enter detailed task description..."
                      style={{ minHeight: '300px' }}
                    />
                  </div>
                )}

                {/* Timesheets Tab */}
                {activeTab === 'timesheets' && (
                  <div>
                    <div className="mb-4">
                      <p className="text-sm mb-3" style={{ color: 'rgb(var(--text-secondary))' }}>
                        A table like structure which holds timesheets which are billable on the task
                      </p>
                      <button
                        type="button"
                        onClick={handleAddTimesheet}
                        className="text-sm font-medium flex items-center hover:opacity-80"
                        style={{ color: '#ef4444' }}
                      >
                        <FiPlus className="mr-1" />
                        Add a line
                      </button>
                    </div>

                    {formData.timesheets.length > 0 ? (
                      <div className="border rounded-lg overflow-hidden" 
                        style={{ borderColor: 'rgb(var(--border))' }}>
                        <table className="w-full">
                          <thead>
                            <tr style={{ backgroundColor: 'rgb(var(--bg-tertiary))' }}>
                              <th className="px-4 py-3 text-left text-sm font-medium" 
                                style={{ color: 'rgb(var(--text-primary))' }}>
                                Employee
                              </th>
                              <th className="px-4 py-3 text-left text-sm font-medium" 
                                style={{ color: 'rgb(var(--text-primary))' }}>
                                Time Logged
                              </th>
                              <th className="px-4 py-3 text-left text-sm font-medium" 
                                style={{ color: 'rgb(var(--text-primary))' }}>
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {formData.timesheets.map((timesheet, index) => (
                              <tr key={timesheet.id} 
                                className="border-t"
                                style={{ borderColor: 'rgb(var(--border))' }}>
                                <td className="px-4 py-3">
                                  <select
                                    value={timesheet.employee}
                                    onChange={(e) => handleTimesheetChange(timesheet.id, 'employee', e.target.value)}
                                    className="input-field text-sm"
                                  >
                                    <option value="">Select employee</option>
                                    {teamMembers.map(member => (
                                      <option key={member.id} value={member.name}>
                                        {member.name}
                                      </option>
                                    ))}
                                  </select>
                                </td>
                                <td className="px-4 py-3">
                                  <input
                                    type="number"
                                    value={timesheet.timeLogged}
                                    onChange={(e) => handleTimesheetChange(timesheet.id, 'timeLogged', parseFloat(e.target.value) || 0)}
                                    className="input-field text-sm"
                                    placeholder="0"
                                    min="0"
                                    step="0.5"
                                  />
                                </td>
                                <td className="px-4 py-3">
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveTimesheet(timesheet.id)}
                                    className="p-2 rounded hover:bg-red-50 text-red-500"
                                  >
                                    <FiTrash2 className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-12 border-2 border-dashed rounded-lg"
                        style={{ borderColor: 'rgb(var(--border))' }}>
                        <FiClock className="mx-auto w-12 h-12 mb-3" 
                          style={{ color: 'rgb(var(--text-tertiary))' }} />
                        <p style={{ color: 'rgb(var(--text-secondary))' }}>
                          No timesheets added yet
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Task Info Tab */}
                {activeTab === 'taskinfo' && (
                  <div className="space-y-6">
                    <p className="text-sm mb-4" style={{ color: 'rgb(var(--text-secondary))' }}>
                      Contains important task info like last changes made by, last change made on, total working hours
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Status */}
                      <div>
                        <label className="block text-sm font-medium mb-2" 
                          style={{ color: 'rgb(var(--text-primary))' }}>
                          Status
                        </label>
                        <select
                          name="status"
                          value={formData.taskInfo.status}
                          onChange={handleTaskInfoChange}
                          className="input-field"
                        >
                          <option value="new">New</option>
                          <option value="in_progress">In Progress</option>
                          <option value="done">Done</option>
                        </select>
                      </div>

                      {/* Priority */}
                      <div>
                        <label className="block text-sm font-medium mb-2" 
                          style={{ color: 'rgb(var(--text-primary))' }}>
                          Priority
                        </label>
                        <select
                          name="priority"
                          value={formData.taskInfo.priority}
                          onChange={handleTaskInfoChange}
                          className="input-field"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>

                      {/* Estimated Hours */}
                      <div>
                        <label className="block text-sm font-medium mb-2" 
                          style={{ color: 'rgb(var(--text-primary))' }}>
                          Estimated Hours
                        </label>
                        <input
                          type="number"
                          name="estimatedHours"
                          value={formData.taskInfo.estimatedHours}
                          onChange={handleTaskInfoChange}
                          className="input-field"
                          placeholder="0"
                          min="0"
                          step="0.5"
                        />
                      </div>

                      {/* Actual Hours */}
                      <div>
                        <label className="block text-sm font-medium mb-2" 
                          style={{ color: 'rgb(var(--text-primary))' }}>
                          Actual Hours
                        </label>
                        <input
                          type="number"
                          name="actualHours"
                          value={formData.taskInfo.actualHours}
                          onChange={handleTaskInfoChange}
                          className="input-field"
                          placeholder="0"
                          min="0"
                          step="0.5"
                        />
                      </div>

                      {/* Last Change */}
                      <div>
                        <label className="block text-sm font-medium mb-2" 
                          style={{ color: 'rgb(var(--text-primary))' }}>
                          Last Change Made On
                        </label>
                        <input
                          type="text"
                          value={new Date(formData.taskInfo.lastChange).toLocaleString()}
                          className="input-field"
                          disabled
                          style={{ backgroundColor: 'rgb(var(--bg-tertiary))' }}
                        />
                      </div>

                      {/* Total Working Hours */}
                      <div>
                        <label className="block text-sm font-medium mb-2" 
                          style={{ color: 'rgb(var(--text-primary))' }}>
                          Total Working Hours
                        </label>
                        <input
                          type="text"
                          value={formData.timesheets.reduce((sum, ts) => sum + ts.timeLogged, 0)}
                          className="input-field"
                          disabled
                          style={{ backgroundColor: 'rgb(var(--bg-tertiary))' }}
                        />
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default TaskCreate;
