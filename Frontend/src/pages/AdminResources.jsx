import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { fetchResources, createResource, deleteResource } from '../utils/api';

const AdminResources = () => {
  const [resources, setResources] = useState([]);
  const [form, setForm] = useState({
    name: '', type: 'Room', capacity: 10, location: '', description: '',
    hasProjector: false, hasGpu: false,
  });
  const [msg, setMsg] = useState('');

  const load = () => fetchResources().then(setResources).catch(() => setResources([]));
  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      await createResource({
        ...form,
        capacity: Number(form.capacity),
        hasProjector: form.hasProjector,
        hasGpu: form.hasGpu,
      });
      setForm({ name: '', type: 'Room', capacity: 10, location: '', description: '', hasProjector: false, hasGpu: false });
      setMsg('Resource added.');
      load();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed — admin login required.');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this resource?')) return;
    try {
      await deleteResource(id);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="page-shell">
      <Navbar />
      <div className="container">
        <header className="page-header">
          <span className="page-eyebrow">Admin</span>
          <h1 className="heading-serif">Manage <span className="text-accent">Resources</span></h1>
        </header>

        {msg && <div className="alert-banner info">{msg}</div>}

        <form onSubmit={handleCreate} className="card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <input className="form-input" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <select className="form-input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option>Room</option><option>Lab</option><option>Equipment</option>
            </select>
            <input className="form-input" type="number" placeholder="Capacity" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} required />
            <input className="form-input" placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
          </div>
          <textarea className="form-input" style={{ marginTop: '1rem' }} placeholder="Description" value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <label style={{ marginRight: '1rem', fontSize: '0.9rem' }}>
            <input type="checkbox" checked={form.hasProjector} onChange={(e) => setForm({ ...form, hasProjector: e.target.checked })} /> Projector
          </label>
          <label style={{ fontSize: '0.9rem' }}>
            <input type="checkbox" checked={form.hasGpu} onChange={(e) => setForm({ ...form, hasGpu: e.target.checked })} /> GPU
          </label>
          <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>Add resource</button>
        </form>

        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {resources.map((r) => (
            <div key={r.id} className="card" style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div><strong>{r.name}</strong> <span style={{ color: 'var(--text-muted)' }}>— {r.type} · {r.location}</span></div>
              <button type="button" className="btn-outline" style={{ color: '#991b1b', borderColor: '#fecaca' }} onClick={() => handleDelete(r.id)}>Delete</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminResources;
