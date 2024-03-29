import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import ErrorModal from '@components/shared/ErrorModal';
import LoadingSpinner from '@components/shared/LoadingSpinner';
import { useHttpClient } from '@hooks/httpHook';
import { IGetUsersPlacesResponse, IPlace } from '@types';

import PlaceList from '../components/places/PlaceList';

const UserPlaces = () => {
  const { isLoading, error, sendRequest, clearError } =
    useHttpClient<IGetUsersPlacesResponse>();
  const [loadedPlaces, setLoadedPlaces] = useState<IPlace[]>([]);

  const userId = useParams<{ userId: string }>().userId;

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const responseData = await sendRequest(
          `${import.meta.env.VITE_BACKEND_URL}/places/user/${userId}`
        );
        setLoadedPlaces(responseData.places);
      } catch (err) {}
    };
    fetchPlaces();
  }, [userId, sendRequest]);

  const placeDeleteHandler = (deletedPlaceId: string) => {
    setLoadedPlaces(prevPlaces =>
      prevPlaces.filter(place => place.id !== deletedPlaceId)
    );
  };

  return (
    <>
      {error && <ErrorModal error={error} onClear={clearError} />}
      {isLoading && (
        <div className='center'>
          <LoadingSpinner />
        </div>
      )}
      {!isLoading && loadedPlaces && (
        <PlaceList items={loadedPlaces} onDeletePlace={placeDeleteHandler} />
      )}
    </>
  );
};

export default UserPlaces;
