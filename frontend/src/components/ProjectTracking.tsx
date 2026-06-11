import { useState, useEffect } from 'react';
import { type Project, type TimeEntry } from '../types/Project';
import { fetchFromAPI } from '../utils/fetchFromAPI';

type ProjectTrackingProps = {
    project: Project;
    closeCallback: () => void;
}

const ProjectTracking = ({ project, closeCallback }: ProjectTrackingProps) => {
    const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
    const [currentTask, setCurrentTask] = useState<TimeEntry | null>(null);
    const [timeElapsed, setTimeElapsed] = useState<string>('-d -h -m -s');
    const [isWorking, setIsWorking] = useState<boolean>(false);

    useEffect(() => {
        const fetchEntries = async () => {
            const entries = await fetchFromAPI(`projects/${project.id}/entries`);
            if (entries.at(-1).is_current) {
                const current = entries.pop();
                setCurrentTask(current);
            }
            setTimeEntries(entries);
        }
        fetchEntries();
    }, []);

    useEffect(() => {
        // If there's no current task in progress, return 
        if (!currentTask || currentTask?.is_current == false) {
            return;
        }
        // If theres a current task in progress, track the time
        setIsWorking(true);
        const timer = setInterval(() => {
            const currentTaskTime = getTimeElapsed(currentTask?.start_time);
            setTimeElapsed(currentTaskTime);
        }, 100);
        return () => {
            clearInterval(timer);
        }
    }, [timeEntries, currentTask])

    const toggleWorkingProject = async () => {
        if (isWorking) {
            const entryId = currentTask?.id;
            const response = await fetchFromAPI(`projects/${project.id}/entries/${entryId}`, 'PUT');
            setTimeEntries((old) => ([...old, response]));
            setTimeElapsed(getElapsedTimeFromDiff(0));
            setCurrentTask(null);
            setIsWorking(false);
        } else {
            const response = await fetchFromAPI(`projects/${project.id}/entries`, 'POST');
            setTimeElapsed(getElapsedTimeFromDiff(0));
            setCurrentTask(response);
            setIsWorking(true);
        }
    }

    const getTimeElapsed = (time_start: number, end_time?: number, showMiliseconds: boolean = false) => {
        const s = new Date(time_start);
        let e = new Date();
        if (end_time) {
            e = new Date(end_time);
        }
        let remainder = e - s;
        return getElapsedTimeFromDiff(remainder, showMiliseconds);
    }

    const getElapsedTimeFromDiff = (diff: number, showMiliseconds?: boolean) => {
        let remainder = diff;
        const days = Math.floor(remainder / (1000 * 60 * 60 * 24));
        remainder %= 1000 * 60 * 60 * 24;

        const hours = Math.floor(remainder / (1000 * 60 * 60));
        remainder %= 1000 * 60 * 60;

        const minutes = Math.floor(remainder / (1000 * 60));
        remainder %= 1000 * 60;

        const seconds = Math.floor(remainder / 1000);
        remainder %= 1000 * 100;
        return `
            ${days}d
            ${hours.toString().padStart(2, '0')}h
            ${minutes.toString().padStart(2, '0')}m
            ${seconds.toString().padStart(2, '0')}${showMiliseconds ? '.' + (remainder % 100).toString().padStart(2, '0') : ''}s`;
    }

    const projectTotalTime = getElapsedTimeFromDiff(timeEntries.reduce((acc, te) => {
        const diff = (new Date(te.end_time)) - (new Date(te.start_time));
        return acc + diff;
    }, 0));


    return (
        <div className="flex flex-col w-full justify-center items-center gap-4">
            <div className="flex flex-col justify-center items-center">
                <div className="text-2xl">{project.name}</div>
                <div className="text-lg">Total time registered: {timeEntries.length == 0 ? 'No time' : `${projectTotalTime}`}</div>
            </div>
            <div className="text-2xl p-12 text-red-600">{isWorking ? `Current Task: ${timeElapsed}` : 'No active work'}</div>
            <div className="flex justify-center items-center w-full gap-4">
                <button className="flex px-4 py-2 rounded border-1 w-1/4 justify-center items-center bg-blue-500 hover:bg-blue-700 text-white cursor-pointer" onClick={() => toggleWorkingProject()}>{!isWorking ? 'Start' : 'Stop'} Timer</button>
                <button className="flex px-4 py-2 rounded border-1 w-1/4 justify-center items-center bg-blue-500 hover:bg-blue-700 text-white cursor-pointer" onClick={() => closeCallback()}>Go back</button>
            </div>
            <div className="flex flex-col w-full justify-center items-center border-t-1 py-8">
                <h4 className="flex py-4 text-xl font-bold w-full justify-center bg-gray-100">History</h4>
                <table className="table-auto w-full">
                    <thead>
                        <tr>
                            <th className="py-2">Date</th>
                            <th className="py-2">Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {timeEntries.map((te) => {
                            if (te.is_current) return;
                            const date = new Date(te.start_time).toLocaleDateString();
                            return (
                                <tr className="px-4 py-2" key={`timeentry-${te.id}`}>
                                    <td className="border px-4 py-2">{date}</td>
                                    <td className="border px-4 py-2">{getTimeElapsed(te.start_time, te.end_time, true)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default ProjectTracking;
