import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import { fetchResources, createResource, updateResource, deleteResource } from '../utils/api';

const initialForm = {
  name: '',
  type: 'Room',
  capacity: 10,
  location: '',
  price_per_hour: 0,
  image: '',
  description: '',
  available: true,
  hasProjector: false,
  hasGpu: false,
};

const getResourceId = (resource) => resource?._id || resource?.id;

const AdminResources = () => {
  const [resources, setResources] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('');
  const [openCategories, setOpenCategories] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setResources(await fetchResources());
    } catch {
      setResources([]);
      toast.error('Could not load resources. Please check admin login and backend.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => load());
  }, [load]);

  const resourceTypes = useMemo(() => {
    const fixedTypes = ['Room', 'Lab', 'Equipment', 'Conference hall', 'Executive Boardroom', 'suite room', 'villa'];
    return [...new Set([...fixedTypes, ...resources.map((resource) => resource.type).filter(Boolean)])].sort();
  }, [resources]);

  const filteredResources = useMemo(() => {
    const query = search.trim().toLowerCase();
    return resources.filter((resource) => {
      const matchesQuery = !query || [resource.name, resource.type, resource.location, resource.description]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
      const matchesType = !typeFilter || resource.type === typeFilter;
      const matchesAvailability =
        !availabilityFilter ||
        (availabilityFilter === 'available' && resource.available !== false) ||
        (availabilityFilter === 'unavailable' && resource.available === false);
      return matchesQuery && matchesType && matchesAvailability;
    });
  }, [resources, search, typeFilter, availabilityFilter]);

  const stats = useMemo(() => {
    const availableCount = resources.filter((resource) => resource.available !== false).length;
    return { total: resources.length, availableCount };
  }, [resources]);

  const groupedResources = useMemo(() => {
    return filteredResources.reduce((groups, resource) => {
      const category = resource.type || 'Uncategorized';
      return {
        ...groups,
        [category]: [...(groups[category] || []), resource],
      };
    }, {});
  }, [filteredResources]);

  const toggleCategory = (category) => {
    setOpenCategories((current) => ({
      ...current,
      [category]: !current[category],
    }));
  };

  const updateForm = (field, value) => {
    setForm((currentForm) => ({ ...currentForm, [field]: value }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
    setMsg('');
  };

  const buildPayload = () => ({
    ...form,
    capacity: Number(form.capacity) || 0,
    price_per_hour: Number(form.price_per_hour) || 0,
    available: Boolean(form.available),
    hasProjector: Boolean(form.hasProjector),
    hasGpu: Boolean(form.hasGpu),
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMsg('');
    setSaving(true);
    try {
      if (editingId) {
        await updateResource(editingId, buildPayload());
        setMsg('Resource updated successfully.');
        toast.success('Resource updated');
      } else {
        await createResource(buildPayload());
        setMsg('Resource added successfully.');
        toast.success('Resource added');
      }
      resetForm();
      await load();
    } catch (error) {
      const message = error.response?.data?.detail || error.response?.data?.message || 'Admin action failed.';
      setMsg(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (resource) => {
    setEditingId(getResourceId(resource));
    setForm({
      name: resource.name || '',
      type: resource.type || 'Room',
      capacity: resource.capacity || 0,
      location: resource.location || '',
      price_per_hour: resource.price_per_hour || 0,
      image: resource.image || '',
      description: resource.description || '',
      available: resource.available !== false,
      hasProjector: Boolean(resource.hasProjector),
      hasGpu: Boolean(resource.hasGpu),
    });
    setMsg(`Editing ${resource.name}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleAvailability = async (resource) => {
    const resourceId = getResourceId(resource);
    try {
      await updateResource(resourceId, { available: resource.available === false });
      toast.success(resource.available === false ? 'Resource marked available' : 'Resource marked unavailable');
      await load();
    } catch (error) {
      toast.error(error.response?.data?.detail || error.response?.data?.message || 'Could not update availability');
    }
  };

  const handleDelete = async (resource) => {
    if (!window.confirm(`Delete ${resource.name}?`)) return;
    try {
      await deleteResource(getResourceId(resource));
      toast.success('Resource deleted');
      if (editingId === getResourceId(resource)) resetForm();
      await load();
    } catch (error) {
      toast.error(error.response?.data?.detail || error.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="page-shell">
      <Navbar />
      <div className="container">
        <header className="page-header">
          <span className="page-eyebrow">Admin</span>
          <h1 className="heading-serif">Manage <span className="text-accent">Resources</span></h1>
          <p style={{ color: 'var(--text-muted)', maxWidth: 680, marginTop: '0.5rem' }}>
            Create, edit, deactivate, filter, and remove resources from one dashboard.
          </p>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div className="card" style={{ padding: '1rem' }}><strong>{stats.total}</strong><br /><span style={{ color: 'var(--text-muted)' }}>Total resources</span></div>
          <div className="card" style={{ padding: '1rem' }}><strong>{stats.availableCount}</strong><br /><span style={{ color: 'var(--text-muted)' }}>Available now</span></div>
        </div>

        {msg && <div className="alert-banner info">{msg}</div>}

        <form onSubmit={handleSubmit} className="card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
          <h2 className="heading-serif" style={{ fontSize: '1.4rem', marginBottom: '1rem' }}>
            {editingId ? 'Edit Resource' : 'Add New Resource'}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem' }}>
            <input className="form-input" placeholder="Name" value={form.name} onChange={(event) => updateForm('name', event.target.value)} required />
            <select className="form-input" value={form.type} onChange={(event) => updateForm('type', event.target.value)}>
              {resourceTypes.map((resourceType) => <option key={resourceType} value={resourceType}>{resourceType}</option>)}
            </select>
            <input className="form-input" type="number" min="1" placeholder="Capacity" value={form.capacity} onChange={(event) => updateForm('capacity', event.target.value)} required />
            <input className="form-input" placeholder="Location" value={form.location} onChange={(event) => updateForm('location', event.target.value)} required />
            <input className="form-input" type="number" min="0" placeholder="Price per hour" value={form.price_per_hour} onChange={(event) => updateForm('price_per_hour', event.target.value)} />
            <input className="form-input" placeholder="Image URL" value={form.image} onChange={(event) => updateForm('image', event.target.value)} />
          </div>
          <textarea className="form-input" style={{ marginTop: '1rem' }} placeholder="Description" value={form.description}
            onChange={(event) => updateForm('description', event.target.value)} />

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', marginTop: '1rem' }}>
            <label style={{ fontSize: '0.9rem' }}>
              <input type="checkbox" checked={form.available} onChange={(event) => updateForm('available', event.target.checked)} /> Available
            </label>
            <label style={{ fontSize: '0.9rem' }}>
              <input type="checkbox" checked={form.hasProjector} onChange={(event) => updateForm('hasProjector', event.target.checked)} /> Projector
            </label>
            <label style={{ fontSize: '0.9rem' }}>
              <input type="checkbox" checked={form.hasGpu} onChange={(event) => updateForm('hasGpu', event.target.checked)} /> GPU
            </label>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap' }}>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : editingId ? 'Update resource' : 'Add resource'}</button>
            {editingId && <button type="button" className="btn-outline" onClick={resetForm}>Cancel edit</button>}
          </div>
        </form>

        <div className="toolbar-row" style={{ marginBottom: '1rem' }}>
          <input className="form-input" placeholder="Search name, type, location..." value={search} onChange={(event) => setSearch(event.target.value)} />
          <select className="form-input" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
            <option value="">All types</option>
            {resourceTypes.map((resourceType) => <option key={resourceType} value={resourceType}>{resourceType}</option>)}
          </select>
          <select className="form-input" value={availabilityFilter} onChange={(event) => setAvailabilityFilter(event.target.value)}>
            <option value="">All availability</option>
            <option value="available">Available</option>
            <option value="unavailable">Unavailable</option>
          </select>
          <button type="button" className="btn-outline" onClick={load}>Refresh</button>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center' }}>Loading resources...</p>
        ) : filteredResources.length === 0 ? (
          <div className="empty-state"><p>No resources match your filters.</p></div>
        ) : (
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {Object.entries(groupedResources).map(([category, categoryResources]) => (
              <section key={category}>
                <button
                  type="button"
                  className="card"
                  onClick={() => toggleCategory(category)}
                  style={{
                    width: '100%',
                    padding: '1rem 1.25rem',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    textAlign: 'left',
                  }}
                >
                  <span>
                    <span className="heading-serif" style={{ fontSize: '1.35rem' }}>{category}</span>
                    <span style={{ color: 'var(--text-muted)', marginLeft: '0.75rem' }}>{categoryResources.length} resources</span>
                  </span>
                  <span style={{ color: 'var(--accent-color)', fontWeight: 800 }}>
                    {openCategories[category] ? 'Hide ▲' : 'Show ▼'}
                  </span>
                </button>

                {openCategories[category] && (
                  <div style={{ display: 'grid', gap: '0.75rem', marginTop: '0.75rem' }}>
                    {categoryResources.map((resource) => (
                      <div key={getResourceId(resource)} className="card" style={{ padding: '1rem 1.25rem', display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', alignItems: 'center' }}>
                        <div>
                          <strong>{resource.name}</strong>
                          <span style={{ color: 'var(--text-muted)' }}> · {resource.location}</span>
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.35rem' }}>
                            Capacity {resource.capacity || 0}
                            {resource.price_per_hour ? ` · ₹${Number(resource.price_per_hour).toLocaleString()}/hr` : ''}
                            {resource.hasProjector ? ' · Projector' : ''}
                            {resource.hasGpu ? ' · GPU' : ''}
                            {' · '}
                            <span style={{ color: resource.available === false ? '#991b1b' : '#15803d', fontWeight: 700 }}>
                              {resource.available === false ? 'Unavailable' : 'Available'}
                            </span>
                          </p>
                          {resource.description && <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.35rem' }}>{resource.description}</p>}
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                          <button type="button" className="btn-outline" onClick={() => handleEdit(resource)}>Edit</button>
                          <button type="button" className="btn-outline" onClick={() => handleToggleAvailability(resource)}>
                            {resource.available === false ? 'Available' : 'Unavailable'}
                          </button>
                          <button type="button" className="btn-outline" style={{ color: '#991b1b', borderColor: '#fecaca' }} onClick={() => handleDelete(resource)}>Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminResources;
