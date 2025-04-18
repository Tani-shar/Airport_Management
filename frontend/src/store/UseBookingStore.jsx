import {create} from "zustand";

const useBookingStore = create((set)=> ({
    passengers: 1,
    flight : null,
    user_id : null,
    booking_id : null,
    setBookingId: (booking_id)=> set({booking_id: booking_id}),
    setPassengers: (num)=> set({passengers: num}),
    setFlight: (flight)=> set({flight: flight}),
    setUserId: (user_id)=> set({user_id: user_id}),

}));

export default useBookingStore;