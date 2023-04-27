import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { map, prop, propOr } from 'ramda';
import Breadcrumb from '../components/Breadcrumb';
import Loadable from '../components/Loadable';

export default ({}) => {
  const { uid } = useParams();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initial = async () => {
      setLoading(true);

      setLoading(false);
    };
    initial();
  }, []);

  return (
    <div className="min-h-full">
      <div className="p-5 bg-white">
        <Breadcrumb items={[{ title: 'Columns', path: 'columns' }]} />
        <Loadable loading={loading}>
          
        </Loadable>
      </div>
    </div>
  );
};
