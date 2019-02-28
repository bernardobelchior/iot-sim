import React, { FC } from "react";
import { Thing } from "../../models/Thing";
import MUIDataTable, {
  MUIDataTableColumnDef,
  MUIDataTableOptions
} from "mui-datatables";

interface IProps {
  thing: Thing;
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
const ThingsDetails: FC<IProps> = ({ thing }) => (
  <div style={{ padding: "16px", backgroundColor: "#f8f8f8" }}>
    <MUIDataTable
      title="Properties"
      columns={columns}
      options={options}
      data={Object.values(thing.properties)}
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

export default ThingsDetails;
