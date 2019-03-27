import actions, { RootActions } from "../actions";
import { getType } from "typesafe-actions";

export type Properties = { [key: string]: any };

export type ThingProperties = {
  id: string;
  properties: Properties;
};

export type ThingsPropertiesState = {
  readonly properties: { [id: string]: Properties };
};

export const initialState: ThingsPropertiesState = {
  properties: {}
};

export default (
  state: ThingsPropertiesState = initialState,
  action: RootActions
): ThingsPropertiesState => {
  switch (action.type) {
    case getType(actions.properties.fetchThingPropertiesAction.success):
      return {
        ...state,
        properties: {
          ...state.properties,
          [action.payload.id]: action.payload.properties
        }
      };

    case getType(actions.things.fetchThingsWithPropertyValuesAction.success):
      const newProperties = action.payload.properties.reduce(
        (obj, thingProp) => {
          obj[thingProp.id] = thingProp.properties;

          return obj;
        },
        {} as { [id: string]: Properties }
      );

      return {
        ...state,
        properties: newProperties
      };

    default:
      return state;
  }
};
