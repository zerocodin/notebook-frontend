import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { toastApiError, showSuccess } from "../utils/toast";

export default function InviteAccept() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [info, setInfo] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    api
      .get(`/notes/invite/${token}`)
      .then((res) => setInfo(res.data))
      .catch((err) => {
        setFailed(true);
        toastApiError(err, "Invalid or expired invite");
      });
  }, [token]);

  const accept = async () => {
    try {
      await api.post(`/notes/invite/${token}/accept`);
      showSuccess("Invite accepted");
      navigate("/");
    } catch (err) {
      toastApiError(err, "Could not accept invite");
    }
  };

  if (failed) return <div className="p-8 text-gray-600">This invite is invalid or expired.</div>;
  if (!info) return <div className="p-8">Loading…</div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-keep-bg">
      <div className="bg-white p-8 rounded-xl shadow max-w-md w-full text-center">
        <h1 className="text-lg font-medium mb-2">
          {info.note.owner?.name} shared a note with you
        </h1>
        <p className="text-sm text-gray-600 mb-4">"{info.note.title || 'Untitled'}"</p>
        <button
          onClick={accept}
          className="bg-yellow-400 hover:bg-yellow-500 px-6 py-2 rounded-full font-medium"
        >
          Accept ({info.permission === 'edit' ? 'can edit' : 'view only'})
        </button>
      </div>
    </div>
  );
}