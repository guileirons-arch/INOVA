import React, { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';
import { PhotosView, PhotoUploadForm } from './components/PhotosView';
import { MaterialsView, MaterialRequestForm } from './components/MaterialsView';
import { ServicesView, ServiceMeasurementForm } from './components/ServicesView';
import NotificationsView from './components/NotificationsView';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Mock authentication system
const mockAuth = {
  currentUser: null,
  login: (user) => {
    mockAuth.currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
  },
  logout: () => {
    mockAuth.currentUser = null;
    localStorage.removeItem('currentUser'); 
  },
  getCurrentUser: () => {
    if (!mockAuth.currentUser) {
      const stored = localStorage.getItem('currentUser');
      if (stored) {
        mockAuth.currentUser = JSON.parse(stored);
      }
    }
    return mockAuth.currentUser;
  }
};

// Components
const LoginScreen = ({ onLogin, users }) => {
  const [selectedUser, setSelectedUser] = useState('');

  const handleLogin = () => {
    if (selectedUser) {
      const user = users.find(u => u.id === selectedUser);
      onLogin(user);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Diário de Obra Digital</h1>
          <p className="text-gray-600">Comunicação ágil entre escritório e canteiro</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Selecionar Usuário</label>
            <select 
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Escolha um usuário...</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name} - {user.role.replace('_', ' ').toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <button 
            onClick={handleLogin}
            disabled={!selectedUser}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Entrar
          </button>
        </div>

        <div className="mt-6 text-xs text-gray-500 text-center">
          <p>Sistema de demonstração - RPG Construtora</p>
        </div>
      </div>
    </div>
  );
};

const Header = ({ user, onLogout, onNavigate, currentView, notifications }) => {
  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <header className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-600 w-10 h-10 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Diário de Obra</h1>
              <p className="text-sm text-gray-600">{user.name} - {user.role.replace('_', ' ')}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => onNavigate('notifications')}
              className={`relative p-2 rounded-lg transition-colors ${
                currentView === 'notifications' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-3.5-3.5a2.121 2.121 0 010-3L20 7h-5M9 17H4l3.5-3.5a2.121 2.121 0 000-3L4 7h5" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            <button
              onClick={onLogout}
              className="text-gray-600 hover:text-gray-800 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

const BottomNavigation = ({ currentView, onNavigate, userRole }) => {
  const navItems = [
    { id: 'dashboard', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z', label: 'Dashboard' },
    { id: 'diary', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', label: 'Diário' },
    { id: 'photos', icon: 'M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z', label: 'Fotos' },
    { id: 'materials', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4', label: 'Materiais' },
    { id: 'services', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', label: 'Serviços' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
      <div className="flex justify-around">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
              currentView === item.id 
                ? 'text-blue-600 bg-blue-50' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
            </svg>
            <span className="text-xs">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

const Dashboard = ({ stats, obras, currentObra, onObraChange }) => {
  return (
    <div className="p-4 pb-20 space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Obra Atual</label>
        <select 
          value={currentObra?.id || ''}
          onChange={(e) => {
            const obra = obras.find(o => o.id === e.target.value);
            onObraChange(obra);
          }}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Selecione uma obra...</option>
          {obras.map(obra => (
            <option key={obra.id} value={obra.id}>{obra.name}</option>
          ))}
        </select>
      </div>

      {currentObra && (
        <>
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
            <h2 className="text-xl font-bold mb-2">{currentObra.name}</h2>
            <p className="opacity-90">{currentObra.location}</p>
            <div className="mt-4 flex items-center text-sm opacity-75">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v16a2 2 0 002 2z" />
              </svg>
              Status: {currentObra.status}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-800">{stats.diary_entries}</p>
                  <p className="text-sm text-gray-600">Diários</p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-800">{stats.photos}</p>
                  <p className="text-sm text-gray-600">Fotos</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-800">{stats.pending_requests}</p>
                  <p className="text-sm text-gray-600">Pendentes</p>
                </div>
                <div className="bg-orange-100 p-3 rounded-lg">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-800">{stats.service_measurements}</p>
                  <p className="text-sm text-gray-600">Medições</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const DiaryForm = ({ currentObra, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    weather: '',
    temperature: '',
    workers_count: '',
    activities: '',
    materials_used: '',
    equipment_used: '',
    incidents: '',
    observations: ''
  });
  
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentObra) return;
    
    setLoading(true);
    try {
      const submitData = {
        ...formData,
        obra_id: currentObra.id,
        workers_count: parseInt(formData.workers_count) || 0
      };
      await onSubmit(submitData);
      setFormData({
        weather: '',
        temperature: '',
        workers_count: '',
        activities: '',
        materials_used: '',
        equipment_used: '',
        incidents: '',
        observations: ''
      });
    } finally {
      setLoading(false);
    }
  };

  if (!currentObra) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-600">Selecione uma obra para registrar o diário.</p>
      </div>
    );
  }

  return (
    <div className="p-4 pb-20">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Novo Diário de Obra</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Clima</label>
              <select
                value={formData.weather}
                onChange={(e) => setFormData({...formData, weather: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Selecione...</option>
                <option value="Ensolarado">Ensolarado</option>
                <option value="Parcialmente nublado">Parcialmente nublado</option>
                <option value="Nublado">Nublado</option>
                <option value="Chuvoso">Chuvoso</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Temperatura</label>
              <input
                type="text"
                value={formData.temperature}
                onChange={(e) => setFormData({...formData, temperature: e.target.value})}
                placeholder="ex: 25°C"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Número de Trabalhadores</label>
            <input
              type="number"
              value={formData.workers_count}
              onChange={(e) => setFormData({...formData, workers_count: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Atividades Realizadas</label>
            <textarea
              value={formData.activities}
              onChange={(e) => setFormData({...formData, activities: e.target.value})}
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Materiais Utilizados</label>
            <textarea
              value={formData.materials_used}
              onChange={(e) => setFormData({...formData, materials_used: e.target.value})}
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Equipamentos Utilizados</label>
            <textarea
              value={formData.equipment_used}
              onChange={(e) => setFormData({...formData, equipment_used: e.target.value})}
              rows={2}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Incidentes (opcional)</label>
            <textarea
              value={formData.incidents}
              onChange={(e) => setFormData({...formData, incidents: e.target.value})}
              rows={2}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Observações (opcional)</label>
            <textarea
              value={formData.observations}
              onChange={(e) => setFormData({...formData, observations: e.target.value})}
              rows={2}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              {loading ? 'Salvando...' : 'Registrar Diário'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DiaryView = ({ currentObra, onNavigate }) => {
  const [diaryEntries, setDiaryEntries] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadDiaryEntries = async () => {
    if (!currentObra) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`${API}/diary-entries/obra/${currentObra.id}`);
      setDiaryEntries(response.data);
    } catch (error) {
      console.error('Error loading diary entries:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDiaryEntries();
  }, [currentObra]);

  const handleCreateDiary = async (formData) => {
    try {
      await axios.post(`${API}/diary-entries`, formData);
      await loadDiaryEntries();
      onNavigate('diary');
    } catch (error) {
      console.error('Error creating diary entry:', error);
    }
  };

  if (!currentObra) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-600">Selecione uma obra para ver os diários.</p>
      </div>
    );
  }

  return (
    <div className="p-4 pb-20">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Diários de Obra</h2>
        <button
          onClick={() => onNavigate('diary-form')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Novo Diário
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Carregando diários...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {diaryEntries.map(entry => (
            <div key={entry.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-gray-800">{entry.user_name}</h3>
                  <p className="text-sm text-gray-600">
                    {new Date(entry.date).toLocaleDateString('pt-BR')} - {entry.weather} ({entry.temperature})
                  </p>
                </div>
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                  {entry.workers_count} trabalhadores
                </span>
              </div>
              
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Atividades:</span>
                  <p className="text-gray-600 mt-1">{entry.activities}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Materiais:</span>
                  <p className="text-gray-600 mt-1">{entry.materials_used}</p>
                </div>
                {entry.incidents && (
                  <div>
                    <span className="font-medium text-gray-700">Incidentes:</span>
                    <p className="text-red-600 mt-1">{entry.incidents}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {diaryEntries.length === 0 && (
            <div className="text-center py-8">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <p className="text-gray-600">Nenhum diário registrado ainda</p>
              <button
                onClick={() => onNavigate('diary-form')}
                className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Criar Primeiro Diário
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [obras, setObras] = useState([]);
  const [currentObra, setCurrentObra] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [stats, setStats] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Initialize sample data
        await axios.post(`${API}/init-sample-data`);
        
        // Load users and obras
        const [usersRes, obrasRes] = await Promise.all([
          axios.get(`${API}/users`),
          axios.get(`${API}/obras`)
        ]);
        
        setUsers(usersRes.data);
        setObras(obrasRes.data);
        
        // Check for stored user
        const storedUser = mockAuth.getCurrentUser();
        if (storedUser && usersRes.data.find(u => u.id === storedUser.id)) {
          setCurrentUser(storedUser);
        }
        
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Load obra-specific data when obra changes
  useEffect(() => {
    const loadObraData = async () => {
      if (!currentObra) return;
      
      try {
        const [statsRes, notificationsRes] = await Promise.all([
          axios.get(`${API}/dashboard/stats/${currentObra.id}`),
          axios.get(`${API}/notifications/obra/${currentObra.id}`)
        ]);
        
        setStats(statsRes.data);
        setNotifications(notificationsRes.data);
      } catch (error) {
        console.error('Error loading obra data:', error);
      }
    };

    loadObraData();
  }, [currentObra]);

  const handleLogin = (user) => {
    mockAuth.login(user);
    setCurrentUser(user);
    
    // Set default obra if user has assigned obras
    if (user.obra_ids.length > 0) {
      const defaultObra = obras.find(o => user.obra_ids.includes(o.id));
      if (defaultObra) {
        setCurrentObra(defaultObra);
      }
    }
  };

  const handleLogout = () => {
    mockAuth.logout();
    setCurrentUser(null);
    setCurrentObra(null);
    setCurrentView('dashboard');
  };

  const handleNavigate = (view) => {
    setCurrentView(view);
  };

  const handleObraChange = (obra) => {
    setCurrentObra(obra);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando aplicação...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} users={users} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        user={currentUser} 
        onLogout={handleLogout}
        onNavigate={handleNavigate}
        currentView={currentView}
        notifications={notifications}
      />
      
      <main className="max-w-4xl mx-auto">
        {currentView === 'dashboard' && (
          <Dashboard 
            stats={stats}
            obras={obras}
            currentObra={currentObra}
            onObraChange={handleObraChange}
          />
        )}
        
        {currentView === 'diary' && (
          <DiaryView 
            currentObra={currentObra}
            onNavigate={handleNavigate}
          />
        )}
        
        {currentView === 'diary-form' && (
          <DiaryForm 
            currentObra={currentObra}
            onSubmit={async (formData) => {
              await axios.post(`${API}/diary-entries`, formData);
              // Reload stats
              if (currentObra) {
                const statsRes = await axios.get(`${API}/dashboard/stats/${currentObra.id}`);
                setStats(statsRes.data);
              }
              handleNavigate('diary');
            }}
            onCancel={() => handleNavigate('diary')}
          />
        )}
        
        {currentView === 'photos' && (
          <div className="p-4 pb-20">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Fotos (Em breve)</h2>
            <div className="bg-white rounded-xl p-8 text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              </svg>
              <p className="text-gray-600">Funcionalidade de fotos será implementada em breve</p>
            </div>
          </div>
        )}
        
        {currentView === 'materials' && (
          <div className="p-4 pb-20">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Solicitações de Material (Em breve)</h2>
            <div className="bg-white rounded-xl p-8 text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <p className="text-gray-600">Funcionalidade de materiais será implementada em breve</p>
            </div>
          </div>
        )}
        
        {currentView === 'services' && (
          <div className="p-4 pb-20">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Medições de Serviço (Em breve)</h2>
            <div className="bg-white rounded-xl p-8 text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-gray-600">Funcionalidade de medições será implementada em breve</p>
            </div>
          </div>
        )}
        
        {currentView === 'notifications' && (
          <div className="p-4 pb-20">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Notificações (Em breve)</h2>
            <div className="bg-white rounded-xl p-8 text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-3.5-3.5a2.121 2.121 0 010-3L20 7h-5M9 17H4l3.5-3.5a2.121 2.121 0 000-3L4 7h5" />
              </svg>
              <p className="text-gray-600">Sistema de notificações será implementado em breve</p>
            </div>
          </div>
        )}
      </main>
      
      <BottomNavigation 
        currentView={currentView}
        onNavigate={handleNavigate}
        userRole={currentUser?.role}
      />
    </div>
  );
}

export default App;