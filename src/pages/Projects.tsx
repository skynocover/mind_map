import * as antd from 'antd';
import React, { useCallback } from 'react';
import Swal from 'sweetalert2';
import { AppContext } from '../AppContext';
import { Link } from 'react-router-dom';
import { Project, getAllProjects, createProject, deleteProject } from '../utils/firestore';

const Projects = () => {
  const appCtx = React.useContext(AppContext);
  const [projects, setProjects] = React.useState<Project[]>([]);

  const init = useCallback(async () => {
    if (appCtx.user) {
      const projects = await getAllProjects(appCtx.user.email || '');
      setProjects(projects);
    }
  }, [appCtx.user]);

  React.useEffect(() => {
    init();
  }, [appCtx.user, init]);

  const addProject = async () => {
    const projectName = prompt('Enter the project name');

    if (appCtx.user && projectName) {
      await createProject(appCtx.user.email || '', projectName);
      init();
    }
  };

  const deletePj = async (project: Project) => {
    const { isDenied } = await Swal.fire({
      title: `Delete Project ${project.projectName}?`,
      showConfirmButton: false,
      showDenyButton: true,
      showCancelButton: true,
      denyButtonText: 'Delete Project',
    });

    if (isDenied) {
      await deleteProject(project.id);
      init();
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Name',
      dataIndex: 'projectName',
      key: 'projectName',
    },
    {
      title: 'Action',
      key: 'x',
      render: (project: Project) => (
        <div className="flex space-x-2">
          <antd.Button type="primary">
            <Link to={'/project/' + project.id}>Edit</Link>
          </antd.Button>
          <antd.Button type="ghost" onClick={() => deletePj(project)}>
            Delete
          </antd.Button>
        </div>
      ),
    },
  ];

  return (
    <div className="m-2">
      <div className="flex justify-end mb-2">
        <antd.Button type="primary" onClick={addProject}>
          Add
        </antd.Button>
      </div>
      <antd.Spin spinning={false}>
        <antd.Table
          scroll={{ x: 800 }}
          dataSource={projects.map((p) => {
            return { key: p.id, ...p };
          })}
          columns={columns}
          pagination={false}
        />
      </antd.Spin>
    </div>
  );
};

export default Projects;
