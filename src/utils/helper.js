import { styled } from '@mui/system';
import { DataGrid } from "@mui/x-data-grid";

export const CustomDataGrid = styled(DataGrid)`
  && {
    /* Set the width to 100% */
    width: 100%;

    /* Remove any margin or padding */
    margin: 0;
    padding: 0;

    /* Add border-spacing to remove space between cells */
    border-spacing: 0;

    /* Add border-collapse to collapse borders between cells */
    border-collapse: collapse;

    /* Add a border to the table */
    border: 1px solid color(srgb 0.955 0.965 0.9736); /* Add the desired border color here */

    /* Set the width of the table to fill the available space */
    /* Use the parent container's width or a fixed width if needed */
    /* If using with a parent container, make sure the container has no padding or margin */
    /* Example: */
    /* width: 100%; */
    /* Or fixed width: */
    /* width: 800px; */

    /* Add padding to rows */
    & .MuiDataGrid-row{
      padding: 8px; /* Adjust the padding value as desired */
      border-bottom: 1px solid #bdbdbd29;  /* Remove the border-bottom property to eliminate the bottom border */
      /* Additional styling if needed */
    }

    & .MuiDataGrid-cell.MuiDataGrid-cell--withRenderer.MuiDataGrid-cell--textLeft {
      outline: none;
      box-shadow: none;
    }

    & .MuiDataGrid-columnHeaderTitle {
      font-weight: 1000
    }

    /* Add padding to cells */
    & .MuiDataGrid-cell {
      border: none !important;
      padding: 8px; /* Adjust the padding value as desired */
    }
    /* Remove border from cells when focused */
    & .MuiDataGrid-cell:focus {
      outline: none;
      box-shadow: none;
    }

    & .MuiDataGrid-columnHeader {
      outline: none !important;
      background-color: #F8F9FA;
      width: 100%; /* Set the header width to 100% */
    }


    /* Add padding to the toolbar container */
    & .MuiDataGrid-toolbarContainer {
      padding: 15px; /* Adjust the padding value as desired */
    }
  }
`;
