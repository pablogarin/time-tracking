import { useState, useEffect } from 'react'
import AddProjectForm from './components/AddProjectForm';
import ProjectTracking from './components/ProjectTracking';
import { fetchFromAPI } from './utils/fetchFromAPI';
import { type Project } from './types/Project';


function App() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [project, setProject] = useState<Project | null>(null);
    const [showAddProjectForm, setShowAddProjectForm] = useState<boolean>(false);

    useEffect(() => {
        const getProjectsFromAPI = async () => {
            const data = await fetchFromAPI('projects');
            setProjects(data);
        }
        getProjectsFromAPI();
    }, []);

    const loadProject = async (project: Project) => {
        setProject(project);
    }

    const clearProject = () => {
        setProject(null);
    }

    const addProject = () => {
        setShowAddProjectForm(true);
    }

    const saveCallback = (project: Project) => {
        setShowAddProjectForm(false);
        setProject(project);
    }

    if (showAddProjectForm) {
        return (
            <AddProjectForm saveCallback={saveCallback} />
        );
    }

    return (
        <div className="flex flex-col justify-center items-center w-3/4 mx-auto gap-2">
            <h1 className="flex text-4xl font-bold h-40 items-center">Time Management</h1>
            {project !== null ? (
                <ProjectTracking project={project} closeCallback={clearProject} />
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
