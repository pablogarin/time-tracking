import { STATUS, type Project } from '../types/Project';
import { fetchFromAPI } from '../utils/fetchFromAPI';

type AddProjectFormProps = {
    saveCallback: (project?: Project) => void;
}

const AddProjectForm = ({ saveCallback }: AddProjectFormProps) => {
    const saveProject = async () => {
        const name = document.querySelector<HTMLInputElement>("input[name='name']")?.value;
        const status = document.querySelector<HTMLInputElement>("input[name='status']")?.value;
        if (!!status && !STATUS.includes(status)) {
            alert('Invalid status');
            return;
        }
        const response = await fetchFromAPI('projects', 'POST', { name, status });
        if (!!response) {
            saveCallback(response);
        }
    }

    return (
        <div className="flex flex-col justify-center items-center w-1/2 mx-auto bg-gray-100 rounded border">
            <h3 className="flex w-full text-2xl justify-center items-center font-bold py-4 bg-gray-300 border-b-1">Add project</h3>
            <div className="flex flex-col justify-center w-full items-center p-6">
                <div className="w-full flex justify-center items-center gap-2 py-2">
                    <label className="flex w-1/4 justify-end text-lg" htmlFor="name">Name</label>
                    <input className="flex w-3/4 border-1 p-3 bg-white rounded" type="text" name="name" />
                </div>
                <div className="w-full flex justify-center items-center gap-2 py-2">
                    <label className="flex w-1/4 justify-end text-lg" htmlFor="status">State</label>
                    <input className="flex w-3/4 border-1 p-3 bg-white rounded" type="text" name="status" />
                </div>
                <div className="flex w-full justify-end">
                    <button className="flex px-4 py-2 rounded border-1 w-1/4 justify-center items-center bg-blue-500 hover:bg-blue-700 text-white cursor-pointer" onClick={() => saveCallback()}>Close</button>
                    <button className="flex px-4 py-2 rounded border-1 w-1/4 justify-center items-center bg-blue-500 hover:bg-blue-700 text-white cursor-pointer" onClick={() => saveProject()}>Save</button>
                </div>
            </div>
        </div>
    );
}

export default AddProjectForm;
