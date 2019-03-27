import { createAsyncAction } from "typesafe-actions";
import api from "../../api";
import { Dispatch } from "redux";
import { Thing, ThingProperty } from "../../models/Thing";
import { ThingProperties } from "../reducers/properties";

export const fetchThingPropertiesAction = createAsyncAction(
  "FETCH_THING_PROPERTY_REQUEST",
  "FETCH_THING_PROPERTY_SUCCESS",
  "FETCH_THING_PROPERTY_FAILURE"
)<void, ThingProperties, string>();

export function fetchThingProperties(thingId: string) {
  return async (dispatch: Dispatch) => {
    dispatch(fetchThingPropertiesAction.request());

    try {
      const properties: ThingProperties = await api.fetchThingProperties(
        thingId
      );

      dispatch(fetchThingPropertiesAction.success(properties));
    } catch (e) {
      dispatch(fetchThingPropertiesAction.failure(e.toString()));
    }
  };
}
