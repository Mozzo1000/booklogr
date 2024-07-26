import { Card, Button, Label, Select} from 'flowbite-react'
import React, {useState } from 'react'
import TasksService from '../../services/tasks.service'
import useToast from '../../toast/useToast';

function RequestData() {
    const [dataFormat, setDataFormat] = useState("csv")
    const toast = useToast(4000);

    const requestData = () => {
        let taskType;
        if (dataFormat == "csv") {
            taskType = "csv_export"
        }
        TasksService.create(taskType, {}).then(
            response => {
                toast("success", response.data.message);
            },
            error => {
              const resMessage =
                (error.response &&
                    error.response.data &&
                    error.response.data.message) ||
                error.message ||
                error.toString();
              toast("error", resMessage);
            }
        )
    }

    return (
        <Card>
            <div className="flex flex-col gap-4 justify-center">
                <div className="format lg:format-lg">
                    <h3>Request data</h3>
                    <p>You can request a copy of all your data. Once the request has finished, the data will be displayed in the "Available exports" table for you to download.</p>
                </div>
                <div>
                    <div className="mb-2 block">
                        <Label htmlFor="data-format" value="Choose data format" />
                    </div>
                    <Select id="data-format" required value={dataFormat} onChange={(e) => setDataFormat(e.target.value)}>
                        <option value="csv">CSV</option>
                    </Select>
                </div>
                <Button onClick={() => requestData()}>Request data</Button>
            </div>
        </Card>
    )
}

export default RequestData