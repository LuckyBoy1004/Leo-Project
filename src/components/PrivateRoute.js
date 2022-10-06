import React from 'react'
import { Redirect, Route } from 'react-router-dom'
import { useAuth } from '../context/userContext'

export default function PrivateRoute({ comp: Component, ...rest }) {
    const { user } = useAuth()
    return (
        <Route
            {...rest}
            render={props => {
                return user ? <Component {...props} /> : <Redirect to='/compte' />
            }}
        >
        </Route>
    )
}