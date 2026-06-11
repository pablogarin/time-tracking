import { STATUS, type Project } from '../types/Project';
import { fetchFromAPI } from '../utils/fetchFromAPI';

type AddProjectFormProps = {
    saveCallback: (project: Project) => void;
}

const AddProjectForm = ({ saveCallback }: AddProjectFormProps) => {

    const saveProject = async () => {
        const name = document.querySelector("input[name='name']").value;
        const status = document.querySelector("input[name='status']").value;
        if (!STATUS.includes(status)) {
            alert('Invalid status');
            return;
        }
        const response = await fetchFromAPI('projects', 'POST', { name, status });
        if (!!response) {
            saveCallback(response);
        }
    }

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

export default AddProjectForm;
