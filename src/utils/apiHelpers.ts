
export const getApiBaseUrl = () => {
  return process.env.NODE_ENV === "production"
    ? "https://flipnote-quizzer-backend.azurewebsites.net"
    : "http://localhost:8000";
};

export const createExtractQuestionsUrl = () => {
  return `${getApiBaseUrl()}/extract-questions`;
};
