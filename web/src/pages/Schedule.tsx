import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Clock, MapPin, User, ExternalLink } from 'lucide-react';
import { API, authHeaders } from '../api';
import toast from 'react-hot-toast';

interface Event {
  id: string;
  title: string;
  description?: string;
  type: 'MEETING' | 'APPOINTMENT' | 'REMINDER' | 'OTHER';
  startDate: string;
  endDate: string;
  contact?: string;
  location?: string;
  googleEventId?: string;
  createdAt: string;
}

export function Schedule() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'MEETING' as 'MEETING' | 'APPOINTMENT' | 'REMINDER' | 'OTHER',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    contact: '',
    location: ''
  });

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const response = await fetch(`${API}/events`, {
        headers: authHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      } else {
        toast.error('Erro ao carregar eventos');
      }
    } catch (error) {
      toast.error('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
      const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);

      const response = await fetch(`${API}/events`, {
        method: 'POST',
        headers: {
          ...authHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          type: formData.type,
          startDate: startDateTime.toISOString(),
          endDate: endDateTime.toISOString(),
          contact: formData.contact,
          location: formData.location
        })
      });

      if (response.ok) {
        toast.success('Evento criado com sucesso!');
        setFormData({
          title: '', description: '', type: 'MEETING', startDate: '', startTime: '', 
          endDate: '', endTime: '', contact: '', location: ''
        });
        setShowForm(false);
        loadEvents();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Erro ao criar evento');
      }
    } catch (error) {
      toast.error('Erro de conexão');
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'MEETING': return <User className="text-blue-400" size={16} />;
      case 'APPOINTMENT': return <Clock className="text-green-400" size={16} />;
      case 'REMINDER': return <Calendar className="text-yellow-400" size={16} />;
      default: return <Calendar className="text-gray-400" size={16} />;
    }
  };

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case 'MEETING': return 'Reunião';
      case 'APPOINTMENT': return 'Compromisso';
      case 'REMINDER': return 'Lembrete';
      case 'OTHER': return 'Outro';
      default: return type;
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'MEETING': return 'bg-blue-600';
      case 'APPOINTMENT': return 'bg-green-600';
      case 'REMINDER': return 'bg-yellow-600';
      default: return 'bg-gray-600';
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('pt-BR'),
      time: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const today = new Date();
  const todayEvents = events.filter(event => {
    const eventDate = new Date(event.startDate);
    return eventDate.toDateString() === today.toDateString();
  });

  const upcomingEvents = events.filter(event => {
    const eventDate = new Date(event.startDate);
    return eventDate > today;
  }).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-gray-800 rounded-lg p-6 h-48"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-yellow-400">Agenda</h1>
            <p className="text-gray-400 mt-2">Gerencie seus eventos e compromissos</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors"
          >
            <Plus size={20} />
            Novo Evento
          </button>
        </div>

        {/* Today's Events */}
        {todayEvents.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-green-400 mb-4">Eventos de Hoje</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {todayEvents.map(event => {
                const startTime = formatDateTime(event.startDate);
                const endTime = formatDateTime(event.endDate);
                
                return (
                  <div key={event.id} className="bg-green-900/20 border border-green-500/30 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2">
                        {getEventTypeIcon(event.type)}
                        <h3 className="text-lg font-semibold">{event.title}</h3>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${getEventTypeColor(event.type)}`}>
                        {getEventTypeLabel(event.type)}
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock size={16} className="text-green-400" />
                        <span className="text-green-400">
                          {startTime.time} - {endTime.time}
                        </span>
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin size={16} className="text-gray-400" />
                          <span className="text-gray-400">{event.location}</span>
                        </div>
                      )}
                      {event.contact && (
                        <div className="flex items-center gap-2 text-sm">
                          <User size={16} className="text-gray-400" />
                          <span className="text-gray-400">{event.contact}</span>
                        </div>
                      )}
                    </div>

                    {event.description && (
                      <p className="text-sm text-gray-400 mb-4">{event.description}</p>
                    )}

                    <div className="flex gap-2">
                      <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-sm transition-colors">
                        Editar
                      </button>
                      {event.googleEventId && (
                        <button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded text-sm transition-colors flex items-center justify-center gap-1">
                          <ExternalLink size={14} />
                          Google
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Upcoming Events */}
        <div>
          <h2 className="text-xl font-semibold text-blue-400 mb-4">Próximos Eventos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map(event => {
              const startTime = formatDateTime(event.startDate);
              const endTime = formatDateTime(event.endDate);
              
              return (
                <div key={event.id} className="bg-gray-800 rounded-lg p-6 hover:bg-gray-750 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      {getEventTypeIcon(event.type)}
                      <h3 className="text-lg font-semibold">{event.title}</h3>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${getEventTypeColor(event.type)}`}>
                      {getEventTypeLabel(event.type)}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar size={16} className="text-gray-400" />
                      <span className="text-gray-400">{startTime.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock size={16} className="text-gray-400" />
                      <span className="text-gray-400">
                        {startTime.time} - {endTime.time}
                      </span>
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin size={16} className="text-gray-400" />
                        <span className="text-gray-400">{event.location}</span>
                      </div>
                    )}
                    {event.contact && (
                      <div className="flex items-center gap-2 text-sm">
                        <User size={16} className="text-gray-400" />
                        <span className="text-gray-400">{event.contact}</span>
                      </div>
                    )}
                  </div>

                  {event.description && (
                    <p className="text-sm text-gray-400 mb-4">{event.description}</p>
                  )}

                  <div className="flex gap-2">
                    <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-sm transition-colors">
                      Editar
                    </button>
                    {event.googleEventId && (
                      <button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded text-sm transition-colors flex items-center justify-center gap-1">
                        <ExternalLink size={14} />
                        Google
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {events.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="text-gray-600 mx-auto mb-4" size={64} />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">Nenhum evento encontrado</h3>
            <p className="text-gray-500 mb-6">Crie seu primeiro evento para começar</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-3 rounded-lg font-semibold"
            >
              Criar Evento
            </button>
          </div>
        )}
      </div>

      {/* Create Event Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Novo Evento</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Título</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500"
                  placeholder="Título do evento"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tipo</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500"
                >
                  <option value="MEETING">Reunião</option>
                  <option value="APPOINTMENT">Compromisso</option>
                  <option value="REMINDER">Lembrete</option>
                  <option value="OTHER">Outro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Descrição (opcional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500"
                  placeholder="Descrição do evento"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Data de Início</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Hora de Início</label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Data de Fim</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Hora de Fim</label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Local (opcional)</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500"
                  placeholder="Local do evento"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Contato (opcional)</label>
                <input
                  type="text"
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500"
                  placeholder="Nome do contato"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black py-2 rounded-lg font-semibold transition-colors"
                >
                  Criar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
