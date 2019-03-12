import { createAsyncAction } from "typesafe-actions";
import api from "../../api";
import { Dispatch } from "redux";
import { ThingMap } from "../reducers/things";

export const fetchThingsAction = createAsyncAction(
  "FETCH_THINGS_REQUEST",
  "FETCH_THINGS_SUCCESS",
  "FETCH_THINGS_FAILURE"
)<void, ThingMap, string>();

export function fetchThings() {
  return async (dispatch: Dispatch) => {
    dispatch(fetchThingsAction.request());

    try {
      const things = await api.fetchThings();
      dispatch(fetchThingsAction.success(things));
    } catch (e) {
      dispatch(fetchThingsAction.failure(e.toString()));
    }
  };
}
