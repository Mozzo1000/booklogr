import { Card, Button, Label, Select} from 'flowbite-react'
import React, {useState } from 'react'
import TasksService from '../../services/tasks.service'
import useToast from '../../toast/useToast';
import { useTranslation, Trans } from 'react-i18next';

const customThemeSelect = {
    base: "flex",
    field: {
        base: "relative w-full",
        icon: {
        base: "pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3",
        svg: "h-5 w-5 text-gray-500 dark:text-gray-400",
        },
        select: {
        base: "block w-full appearance-none border bg-arrow-down-icon bg-[length:0.75em_0.75em] bg-[position:right_12px_center] bg-no-repeat pr-10 focus:outline-none focus:ring-1 disabled:cursor-not-allowed disabled:opacity-50",
        withIcon: {
            on: "pl-10",
            off: "",
        }
    },
  }
}

function RequestData(props) {
    const [dataFormat, setDataFormat] = useState("csv")
    const toast = useToast(4000);
    const { t } = useTranslation();

    const requestData = () => {
        let taskType;
        if (dataFormat == "csv") {
            taskType = "csv_export"
        }else if (dataFormat == "json") {
            taskType = "json_export"
        }else if (dataFormat == "html") {
            taskType = "html_export"
        }
        TasksService.create(taskType, {}).then(
            response => {
                toast("success", response.data.message);
                props.onRequest();
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
                <div className="format lg:format-lg dark:format-invert">
                    <h3>{t("settings.data.request_data.title")}</h3>
                    <p>{t("settings.data.request_data.description")}</p>
                </div>
                <div>
                    <div className="mb-2 block">
                        <Label htmlFor="data-format">{t("settings.data.request_data.format")}</Label>
                    </div>
                        <Select theme={customThemeSelect} className='bg-none' id="data-format" required value={dataFormat} onChange={(e) => setDataFormat(e.target.value)}>
                        <option value="csv">CSV</option>
                        <option value="json">JSON</option>
                        <option value="html">HTML</option>
                    </Select>
                </div>
                <Button onClick={() => requestData()}>{t("settings.data.request_data.title")}</Button>
            </div>
        </Card>
    )
}

export default RequestData