export const isSingleUserMode = import.meta.env.VITE_SINGLE_USER_MODE?.toString().toLowerCase() === 'true';

export default isSingleUserMode;
