import { useState, useEffect } from 'react'

type Project = {
    id: number;
    name: string;
    status: 'Created' | 'Active' | 'Working' | 'Finished';
}

type TimeEntry = {
    id: number;
    start_time: number;
    end_time: number;
    is_current: boolean;
}

const STATUS = ['Created', 'Active', 'Working', 'Finished'];

const fetchFromAPI = async (path: string, method?: string, body?: any) => {
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

function App() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [project, setProject] = useState<Project | null>(null);
    const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
    const [timeElapsed, setTimeElapsed] = useState<string>('');
    const [showAddProjectForm, setShowAddProjectForm] = useState<boolean>(false);
    const [isWorking, setIsWorking] = useState<boolean>(false);

    useEffect(() => {
        const getProjectsFromAPI = async () => {
            const data = await fetchFromAPI('projects');
            setProjects(data);
        }
        getProjectsFromAPI();
    }, []);

    useEffect(() => {
        if (timeEntries.length == 0 || timeEntries.at(-1).is_current == false) {
            return;
        }
        setIsWorking(true);
        const timer = setInterval(() => {
            const currentTaskTime = getTimeElapsed(timeEntries.at(-1).start_time);
            setTimeElapsed(currentTaskTime);
        }, 1000);
        return () => {
            clearInterval(timer);
        }
    }, [timeEntries])

    const loadProject = async (project: Project) => {
        setProject(project);
        const entries = await fetchFromAPI(`projects/${project.id}/entries`);
        setTimeEntries(entries);
    }

    const clearProject = () => {
        setProject(null);
    }

    const getTimeElapsed = (time_start: number, end_time?: number) => {
        const s = new Date(time_start);
        let e = new Date();
        if (end_time) {
            e = new Date(end_time);
        }
        let remainder = e - s;
        return getElapsedTimeFromDiff(remainder);
    }

    const getElapsedTimeFromDiff = (diff) => {
        let remainder = diff;
        const days = Math.floor(remainder / (1000 * 60 * 60 * 24));
        remainder %= 1000 * 60 * 60 * 24;

        const hours = Math.floor(remainder / (1000 * 60 * 60));
        remainder %= 1000 * 60 * 60;

        const minutes = Math.floor(remainder / (1000 * 60));
        remainder %= 1000 * 60;

        const seconds = Math.floor(remainder / 1000);
        return `${days}d ${hours}h ${minutes}m ${seconds}s.`;
    }

    const addProject = () => {
        setShowAddProjectForm(true);
    }

    const toggleWorkingProject = async () => {
        if (isWorking) {
            const entryId = timeEntries.at(-1).id;
            const response = await fetchFromAPI(`projects/${project.id}/entries/${entryId}`, 'PUT');
            setTimeEntries((old) => ([...old.slice(0, -1), response]));
            setIsWorking(false);
        } else {
            const response = await fetchFromAPI(`projects/${project.id}/entries`, 'POST');
            setTimeEntries((old) => ([...old, response]));
            setIsWorking(true);
        }
    }

    const saveProject = async () => {
        const name = document.querySelector("input[name='name']").value;
        const status = document.querySelector("input[name='status']").value;
        if (!STATUS.includes(status)) {
            alert('Invalid status');
            return;
        }
        const response = await fetchFromAPI('projects', 'POST', { name, status });
        if (!!response) {
            setShowAddProjectForm(false);
            setProject(response);
        }
    }

    if (showAddProjectForm) {
        return (
            <div className="flex flex-col justify-center items-center w-1/2 mx-auto bg-[#3333] p-6">
                <h3 className="text-2xl font-bold py-4">Add project</h3>
                <div className="w-full flex justify-center items-center gap-2 py-2">
                    <label className="flex w-1/4" htmlFor="name">Name</label>
                    <input className="flex w-3/4 border-1 p-3" type="text" name="name" />
                </div>
                <div className="w-full flex justify-center items-center gap-2 py-2">
                    <label className="flex w-1/4" htmlFor="status">State</label>
                    <input className="flex w-3/4 border-1 p-3" type="text" name="status" />
                </div>
                <button className="flex px-4 py-2 rounded border-1 w-1/4 justify-center items-center bg-blue-500 hover:bg-blue-700 text-white cursor-pointer" onClick={() => saveProject()}>Save</button>
            </div>
        );
    }

    return (
        <div className="flex flex-col justify-center items-center w-3/4 mx-auto gap-2">
            <h1 className="flex text-4xl font-bold h-40 items-center">Time Management</h1>
            {project !== null ? (
                <div className="flex flex-col w-full justify-center items-center gap-4">
                    <div className="text-lg">{project.name}</div>
                    {timeEntries.length > 0 && timeEntries.at(-1).is_current && (<div className="text-2xl p-12 text-red-600">Current Time: {timeElapsed}</div>)}
                    <table className="table-auto w-full">
                        <tbody>
                            {timeEntries.map((te) => {
                                if (te.is_current) return;
                                const date = new Date(te.start_time).toLocaleDateString();
                                return (
                                    <tr className="px-4 py-2" key={`timeentry-${te.id}`}>
                                        <td className="border px-4 py-2">{date}</td>
                                        <td className="border px-4 py-2">{getTimeElapsed(te.start_time, te.end_time)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    <div className="text-xl">Total time registered: {timeEntries.length == 0 ? 'No time' : `${getElapsedTimeFromDiff(timeEntries.reduce((acc, te) => {
                        if (te.is_current) return acc;
                        const diff = (new Date(te.end_time)) - (new Date(te.start_time));
                        return acc + diff;
                    }, 0))}`}</div>
                    <div className="flex justify-center items-center w-full">
                        <button className="flex px-4 py-2 rounded border-1 w-1/4 justify-center items-center bg-blue-500 hover:bg-blue-700 text-white cursor-pointer" onClick={() => toggleWorkingProject()}>{!isWorking ? 'Start' : 'Stop'} Timer</button>
                        <button className="flex px-4 py-2 rounded border-1 w-1/4 justify-center items-center bg-blue-500 hover:bg-blue-700 text-white cursor-pointer" onClick={() => clearProject()}>Go back</button>
                    </div>
                </div>
            ) : (
                <>
                    <table className="table-auto w-full pb-4">
                        <thead>
                            <tr>
                                <th className="px-4 py-2">Project</th >
                                <th className="px-4 py-2">Status</th >
                            </tr >
                        </thead >
                        <tbody>
                            {!!projects && projects.map((prj) => (
                                <tr className="bg-gray-100 hover:bg-gray-200 cursor-pointer" key={prj.id} onClick={() => loadProject(prj)}>
                                    <td className="border px-4 py-2">{prj.name}</td>
                                    <td className="border px-4 py-2">{prj.status}</td>
                                </tr>))}
                        </tbody>
                    </table >
                    <button className="flex px-4 py-2 rounded border-1 w-1/4 justify-center items-center bg-blue-500 hover:bg-blue-700 text-white cursor-pointer" onClick={() => addProject()}>Add Project</button>
                </>
            )
            }
        </div >
    )
}

export default App
