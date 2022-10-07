import React from 'react';
import { Card } from 'react-bootstrap';

export interface INodeProps {
  name: string;
  type?: string;
  id: number;
  properties?: any;
  dependency?: [any];
}

export const MyNode = (props: INodeProps) => {
  return (
    <Card style={{ width: '10rem', margin: '0.5rem' }}>
      <Card.Title>{props.name}</Card.Title>
      {props.type && <Card.Title>{props.type}</Card.Title>}
      <Card.Text>
        {props.properties &&
          Object.keys(props.properties).map((p) => {
            return (
              <div>
                {p}: {props.properties[p]}
              </div>
            );
          })}
      </Card.Text>
    </Card>
  );
};
