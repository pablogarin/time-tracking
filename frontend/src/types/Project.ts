export const STATUS = ['Created', 'Active', 'Working', 'Finished'];

export type Project = {
    id: number;
    name: string;
    status: 'Created' | 'Active' | 'Working' | 'Finished';
}

export type TimeEntry = {
    id: number;
    start_time: number;
    end_time: number;
    is_current: boolean;
}

