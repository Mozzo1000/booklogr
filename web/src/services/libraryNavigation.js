export const LIBRARY_TABS = [
    { id: 0, key: "all", value: "All", status: "", tKey: "reading_status.all" },
    { id: 1, key: "currentlyReading", value: "Currently reading", status: "Currently reading", tKey: "reading_status.currently_reading" },
    { id: 2, key: "toBeRead", value: "To be read", status: "To be read", tKey: "reading_status.to_be_read" },
    { id: 3, key: "completed", value: "Read", status: "Read", tKey: "reading_status.read" },
    { id: 4, key: "didNotFinish", value: "Did not finish", status: "Did not finish", tKey: "reading_status.did_not_finish" },
];

export const DEFAULT_VISIBLE_TABS = {
    all: false,
    currentlyReading: true,
    toBeRead: true,
    completed: true,
    didNotFinish: true,
};

export function resolveDefaultView(defaultView, visibleTabs) {
    const visible = LIBRARY_TABS.filter(tab => visibleTabs[tab.key]);
    return visible.find(tab => tab.value === defaultView)?.value
        ?? visible[0]?.value
        ?? "Currently reading";
}

export function saveLibraryNavigation(defaultView, visibleTabs) {
    const nextTabs = { ...DEFAULT_VISIBLE_TABS, ...visibleTabs };
    if (!LIBRARY_TABS.some(tab => nextTabs[tab.key])) {
        nextTabs.currentlyReading = true;
    }
    const nextDefault = resolveDefaultView(defaultView, nextTabs);
    localStorage.setItem("library_visible_tabs", JSON.stringify(nextTabs));
    localStorage.setItem("library_default_view", nextDefault);
    return { defaultView: nextDefault, visibleTabs: nextTabs };
}

export function getLibraryNavigation() {
    let visibleTabs;
    try {
        visibleTabs = JSON.parse(localStorage.getItem("library_visible_tabs"));
    } catch {
        visibleTabs = null;
    }
    return saveLibraryNavigation(
        localStorage.getItem("library_default_view") || "Currently reading",
        visibleTabs,
    );
}

export function resolveLibraryTab(hash, defaultView, visibleTabs) {
    const match = hash.match(/^#tab-(\d+)$/);
    const hashTab = match && LIBRARY_TABS.find(tab => tab.id === Number(match[1]));
    if (hashTab && visibleTabs[hashTab.key]) return hashTab.id;
    const resolvedDefault = resolveDefaultView(defaultView, visibleTabs);
    return LIBRARY_TABS.find(tab => tab.value === resolvedDefault).id;
}
