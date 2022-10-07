import React, { useCallback, useState } from 'react';
import { createContext, useContext } from 'react';
import { Container } from 'react-bootstrap';
import { INotificationData, INotificationProps, Notification } from '../components/Notification/Notification';
import '../components/Notification/Notification.css'

const notificationsContext = {
    notifications: [] as INotificationData[],
    addNotification: (notification: INotificationData) => {},
    clearNotification: (notificationId: string) => {}
}

export type NotificationContextValue = typeof notificationsContext;

const NotificationContext = createContext<NotificationContextValue>(notificationsContext);

export const NotificationProvider = ({children}: any) => {
    const [notifications, setNotifications] = useState<INotificationData[]>(notificationsContext.notifications)
    const defaultDelay = 3000;
    const addNotification = useCallback(
        (notification: INotificationData) => {
            const id = Date.now().toString()
            notification.id = id;
            const result = notifications.concat(notification);
            setNotifications(result)
    },[notifications, setNotifications]);

    const clearNotification = useCallback(
        (notificationId: string) => {
            const result = notifications.filter((n) => n.id !== notificationId)
            console.log(result)
        setNotifications(result)
        }, [notifications, setNotifications]);

    const contextValue = {
        notifications, addNotification, clearNotification
    };

    return <NotificationContext.Provider value = {contextValue}>
        
        {children}
        <Container className='notification-container'>
        {notifications.map(n => {
            return <Notification key={n.id} title={n.title} text={n.text} variant={n.variant || 'light'} delay={n.delay || defaultDelay} onClose={clearNotification} id={n.id || '1'}></Notification>
        })}
        </Container>
        </NotificationContext.Provider>
}

export const useNotification = () => useContext(NotificationContext);
