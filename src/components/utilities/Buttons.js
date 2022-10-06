import React from 'react'

export const ButtonSmall = ({ onClick, color, value, marginTop, marginRight, disabled, classname, icon, iconMUIStart, iconMUIEnd }) => {
    return (
        <button
            style={{ marginTop: marginTop, marginRight: marginRight }}
            className={`smallButton ${color && color} ${classname && classname} ${disabled && "disabled"}`}
            onClick={onClick}
            disabled={disabled}
        >
            {iconMUIStart && iconMUIStart} 
            {icon && <img alt="" src={icon} />}{value}
            {iconMUIEnd && iconMUIEnd}
        </button>
    )
}

export const ButtonLarge = ({ onClick, color, value, marginTop, marginRight, disabled, width }) => {
    return (
        <button
            style={{ marginTop: marginTop, marginRight: marginRight, width: width }}
            className={`largeButton ${color}`}
            onClick={onClick}
            disabled={disabled}
        >
            {value}
        </button>
    )
}

export const ButtonRoundLarge = ({ onClick, color, value, marginTop, marginRight, disabled }) => {
    return (
        <button
            style={{ marginTop: marginTop, marginRight: marginRight }}
            className={`largeRoundButton largeButton ${color}`}
            onClick={onClick}
            disabled={disabled}
        >
            {value}
        </button>
    )
}