import { useState, useEffect } from 'react';
import { type Project, type TimeEntry } from '../types/Project';
import { fetchFromAPI } from '../utils/fetchFromAPI';

type ProjectTrackingProps = {
    project: Project;
    closeCallback: () => void;
}

const ProjectTracking = ({ project, closeCallback }: ProjectTrackingProps) => {
    const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
    const [timeElapsed, setTimeElapsed] = useState<string>('');
    const [isWorking, setIsWorking] = useState<boolean>(false);

    useEffect(() => {
        const fetchEntries = async () => {
            const entries = await fetchFromAPI(`projects/${project.id}/entries`);
            setTimeEntries(entries);
        }
        fetchEntries();
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

    const getTimeElapsed = (time_start: number, end_time?: number) => {
        const s = new Date(time_start);
        let e = new Date();
        if (end_time) {
            e = new Date(end_time);
        }
        let remainder = e - s;
        return getElapsedTimeFromDiff(remainder);
    }

    const getElapsedTimeFromDiff = (diff: number) => {
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

    return (
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
                <button className="flex px-4 py-2 rounded border-1 w-1/4 justify-center items-center bg-blue-500 hover:bg-blue-700 text-white cursor-pointer" onClick={() => closeCallback()}>Go back</button>
            </div>
        </div>
    )
}

export default ProjectTracking;
