export default {
    components:{
        bookingInfo:()=>import('./BookingInfo.vue'),
        bookingSlotInformation:()=>import('./BookingSlotInformation.vue'),
        bookingInternalAttendees:()=>import('./InternalAttendeeList.vue'),
        bookingExternalAttendees:()=>import('./ExternalAttendeesList.vue')
    }
}

