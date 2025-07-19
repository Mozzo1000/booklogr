export const formatDate = (date = {}) => {
  const displayLocale = localStorage.getItem("region") || navigator.language || "en-GB";
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  
  return new Intl.DateTimeFormat(displayLocale, defaultOptions).format(date);
};

export const formatTime = (dateTime) => {
  const displayLocale = localStorage.getItem("region") || navigator.language || "en-GB";
  const defaultOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: localStorage.getItem("time_format_24h") === "true" ? false: true,
    timeZone: localStorage.getItem("timezone") || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
  };
  
  return new Intl.DateTimeFormat(displayLocale, defaultOptions).format(dateTime);
};

export const formatDateTime = (date) => {
  return `${formatDate(date)} ${formatTime(date)}`;
};