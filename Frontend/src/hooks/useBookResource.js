import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { createBooking, ensureCatalogResource } from '../utils/api';
import { isAuthenticated } from '../utils/auth';

export function useBookResource() {
  const navigate = useNavigate();
  const [selectedResource, setSelectedResource] = useState(null);
  const [resolving, setResolving] = useState(false);

  const handleBookExternal = async (external) => {
    if (!isAuthenticated()) {
      toast.error("Login required to make a reservation.");
      navigate('/login');
      return;
    }
    setResolving(true);
    try {
      const dbResource = await ensureCatalogResource({
        catalogId: external.id,
        name: external.name,
        type: external.type,
        location: external.location,
        capacity: external.capacity,
        price_per_hour: external.price_per_hour,
        image: external.image,
      });
      setSelectedResource(dbResource);
    } catch {
      toast.error('Could not start booking. Please sign in and try again in a moment.');
    } finally {
      setResolving(false);
    }
  };

  const handleConfirmBooking = async (details) => {
    try {
      await createBooking(details);
      setSelectedResource(null);
      toast.success('Booking created successfully!');
      navigate('/bookings');
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.message;
      toast.error(
        msg && !msg.includes('could not execute statement')
          ? msg
          : 'Booking could not be completed. Please try again.'
      );
    }
  };

  return {
    selectedResource,
    setSelectedResource,
    handleBookExternal,
    handleConfirmBooking,
    resolving,
  };
}
