import React, {useState} from 'react';
import { FileInput, Button, Label, HelperText, Checkbox, Card, Dropdown, DropdownItem, Select } from "flowbite-react";
import FilesService from '../../services/files.service';
import useToast from '../../toast/useToast';

function FileImport() {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [allowDuplicates, setAllowDuplicates] = useState(false);
    const [platform, setPlatform] = useState("csv");
    const toast = useToast(4000);

    const handleUpload = () => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", platform)

        if (allowDuplicates) {
            formData.append("allow_duplicates", "true")
        }

        setUploading(true);
        FilesService.upload(formData).then(
            response => {
                toast("success", response.data.message)
                setUploading(false);
            },
            error => {
              const resMessage =
                (error.response &&
                    error.response.data &&
                    error.response.data.message) ||
                error.message ||
                error.toString();
              toast("error", resMessage);
              setUploading(false);
            }
        )
    }

    return (
        <Card>
            <div className="flex flex-col gap-4 justify-center">
                <div className="format lg:format-lg dark:format-invert">
                    <h3>Import books</h3>
                    <p></p>
                </div>
                <div >
                    <div>
                        <Label className="mb-2 block" htmlFor="platform">Platform</Label>
                        <Select id="platform" required value={platform} onChange={(e) => setPlatform(e.target.value)}>
                            <option value="csv">BookLogr CSV</option>
                            <option value="goodreads">Goodreads</option>
                        </Select>
                    </div>
                    <br />
                    <div>
                        <Label className="mb-2 block" htmlFor="file-upload">File</Label>
                        <FileInput className="block w-full cursor-pointer rounded-lg border file:-ms-4 file:me-4 file:cursor-pointer file:border-none file:bg-gray-800 file:py-2.5 file:pe-4 file:ps-8 file:text-sm file:font-medium file:leading-[inherit] file:text-white hover:file:bg-gray-700 focus:outline-none focus:ring-1 dark:file:bg-gray-600 dark:hover:file:bg-gray-500" id="file-upload" onChange={(e) => setFile(e.target.files[0])}/>
                        <div className="flex items-center gap-2 pt-2">
                            <Checkbox id="duplicate_checkbox" checked={allowDuplicates} onChange={() => setAllowDuplicates(!allowDuplicates)} />
                            <Label  htmlFor="duplicate_checkbox">Add duplicate books</Label>
                        </div>
                    </div>
                </div>
                <Button onClick={handleUpload} disabled={uploading} className="mt-4">{uploading ? "Uploading..." : "Upload"}</Button>
            </div>
        </Card>
    )
}

export default FileImport