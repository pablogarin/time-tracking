export const fetchFromAPI = async (path: string, method?: string, body?: any) => {
    const baseUrl = "http://localhost:8005/";
    const options: { headers: any, method?: string, body?: any } = {
        headers: { "Content-Type": "application/json" }
    };
    if (!!method) {
        options.method = method;
    }
    if (!!body) {
        options.body = JSON.stringify(body);
    }
    const response = await fetch(`${baseUrl}${path}`, options);
    const data = await response.json();
    return data;
}
