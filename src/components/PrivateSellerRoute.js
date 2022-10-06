import React from 'react'
import { Redirect, Route } from 'react-router-dom'
import { useAuth } from '../context/userContext'

export default function PrivateRoute({ comp: Component, ...rest }) {
    const { seller } = useAuth()
    return (
        <Route
            {...rest}
            render={props => {
                return /*seller ? */<Component {...props} />/* : <Redirect to='/acces-prestataire' />*/
            }}
        >
        </Route>
    )
}