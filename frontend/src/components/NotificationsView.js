import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const NotificationsView = ({ currentObra, onNavigate }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadNotifications = async () => {
    if (!currentObra) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`${API}/notifications/obra/${currentObra.id}`);
      setNotifications(response.data);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [currentObra]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await axios.put(`${API}/notifications/${notificationId}/read`);
      await loadNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      'diary': 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
      'photo': 'M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z',
      'material_request': 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
      'service_measurement': 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
    };
    return icons[type] || 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
  };

  const getNotificationColor = (type) => {
    const colors = {
      'diary': 'bg-green-100 text-green-600',
      'photo': 'bg-purple-100 text-purple-600',
      'material_request': 'bg-orange-100 text-orange-600',
      'service_measurement': 'bg-blue-100 text-blue-600'
    };
    return colors[type] || 'bg-gray-100 text-gray-600';
  };

  const getNotificationLabel = (type) => {
    const labels = {
      'diary': 'Diário de Obra',
      'photo': 'Foto',
      'material_request': 'Solicitação de Material',
      'service_measurement': 'Medição de Serviço'
    };
    return labels[type] || 'Notificação';
  };

  const handleNavigateToSource = (type) => {
    const navigation = {
      'diary': 'diary',
      'photo': 'photos',
      'material_request': 'materials',
      'service_measurement': 'services'
    };
    
    if (navigation[type]) {
      onNavigate(navigation[type]);
    }
  };

  if (!currentObra) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-600">Selecione uma obra para ver as notificações.</p>
      </div>
    );
  }

  return (
    <div className="p-4 pb-20">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Notificações</h2>
        {notifications.some(n => !n.is_read) && (
          <button
            onClick={() => {
              notifications.forEach(n => {
                if (!n.is_read) {
                  handleMarkAsRead(n.id);
                }
              });
            }}
            className="text-blue-600 text-sm hover:text-blue-700 transition-colors"
          >
            Marcar todas como lidas
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Carregando notificações...</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map(notification => (
            <div 
              key={notification.id} 
              className={`bg-white rounded-xl shadow-sm border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-shadow ${
                !notification.is_read ? 'border-l-4 border-l-blue-500' : ''
              }`}
              onClick={() => {
                if (!notification.is_read) {
                  handleMarkAsRead(notification.id);
                }
                handleNavigateToSource(notification.type);
              }}
            >
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg ${getNotificationColor(notification.type)}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={getNotificationIcon(notification.type)} />
                  </svg>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-800 truncate">{notification.title}</h3>
                    {!notification.is_read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 ml-2"></div>
                    )}
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-2">{notification.message}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getNotificationColor(notification.type)}`}>
                      {getNotificationLabel(notification.type)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(notification.created_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {notifications.length === 0 && (
            <div className="text-center py-8">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-3.5-3.5a2.121 2.121 0 010-3L20 7h-5M9 17H4l3.5-3.5a2.121 2.121 0 000-3L4 7h5" />
              </svg>
              <p className="text-gray-600">Nenhuma notificação ainda</p>
              <p className="text-gray-500 text-sm mt-2">
                As notificações aparecerão aqui quando houver atividade na obra
              </p>
            </div>
          )}
        </div>
      )}
      
      {notifications.length > 0 && (
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            {notifications.filter(n => !n.is_read).length} não lidas de {notifications.length} total
          </p>
        </div>
      )}
    </div>
  );
};

export default NotificationsView;