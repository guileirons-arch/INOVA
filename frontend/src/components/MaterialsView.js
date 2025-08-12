import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const MaterialRequestForm = ({ currentObra, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    material_name: '',
    quantity: '',
    unit: '',
    priority: 'media',
    justification: '',
    needed_date: ''
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
        quantity: parseFloat(formData.quantity) || 0,
        needed_date: new Date(formData.needed_date).toISOString()
      };
      await onSubmit(submitData);
      setFormData({
        material_name: '',
        quantity: '',
        unit: '',
        priority: 'media',
        justification: '',
        needed_date: ''
      });
    } finally {
      setLoading(false);
    }
  };

  if (!currentObra) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-600">Selecione uma obra para solicitar materiais.</p>
      </div>
    );
  }

  // Set default date to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDate = tomorrow.toISOString().split('T')[0];

  return (
    <div className="p-4 pb-20">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Nova Solicitação de Material</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Material</label>
            <input
              type="text"
              value={formData.material_name}
              onChange={(e) => setFormData({...formData, material_name: e.target.value})}
              placeholder="Ex: Cimento Portland, Vergalhão 12mm"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quantidade</label>
              <input
                type="number"
                step="0.01"
                value={formData.quantity}
                onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Unidade</label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({...formData, unit: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Selecione...</option>
                <option value="unidade">Unidade</option>
                <option value="metros">Metros</option>
                <option value="metros²">Metros²</option>
                <option value="metros³">Metros³</option>
                <option value="quilos">Quilos</option>
                <option value="toneladas">Toneladas</option>
                <option value="sacos">Sacos</option>
                <option value="litros">Litros</option>
                <option value="caixas">Caixas</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Prioridade</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({...formData, priority: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="baixa">Baixa</option>
              <option value="media">Média</option>
              <option value="alta">Alta</option>
              <option value="urgente">Urgente</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Data Necessária</label>
            <input
              type="date"
              value={formData.needed_date}
              onChange={(e) => setFormData({...formData, needed_date: e.target.value})}
              min={defaultDate}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Justificativa</label>
            <textarea
              value={formData.justification}
              onChange={(e) => setFormData({...formData, justification: e.target.value})}
              rows={3}
              placeholder="Explique para que será usado o material..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              {loading ? 'Enviando...' : 'Solicitar Material'}
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

const MaterialsView = ({ currentObra, onNavigate, userRole }) => {
  const [materialRequests, setMaterialRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadMaterialRequests = async () => {
    if (!currentObra) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`${API}/material-requests/obra/${currentObra.id}`);
      setMaterialRequests(response.data);
    } catch (error) {
      console.error('Error loading material requests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMaterialRequests();
  }, [currentObra]);

  const handleCreateRequest = async (formData) => {
    try {
      await axios.post(`${API}/material-requests`, formData);
      await loadMaterialRequests();
      onNavigate('materials');
    } catch (error) {
      console.error('Error creating material request:', error);
    }
  };

  const handleStatusChange = async (requestId, newStatus) => {
    try {
      await axios.put(`${API}/material-requests/${requestId}/status`, null, {
        params: { status: newStatus }
      });
      await loadMaterialRequests();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'baixa': 'bg-green-100 text-green-800',
      'media': 'bg-yellow-100 text-yellow-800',
      'alta': 'bg-orange-100 text-orange-800',
      'urgente': 'bg-red-100 text-red-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status) => {
    const colors = {
      'pendente': 'bg-yellow-100 text-yellow-800',
      'aprovado': 'bg-blue-100 text-blue-800',
      'em_compra': 'bg-purple-100 text-purple-800',
      'entregue': 'bg-green-100 text-green-800',
      'rejeitado': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const canChangeStatus = (userRole) => {
    return userRole === 'engenheiro' || userRole === 'tecnico_planejamento';
  };

  if (!currentObra) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-600">Selecione uma obra para ver as solicitações de material.</p>
      </div>
    );
  }

  return (
    <div className="p-4 pb-20">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Solicitações de Material</h2>
        <button
          onClick={() => onNavigate('material-form')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Nova Solicitação
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Carregando solicitações...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {materialRequests.map(request => (
            <div key={request.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-gray-800 text-lg">{request.material_name}</h3>
                  <p className="text-sm text-gray-600">
                    Solicitado por: {request.user_name} em {new Date(request.requested_date).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(request.priority)}`}>
                    {request.priority.toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(request.status)}`}>
                    {request.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Quantidade:</span>
                  <p className="text-gray-600">{request.quantity} {request.unit}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Data necessária:</span>
                  <p className="text-gray-600">{new Date(request.needed_date).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>

              <div className="mb-3">
                <span className="font-medium text-gray-700 text-sm">Justificativa:</span>
                <p className="text-gray-600 text-sm mt-1">{request.justification}</p>
              </div>

              {canChangeStatus(userRole) && request.status === 'pendente' && (
                <div className="flex space-x-2 mt-4">
                  <button
                    onClick={() => handleStatusChange(request.id, 'aprovado')}
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                  >
                    Aprovar
                  </button>
                  <button
                    onClick={() => handleStatusChange(request.id, 'rejeitado')}
                    className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                  >
                    Rejeitar
                  </button>
                </div>
              )}

              {canChangeStatus(userRole) && request.status === 'aprovado' && (
                <div className="flex space-x-2 mt-4">
                  <button
                    onClick={() => handleStatusChange(request.id, 'em_compra')}
                    className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700 transition-colors"
                  >
                    Em Compra
                  </button>
                </div>
              )}

              {canChangeStatus(userRole) && request.status === 'em_compra' && (
                <div className="flex space-x-2 mt-4">
                  <button
                    onClick={() => handleStatusChange(request.id, 'entregue')}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                  >
                    Marcar como Entregue
                  </button>
                </div>
              )}
            </div>
          ))}
          
          {materialRequests.length === 0 && (
            <div className="text-center py-8">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <p className="text-gray-600">Nenhuma solicitação de material ainda</p>
              <button
                onClick={() => onNavigate('material-form')}
                className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Criar Primeira Solicitação
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export { MaterialsView, MaterialRequestForm };