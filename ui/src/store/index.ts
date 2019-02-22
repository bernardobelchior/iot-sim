import { applyMiddleware, createStore } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import thunk from "redux-thunk";
import rootReducer from "./reducers";

const middleware = () => applyMiddleware(thunk);
const enhancer =
  process.env.NODE_ENV === "development"
    ? composeWithDevTools(middleware())
    : middleware();

export default createStore(rootReducer, enhancer);
