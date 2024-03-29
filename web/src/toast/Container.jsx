import Toast from "./Toast";
import { useToastStateContext } from "./Context";

export default function ToastContainer() {
    const { toasts } = useToastStateContext();

    return (
        <div className="absolute bottom-10 ml-5 z-50">
            <div className="">
                {toasts &&
                    toasts.map((toast) => <Toast id={toast.id} key={toast.id} type={toast.type} message={toast.message} />)}
            </div>
        </div>
    );
}