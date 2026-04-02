export const initialState = {
    books: null,
  };
  
export const actionTypes = {
    BOOKS: "BOOKS",
    CLEAR: "CLEAR",
};
  
const reducer = (state, action) => {
    switch (action.type) {
        case actionTypes.BOOKS:
            return {
                ...state,
                books: action.books,
            };
        case actionTypes.CLEAR:
            return initialState;

        default:
            return state;
    }
};
  
export default reducer;