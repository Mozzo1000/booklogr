import React, { useEffect, useRef, useState } from 'react'
import { Button, Modal, ModalBody, ModalHeader, Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from 'flowbite-react';
import {
    RiDraggable, RiPencilLine, RiDeleteBinLine, RiErrorWarningLine,
    RiText, RiHashtag, RiListCheck2, RiToggleLine, RiCalendarLine,
} from 'react-icons/ri';
import FieldsService from '../services/fields.service';
import AddFieldModal from './AddFieldModal';
import EditFieldModal from './EditFieldModal';
import useToast from '../toast/useToast';

const TYPE_CONFIG = {
    text: {
        label: 'Text',
        Icon: RiText,
        badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    },
    number: {
        label: 'Number',
        Icon: RiHashtag,
        badge: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    },
    selection: {
        label: 'Selection',
        Icon: RiListCheck2,
        badge: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
    },
    boolean: {
        label: 'Boolean',
        Icon: RiToggleLine,
        badge: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
    },
    date: {
        label: 'Date',
        Icon: RiCalendarLine,
        badge: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    },
};

function FieldsTab() {
    const [fields, setFields] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingField, setEditingField] = useState(null);
    const [fieldToDelete, setFieldToDelete] = useState(null);
    const [dragOverId, setDragOverId] = useState(null);
    const dragSrcId = useRef(null);
    const toast = useToast(4000);

    const loadFields = () => {
        FieldsService.get().then(
            response => setFields(response.data),
            error => {
                const resMessage =
                    (error.response && error.response.data && error.response.data.message) ||
                    error.message ||
                    error.toString();
                toast("error", resMessage);
            }
        );
    };

    useEffect(() => {
        loadFields();
    }, []);

    const handleAddSuccess = () => {
        setShowAddModal(false);
        loadFields();
    };

    const handleEditSuccess = () => {
        setEditingField(null);
        loadFields();
    };

    const handleDeleteConfirm = () => {
        if (!fieldToDelete) return;
        FieldsService.remove(fieldToDelete.id).then(
            () => { setFieldToDelete(null); loadFields(); },
            error => {
                const resMessage =
                    (error.response && error.response.data && error.response.data.message) ||
                    error.message ||
                    error.toString();
                toast("error", resMessage);
                setFieldToDelete(null);
            }
        );
    };

    const handleDragStart = (e, fieldId) => {
        dragSrcId.current = fieldId;
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragEnd = () => {
        dragSrcId.current = null;
        setDragOverId(null);
    };

    const handleDragOver = (e, fieldId) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (fieldId !== dragSrcId.current) setDragOverId(fieldId);
    };

    const handleDrop = (e, targetId) => {
        e.preventDefault();
        setDragOverId(null);
        if (!dragSrcId.current || dragSrcId.current === targetId) return;

        const srcIndex = fields.findIndex(f => f.id === dragSrcId.current);
        const tgtIndex = fields.findIndex(f => f.id === targetId);
        if (srcIndex === -1 || tgtIndex === -1) return;

        const updated = [...fields];
        const [moved] = updated.splice(srcIndex, 1);
        updated.splice(tgtIndex, 0, moved);

        const withOrder = updated.map((f, i) => ({ ...f, show_order: i + 1 }));
        setFields(withOrder);

        Promise.all(
            withOrder.map((f, i) => FieldsService.edit(f.id, { show_order: i + 1 }))
        ).catch(error => {
            const resMessage =
                (error.response && error.response.data && error.response.data.message) ||
                error.message ||
                error.toString();
            toast("error", resMessage);
            loadFields();
        });
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-row gap-4 items-center justify-between">
                <h2 className="format lg:format-lg dark:format-invert">Fields ({fields.length})</h2>
                <Button size="sm" onClick={() => setShowAddModal(true)}>Add Field</Button>
            </div>

            <Table striped>
                <TableHead>
                    <TableRow>
                        <TableHeadCell className="w-10"></TableHeadCell>
                        <TableHeadCell>Name</TableHeadCell>
                        <TableHeadCell className="w-36">Type</TableHeadCell>
                        <TableHeadCell className="w-28">Actions</TableHeadCell>
                    </TableRow>
                </TableHead>
                <TableBody className="">
                    {fields.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center text-gray-400 dark:text-gray-500">
                                No fields defined yet — add one above.
                            </TableCell>
                        </TableRow>
                    ) : (
                        fields.map((field) => {
                            const conf = TYPE_CONFIG[field.field_type] ?? { label: field.field_type, Icon: RiText, badge: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' };
                            const { Icon } = conf;
                            const isDragOver = dragOverId === field.id;
                            return (
                                <TableRow
                                    key={field.id}
                                    draggable
                                    onDragStart={e => handleDragStart(e, field.id)}
                                    onDragEnd={handleDragEnd}
                                    onDragOver={e => handleDragOver(e, field.id)}
                                    onDrop={e => handleDrop(e, field.id)}
                                    className={isDragOver ? 'border-t-2 border-t-blue-500' : ''}
                                >
                                    <TableCell className="cursor-grab active:cursor-grabbing text-gray-600 dark:text-gray-500">
                                        <RiDraggable size={18} />
                                    </TableCell>
                                    <TableCell className="font-medium text-gray-600">{field.name}</TableCell>
                                    <TableCell>
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-sm font-medium ${conf.badge}`}>
                                            <Icon size={18} />
                                            {conf.label}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            <Button size="xs" color="light" title="Edit" onClick={() => setEditingField(field)}>
                                                <RiPencilLine size={16} />
                                            </Button>
                                            <Button size="xs" color="light" title="Delete" onClick={() => setFieldToDelete(field)}>
                                                <RiDeleteBinLine size={16} className="text-red-500" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    )}
                </TableBody>
            </Table>

            <AddFieldModal
                open={showAddModal}
                close={setShowAddModal}
                onSuccess={handleAddSuccess}
            />
            {editingField && (
                <EditFieldModal
                    open={!!editingField}
                    field={editingField}
                    close={() => setEditingField(null)}
                    onSuccess={handleEditSuccess}
                />
            )}

            <Modal show={!!fieldToDelete} size="md" onClose={() => setFieldToDelete(null)} popup>
                <ModalHeader />
                <ModalBody>
                    <div className="text-center">
                        <RiErrorWarningLine className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
                        <h3 className="mb-2 text-lg font-normal text-gray-500 dark:text-gray-400">
                            Delete &ldquo;{fieldToDelete?.name}&rdquo;?
                        </h3>
                        <p className="mb-5 text-sm text-gray-400 dark:text-gray-500">
                            This will permanently remove the field and all its values across every book.
                        </p>
                        <div className="flex justify-center gap-4">
                            <Button color="red" onClick={handleDeleteConfirm}>Yes, delete</Button>
                            <Button color="alternative" onClick={() => setFieldToDelete(null)}>Cancel</Button>
                        </div>
                    </div>
                </ModalBody>
            </Modal>
        </div>
    );
}

export default FieldsTab;
