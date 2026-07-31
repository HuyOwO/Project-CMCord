import { useState, useEffect, useRef } from 'react';
import { searchService } from '../../services';
import { resolveFileUrl } from '../../config';
import { getDisplayName } from '../../utils/permissions';

const TABS = [
  { key: 'all',      label: 'Tất cả' },
  { key: 'messages', label: 'Tin nhắn' },
  { key: 'files',    label: 'File' },
  { key: 'members',  label: 'Thành viên' },
];

const IMAGE_EXT_RE = /\.(png|jpe?g|gif|webp|bmp|svg)(\?.*)?$/i;
const looksLikeImage = (fileType, fileName) => fileType?.startsWith('image/') || IMAGE_EXT_RE.test(fileName || '');

// Icon 32x32: thumbnail thật nếu là ảnh, fallback về emoji 📎 nếu không phải ảnh
// hoặc ảnh lỗi không tải được.
function FileThumb({ fileUrl, fileName, fileType }) {
  const [broken, setBroken] = useState(false);
  const isImage = !broken && looksLikeImage(fileType, fileName);

  return (
    <span className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0 overflow-hidden bg-cm-input">
      {isImage ? (
        <img
          src={resolveFileUrl(fileUrl)}
          alt={fileName || 'Ảnh đính kèm'}
          loading="lazy"
          onError={() => setBroken(true)}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="text-lg">📎</span>
      )}
    </span>
  );
}

const ROLE_LABEL = { owner: 'Chủ sở hữu', moderator: 'Moderator', member: 'Thành viên' };

// Bôi vàng đoạn khớp với từ khoá — dựng bằng React node, không dùng
// dangerouslySetInnerHTML nên an toàn với nội dung do người dùng nhập.
function Highlight({ text, query }) {
  if (!query || !text) return text || null;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-cm-accent/40 text-white rounded-sm">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}

// Modal tìm kiếm toàn server: tin nhắn, file đính kèm, thành viên.
// Mở bằng nút 🔍 trên header hoặc phím tắt Ctrl/Cmd+K.
export default function SearchModal({ isOpen, onClose, server, onJumpToChannel, onMessageUser, currentUserId }) {
  const [query, setQuery] = useState('');
  const [scope, setScope] = useState('all');
  const [results, setResults] = useState({ messages: [], files: [], members: [] });
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  // Reset mỗi lần mở lại + tự focus vào ô nhập
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setScope('all');
      setResults({ messages: [], files: [], members: [] });
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [isOpen]);

  // Debounce 300ms trước khi gọi API, tránh gọi liên tục khi đang gõ
  useEffect(() => {
    if (!isOpen) return;
    const q = query.trim();
    if (!q) {
      setResults({ messages: [], files: [], members: [] });
      setLoading(false);
      return;
    }
    setLoading(true);
    const timer = setTimeout(() => {
      searchService.search(server._id, q, scope)
        .then(setResults)
        .catch(() => setResults({ messages: [], files: [], members: [] }))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [query, scope, isOpen, server?._id]);

  if (!isOpen) return null;

  const jump = (channelId) => {
    onJumpToChannel(channelId);
    onClose();
  };

  const totalResults = results.messages.length + results.files.length + results.members.length;
  const trimmedQuery = query.trim();

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-start justify-center pt-24 z-50"
      onClick={onClose}
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
    >
      <div
        className="bg-cm-sidebar rounded-lg w-[560px] max-h-[70vh] shadow-xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ô nhập */}
        <div className="px-4 pt-4 pb-2 border-b border-cm-border">
          <div className="flex items-center gap-2 bg-cm-input rounded px-3">
            <span className="text-cm-muted">🔍</span>
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Tìm trong ${server?.name || 'server'}...`}
              className="flex-1 bg-transparent text-cm-text text-sm py-2.5 outline-none placeholder-cm-muted"
            />
            <button onClick={onClose} className="text-cm-muted hover:text-white text-xs">Esc</button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-3">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setScope(t.key)}
                className={`text-xs px-2.5 py-1 rounded ${
                  scope === t.key ? 'bg-cm-accent text-white' : 'text-cm-muted hover:text-white hover:bg-cm-input'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Kết quả */}
        <div className="flex-1 overflow-y-auto p-2">
          {!trimmedQuery && (
            <p className="text-cm-muted text-sm text-center py-8">
              Nhập từ khoá để tìm tin nhắn, file hoặc thành viên trong server này.
            </p>
          )}

          {trimmedQuery && loading && (
            <p className="text-cm-muted text-sm text-center py-8">Đang tìm...</p>
          )}

          {trimmedQuery && !loading && totalResults === 0 && (
            <p className="text-cm-muted text-sm text-center py-8">
              Không tìm thấy kết quả nào cho "{trimmedQuery}".
            </p>
          )}

          {trimmedQuery && !loading && results.messages.length > 0 && (
            <div className="mb-3">
              <div className="text-cm-muted text-xs font-semibold uppercase tracking-wide px-2 mb-1">
                Tin nhắn
              </div>
              {results.messages.map((m) => (
                <button
                  key={m._id}
                  onClick={() => jump(m.channel)}
                  className="w-full text-left flex items-start gap-2 px-2 py-2 rounded hover:bg-cm-input"
                >
                  <div className="w-8 h-8 rounded-full bg-cm-accent flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {(m.author?.username || '?')[0].toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-white text-sm font-semibold truncate">
                        {getDisplayName(server, m.author?._id, m.author?.username)}
                      </span>
                      <span className="text-cm-muted text-xs">#{m.channelName}</span>
                    </div>
                    <p className="text-cm-text text-sm truncate">
                      <Highlight text={m.content} query={trimmedQuery} />
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {trimmedQuery && !loading && results.files.length > 0 && (
            <div className="mb-3">
              <div className="text-cm-muted text-xs font-semibold uppercase tracking-wide px-2 mb-1">
                File
              </div>
              {results.files.map((m) => (
                <div
                  key={m._id}
                  onClick={() => jump(m.channel)}
                  className="w-full flex items-center gap-2 px-2 py-2 rounded hover:bg-cm-input cursor-pointer"
                >
                  <FileThumb fileUrl={m.fileUrl} fileName={m.fileName} fileType={m.fileType} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-white text-sm truncate">
                        <Highlight text={m.fileName || 'Tệp đính kèm'} query={trimmedQuery} />
                      </span>
                      <span className="text-cm-muted text-xs">#{m.channelName}</span>
                    </div>
                    <span className="text-cm-muted text-xs">
                      {getDisplayName(server, m.author?._id, m.author?.username)}
                    </span>
                  </div>
                  <a
                    href={resolveFileUrl(m.fileUrl)}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-cm-accent text-xs hover:underline flex-shrink-0"
                  >
                    Tải xuống
                  </a>
                </div>
              ))}
            </div>
          )}

          {trimmedQuery && !loading && results.members.length > 0 && (
            <div className="mb-3">
              <div className="text-cm-muted text-xs font-semibold uppercase tracking-wide px-2 mb-1">
                Thành viên
              </div>
              {results.members.map((m) => (
                <div key={m.user?._id} className="w-full flex items-center gap-2 px-2 py-2 rounded">
                  <div className="w-8 h-8 rounded-full bg-cm-accent flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {(m.nickname || m.user?.username || '?')[0].toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-white text-sm truncate">
                      <Highlight text={m.nickname || m.user?.username} query={trimmedQuery} />
                    </div>
                    <div className="text-cm-muted text-xs truncate">@{m.user?.username}</div>
                  </div>
                  <span className="text-cm-muted text-xs flex-shrink-0">{ROLE_LABEL[m.role]}</span>
                  {onMessageUser && m.user?._id !== currentUserId && (
                    <button
                      onClick={() => { onMessageUser(m.user._id); onClose(); }}
                      title="Nhắn tin"
                      className="text-cm-muted hover:text-cm-accent text-xs flex-shrink-0"
                    >
                      💬
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
