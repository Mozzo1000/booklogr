import React from 'react'
import { TextInput, Select, Label, ToggleSwitch } from 'flowbite-react';

function FieldInputs({ fields, values, onChange }) {
    if (!fields || fields.length === 0) return null;

    return (
        <div className="flex flex-col gap-4">
            {fields.map(field => (
                <div key={field.id}>
                    <div className="mb-2 block">
                        <Label>{field.name}</Label>
                    </div>
                    {field.field_type === 'text' && (
                        <TextInput
                            value={values[field.id] || ''}
                            onChange={e => onChange(field.id, e.target.value)}
                        />
                    )}
                    {field.field_type === 'number' && (
                        <TextInput
                            type="number"
                            value={values[field.id] || ''}
                            onChange={e => onChange(field.id, e.target.value)}
                        />
                    )}
                    {field.field_type === 'date' && (
                        <TextInput
                            type="date"
                            value={values[field.id] || ''}
                            onChange={e => onChange(field.id, e.target.value)}
                        />
                    )}
                    {field.field_type === 'selection' && (
                        <Select
                            value={values[field.id] || ''}
                            onChange={e => onChange(field.id, e.target.value)}
                        >
                            <option value="">-- Select --</option>
                            {(field.options || []).map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </Select>
                    )}
                    {field.field_type === 'boolean' && (
                        <div className="flex items-center gap-3 pt-1">
                            <ToggleSwitch
                                checked={values[field.id] === 'true'}
                                onChange={() => onChange(field.id, values[field.id] === 'true' ? 'false' : 'true')}
                            />
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                {values[field.id] === 'true' ? 'Yes' : 'No'}
                            </span>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

export default FieldInputs;
