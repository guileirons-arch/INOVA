import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PhotoUploadForm = ({ currentObra, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_data: '',
    latitude: null,
    longitude: null
  });
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = event.target.result;
        setFormData({ ...formData, image_data: base64String });
        setImagePreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.log('Erro ao obter localização:', error);
        }
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentObra) return;

    setLoading(true);
    try {
      const submitData = {
        ...formData,
        obra_id: currentObra.id
      };
      await onSubmit(submitData);
      setFormData({
        title: '',
        description: '',
        image_data: '',
        latitude: null,
        longitude: null
      });
      setImagePreview(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getLocation();
  }, []);

  if (!currentObra) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-600">Selecione uma obra para enviar fotos.</p>
      </div>
    );
  }

  return (
    <div className="p-4 pb-20">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Nova Foto</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Título</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Ex: Concretagem laje 3º andar"
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
              placeholder="Descreva o que está sendo mostrado na foto..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Foto</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
            {imagePreview && (
              <div className="mt-4">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg border border-gray-200"
                />
              </div>
            )}
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-sm text-blue-800">
                {formData.latitude && formData.longitude
                  ? `Localização: ${formData.latitude.toFixed(6)}, ${formData.longitude.toFixed(6)}`
                  : 'Obtendo localização...'
                }
              </span>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading || !formData.image_data}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              {loading ? 'Enviando...' : 'Enviar Foto'}
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

const PhotosView = ({ currentObra, onNavigate }) => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadPhotos = async () => {
    if (!currentObra) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`${API}/photos/obra/${currentObra.id}`);
      setPhotos(response.data);
    } catch (error) {
      console.error('Error loading photos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPhotos();
  }, [currentObra]);

  const handleUploadPhoto = async (formData) => {
    try {
      await axios.post(`${API}/photos`, formData);
      await loadPhotos();
      onNavigate('photos');
    } catch (error) {
      console.error('Error uploading photo:', error);
    }
  };

  if (!currentObra) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-600">Selecione uma obra para ver as fotos.</p>
      </div>
    );
  }

  return (
    <div className="p-4 pb-20">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Fotos da Obra</h2>
        <button
          onClick={() => onNavigate('photo-form')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Nova Foto
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Carregando fotos...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {photos.map(photo => (
            <div key={photo.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <img
                src={photo.image_data}
                alt={photo.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 mb-2">{photo.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{photo.description}</p>
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>{photo.user_name}</span>
                  <span>{new Date(photo.timestamp).toLocaleDateString('pt-BR')}</span>
                </div>
                {photo.latitude && photo.longitude && (
                  <div className="flex items-center mt-2 text-xs text-gray-500">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    <span>Localização: {photo.latitude.toFixed(4)}, {photo.longitude.toFixed(4)}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {photos.length === 0 && (
            <div className="col-span-full text-center py-8">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              </svg>
              <p className="text-gray-600">Nenhuma foto enviada ainda</p>
              <button
                onClick={() => onNavigate('photo-form')}
                className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Enviar Primeira Foto
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export { PhotosView, PhotoUploadForm };