import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiX, 
  FiUpload, 
  FiCalendar, 
  FiUser, 
  FiTag,
  FiAlignLeft,
  FiSave,
  FiTrash2
} from 'react-icons/fi';

const Projects = () => {
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    tags: [],
    projectManager: '',
    deadline: '',
    priority: 'medium',
    images: [],
    description: ''
  });
  const [tagInput, setTagInput] = useState('');

  // Mock team members for project manager selection
  const teamMembers = [
    { id: 1, name: 'drashti pateliya', role: 'Project Manager' },
    { id: 2, name: 'rizz_lord', role: 'Project Manager' },
    { id: 3, name: 'John Doe', role: 'Project Manager' },
    { id: 4, name: 'Jane Smith', role: 'Project Manager' },
    { id: 5, name: 'Mike Johnson', role: 'Project Manager' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Project data:', formData);
    // In production, send to API
    setShowCreateModal(false);
    // Reset form
    setFormData({
      name: '',
      tags: [],
      projectManager: '',
      deadline: '',
      priority: 'medium',
      images: [],
      description: ''
    });
  };

  const handleDiscard = () => {
    setShowCreateModal(false);
    setFormData({
      name: '',
      tags: [],
      projectManager: '',
      deadline: '',
      priority: 'medium',
      images: [],
      description: ''
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'rgb(var(--text-primary))' }}>
            Projects
          </h1>
          <p className="mt-2" style={{ color: 'rgb(var(--text-secondary))' }}>
            Create and manage all your projects
          </p>
        </div>
        <button 
          className="btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          Create New Project
        </button>
      </div>

      <div className="card">
        <p style={{ color: 'rgb(var(--text-secondary))' }}>
          Project list will appear here. Click "Create New Project" to get started.
        </p>
      </div>

      {/* Create/Edit Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" 
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden animate-scale-in" 
            style={{ backgroundColor: 'rgb(var(--bg-secondary))' }}>
            
            {/* Header */}
            <div className="px-6 py-4 border-b flex items-center justify-between" 
              style={{ borderColor: 'rgb(var(--border))' }}>
              <div>
                <h2 className="text-xl font-bold" style={{ color: 'rgb(var(--text-primary))' }}>
                  Create New Project
                </h2>
                <p className="text-sm mt-1" style={{ color: 'rgb(var(--text-secondary))' }}>
                  Projects &gt; New Project
                </p>
              </div>
              <button
                onClick={handleDiscard}
                className="p-2 rounded-lg hover:opacity-70 transition-opacity"
                style={{ color: 'rgb(var(--text-tertiary))' }}
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit} className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              <div className="space-y-6">

                {/* Project Name */}
                <div>
                  <label className="block text-sm font-medium mb-2" 
                    style={{ color: 'rgb(var(--text-primary))' }}>
                    Project Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Enter project name"
                    required
                  />
                </div>

                {/* Tags with Multi-Selection Dropdown */}
                <div>
                  <label className="block text-sm font-medium mb-2" 
                    style={{ color: 'rgb(var(--text-primary))' }}>
                    Tags
                  </label>
                  <div className="space-y-2">
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
                            backgroundColor: 'rgb(var(--primary))',
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
                        placeholder={formData.tags.length === 0 ? "Type and press Enter to add tags" : "Add more..."}
                        className="flex-1 min-w-[150px] bg-transparent border-none outline-none"
                        style={{ color: 'rgb(var(--text-primary))' }}
                      />
                    </div>
                    <p className="text-xs" style={{ color: 'rgb(var(--text-tertiary))' }}>
                      Press Enter to add tags. <span className="font-medium">Multi-selection dropdown</span> for existing tags.
                    </p>
                  </div>
                </div>

                {/* Project Manager - Single Selection Dropdown */}
                <div>
                  <label className="block text-sm font-medium mb-2" 
                    style={{ color: 'rgb(var(--text-primary))' }}>
                    Project Manager *
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2" 
                      style={{ color: 'rgb(var(--text-tertiary))' }} />
                    <select
                      name="projectManager"
                      value={formData.projectManager}
                      onChange={handleChange}
                      className="input-field pl-10"
                      required
                    >
                      <option value="">Select project manager</option>
                      {teamMembers.map(member => (
                        <option key={member.id} value={member.name}>
                          {member.name} ({member.role})
                        </option>
                      ))}
                    </select>
                  </div>
                  <p className="text-xs mt-1" style={{ color: 'rgb(var(--text-tertiary))' }}>
                    <span className="font-medium">Single Selection Dropdown</span> - Choose one project manager
                  </p>
                </div>

                {/* Deadline - Date Selection Field */}
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
                  <p className="text-xs mt-1" style={{ color: 'rgb(var(--text-tertiary))' }}>
                    <span className="font-medium">Date Selection Field</span> - Pick project deadline
                  </p>
                </div>

                {/* Priority - Single Radio Selection */}
                <div>
                  <label className="block text-sm font-medium mb-3" 
                    style={{ color: 'rgb(var(--text-primary))' }}>
                    Priority *
                  </label>
                  <div className="flex items-center space-x-6">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="priority"
                        value="low"
                        checked={formData.priority === 'low'}
                        onChange={handleChange}
                        className="w-4 h-4"
                        style={{ accentColor: 'rgb(var(--primary))' }}
                      />
                      <span className="text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>
                        Low
                      </span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="priority"
                        value="medium"
                        checked={formData.priority === 'medium'}
                        onChange={handleChange}
                        className="w-4 h-4"
                        style={{ accentColor: 'rgb(var(--primary))' }}
                      />
                      <span className="text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>
                        Medium
                      </span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="priority"
                        value="high"
                        checked={formData.priority === 'high'}
                        onChange={handleChange}
                        className="w-4 h-4"
                        style={{ accentColor: 'rgb(var(--primary))' }}
                      />
                      <span className="text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>
                        High
                      </span>
                    </label>
                  </div>
                  <p className="text-xs mt-2" style={{ color: 'rgb(var(--text-tertiary))' }}>
                    <span className="font-medium">Single Radio Selection</span> - Choose priority level
                  </p>
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium mb-2" 
                    style={{ color: 'rgb(var(--text-primary))' }}>
                    Images
                  </label>
                  
                  {/* Upload Button */}
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

                  {/* Image Previews */}
                  {formData.images.length > 0 && (
                    <div className="mt-3 grid grid-cols-4 gap-3">
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
                  
                  <p className="text-xs mt-2" style={{ color: 'rgb(var(--text-tertiary))' }}>
                    Upload project images or mockups (multiple files supported)
                  </p>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium mb-2" 
                    style={{ color: 'rgb(var(--text-primary))' }}>
                    Description
                  </label>
                  <div className="relative">
                    <FiAlignLeft className="absolute left-3 top-3" 
                      style={{ color: 'rgb(var(--text-tertiary))' }} />
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={6}
                      className="input-field pl-10 resize-none"
                      placeholder="Enter project description, goals, and requirements..."
                    />
                  </div>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 mt-8 pt-6 border-t"
                style={{ borderColor: 'rgb(var(--border))' }}>
                <button
                  type="button"
                  onClick={handleDiscard}
                  className="px-6 py-2.5 rounded-lg font-medium transition-all hover:opacity-80"
                  style={{ 
                    backgroundColor: 'rgb(var(--bg-tertiary))',
                    color: 'rgb(var(--text-secondary))'
                  }}
                >
                  Discard
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-lg font-medium transition-all hover:opacity-90 flex items-center"
                  style={{ 
                    backgroundColor: '#10b981',
                    color: 'white'
                  }}
                >
                  <FiSave className="mr-2" />
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
