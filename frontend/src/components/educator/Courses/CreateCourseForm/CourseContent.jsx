import React from 'react';
import { Plus, Trash2, Target, TrendingUp, Zap, Clock, Award, ChevronDown } from 'lucide-react';

const DURATION_UNITS = [
  { value: 'minutes', label: 'Minutes' },
  { value: 'hours', label: 'Hours' },
  { value: 'weeks', label: 'Weeks' },
  { value: 'months', label: 'Months' }
];

const ListInputField = ({ field, label, Icon, data, onAdd, onRemove, onChange, errors, placeholder, color }) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <label className="block text-sm font-bold text-gray-700 flex items-center">
        <Icon className={`w-4 h-4 mr-2 text-${color}-500`} />
        {label}
      </label>
      <button
        type="button"
        onClick={() => onAdd(field)}
        className={`flex items-center text-${color}-600 hover:text-${color}-700 text-xs font-bold bg-${color}-50 px-3 py-1.5 rounded-lg transition-all hover:bg-${color}-100`}
      >
        <Plus className="w-3 h-3 mr-1" />
        Add Item
      </button>
    </div>
    
    <div className="space-y-3">
      {data.map((item, index) => (
        <div key={index} className="group flex items-start gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
          <div className="flex-1 relative">
            <input
              type="text"
              value={item}
              onChange={(e) => onChange(field, index, e.target.value)}
              className="block w-full pl-4 pr-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-sky-500 transition-all hover:border-gray-300"
              placeholder={placeholder}
              maxLength={500}
            />
          </div>
          {data.length > 1 && (
            <button
              type="button"
              onClick={() => onRemove(field, index)}
              className="mt-2.5 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ))}
    </div>
    {errors[field] && <p className="text-xs text-red-600 font-medium px-1">{errors[field]}</p>}
  </div>
);

const CourseContent = ({ courseData, handleInputChange, handleListItemChange, addListItem, removeListItem, errors }) => {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
      
      {/* Duration & Certificate */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 bg-gray-50/50 rounded-2xl border border-gray-100">
        <div className="space-y-3">
          <label htmlFor="totalDuration" className="block text-sm font-bold text-gray-700 flex items-center">
            <Clock className="w-4 h-4 mr-2 text-sky-500" />
            Estimated Duration
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="number"
                id="totalDuration"
                name="totalDuration"
                value={courseData.totalDuration}
                onChange={handleInputChange}
                min="0"
                className={`block w-full px-4 py-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-sky-500 transition-all ${
                  errors.totalDuration ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                }`}
                placeholder="e.g. 10"
              />
            </div>
            <div className="relative min-w-[120px]">
              <select
                id="durationUnit"
                name="durationUnit"
                value={courseData.durationUnit}
                onChange={handleInputChange}
                className="block w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm appearance-none focus:ring-2 focus:ring-sky-500 transition-all hover:border-gray-300"
              >
                {DURATION_UNITS.map((unit) => (
                  <option key={unit.value} value={unit.value}>{unit.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
          {errors.totalDuration && <p className="text-xs text-red-600 font-medium">{errors.totalDuration}</p>}
        </div>

        <div className="flex flex-col justify-end">
          <div className={`flex items-center p-4 rounded-xl border transition-all duration-300 ${
            courseData.hasCertificate ? 'bg-emerald-50 border-emerald-100 ring-1 ring-emerald-100 shadow-sm' : 'bg-white border-gray-200'
          }`}>
            <div className="flex-1 flex items-center">
              <input
                id="hasCertificate"
                name="hasCertificate"
                type="checkbox"
                checked={courseData.hasCertificate}
                onChange={handleInputChange}
                className="h-5 w-5 text-emerald-500 focus:ring-sky-500 border-gray-300 rounded-lg cursor-pointer"
              />
              <div className="ml-3">
                <label htmlFor="hasCertificate" className="block text-sm font-bold text-gray-800 cursor-pointer">
                  Completion Certificate
                </label>
                <p className="text-[11px] text-gray-500">Provide digital certificate to students</p>
              </div>
            </div>
            <Award className={`w-8 h-8 transition-colors ${courseData.hasCertificate ? 'text-emerald-500' : 'text-gray-300'}`} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Prerequisites */}
        <ListInputField
          field="prerequisites"
          label="Prerequisites"
          Icon={Target}
          data={courseData.prerequisites}
          onAdd={addListItem}
          onRemove={removeListItem}
          onChange={handleListItemChange}
          errors={errors}
          placeholder="Basic knowledge of HTML/CSS"
          color="amber"
        />

        {/* Learning Outcomes */}
        <ListInputField
          field="learningOutcomes"
          label="Learning Outcomes"
          Icon={TrendingUp}
          data={courseData.learningOutcomes}
          onAdd={addListItem}
          onRemove={removeListItem}
          onChange={handleListItemChange}
          errors={errors}
          placeholder="Build production-ready React apps"
          color="emerald"
        />

        {/* Requirements */}
        <div className="md:col-span-2">
          <ListInputField
            field="requirements"
            label="Additional Requirements / Target Audience"
            Icon={Zap}
            data={courseData.requirements}
            onAdd={addListItem}
            onRemove={removeListItem}
            onChange={handleListItemChange}
            errors={errors}
            placeholder="A computer with at least 8GB RAM"
            color="sky"
          />
        </div>
      </div>
    </div>
  );
};

export default CourseContent;
