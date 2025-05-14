import { atom } from "recoil";

export const RoomState = atom({
    key: 'ROOM_STATE', // unique ID (with respect to other atoms/selectors)
    default: {
        // isLoading: false,
        // uri: '',
        data: <any>{}
    }, // default value (aka initial value)
});