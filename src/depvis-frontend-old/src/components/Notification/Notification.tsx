import { Variant } from 'react-bootstrap/esm/types';
import Toast from 'react-bootstrap/Toast';
import React from 'react'
import './Notification.css'

export interface INotificationData {
  title: string,
  text: string,
  variant?: string,
  delay?: number
  id?: string
}
export interface INotificationProps {
    title: string,
    text: string,
    onClose: Function,
    variant?: string,
    delay?: number
    id: string
}

export const Notification = (props:INotificationProps) => {
    return (
    <Toast className='notification' bg={props.variant} onClose={() => {props.onClose(props.id || '1')}} delay={props.delay || undefined} autohide={props.delay ? true : false}>
      <Toast.Header>
        <strong className="me-auto">{props.title}</strong>
      </Toast.Header>
      <Toast.Body>{props.text} {props.id}</Toast.Body>
    </Toast>
  );
}
