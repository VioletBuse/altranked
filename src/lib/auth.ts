export const saveSessionId = (id: string) => {
	localStorage.setItem('session_id', id);
};

export const clearSessionId = () => {
	localStorage.removeItem('session_id');
};
