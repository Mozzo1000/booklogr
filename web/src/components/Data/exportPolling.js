// One export request gets at most two retries after consecutive transient failures.
export function createExportPoller({ getTask, getFiles, onFiles, onSuccess, onFailure }) {
    let stopped = false;
    let inFlight = false;
    let failures = 0;

    return {
        stop() {
            stopped = true;
        },
        async poll() {
            if (stopped || inFlight) return;
            inFlight = true;
            try {
                const { data: task } = await getTask();
                if (stopped) return;
                if (task.status === 'failed') {
                    stopped = true;
                    onFailure(task.error_message || 'Export task failed.');
                    return;
                }
                if (task.status !== 'success') {
                    failures = 0;
                    return;
                }
                const { data: files } = await getFiles();
                if (stopped) return;
                stopped = true;
                onFiles(files);
                onSuccess();
            } catch (error) {
                if (stopped) return;
                const status = error.response?.status;
                const transient = !status || (status >= 500 && status <= 599);
                failures += 1;
                if (transient && failures < 3) return;
                stopped = true;
                const reason = error.response?.data?.message ||
                    (status ? `HTTP ${status}` : 'Network connection failed.');
                onFailure(`Unable to check export status. ${reason} Please try requesting the export again.`);
            } finally {
                inFlight = false;
            }
        },
    };
}
