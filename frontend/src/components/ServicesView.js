import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ServiceMeasurementForm = ({ currentObra, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    service_name: '',
    description: '',
    quantity: '',
    unit: '',
    status: 'iniciado',
    start_date: '',
    end_date: '',
    signature_data: '',
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
        quantity: parseFloat(formData.quantity) || 0,
        start_date: new Date(formData.start_date).toISOString(),
        end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null
      };
      await onSubmit(submitData);
      setFormData({
        service_name: '',
        description: '',
        quantity: '',
        unit: '',
        status: 'iniciado',
        start_date: '',
        end_date: '',
        signature_data: '',
        observations: ''
      });
    } finally {
      setLoading(false);
    }
  };

  // Set default start date to today
  const today = new Date().toISOString().split('T')[0];

  if (!currentObra) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-600">Selecione uma obra para registrar medições.</p>
      </div>
    );
  }

  return (
    <div className="p-4 pb-20">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Nova Medição de Serviço</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Serviço</label>
            <input
              type="text"
              value={formData.service_name}
              onChange={(e) => setFormData({...formData, service_name: e.target.value})}
              placeholder="Ex: Concretagem de laje, Alvenaria, Pintura"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={3}
              placeholder="Descreva detalhadamente o serviço executado..."
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
                <option value="metros²">Metros²</option>
                <option value="metros³">Metros³</option>
                <option value="metros">Metros</option>
                <option value="unidade">Unidade</option>
                <option value="quilos">Quilos</option>
                <option value="toneladas">Toneladas</option>
                <option value="horas">Horas</option>
                <option value="dias">Dias</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="iniciado">Iniciado</option>
              <option value="em_andamento">Em Andamento</option>
              <option value="concluido">Concluído</option>
              <option value="pausado">Pausado</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Data de Início</label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                max={today}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Data de Fim (opcional)</label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                min={formData.start_date}
                max={today}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Observações (opcional)</label>
            <textarea
              value={formData.observations}
              onChange={(e) => setFormData({...formData, observations: e.target.value})}
              rows={2}
              placeholder="Observações adicionais sobre o serviço..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-blue-800">
                <p className="font-medium">Assinatura Digital</p>
                <p>A funcionalidade de assinatura digital será implementada em breve para validar as medições.</p>
              </div>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              {loading ? 'Salvando...' : 'Registrar Medição'}
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

const ServicesView = ({ currentObra, onNavigate }) => {
  const [serviceMeasurements, setServiceMeasurements] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadServiceMeasurements = async () => {
    if (!currentObra) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`${API}/service-measurements/obra/${currentObra.id}`);
      setServiceMeasurements(response.data);
    } catch (error) {
      console.error('Error loading service measurements:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServiceMeasurements();
  }, [currentObra]);

  const handleCreateMeasurement = async (formData) => {
    try {
      await axios.post(`${API}/service-measurements`, formData);
      await loadServiceMeasurements();
      onNavigate('services');
    } catch (error) {
      console.error('Error creating service measurement:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'iniciado': 'bg-blue-100 text-blue-800',
      'em_andamento': 'bg-yellow-100 text-yellow-800',
      'concluido': 'bg-green-100 text-green-800',
      'pausado': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'iniciado': 'Iniciado',
      'em_andamento': 'Em Andamento',
      'concluido': 'Concluído',
      'pausado': 'Pausado'
    };
    return labels[status] || status;
  };

  if (!currentObra) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-600">Selecione uma obra para ver as medições de serviço.</p>
      </div>
    );
  }

  return (
    <div className="p-4 pb-20">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Medições de Serviço</h2>
        <button
          onClick={() => onNavigate('service-form')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Nova Medição
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Carregando medições...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {serviceMeasurements.map(measurement => (
            <div key={measurement.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-gray-800 text-lg">{measurement.service_name}</h3>
                  <p className="text-sm text-gray-600">
                    Medido por: {measurement.user_name} em {new Date(measurement.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(measurement.status)}`}>
                  {getStatusLabel(measurement.status)}
                </span>
              </div>
              
              <div className="mb-3">
                <p className="text-gray-600 text-sm">{measurement.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Quantidade:</span>
                  <p className="text-gray-600">{measurement.quantity} {measurement.unit}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Período:</span>
                  <p className="text-gray-600">
                    {new Date(measurement.start_date).toLocaleDateString('pt-BR')}
                    {measurement.end_date && ` - ${new Date(measurement.end_date).toLocaleDateString('pt-BR')}`}
                  </p>
                </div>
              </div>

              {measurement.observations && (
                <div className="mb-3">
                  <span className="font-medium text-gray-700 text-sm">Observações:</span>
                  <p className="text-gray-600 text-sm mt-1">{measurement.observations}</p>
                </div>
              )}

              {measurement.signature_data && (
                <div className="mt-3 p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm text-green-800 font-medium">Medição assinada digitalmente</span>
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {serviceMeasurements.length === 0 && (
            <div className="text-center py-8">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-gray-600">Nenhuma medição de serviço registrada ainda</p>
              <button
                onClick={() => onNavigate('service-form')}
                className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Registrar Primeira Medição
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export { ServicesView, ServiceMeasurementForm };