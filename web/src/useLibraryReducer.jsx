export const initialState = {
    books: null,
  };
  
export const actionTypes = {
BOOKS: "BOOKS",
};
  
const reducer = (state, action) => {
    switch (action.type) {
        case actionTypes.BOOKS:
        return {
            ...state,
            books: action.books,
        };

        default:
        return state;
    }
};
  
export default reducer;