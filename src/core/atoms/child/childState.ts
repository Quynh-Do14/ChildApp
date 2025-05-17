import { atom } from "recoil";

export const ChildState = atom({
    key: 'CHILD_STATE', // unique ID (with respect to other atoms/selectors)
    default: {
        // isLoading: false,
        // uri: '',
        data: <any>{}
    }, // default value (aka initial value)
});