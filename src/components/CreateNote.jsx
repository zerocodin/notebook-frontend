import { useState } from 'react';

const COLORS = ['#ffffff', '#fff9c4', '#f8bbd0', '#c5e1a5', '#b3e5fc', '#d1c4e9'];

export default function CreateNote({ onCreate }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState('#ffffff');
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setTitle('');
    setContent('');
    setColor('#ffffff');
    setOpen(false);
    setSaving(false);
  };

  const submit = async () => {
    if (!title.trim() && !content.trim()) return reset();
    setSaving(true);
    try {
      await onCreate({ title, content, color });
      reset();
    } catch (err) {
      console.error('Create note failed:', err.response?.data || err.message);
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mb-8">
      <div
        className="rounded-xl shadow-sm border border-keep-border transition hover:shadow-md"
        style={{ backgroundColor: color }}
      >
        {open && (
          <input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-5 pt-4 pb-2 font-medium bg-transparent outline-none rounded-t-xl"
          />
        )}
        <textarea
          placeholder="Take a note..."
          value={content}
          onFocus={() => setOpen(true)}
          onChange={(e) => setContent(e.target.value)}
          rows={open ? 3 : 1}
          className="w-full px-5 py-4 resize-none bg-transparent outline-none text-sm"
        />
        {open && (
          <div className="flex items-center justify-between px-4 pb-3">
            <div className="flex gap-1.5">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  aria-label={`Set color ${c}`}
                  className={`w-5 h-5 rounded-full border border-black/10 transition hover:scale-110 ${
                    color === c ? 'ring-2 ring-gray-500 ring-offset-1' : ''
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={reset}
                className="text-sm px-4 py-1.5 rounded-full text-gray-600 hover:bg-black/5"
              >
                Cancel
              </button>
              <button
                onClick={submit}
                disabled={saving}
                className="text-sm px-4 py-1.5 rounded-full bg-yellow-400 hover:bg-yellow-500
                           font-medium text-gray-900 disabled:opacity-60"
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}