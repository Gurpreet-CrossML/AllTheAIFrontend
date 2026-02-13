// third-party
import { createSlice } from '@reduxjs/toolkit';

/**
 * @method [initialState] initial state for the slice
 */
const initialState = {
    image: null,
    responseImg: null,
    deleteIcon: false,
    disableUpload: false,
    plan: '',
    profileUpdated: false
};

/**
 * @method [slice] initial state for the slice
 */
const slice = createSlice({
    name: 'imageSlice',
    initialState,
    reducers: {
        // HAS ERROR
        updateImageResponse(state, action) {
            state.image = action.payload;
        },

        displayImageResponse(state, action) {
            state.responseImg = action.payload;
        },

        displayDeleteIcon(state, action) {
            state.deleteIcon = action.payload;
        },

        displayActivePlan(state, action) {
            state.plan = action.payload;
        },
        updateDisableUpload(state, action) {
            state.disableUpload = action.payload;
        },
        updateProfileState(state, action) {
            state.profileUpdated = action.payload;
        }
    }
})
// Reducer
export default slice.reducer;

export const { updateImageResponse, displayImageResponse, displayDeleteIcon, displayActivePlan, updateDisableUpload, updateProfileState } = slice.actions