import { useNavigate } from 'react-router-dom';
import { channelService } from '../services';

// Logic "chọn 1 server -> lấy danh sách channel -> nhảy vào channel đầu tiên"
// Trước đây chỉ tồn tại trong HomePage nên ChannelPage không có cách nào đổi server.
// Tách ra hook riêng để cả HomePage và ChannelPage dùng chung.
export default function useServerSelect() {
  const navigate = useNavigate();

  return async (server) => {
    const channels = await channelService.getAll(server._id);
    if (channels.length > 0) {
      navigate(`/channels/${server._id}/${channels[0]._id}`);
    }
  };
}
