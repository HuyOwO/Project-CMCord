import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  serverService, courseService, channelService,
  lessonService, assignmentService,
} from '../services';
import useAuth from '../hooks/useAuth';
import useSocket from '../hooks/useSocket';
import useServerSelect from '../hooks/useServerSelect';
import ServerSidebar from '../components/server/ServerSidebar';
import CourseListSidebar from '../components/course/CourseListSidebar';
import CreateCourseModal from '../components/course/CreateCourseModal';
import JoinCourseModal from '../components/course/JoinCourseModal';
import CourseInviteModal from '../components/course/CourseInviteModal';
import LessonModal from '../components/course/LessonModal';
import LessonList from '../components/course/LessonList';
import AssignmentModal from '../components/course/AssignmentModal';
import AssignmentList from '../components/course/AssignmentList';
import CourseMembersPanel from '../components/course/CourseMembersPanel';
import GradebookTable from '../components/course/GradebookTable';
import { getRole } from '../utils/permissions';
import { getCourseRole, canManageCourse, isCourseInstructor } from '../utils/coursePermissions';

const ROLE_LABEL = { instructor: 'Instructor', ta: 'TA', student: 'Student' };
const TABS = [
  { key: 'lessons',     label: '📚 Bài học' },
  { key: 'assignments', label: '📝 Bài tập' },
  { key: 'members',     label: '👥 Thành viên' },
  { key: 'gradebook',   label: '📊 Bảng điểm', instructorOnly: true },
];

export default function CourseDetailPage() {
  const { serverId, courseId } = useParams();
  const { user, logout } = useAuth();
  const socket = useSocket();
  const navigate = useNavigate();
  const goToServer = useServerSelect();

  const [servers, setServers] = useState([]);
  const [server, setServer] = useState(null);
  const [courses, setCourses] = useState([]);
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [tab, setTab] = useState('lessons');

  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);

  useEffect(() => {
    serverService.getAll().then(setServers);
  }, []);

  useEffect(() => {
    serverService.getOne(serverId).then(setServer);
    courseService.getAll(serverId).then(setCourses);
  }, [serverId]);

  const loadCourse = () => courseService.getOne(courseId).then(setCourse);
  const loadLessons = () => lessonService.getAll(courseId).then(setLessons);
  const loadAssignments = () => assignmentService.getAll(courseId).then(setAssignments);

  useEffect(() => {
    setTab('lessons');
    loadCourse();
    loadLessons();
    loadAssignments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  // Milestone 2: nếu đang mở đúng course này thì tự làm mới danh sách bài tập khi có
  // điểm mới, để điểm hiển thị ngay mà không cần F5. Toast hiển thị real-time cho
  // người dùng dùng chung 1 component ở App.jsx (NotificationToastHost) nên ở đây
  // không cần tự vẽ banner nữa.
  useEffect(() => {
    if (!socket) return;
    const handleGrade = (data) => {
      if (data.courseId === courseId) loadAssignments();
    };
    socket.on('grade_posted', handleGrade);
    return () => socket.off('grade_posted', handleGrade);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, courseId]);

  const actorServerRole = getRole(server, user?._id);
  const canCreateCourse = actorServerRole === 'owner' || actorServerRole === 'moderator';
  const myCourseRole = course ? getCourseRole(course, user?._id) : null;
  const canManage = canManageCourse(myCourseRole);
  const isInstructor = isCourseInstructor(myCourseRole);

  const handleBackToChannels = async () => {
    const channels = await channelService.getAll(serverId);
    if (channels.length > 0) navigate(`/channels/${serverId}/${channels[0]._id}`);
    else navigate('/');
  };

  const handleCreateCourse = async ({ name, description }) => {
    const c = await courseService.create(serverId, { name, description });
    setCourses((prev) => [...prev, c]);
    navigate(`/servers/${serverId}/courses/${c._id}`);
  };

  const handleJoinCourse = async (inviteCode) => {
    const c = await courseService.join(inviteCode);
    setCourses((prev) => (prev.some((x) => x._id === c._id) ? prev : [...prev, c]));
    navigate(`/servers/${serverId}/courses/${c._id}`);
  };

  // ── Lessons ──
  const handleSaveLesson = async ({ title, content }, file) => {
    if (editingLesson) {
      await lessonService.update(editingLesson._id, { title, content });
    } else {
      await lessonService.create(courseId, { title, content }, file);
    }
    setEditingLesson(null);
    loadLessons();
  };
  const handleDeleteLesson = async (lesson) => {
    if (!window.confirm(`Xoá bài học "${lesson.title}"?`)) return;
    await lessonService.remove(lesson._id);
    loadLessons();
  };
  const handleMoveLesson = async (lesson, direction) => {
    const idx = lessons.findIndex((l) => l._id === lesson._id);
    const swapWith = lessons[idx + direction];
    if (!swapWith) return;
    await Promise.all([
      lessonService.reorder(lesson._id, swapWith.order),
      lessonService.reorder(swapWith._id, lesson.order),
    ]);
    loadLessons();
  };

  // ── Assignments ──
  const handleSaveAssignment = async ({ title, description, deadline }, file) => {
    if (editingAssignment) {
      await assignmentService.update(editingAssignment._id, { title, description, deadline });
    } else {
      await assignmentService.create(courseId, { title, description, deadline }, file);
    }
    setEditingAssignment(null);
    loadAssignments();
  };
  const handleDeleteAssignment = async (assignment) => {
    if (!window.confirm(`Xoá bài tập "${assignment.title}"? Toàn bộ bài nộp liên quan cũng sẽ mất.`)) return;
    await assignmentService.remove(assignment._id);
    loadAssignments();
  };

  // ── Members ──
  const handlePromoteTA = async (userId) => {
    await courseService.updateMemberRole(courseId, userId, 'ta');
    loadCourse();
  };
  const handleDemoteTA = async (userId) => {
    await courseService.updateMemberRole(courseId, userId, 'student');
    loadCourse();
  };
  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Xoá thành viên này khỏi khoá học?')) return;
    await courseService.removeMember(courseId, userId);
    loadCourse();
  };

  const handleDeleteCourse = async () => {
    if (!window.confirm(`Xoá vĩnh viễn khoá học "${course?.name}"? Toàn bộ bài học/bài tập/bài nộp sẽ mất.`)) return;
    await courseService.remove(courseId);
    setCourses((prev) => prev.filter((c) => c._id !== courseId));
    navigate(`/servers/${serverId}/courses`);
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
        activeCourseId={courseId}
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
      <CourseInviteModal isOpen={showInvite} onClose={() => setShowInvite(false)} course={course} />
      <LessonModal
        isOpen={showLessonModal}
        onClose={() => { setShowLessonModal(false); setEditingLesson(null); }}
        onSave={handleSaveLesson}
        lesson={editingLesson}
      />
      <AssignmentModal
        isOpen={showAssignmentModal}
        onClose={() => { setShowAssignmentModal(false); setEditingAssignment(null); }}
        onSave={handleSaveAssignment}
        assignment={editingAssignment}
      />

      <div className="flex-1 flex flex-col bg-cm-surface overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-cm-border">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-white font-bold text-lg truncate">{course?.name}</h1>
                {myCourseRole && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-cm-input text-cm-accent flex-shrink-0">
                    {ROLE_LABEL[myCourseRole]}
                  </span>
                )}
              </div>
              {course?.description && (
                <p className="text-cm-muted text-sm mt-0.5">{course.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {canManage && (
                <button
                  onClick={() => setShowInvite(true)}
                  className="text-xs px-3 py-1.5 bg-cm-input hover:bg-cm-border rounded text-cm-text"
                >
                  Mời sinh viên
                </button>
              )}
              {isInstructor && (
                <button
                  onClick={handleDeleteCourse}
                  className="text-xs px-3 py-1.5 border border-red-900 hover:bg-red-950 rounded text-red-400"
                >
                  Xoá khoá học
                </button>
              )}
            </div>
          </div>

          <div className="flex gap-1 mt-4">
            {TABS.filter((t) => !t.instructorOnly || canManage).map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`text-sm px-3 py-1.5 rounded ${
                  tab === t.key ? 'bg-cm-input text-white' : 'text-cm-muted hover:text-white hover:bg-cm-input'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {tab === 'lessons' && (
            <div>
              {canManage && (
                <button
                  onClick={() => setShowLessonModal(true)}
                  className="mb-4 px-4 py-2 bg-cm-accent hover:bg-indigo-500 text-white text-sm rounded"
                >
                  + Thêm bài học
                </button>
              )}
              <LessonList
                lessons={lessons}
                canManage={canManage}
                onEdit={(l) => { setEditingLesson(l); setShowLessonModal(true); }}
                onDelete={handleDeleteLesson}
                onMove={handleMoveLesson}
              />
            </div>
          )}

          {tab === 'assignments' && (
            <div>
              {canManage && (
                <button
                  onClick={() => setShowAssignmentModal(true)}
                  className="mb-4 px-4 py-2 bg-cm-accent hover:bg-indigo-500 text-white text-sm rounded"
                >
                  + Giao bài tập
                </button>
              )}
              <AssignmentList
                assignments={assignments}
                canManage={canManage}
                onEdit={(a) => { setEditingAssignment(a); setShowAssignmentModal(true); }}
                onDelete={handleDeleteAssignment}
              />
            </div>
          )}

          {tab === 'gradebook' && canManage && (
            <GradebookTable courseId={courseId} />
          )}

          {tab === 'members' && (
            <CourseMembersPanel
              course={course}
              currentUserId={user?._id}
              isInstructor={isInstructor}
              onPromoteTA={handlePromoteTA}
              onDemoteTA={handleDemoteTA}
              onRemove={handleRemoveMember}
            />
          )}
        </div>
      </div>
    </div>
  );
}
