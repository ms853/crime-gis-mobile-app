import { createStore, applyMiddleware, compose } from "redux";
import thunk from 'redux-thunk'; //react-redux middleware 
import reducers from '../reducers';

//create store that will hold the applications state.
export default store = createStore(
    reducers, {}, compose(applyMiddleware(thunk)) //apply the middleware to the store. 
);