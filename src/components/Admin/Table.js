import React, { useState } from "react";
import { useTable } from 'react-table'


export const Table = (props) => {

    const type = props.type
    const dataTable = props.data

    const tableTemplate =
        type === "services" ? [
            { Header: 'Nom', accessor: 'name' },
            { Header: 'Prix', accessor: 'price' },
            { Header: 'Catégorie', accessor: 'category' },
            { Header: 'Prestataire', accessor: 'id' },
            { Header: 'Action', accessor: 'action' }
        ]
            : type === "sellers" ?
                [
                    { Header: 'Nom', accessor: 'companyName' },
                    { Header: 'Adresse', accessor: 'adress' },
                    { Header: 'Catégorie', accessor: 'category' },
                    { Header: 'Sous catégorie', accessor: 'subcategory' },
                    { Header: 'Id', accessor: 'id' },
                    { Header: 'statut', accessor: 'status' },
                    { Header: 'Action', accessor: 'action' }
                ]
                : type === "events" ?
                    [
                        { Header: 'Nom', accessor: 'name' },
                        { Header: 'Adresse', accessor: 'place' },
                        { Header: 'Budget', accessor: 'budget' },
                        { Header: 'Personnes', accessor: 'people' },
                        { Header: 'm²', accessor: 'placeSize' },
                        { Header: 'Statut', accessor: 'statut' },
                        { Header: 'Date', accessor: 'date' },
                        { Header: 'Action', accessor: 'action' }
                    ]
                    : type === "users" &&
                    [
                        { Header: 'Email', accessor: 'email' },
                        { Header: 'Prénom', accessor: 'firstName' },
                        { Header: 'Nom', accessor: 'name' },
                        { Header: 'Tel', accessor: 'tel' },
                        { Header: 'Genre', accessor: 'gender' },
                        { Header: 'Id', accessor: 'id' },
                        { Header: 'Action', accessor: 'action' }
                    ]


    const columns = React.useMemo(
        () => tableTemplate,
        []
    )

    const data = React.useMemo(
        () => dataTable,
        [dataTable]
    )

    const tableInstance = useTable({ columns, data })
    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
    } = tableInstance


    return (
        <table {...getTableProps()}>
            <thead>
                {// Loop over the header rows
                    headerGroups.map(headerGroup => (
                        // Apply the header row props
                        <tr {...headerGroup.getHeaderGroupProps()}>
                            {// Loop over the headers in each row
                                headerGroup.headers.map(column => (
                                    // Apply the header cell props
                                    <th {...column.getHeaderProps()}>
                                        {// Render the header
                                            column.render('Header')}
                                    </th>
                                ))}
                        </tr>
                    ))}
            </thead>
            {/* Apply the table body props */}
            <tbody {...getTableBodyProps()}>
                {// Loop over the table rows
                    rows.map(row => {
                        // Prepare the row for display
                        prepareRow(row)
                        return (
                            // Apply the row props
                            <tr {...row.getRowProps()}>
                                {// Loop over the rows cells
                                    row.cells.map(cell => {
                                        // Apply the cell props
                                        return (
                                            <td className={
                                                cell.value === "validated" ? "validatedStatus"
                                                    : cell.value === "pending" ? "pendingStatus"
                                                        : cell.value === "subscribing" && "subscribingStatus"
                                            }
                                                {...cell.getCellProps()}
                                            >
                                                {// Render the cell contents
                                                    cell.value === "validated" ? "Validé"
                                                        : cell.value === "pending" ? "En attente de validation"
                                                            : cell.value === "subscribing" ? "Documents manquants"
                                                                :
                                                                cell.render('Cell')
                                                }
                                            </td>
                                        )
                                    })}
                            </tr>
                        )
                    })}
            </tbody>
        </table>
    );
}
