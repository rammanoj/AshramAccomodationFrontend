const BASE_API_URI = "https://aabsoftware.herokuapp.com/";
// const BASE_API_URI = "http://127.0.0.1:8000/";

// method: POST
export const login = BASE_API_URI + "accounts/login/";
// method: POST
export const signup = BASE_API_URI + "accounts/signup/";
// method: POST
export const forgotPassword = BASE_API_URI + "accounts/forgot_password/";
// method: POST
export const mobileverify = BASE_API_URI + "accounts/mobile-verify/";
// method: POST
export const mobileverifyResend = BASE_API_URI + "accounts/mobile-resend/";
// method: GET, PATCH
export const profile = BASE_API_URI + "accounts/update/";
// method: PATCH
export const passwordUpdate = BASE_API_URI + "accounts/password_update/";
// method: POST
export const logout = BASE_API_URI + "accounts/logout/";
// method: GET
export const userListView = BASE_API_URI + "accounts/users/";
// method: POST
export const searchRooms = BASE_API_URI + "rooms/search/";
// method: POST
export const adminRegisterGenerate = BASE_API_URI + "accounts/admin-link/";
// method: POST
export const adminRegisterValidate =
  BASE_API_URI + "accounts/validate/adminlink/";
// method: GET
export const adminRegister = BASE_API_URI + "accounts/admin-register/";
// method: GET
export const getBookings = BASE_API_URI + "rooms/bookings";
// method: GET
export const createBooking = BASE_API_URI + "rooms/book/";
//method: POST
export const userAccess = BASE_API_URI + "accounts/update/access/";
// method: POST
export const roomCreateView = BASE_API_URI + "rooms/create/";
// method: GET
export const roomListView = BASE_API_URI + "rooms/rooms/";
// method: GET
export const roomDelete = BASE_API_URI + "rooms/delete/";
// method: POST
export const blockUnblockRoom = BASE_API_URI + "rooms/blockroom/";
// method: PATCH
export const bookingUpdate = BASE_API_URI + "rooms/booking/update/";
// method: PATCH
export const bookingDelete = BASE_API_URI + "rooms/booking/delete/";
// method: POST
export const bookingStatusUpdate = BASE_API_URI + "rooms/update/status/";
// method: GET, POST, DELETE
export const blockListCreateDelete = BASE_API_URI + "rooms/block/";

/* List of All States */
