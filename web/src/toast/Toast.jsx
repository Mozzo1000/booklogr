import { Alert } from "flowbite-react";
import { useToastDispatchContext } from "./Context";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { MdErrorOutline } from "react-icons/md";

export default function Toast({ type, message, id }) {
    const dispatch = useToastDispatchContext();
    return (
        <>
            {type == "success" && (
                <Alert icon={IoMdInformationCircleOutline} color="success" onDismiss={() => {
                    dispatch({ type: "DELETE_TOAST", id });
                }}>
                    {message}
                </Alert>
            )}
            {type == "error" && (
                <Alert icon={MdErrorOutline} color="failure" onDismiss={() => {
                    dispatch({ type: "DELETE_TOAST", id });
                }}>
                    {message}
                </Alert>
            )}
        </>
    );
}