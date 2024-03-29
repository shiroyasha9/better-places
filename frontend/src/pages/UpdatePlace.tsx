import '@styles/NewPlace.css';

import { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Button from '@components/shared/Button';
import Card from '@components/shared/Card';
import ErrorModal from '@components/shared/ErrorModal';
import Input from '@components/shared/Input';
import LoadingSpinner from '@components/shared/LoadingSpinner';
import { AuthContext } from '@context/authContext';
import useForm from '@hooks/formHook';
import { useHttpClient } from '@hooks/httpHook';
import { IGetPlaceResponse, IPlace } from '@types';
import { VALIDATOR_MINLENGTH, VALIDATOR_REQUIRE } from '@utils/validators';

const UpdatePlace = () => {
  const { isLoading, error, sendRequest, clearError } =
    useHttpClient<IGetPlaceResponse>();
  const [loadedPlace, setLoadedPlace] = useState<IPlace>();
  const placeId = useParams<{ placeId: string }>().placeId;
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);

  const [formState, inputHandler, setFormData] = useForm(
    {
      title: {
        value: '',
        isValid: false
      },
      description: {
        value: '',
        isValid: false
      }
    },
    false
  );

  useEffect(() => {
    const fetchPlace = async () => {
      try {
        const responseData = await sendRequest(
          `${import.meta.env.VITE_BACKEND_URL}/places/${placeId}`
        );
        setLoadedPlace(responseData.place);
        setFormData(
          {
            title: {
              value: responseData.place.title,
              isValid: true
            },
            description: {
              value: responseData.place.description,
              isValid: true
            }
          },
          true
        );
      } catch (err) {}
    };
    fetchPlace();
  }, [sendRequest, placeId, setFormData]);

  const placeUpdateSubmitHandler = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await sendRequest(
        `${import.meta.env.VITE_BACKEND_URL}/places/${placeId}`,
        'PATCH',
        {
          title: formState.inputs.title.value,
          description: formState.inputs.description.value
        },
        {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authContext.token}`
        }
      );
      navigate(`/${authContext.userId}/places`);
    } catch (err) {}
  };

  if (isLoading) {
    return (
      <div className='center'>
        <LoadingSpinner />
      </div>
    );
  }

  if (!loadedPlace && !error) {
    return (
      <div className='center'>
        <Card>
          <h2>Could not find place!</h2>
        </Card>
      </div>
    );
  }

  return (
    <>
      {error && <ErrorModal error={error} onClear={clearError} />}
      {!isLoading && loadedPlace && (
        <form className='place-form' onSubmit={placeUpdateSubmitHandler}>
          <Input
            id='title'
            element='input'
            label='Title'
            validators={[VALIDATOR_REQUIRE()]}
            errorText='Please enter a valid text.'
            type='text'
            onInput={inputHandler}
            initialValue={loadedPlace.title}
            initialValid={true}
          />
          <Input
            id='description'
            element='textarea'
            label='Description'
            validators={[VALIDATOR_MINLENGTH(5)]}
            errorText='Please enter a valid description (min 5 characters).'
            onInput={inputHandler}
            initialValue={loadedPlace.description}
            initialValid={true}
          />
          <Button type='submit' disabled={!formState.isValid}>
            UPDATE PLACE
          </Button>
        </form>
      )}
    </>
  );
};

export default UpdatePlace;
