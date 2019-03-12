import React, { FC } from "react";
import { Thing, ThingProperty } from "../../models/Thing";
import MUIDataTable, {
  MUIDataTableColumnDef,
  MUIDataTableOptions
} from "mui-datatables";
import { Properties } from "../../store/reducers/properties";
import { RootState } from "../../store/reducers";
import { connect } from "react-redux";

interface IProps {
  thing: Thing;
  properties: { [id: string]: Properties };
}

const options: MUIDataTableOptions = {
  filterType: "checkbox",
  selectableRows: false,
  viewColumns: false,
  pagination: false,
  elevation: 0,
  download: false,
  filter: false,
  search: false,
  print: false
};

const propertyColumns: MUIDataTableColumnDef[] = [
  {
    name: "title",
    label: "Title",
    options: {
      customBodyRender: value => value || "Untitled"
    }
  },
  {
    name: "description",
    label: "Description",
    options: {
      customBodyRender: value => value || "No description provided"
    }
  },
  {
    name: "value",
    label: "Value",
    options: {
      customBodyRender: value => value || "No value found"
    }
  },
];

const columns: MUIDataTableColumnDef[] = [
  {
    name: "title",
    label: "Title",
    options: {
      customBodyRender: value => value || "Untitled"
    }
  },
  {
    name: "description",
    label: "Description",
    options: {
      customBodyRender: value => value || "No description provided"
    }
  }
];

/**
 * Shows the properties, actions and events of a thing.
 * @param thing
 * @param numCols Number of columns to span
 */
const ThingsDetails: FC<IProps> = ({ thing, properties }) => (
  <div style={{ padding: "16px", backgroundColor: "#f8f8f8" }}>
    <MUIDataTable
      title="Properties"
      columns={propertyColumns}
      options={options}
      data={Object.entries(thing.properties).map(([id, prop]) => ({
       title: prop.title,
        description: prop.description,
        value: properties[thing.id] && properties[thing.id].properties[prop.id]
      }))}
    />
    <MUIDataTable
      title="Actions"
      columns={columns}
      options={options}
      data={Object.values(thing.actions)}
    />
    <MUIDataTable
      title="Events"
      columns={columns}
      options={options}
      data={Object.values(thing.events)}
    />
  </div>
);

const mapStateToProps = ({properties: { properties}}: RootState) => ({
  properties
});

export default connect(mapStateToProps)(ThingsDetails);
