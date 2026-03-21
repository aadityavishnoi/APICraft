import { useState, useEffect } from 'react';
import api from '../api';
import { Search, Plus, Trash2, Server, GripVertical } from 'lucide-react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CopyButton } from '../components/CopyButton';
import { ConfirmModal } from '../components/ConfirmModal';
import { GlassCard } from '../components/GlassCard';

const SortableField = ({ id, field, updateField, removeField }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition, display: 'flex', gap: '1rem', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '0.8rem', borderRadius: '6px', border: '1px solid var(--glass-border)', marginBottom: '0.5rem' };
  
  return (
    <div ref={setNodeRef} style={style}>
      <div {...attributes} {...listeners} style={{ cursor: 'grab', color: 'var(--text-muted)' }}><GripVertical size={18} /></div>
      <input type="text" placeholder="Field Name" value={field.name} onChange={e => updateField(id, 'name', e.target.value)} style={{ flex: 1, padding: '0.5rem' }} />
      <select value={field.type} onChange={e => updateField(id, 'type', e.target.value)} style={{ width: '120px', padding: '0.5rem' }}>
        <option value="String">String</option><option value="Number">Number</option><option value="Boolean">Boolean</option><option value="Date">Date</option><option value="Array">Array</option>
      </select>
      <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        <input type="checkbox" checked={field.required} onChange={e => updateField(id, 'required', e.target.checked)} style={{ width: 'auto' }} />Req
      </label>
      <button type="button" onClick={() => removeField(id)} style={{ color: '#ff4d4f', padding: '0.4rem', background: 'transparent', border: 'none' }}><Trash2 size={18} /></button>
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

  const fetchCollections = async () => {
    try {
      const { data } = await api.get('/collections');
      setCollections(data);
    } catch(err) { console.error(err); }
  };
  
  useEffect(() => { fetchCollections(); }, []);

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

  const filtered = collections.filter(c => c.collectionName.toLowerCase().includes(search.toLowerCase()));
  const baseUrl = import.meta.env.VITE_API_URL || window.location.origin.replace(':5173', ':5000');

  return (
    <div style={{ display: 'flex', gap: '2rem', height: '100%' }}>
      {/* Left List */}
      <div className="glass-card" style={{ width: '320px', display: 'flex', flexDirection: 'column', padding: 0 }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--glass-border)' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', top: '12px', left: '12px', color: 'var(--text-muted)' }} />
            <input type="text" placeholder="Search schemas..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '2.5rem' }} />
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
          <button onClick={() => { setActiveCol(null); setNewColName(''); setFields([{ id: `f${Date.now()}`, name: '', type: 'String', required: false }]); }}
                  style={{ width: '100%', padding: '1rem', marginBottom: '1rem', border: '1px dashed var(--accent-primary)', color: 'var(--accent-primary)', borderRadius: '8px', background: 'rgba(0,212,255,0.05)' }}>
            <Plus size={16} /> New Collection
          </button>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {filtered.map(c => (
              <button key={c._id} onClick={() => setActiveCol(c)}
                      style={{ padding: '1rem', textAlign: 'left', background: activeCol?._id === c._id ? 'rgba(0, 212, 255, 0.1)' : 'rgba(255,255,255,0.02)', border: '1px solid', borderColor: activeCol?._id === c._id ? 'var(--accent-primary)' : 'var(--glass-border)', borderRadius: '8px', color: 'var(--text-main)', display: 'block', width: '100%' }}>
                <div style={{ fontWeight: 'bold' }}>/{c.collectionName}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{c.fields.length} fields</div>
              </button>
            ))}
            {filtered.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1rem', fontSize: '0.9rem' }}>No collections match search.</p>}
          </div>
        </div>
      </div>

      {/* Right Detail / Form */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {!activeCol ? (
          <GlassCard style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-sans)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Server size={24} color="var(--accent-primary)" /> Create Collection Schema
            </h2>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', marginBottom: '0.8rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Collection Name (Slug)</label>
                <input required type="text" placeholder="e.g. products" value={newColName} onChange={e => setNewColName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} style={{ fontSize: '1.2rem', padding: '1rem' }} />
                <div style={{ fontSize: '0.85rem', color: 'var(--accent-secondary)', marginTop: '0.8rem' }}>
                  Base Path: /api/{newColName || '...'}
                </div>
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                  <label style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Fields & Types</label>
                  <button type="button" onClick={addField} style={{ border: '1px solid var(--accent-primary)', color: 'var(--accent-primary)', padding: '0.4rem 0.8rem', borderRadius: '4px' }}><Plus size={16} /> Add Field</button>
                </div>
                
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={fields.map(f => f.id)} strategy={verticalListSortingStrategy}>
                    {fields.map(field => (
                      <SortableField key={field.id} id={field.id} field={field} updateField={updateField} removeField={removeField} />
                    ))}
                  </SortableContext>
                </DndContext>
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '2rem', borderTop: '1px solid var(--glass-border)' }}>
                <button type="submit" className="btn-primary" disabled={!newColName || fields.length === 0} style={{ padding: '1rem 2rem', fontSize: '1.1rem', width: '100%' }}>
                  Create Collection
                </button>
              </div>
            </form>
          </GlassCard>
        ) : (
          <GlassCard style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid var(--glass-border)' }}>
              <div>
                <h2 style={{ fontSize: '2.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem', fontFamily: 'var(--font-mono)' }}>
                  <Server size={32} color="var(--accent-primary)" /> /{activeCol.collectionName}
                </h2>
                <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '1rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                  <div style={{ color: 'var(--accent-secondary)', marginBottom: '0.5rem' }}>// schema_fields</div>
                  {activeCol.fields.join(' | ')}
                </div>
              </div>
              <button type="button" onClick={() => setDeleteTarget(activeCol)} className="btn-danger" style={{ background: 'rgba(255, 77, 79, 0.1)', color: '#ff4d4f', border: '1px solid rgba(255,77,79,0.3)', padding: '0.6rem 1rem' }}><Trash2 size={16} /> Delete</button>
            </div>

            <h3 style={{ marginBottom: '1.5rem', color: 'var(--accent-primary)' }}>Endpoints</h3>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ color: 'var(--text-muted)', textAlign: 'left', borderBottom: '1px solid var(--glass-border)' }}>
                    <th style={{ padding: '1rem 0' }}>Method</th>
                    <th>Endpoint</th>
                    <th>Description</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { m: 'GET', e: `/api/${activeCol.collectionName}`, d: 'Get all docs' },
                    { m: 'POST', e: `/api/${activeCol.collectionName}`, d: 'Create document' },
                    { m: 'GET', e: `/api/${activeCol.collectionName}/:id`, d: 'Get by ID' },
                    { m: 'PUT', e: `/api/${activeCol.collectionName}/:id`, d: 'Update by ID' },
                    { m: 'DELETE', e: `/api/${activeCol.collectionName}/:id`, d: 'Delete by ID' }
                  ].map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                      <td style={{ padding: '1.2rem 0' }}>
                        <span style={{ color: row.m==='GET'?'#00D4FF':row.m==='POST'?'#34d399':row.m==='PUT'?'#fbbf24':'#ff4d4f', fontWeight: 'bold' }}>{row.m}</span>
                      </td>
                      <td style={{ color: 'var(--text-main)' }}>{row.e}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{row.d}</td>
                      <td style={{ textAlign: 'right' }}>
                        <CopyButton text={`${baseUrl}${row.e}`} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        )}
      </div>

      <ConfirmModal 
        isOpen={!!deleteTarget}
        title={`DELETE /${deleteTarget?.collectionName}`}
        text="This will permanently delete this collection and all underlying data. This action cannot be reversed."
        confirmText="Confirm Deletion"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
export default CollectionsView;
