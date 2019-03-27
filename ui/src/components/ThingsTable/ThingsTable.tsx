import React, { FC } from "react";
import UpdateIcon from "@material-ui/icons/Update";
import MUIDataTable, { MUIDataTableOptions } from "mui-datatables";
import ThingsDetails from "./ThingsDetails";
import { Thing } from "../../models/Thing";
import { IconButton } from "@material-ui/core";

const columns = [
  {
    name: "name",
    label: "Name",
    options: {
      filter: true,
      sort: true
    }
  },
  {
    name: "description",
    label: "Description",
    options: {
      filter: true,
      sort: false
    }
  },
  {
    name: "href",
    label: "Link",
    options: {
      filter: true,
      sort: false
    }
  }
];

interface IProps {
  things: Thing[];
  update: () => void;
}

const ThingsTable: FC<IProps> = ({ things, update }) => {
  const options: MUIDataTableOptions = {
    filterType: "checkbox",
    selectableRows: false,
    expandableRows: true,
    viewColumns: false,
    customToolbar: () => (<IconButton onClick={update}><UpdateIcon/></IconButton>),

    renderExpandableRow: (rowData, rowMeta) => (
      <tr>
        <td colSpan={columns.length + 1}>
          <ThingsDetails thing={things[rowMeta.dataIndex]} />
        </td>
      </tr>
    )
  };

  return (
    <MUIDataTable
      title="Things"
      data={things}
      columns={columns}
      options={options}
    />
  );
};

export default ThingsTable;
