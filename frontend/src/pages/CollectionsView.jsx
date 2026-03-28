import { useState, useEffect } from 'react';
import api from '../api';
import { Search, Plus, Trash2, Server, GripVertical, Pencil, Check, X } from 'lucide-react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CopyButton } from '../components/CopyButton';
import { ConfirmModal } from '../components/ConfirmModal';

const SortableField = ({ id, field, updateField, removeField }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = { 
    transform: CSS.Transform.toString(transform), 
    transition, 
    display: 'flex', 
    gap: '0.8rem', 
    alignItems: 'center', 
    background: 'var(--bg-secondary)', 
    padding: '0.6rem 0.8rem', 
    borderRadius: 'var(--radius-sm)', 
    border: '1px solid var(--border)', 
    marginBottom: '0.5rem' 
  };
  
  return (
    <div ref={setNodeRef} style={style}>
      <div {...attributes} {...listeners} style={{ cursor: 'grab', color: 'var(--text-muted)' }}><GripVertical size={16} /></div>
      <input 
        type="text" 
        placeholder="Field Name" 
        value={field.name} 
        onChange={e => updateField(id, 'name', e.target.value)} 
        style={{ flex: 1, padding: '0.4rem 0.6rem' }} 
      />
      <select 
        value={field.type} 
        onChange={e => updateField(id, 'type', e.target.value)} 
        style={{ width: '110px', padding: '0.4rem 0.6rem' }}
      >
        <option value="String">String</option>
        <option value="Number">Number</option>
        <option value="Boolean">Boolean</option>
        <option value="Date">Date</option>
        <option value="Array">Array</option>
      </select>
      <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: 0, cursor: 'pointer', whiteSpace: 'nowrap' }}>
        <input 
          type="checkbox" 
          checked={field.required} 
          onChange={e => updateField(id, 'required', e.target.checked)} 
          style={{ width: '14px', height: '14px', margin: 0 }} 
        />
        Required
      </label>
      <button 
        type="button" 
        className="btn-ghost"
        onClick={() => removeField(id)} 
        style={{ color: 'var(--error)', padding: '0.4rem' }}
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
};

const CollectionsView = () => {
  const [collections, setCollections] = useState([]);
  const [search, setSearch] = useState('');
  const [activeCol, setActiveCol] = useState(null);
  const [newColName, setNewColName] = useState('');
  const [fields, setFields] = useState([{ id: 'f1', name: '', type: 'String', required: false }]);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteRowTarget, setDeleteRowTarget] = useState(null);
  
  const [activeTab, setActiveTab] = useState('endpoints');
  const [collectionData, setCollectionData] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [editingRow, setEditingRow] = useState(null); // row _id being edited
  const [editValues, setEditValues] = useState({}); // field -> value map

  const fetchCollections = async () => {
    try {
      const { data } = await api.get('/collections');
      setCollections(data);
    } catch(err) { console.error(err); }
  };
  
  useEffect(() => { fetchCollections(); }, []);

  const fetchCollectionData = async (name) => {
    setDataLoading(true);
    try {
      const { data } = await api.get(`/collections/${name}/data`);
      setCollectionData(data);
    } catch(err) { console.error(err); } finally { setDataLoading(false); }
  };

  useEffect(() => {
    if (activeCol && activeTab === 'data') {
      fetchCollectionData(activeCol.collectionName);
    }
  }, [activeCol, activeTab]);

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setFields((items) => {
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const addField = () => setFields([...fields, { id: `f${Date.now()}`, name: '', type: 'String', required: false }]);
  const removeField = (id) => setFields(fields.filter(f => f.id !== id));
  const updateField = (id, key, val) => setFields(fields.map(f => f.id === id ? { ...f, [key]: val } : f));

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const formattedFields = fields.filter(f => f.name.trim()).map(f => `${f.name.trim()}:${f.type}:${f.required?'REQ':''}`);
      await api.post('/create-collection', { collectionName: newColName, fields: formattedFields });
      setNewColName(''); setFields([{ id: `f${Date.now()}`, name: '', type: 'String', required: false }]);
      fetchCollections();
      setActiveCol(null);
    } catch(err) { alert(err.response?.data?.message || 'Failed to create collection'); }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/collections/${deleteTarget.collectionName}`);
      setDeleteTarget(null);
      setActiveCol(null);
      fetchCollections();
    } catch(err) { alert('Failed to delete'); }
  };

  const startEditRow = (row) => {
    setEditingRow(row._id);
    const vals = {};
    activeCol.fields.forEach(f => {
      const fieldName = f.split(':')[0];
      vals[fieldName] = row[fieldName] !== undefined ? String(row[fieldName]) : '';
    });
    setEditValues(vals);
  };

  const cancelEditRow = () => {
    setEditingRow(null);
    setEditValues({});
  };

  const handleSaveRow = async (rowId) => {
    try {
      await api.put(`/collections/${activeCol.collectionName}/data/${rowId}`, editValues);
      setEditingRow(null);
      setEditValues({});
      fetchCollectionData(activeCol.collectionName);
    } catch(err) { alert(err.response?.data?.message || 'Failed to update row'); }
  };

  const handleDeleteRow = async () => {
    try {
      await api.delete(`/collections/${activeCol.collectionName}/data/${deleteRowTarget}`);
      setDeleteRowTarget(null);
      fetchCollectionData(activeCol.collectionName);
    } catch(err) { alert('Failed to delete row'); }
  };

  const filtered = collections.filter(c => c.collectionName.toLowerCase().includes(search.toLowerCase()));
  const baseUrl = import.meta.env.VITE_API_URL || window.location.origin.replace(':5173', ':5000');

  return (
    <div style={{ display: 'flex', gap: '1.5rem', height: '100%' }}>
      {/* Left List */}
      <div className="card" style={{ width: '280px', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', top: '10px', left: '10px', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Filter..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              style={{ paddingLeft: '2.2rem', fontSize: '0.85rem' }} 
            />
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
          <button 
            onClick={() => { setActiveCol(null); setNewColName(''); setFields([{ id: `f1`, name: '', type: 'String', required: false }]); }}
            className="btn-secondary"
            style={{ width: '100%', justifyContent: 'flex-start', marginBottom: '0.5rem', fontSize: '0.85rem' }}
          >
            <Plus size={14} /> New Collection
          </button>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {filtered.map(c => (
              <button 
                key={c._id} 
                onClick={() => setActiveCol(c)}
                className={`nav-link ${activeCol?._id === c._id ? 'active' : ''}`}
                style={{ justifyContent: 'space-between', width: '100%' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Server size={14} />
                  <span>{c.collectionName}</span>
                </div>
                <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>{c.fields.length}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right Detail / Form */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {!activeCol ? (
          <div className="card" style={{ flex: 1, padding: '2rem', display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '600', marginBottom: '2rem' }}>Create Collection</h2>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <div style={{ marginBottom: '2rem', maxWidth: '400px' }}>
                <label>Collection ID</label>
                <input 
                  required 
                  type="text" 
                  placeholder="e.g. products, blog_posts" 
                  value={newColName} 
                  onChange={e => setNewColName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} 
                />
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                  Endpoints will be generated at <span className="mono">/api/{newColName || '...'}</span>
                </p>
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Fields</h3>
                  <button type="button" onClick={addField} className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                    <Plus size={14} /> Add Field
                  </button>
                </div>
                
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={fields.map(f => f.id)} strategy={verticalListSortingStrategy}>
                    {fields.map(field => (
                      <SortableField key={field.id} id={field.id} field={field} updateField={updateField} removeField={removeField} />
                    ))}
                  </SortableContext>
                </DndContext>
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
                <button 
                  type="submit" 
                  className="btn-primary" 
                  disabled={!newColName || fields.length === 0} 
                  style={{ padding: '0.8rem 2rem' }}
                >
                  Create Collection
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '2rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h2 style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  /{activeCol.collectionName}
                </h2>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {activeCol.fields.map((f, idx) => (
                    <span key={idx} className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border)' }}>
                      {f}
                    </span>
                  ))}
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setDeleteTarget(activeCol)} 
                className="btn-danger" 
                style={{ fontSize: '0.85rem' }}
              >
                <Trash2 size={16} /> Delete
              </button>
            </div>

            <div style={{ padding: '0 2rem', borderBottom: '1px solid var(--border)', display: 'flex', gap: '2rem' }}>
              <button 
                onClick={() => setActiveTab('endpoints')}
                style={{ 
                  padding: '1rem 0', 
                  fontSize: '0.9rem', 
                  fontWeight: '600', 
                  color: activeTab === 'endpoints' ? 'var(--blue)' : 'var(--text-muted)',
                  borderBottom: `2px solid ${activeTab === 'endpoints' ? 'var(--blue)' : 'transparent'}`,
                  background: 'none',
                  borderTop: 'none',
                  borderLeft: 'none',
                  borderRight: 'none',
                  cursor: 'pointer'
                }}
              >
                Endpoints
              </button>
              <button 
                onClick={() => setActiveTab('data')}
                style={{ 
                  padding: '1rem 0', 
                  fontSize: '0.9rem', 
                  fontWeight: '600', 
                  color: activeTab === 'data' ? 'var(--blue)' : 'var(--text-muted)',
                  borderBottom: `2px solid ${activeTab === 'data' ? 'var(--blue)' : 'transparent'}`,
                  background: 'none',
                  borderTop: 'none',
                  borderLeft: 'none',
                  borderRight: 'none',
                  cursor: 'pointer'
                }}
              >
                Data Preview
              </button>
            </div>

            <div style={{ padding: '2rem', flex: 1, overflowY: 'auto' }}>
              {activeTab === 'endpoints' ? (
                <>
                  <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Available Endpoints</h3>
                  <table>
                    <thead>
                      <tr>
                        <th>Method</th>
                        <th>Endpoint</th>
                        <th>Action</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { m: 'GET', e: `/api/${activeCol.collectionName}`, a: 'Fetch all' },
                        { m: 'POST', e: `/api/${activeCol.collectionName}`, a: 'Create new' },
                        { m: 'GET', e: `/api/${activeCol.collectionName}/:id`, a: 'Fetch single' },
                        { m: 'PUT', e: `/api/${activeCol.collectionName}/:id`, a: 'Update existing' },
                        { m: 'DELETE', e: `/api/${activeCol.collectionName}/:id`, a: 'Delete' }
                      ].map((row, i) => (
                        <tr key={i}>
                          <td>
                            <span className={`badge ${
                              row.m === 'GET' ? 'badge-blue' : 
                              row.m === 'POST' ? 'badge-green' : 
                              'badge-red'
                            }`}>
                              {row.m}
                            </span>
                          </td>
                          <td className="mono" style={{ color: 'var(--text-secondary)' }}>{row.e}</td>
                          <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{row.a}</td>
                          <td style={{ textAlign: 'right' }}>
                            <CopyButton text={`${baseUrl}${row.e}`} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-primary)' }}>Last 100 Records</h3>
                    <button onClick={() => fetchCollectionData(activeCol.collectionName)} className="btn-secondary" style={{ fontSize: '0.8rem' }}>Refresh</button>
                  </div>
                  
                  {dataLoading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading records...</div>
                  ) : collectionData.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border)' }}>
                      <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>No data found in this collection yet.</p>
                      <button onClick={() => setActiveTab('endpoints')} className="btn-primary" style={{ fontSize: '0.85rem' }}>View Endpoints to insert data</button>
                    </div>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ minWidth: '100%' }}>
                        <thead>
                          <tr>
                            <th style={{ width: '50px' }}>_id</th>
                            {activeCol.fields.map((f, i) => (
                              <th key={i}>{f.split(':')[0]}</th>
                            ))}
                            <th style={{ width: '90px', textAlign: 'center' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {collectionData.map((row) => {
                            const isEditing = editingRow === row._id;
                            return (
                              <tr key={row._id}>
                                <td className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }} title={row._id}>
                                  {String(row._id).slice(-6)}...
                                </td>
                                {activeCol.fields.map((f, i) => {
                                  const fieldName = f.split(':')[0];
                                  const val = row[fieldName];
                                  return (
                                    <td key={i} style={{ fontSize: '0.9rem' }}>
                                      {isEditing ? (
                                        <input
                                          value={editValues[fieldName] ?? ''}
                                          onChange={e => setEditValues(prev => ({ ...prev, [fieldName]: e.target.value }))}
                                          style={{ width: '100%', padding: '0.3rem 0.5rem', fontSize: '0.85rem' }}
                                        />
                                      ) : (
                                        typeof val === 'boolean' ? (val ? 'true' : 'false') :
                                        val === null || val === undefined ? <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>null</span> :
                                        String(val)
                                      )}
                                    </td>
                                  );
                                })}
                                <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                                  {isEditing ? (
                                    <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                                      <button
                                        onClick={() => handleSaveRow(row._id)}
                                        className="btn-ghost"
                                        title="Save"
                                        style={{ color: 'var(--green, #22c55e)', padding: '0.3rem' }}
                                      >
                                        <Check size={15} />
                                      </button>
                                      <button
                                        onClick={cancelEditRow}
                                        className="btn-ghost"
                                        title="Cancel"
                                        style={{ color: 'var(--text-muted)', padding: '0.3rem' }}
                                      >
                                        <X size={15} />
                                      </button>
                                    </div>
                                  ) : (
                                    <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                                      <button
                                        onClick={() => startEditRow(row)}
                                        className="btn-ghost"
                                        title="Edit row"
                                        style={{ color: 'var(--blue)', padding: '0.3rem' }}
                                      >
                                        <Pencil size={14} />
                                      </button>
                                      <button
                                        onClick={() => setDeleteRowTarget(row._id)}
                                        className="btn-ghost"
                                        title="Delete row"
                                        style={{ color: 'var(--error)', padding: '0.3rem' }}
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <ConfirmModal 
        isOpen={!!deleteTarget}
        title="Confirm Deletion"
        text={`Are you sure you want to delete the "${deleteTarget?.collectionName}" collection? This will permanently erase all associated data.`}
        confirmText="Delete Collection"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <ConfirmModal 
        isOpen={!!deleteRowTarget}
        title="Delete Row"
        text="Are you sure you want to delete this record? This action cannot be undone."
        confirmText="Delete Row"
        onConfirm={handleDeleteRow}
        onCancel={() => setDeleteRowTarget(null)}
      />
    </div>
  );
};

export default CollectionsView;
