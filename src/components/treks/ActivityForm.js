import { useState, useEffect } from "react"
import { Save, Plus, Trash, Clock, Car } from 'lucide-react'
import { toast } from "react-hot-toast"
import activityApi from "../../services/activityApi"

export function ActivityForm({ trekId, onActivityAdded }) {
  const [activityType, setActivityType] = useState("ACTIVITY") // Default to general activity
  const [activities, setActivities] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})
  
  const [newActivity, setNewActivity] = useState({
    title: "",
    type: "ACTIVITY",
    description: "",
    isOptional: false,
    activityOrder: 1,
    // Transportation specific fields
    transportType: "",
    transportDuration: ""
  })

  // Fetch existing activities when component mounts
  useEffect(() => {
    if (trekId) {
      fetchActivities();
    }
  }, [trekId]);

  const fetchActivities = async () => {
    if (!trekId) return;
    
    setIsLoading(true);
    try {
      const response = await activityApi.getTrekActivities(trekId);
      if (response.success) {
        setActivities(response.data);
      } else {
        toast.error(response.message || "Failed to fetch activities");
      }
    } catch (error) {
      console.error("Error fetching activities:", error);
      toast.error("An error occurred while fetching activities");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    const inputValue = type === "checkbox" ? checked : value
    
    setNewActivity(prev => ({
      ...prev,
      [name]: inputValue
    }))
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ""
      })
    }
  }

  const handleTypeChange = (e) => {
    const type = e.target.value
    setActivityType(type)
    setNewActivity(prev => ({
      ...prev,
      type: type
    }))
  }

  const validateActivity = () => {
    const newErrors = {}
    
    if (!newActivity.title.trim()) newErrors.title = "Title is required"
    if (!newActivity.description.trim()) newErrors.description = "Description is required"
    
    if (newActivity.type === "TRANSPORTATION") {
      if (!newActivity.transportType.trim()) newErrors.transportType = "Transport type is required"
      if (!newActivity.transportDuration.trim()) newErrors.transportDuration = "Duration is required"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleAddActivity = async (e) => {
    e.preventDefault()
    
    if (!validateActivity()) {
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // Prepare the activity data based on type
      const activityData = {
        title: newActivity.title,
        type: newActivity.type,
        description: newActivity.description,
        isOptional: newActivity.isOptional,
        activityOrder: activities.length + 1
      }
      
      // Add transportation-specific fields if needed
      if (newActivity.type === "TRANSPORTATION") {
        activityData.transportType = newActivity.transportType
        activityData.transportDuration = newActivity.transportDuration
      }
      
      // Call the API to add the activity
      const response = await activityApi.addActivityToTrek(trekId, activityData);
      
      if (!response.success) {
        throw new Error(response.message || "Failed to add activity");
      }
      
      // Add the new activity to the list
      setActivities([...activities, response.data]);
      
      // Reset the form
      setNewActivity({
        title: "",
        type: activityType, // Keep the current activity type
        description: "",
        isOptional: false,
        activityOrder: activities.length + 2,
        transportType: "",
        transportDuration: ""
      });
      
      // Notify parent component
      if (onActivityAdded) {
        onActivityAdded(response.data);
      }
      
    } catch (error) {
      console.error("Error adding activity:", error);
      setErrors({ submit: error.message || "Failed to add activity" });
      toast.error(error.message || "Failed to add activity");
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleRemoveActivity = async (activityId, index) => {
    try {
      const response = await activityApi.removeActivityFromTrek(trekId, activityId);
      
      if (!response.success) {
        throw new Error(response.message || "Failed to remove activity");
      }
      
      const updatedActivities = [...activities];
      updatedActivities.splice(index, 1);
      
      // Update activity order for remaining activities
      const reorderedActivities = updatedActivities.map((activity, idx) => ({
        ...activity,
        activityOrder: idx + 1
      }));
      
      setActivities(reorderedActivities);
      toast.success("Activity removed successfully");
      
      // Update the order in the backend
      for (let i = 0; i < reorderedActivities.length; i++) {
        const activity = reorderedActivities[i];
        if (activity.activityOrder !== i + 1) {
          await activityApi.updateActivityOrder(trekId, activity.id, i + 1);
        }
      }
      
    } catch (error) {
      console.error("Error removing activity:", error);
      toast.error(error.message || "Failed to remove activity");
    }
  }

  return (
    <div className="space-y-6">
      {/* Activity Type Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Activity Type
        </label>
        <div className="flex space-x-4">
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="activityType"
              value="ACTIVITY"
              checked={activityType === "ACTIVITY"}
              onChange={handleTypeChange}
              className="form-radio h-4 w-4 text-[#ff5c5c] focus:ring-[#ff5c5c]"
            />
            <span className="ml-2 text-gray-700 dark:text-gray-300">General Activity</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="activityType"
              value="TRANSPORTATION"
              checked={activityType === "TRANSPORTATION"}
              onChange={handleTypeChange}
              className="form-radio h-4 w-4 text-[#ff5c5c] focus:ring-[#ff5c5c]"
            />
            <span className="ml-2 text-gray-700 dark:text-gray-300">Transportation</span>
          </label>
        </div>
      </div>

      {/* Activity Form */}
      <form onSubmit={handleAddActivity} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          {activityType === "TRANSPORTATION" ? "Add Transportation" : "Add Activity"}
        </h3>
        
        {/* Common Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Title */}
          <div className="col-span-2">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={newActivity.title}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 rounded-lg border ${
                errors.title ? "border-red-500 dark:border-red-500" : "border-gray-300 dark:border-gray-600"
              } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#ff5c5c] focus:border-transparent`}
              placeholder={activityType === "TRANSPORTATION" ? "e.g., Transfer to Trailhead" : "e.g., Hiking to Cascade"}
            />
            {errors.title && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title}</p>}
          </div>

          {/* Description */}
          <div className="col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={newActivity.description}
              onChange={handleInputChange}
              rows="3"
              className={`w-full px-4 py-2 rounded-lg border ${
                errors.description ? "border-red-500 dark:border-red-500" : "border-gray-300 dark:border-gray-600"
              } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#ff5c5c] focus:border-transparent`}
              placeholder="Describe the activity"
            />
            {errors.description && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description}</p>}
          </div>

          {/* Optional Checkbox */}
          <div className="col-span-2">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                name="isOptional"
                checked={newActivity.isOptional}
                onChange={handleInputChange}
                className="form-checkbox h-5 w-5 text-[#ff5c5c] rounded focus:ring-[#ff5c5c]"
              />
              <span className="ml-2 text-gray-700 dark:text-gray-300">This activity is optional</span>
            </label>
          </div>

          {/* Transportation-specific fields */}
          {activityType === "TRANSPORTATION" && (
            <>
              {/* Transport Type */}
              <div>
                <label htmlFor="transportType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Transport Type <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Car className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    id="transportType"
                    name="transportType"
                    value={newActivity.transportType}
                    onChange={handleInputChange}
                    className={`w-full pl-10 px-4 py-2 rounded-lg border ${
                      errors.transportType ? "border-red-500 dark:border-red-500" : "border-gray-300 dark:border-gray-600"
                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#ff5c5c] focus:border-transparent`}
                  >
                    <option value="">Select transport type</option>
                    <option value="VAN">Van</option>
                    <option value="BUS">Bus</option>
                    <option value="CAR">Car</option>
                    <option value="TRAIN">Train</option>
                    <option value="BOAT">Boat</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                {errors.transportType && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.transportType}</p>}
              </div>

              {/* Transport Duration */}
              <div>
                <label htmlFor="transportDuration" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Duration <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Clock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="transportDuration"
                    name="transportDuration"
                    value={newActivity.transportDuration}
                    onChange={handleInputChange}
                    className={`w-full pl-10 px-4 py-2 rounded-lg border ${
                      errors.transportDuration ? "border-red-500 dark:border-red-500" : "border-gray-300 dark:border-gray-600"
                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#ff5c5c] focus:border-transparent`}
                    placeholder="e.g., PT1H30M for 1h 30m"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Use ISO 8601 duration format (e.g., PT1H30M for 1 hour 30 minutes)
                </p>
                {errors.transportDuration && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.transportDuration}</p>}
              </div>
            </>
          )}
        </div>

        {/* Add Activity Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center px-4 py-2 bg-[#ff5c5c] text-white rounded-md hover:bg-[#ff4040] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Adding...
              </span>
            ) : (
              <>
                <Plus className="w-5 h-5 mr-2" />
                Add {activityType === "TRANSPORTATION" ? "Transportation" : "Activity"}
              </>
            )}
          </button>
        </div>
      </form>

      {/* Activities List */}
      {isLoading ? (
        <div className="flex justify-center items-center p-12">
          <svg className="animate-spin h-8 w-8 text-[#ff5c5c]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="ml-2 text-gray-600 dark:text-gray-300">Loading activities...</span>
        </div>
      ) : activities.length > 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Added Activities</h3>
          
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <div 
                key={activity.id || index} 
                className="flex items-start justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <div>
                  <div className="flex items-center">
                    <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-[#ff5c5c] text-white text-sm font-medium mr-2">
                      {activity.activityOrder}
                    </span>
                    <h4 className="text-md font-medium text-gray-900 dark:text-white">
                      {activity.title}
                    </h4>
                    <span className="ml-2 px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                      {activity.type === "TRANSPORTATION" ? "Transportation" : "Activity"}
                    </span>
                    {activity.isOptional && (
                      <span className="ml-2 px-2 py-1 text-xs rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300">
                        Optional
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{activity.description}</p>
                  {activity.type === "TRANSPORTATION" && (
                    <div className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <Car className="h-4 w-4 mr-1" />
                      <span>{activity.transportType}</span>
                      <span className="mx-2">•</span>
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{activity.transportDuration}</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleRemoveActivity(activity.id, index)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
