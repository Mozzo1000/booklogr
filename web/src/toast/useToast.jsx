import { useToastDispatchContext } from "./Context";

export function useToast(delay) {
    const dispatch = useToastDispatchContext();

    function toast(type, message) {
        const id = Math.random().toString(36).substr(2, 9);
        dispatch({
            type: "ADD_TOAST",
            toast: {
                type,
                message,
                id,
            },
        });

        setTimeout(() => {
            dispatch({ type: "DELETE_TOAST", id });
        }, delay);
    }

    return toast;
}

export default useToast;