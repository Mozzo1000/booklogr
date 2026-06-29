import React, { useState } from 'react'
import { Button, Label, TextInput, Select, HelperText } from 'flowbite-react';
import { RiCloseLine } from 'react-icons/ri';
import AdaptiveDialog from './AdaptiveDialog';
import FieldsService from '../services/fields.service';
import useToast from '../toast/useToast';

const FIELD_TYPES = [
    { value: 'text', label: 'Text' },
    { value: 'number', label: 'Number' },
    { value: 'date', label: 'Date' },
    { value: 'selection', label: 'Selection' },
    { value: 'boolean', label: 'Boolean' },
];

function AddFieldModal({ open, close, onSuccess }) {
    const [name, setName] = useState('');
    const [fieldType, setFieldType] = useState('text');
    const [options, setOptions] = useState([]);
    const [optionInput, setOptionInput] = useState('');
    const [errors, setErrors] = useState({ name: false, options: false });
    const toast = useToast(4000);

    const reset = () => {
        setName('');
        setFieldType('text');
        setOptions([]);
        setOptionInput('');
        setErrors({ name: false, options: false });
    };

    const handleClose = () => {
        reset();
        close(false);
    };

    const handleAddOption = () => {
        const trimmed = optionInput.trim();
        if (trimmed && !options.includes(trimmed)) {
            setOptions(prev => [...prev, trimmed]);
            setOptionInput('');
            if (errors.options) setErrors(prev => ({ ...prev, options: false }));
        }
    };

    const handleOptionKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddOption();
        }
    };

    const handleRemoveOption = (opt) => {
        setOptions(prev => prev.filter(o => o !== opt));
    };

    const handleSubmit = () => {
        const nameError = !name.trim();
        const optionsError = fieldType === 'selection' && options.length === 0;

        if (nameError || optionsError) {
            setErrors({ name: nameError, options: optionsError });
            return;
        }

        FieldsService.add({
            name: name.trim(),
            field_type: fieldType,
            options: fieldType === 'selection' ? options : null,
        }).then(
            () => {
                reset();
                onSuccess();
            },
            error => {
                const resMessage =
                    (error.response && error.response.data && error.response.data.message) ||
                    error.message ||
                    error.toString();
                toast("error", resMessage);
            }
        );
    };

    const modalFooter = (
        <div className="flex gap-2">
            <Button color="gray" onClick={handleClose}>Cancel</Button>
            <Button onClick={handleSubmit}>Add Field</Button>
        </div>
    );

    return (
        <AdaptiveDialog type="modal" show={open} onClose={handleClose} title="Add Field" footer={modalFooter}>
            <div className="flex flex-col gap-4">
                <div>
                    <div className="mb-2 block">
                        <Label htmlFor="cf-name">Name</Label>
                    </div>
                    <TextInput
                        id="cf-name"
                        placeholder="e.g. Location, Purchase Date"
                        value={name}
                        onChange={e => { setName(e.target.value); if (errors.name) setErrors(prev => ({ ...prev, name: false })); }}
                        color={errors.name ? "failure" : "gray"}
                    />
                    {errors.name && (
                        <HelperText color="failure">
                            <span className="font-medium">Field name is required</span>
                        </HelperText>
                    )}
                </div>
                <div>
                    <div className="mb-2 block">
                        <Label htmlFor="cf-type">Type</Label>
                    </div>
                    <Select id="cf-type" value={fieldType} onChange={e => { setFieldType(e.target.value); setOptions([]); setErrors(prev => ({ ...prev, options: false })); }}>
                        {FIELD_TYPES.map(t => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                    </Select>
                </div>
                {fieldType === 'selection' && (
                    <div>
                        <div className="mb-2 block">
                            <Label>Options</Label>
                        </div>
                        <div className="flex gap-2 mb-2">
                            <TextInput
                                className="flex-1"
                                placeholder="Add an option"
                                value={optionInput}
                                onChange={e => setOptionInput(e.target.value)}
                                onKeyDown={handleOptionKeyDown}
                            />
                            <Button size="sm" color="gray" onClick={handleAddOption}>Add</Button>
                        </div>
                        {errors.options && (
                            <HelperText color="failure">
                                <span className="font-medium">Add at least one option</span>
                            </HelperText>
                        )}
                        <div className="flex flex-col gap-1 mt-1">
                            {options.map(opt => (
                                <div key={opt} className="flex items-center justify-between px-3 py-2 rounded bg-gray-50 dark:bg-gray-700 text-sm">
                                    <span>{opt}</span>
                                    <button
                                        onClick={() => handleRemoveOption(opt)}
                                        className="text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                                    >
                                        <RiCloseLine size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AdaptiveDialog>
    );
}

export default AddFieldModal;
