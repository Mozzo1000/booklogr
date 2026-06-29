import React, { useState, useEffect } from 'react'
import { Button, Label, TextInput, HelperText } from 'flowbite-react';
import { RiCloseLine } from 'react-icons/ri';
import AdaptiveDialog from './AdaptiveDialog';
import FieldsService from '../services/fields.service';
import useToast from '../toast/useToast';

function EditFieldModal({ open, field, close, onSuccess }) {
    const [name, setName] = useState('');
    const [options, setOptions] = useState([]);
    const [optionInput, setOptionInput] = useState('');
    const [nameError, setNameError] = useState(false);
    const toast = useToast(4000);

    useEffect(() => {
        if (field) {
            setName(field.name);
            setOptions(field.options || []);
            setNameError(false);
            setOptionInput('');
        }
    }, [field]);

    const handleClose = () => {
        close();
    };

    const handleAddOption = () => {
        const trimmed = optionInput.trim();
        if (trimmed && !options.includes(trimmed)) {
            setOptions(prev => [...prev, trimmed]);
            setOptionInput('');
        }
    };

    const handleOptionKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddOption();
        }
    };

    const handleSave = () => {
        if (!name.trim()) {
            setNameError(true);
            return;
        }

        const data = { name: name.trim() };
        if (field.field_type === 'selection') {
            data.options = options;
        }

        FieldsService.edit(field.id, data).then(
            () => onSuccess(),
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
            <Button onClick={handleSave}>Save</Button>
        </div>
    );

    return (
        <AdaptiveDialog type="modal" show={open} onClose={handleClose} title="Edit Field" footer={modalFooter}>
            <div className="flex flex-col gap-4">
                <div>
                    <div className="mb-2 block">
                        <Label htmlFor="ecf-name">Name</Label>
                    </div>
                    <TextInput
                        id="ecf-name"
                        value={name}
                        onChange={e => { setName(e.target.value); if (nameError) setNameError(false); }}
                        color={nameError ? "failure" : "gray"}
                    />
                    {nameError && (
                        <HelperText color="failure">
                            <span className="font-medium">Field name is required</span>
                        </HelperText>
                    )}
                </div>
                <div>
                    <div className="mb-2 block">
                        <Label>Type</Label>
                    </div>
                    <TextInput value={field?.field_type?.toUpperCase() || ''} disabled />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Field type cannot be changed after creation.</p>
                </div>
                {field?.field_type === 'selection' && (
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
                        <div className="flex flex-col gap-1">
                            {options.map(opt => (
                                <div key={opt} className="flex items-center justify-between px-3 py-2 rounded bg-gray-50 dark:bg-gray-700 text-sm">
                                    <span>{opt}</span>
                                    <button
                                        onClick={() => setOptions(prev => prev.filter(o => o !== opt))}
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

export default EditFieldModal;
