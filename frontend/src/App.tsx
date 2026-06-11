import React, { useState, useEffect } from 'react'
import AddProjectForm from './components/AddProjectForm';
import ProjectTracking from './components/ProjectTracking';
import { fetchFromAPI } from './utils/fetchFromAPI';
import { type Project } from './types/Project';


function App() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [project, setProject] = useState<Project | null>(null);
    const [showAddProjectForm, setShowAddProjectForm] = useState<boolean>(false);
    const [filter, setFilter] = useState<string>('');

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

    const saveCallback = (project?: Project) => {
        setShowAddProjectForm(false);
        if (!!project) setProject(project);
    }

    const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setFilter(query);
    }

    return (
        <>
            <h1 className="flex fixed text-4xl w-full top-0 font-bold h-20 justify-center items-center bg-gray-700 text-white">Time Management</h1>
            <div className="flex flex-col w-3/4 items-center mx-auto gap-2 mt-4 mt-24">
                {showAddProjectForm && (
                    <AddProjectForm saveCallback={saveCallback} />
                )}
                {!showAddProjectForm && (project !== null ? (
                    <ProjectTracking project={project} closeCallback={clearProject} />
                ) : (
                    <>
                        <div className="flex w-full gap-2 py-4">
                            <input className="w-full border rounded py-4 px-2" type="text" onChange={onChangeHandler} placeholder="Search by project" />
                            <button className="flex w-1/3 px-4 py-2 rounded border-1 w-1/4 justify-center items-center bg-blue-500 hover:bg-blue-700 text-white cursor-pointer" onClick={() => addProject()}>Add Project</button>
                        </div>
                        <table className="table-auto w-full pb-4 border-t-1 border-gray-500">
                            <thead>
                                <tr>
                                    <th className="px-4 py-2">Project</th >
                                    <th className="px-4 py-2">Status</th >
                                </tr >
                            </thead >
                            <tbody>
                                {!!projects && projects.filter(prj => prj.name.toLowerCase().includes(filter.toLowerCase())).map((prj) => (
                                    <tr className="bg-gray-100 hover:bg-gray-200 cursor-pointer" key={prj.id} onClick={() => loadProject(prj)}>
                                        <td className="border border-gray-500 px-4 py-2">{prj.name}</td>
                                        <td className="border border-gray-500 px-4 py-2">{prj.status}</td>
                                    </tr>))}
                            </tbody>
                        </table >
                    </>
                ))
                }
            </div >
        </>
    )
}

export default App
