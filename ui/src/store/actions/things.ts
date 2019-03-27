import { createAsyncAction } from "typesafe-actions";
import api from "../../api";
import { Dispatch } from "redux";
import { ThingMap } from "../reducers/things";
import { ThingProperties } from "../reducers/properties";

export const fetchThingsAction = createAsyncAction(
  "FETCH_THINGS_REQUEST",
  "FETCH_THINGS_SUCCESS",
  "FETCH_THINGS_FAILURE"
)<void, ThingMap, string>();

export const fetchThingsWithPropertyValuesAction = createAsyncAction(
  "FETCH_THINGS_WITH_PROPERTY_VALUES_REQUEST",
  "FETCH_THINGS_WITH_PROPERTY_VALUES_SUCCESS",
  "FETCH_THINGS_WITH_PROPERTY_VALUES_FAILURE"
)<void, { things: ThingMap; properties: ThingProperties[] }, string>();

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

export function fetchThingsWithPropertyValues() {
  return async (dispatch: Dispatch) => {
    dispatch(fetchThingsWithPropertyValuesAction.request());

    try {
      const things: ThingMap = await api.fetchThings();

      const properties: ThingProperties[] = await Promise.all(
        Object.keys(things).map(id => api.fetchThingProperties(id))
      );

      const thingsWithProperty = {
        things,
        properties
      };

      dispatch(fetchThingsWithPropertyValuesAction.success(thingsWithProperty));
    } catch (e) {
      dispatch(fetchThingsWithPropertyValuesAction.failure(e.toString()));
    }
  };
}
