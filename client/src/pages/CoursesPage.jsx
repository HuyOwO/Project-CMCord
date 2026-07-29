import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { serverService, courseService, channelService } from '../services';
import useAuth from '../hooks/useAuth';
import useServerSelect from '../hooks/useServerSelect';
import ServerSidebar from '../components/server/ServerSidebar';
import CourseListSidebar from '../components/course/CourseListSidebar';
import CreateCourseModal from '../components/course/CreateCourseModal';
import JoinCourseModal from '../components/course/JoinCourseModal';
import { getRole } from '../utils/permissions';

// Route /servers/:serverId/courses -- màn hình "không gian học tập" của 1 server,
// hiển thị danh sách khoá học và cho phép tạo/tham gia khoá học mới.
export default function CoursesPage() {
  const { serverId } = useParams();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const goToServer = useServerSelect();

  const [servers, setServers] = useState([]);
  const [server, setServer] = useState(null);
  const [courses, setCourses] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);

  useEffect(() => {
    serverService.getAll().then(setServers);
  }, []);

  useEffect(() => {
    serverService.getOne(serverId).then(setServer);
    courseService.getAll(serverId).then(setCourses);
  }, [serverId]);

  const actorRole = getRole(server, user?._id);
  const canCreateCourse = actorRole === 'owner' || actorRole === 'moderator';

  const handleBackToChannels = async () => {
    const channels = await channelService.getAll(serverId);
    if (channels.length > 0) navigate(`/channels/${serverId}/${channels[0]._id}`);
    else navigate('/');
  };

  const handleCreateCourse = async ({ name, description }) => {
    const course = await courseService.create(serverId, { name, description });
    setCourses((prev) => [...prev, course]);
    navigate(`/servers/${serverId}/courses/${course._id}`);
  };

  const handleJoinCourse = async (inviteCode) => {
    const course = await courseService.join(inviteCode);
    setCourses((prev) => (prev.some((c) => c._id === course._id) ? prev : [...prev, course]));
    navigate(`/servers/${serverId}/courses/${course._id}`);
  };

  return (
    <div className="flex h-screen bg-cm-bg overflow-hidden">
      <ServerSidebar
        servers={servers}
        activeServerId={serverId}
        onSelectServer={goToServer}
        onCreateClick={() => navigate('/')}
        onHomeClick={() => navigate('/dm')}
      />

      <CourseListSidebar
        server={server}
        courses={courses}
        activeCourseId={null}
        onSelectCourse={(c) => navigate(`/servers/${serverId}/courses/${c._id}`)}
        onBackToChannels={handleBackToChannels}
        canCreateCourse={canCreateCourse}
        onCreateClick={() => setShowCreate(true)}
        onJoinClick={() => setShowJoin(true)}
        user={user}
        onLogout={logout}
      />

      <CreateCourseModal isOpen={showCreate} onClose={() => setShowCreate(false)} onCreate={handleCreateCourse} />
      <JoinCourseModal isOpen={showJoin} onClose={() => setShowJoin(false)} onJoin={handleJoinCourse} />

      <div className="flex-1 bg-cm-surface flex flex-col items-center justify-center text-center px-6">
        <div className="text-5xl mb-3">🎓</div>
        <p className="text-white font-semibold mb-1">Không gian học tập của {server?.name}</p>
        <p className="text-cm-muted text-sm mb-5 max-w-sm">
          Chọn 1 khoá học ở sidebar bên trái, hoặc tạo/tham gia khoá học mới để bắt đầu.
        </p>
        <div className="flex gap-2">
          {canCreateCourse && (
            <button
              onClick={() => setShowCreate(true)}
              className="px-4 py-2 bg-cm-accent hover:bg-indigo-500 text-white text-sm rounded"
            >
              + Tạo khoá học
            </button>
          )}
          <button
            onClick={() => setShowJoin(true)}
            className="px-4 py-2 bg-cm-input hover:bg-cm-border text-cm-text text-sm rounded"
          >
            🔗 Tham gia bằng mã mời
          </button>
        </div>
      </div>
    </div>
  );
}
