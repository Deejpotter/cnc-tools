"use client";
import React from "react";

/**
 * Props for the Input component
 * @interface InputProps
 * @property {string} [id] - The ID for the input element
 * @property {string} [name] - The name attribute for the input
 * @property {string} [label] - Label text for the input
 * @property {string} [type="text"] - Input type (text, number, email, etc.)
 * @property {string} [value] - Current value of the input
 * @property {function} [onChange] - Function to call when input changes
 * @property {string} [placeholder] - Placeholder text
 * @property {boolean} [required=false] - Whether the input is required
 * @property {string} [error] - Error message to display
 * @property {string} [className] - Additional CSS classes for the input wrapper
 * @property {string} [inputClassName] - Additional CSS classes for the input element
 * @property {string} [labelClassName] - Additional CSS classes for the label
 * @property {boolean} [disabled=false] - Whether the input is disabled
 * @property {React.ReactNode} [helpText] - Optional help text to display below the input
 */
export interface InputProps {
	id?: string;
	name?: string;
	label?: string;
	type?: string;
	value?: string | number;
	onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
	placeholder?: string;
	required?: boolean;
	error?: string;
	className?: string;
	inputClassName?: string;
	labelClassName?: string;
	disabled?: boolean;
	helpText?: React.ReactNode;
}

/**
 * A reusable input component
 *
 * This component provides a standard input field with support for labels,
 * error messages, and help text. It's designed to work with Bootstrap's styling.
 *
 * @param {InputProps} props - The component props
 * @returns {JSX.Element} The rendered Input component
 */
const Input: React.FC<InputProps> = ({
	id,
	name,
	label,
	type = "text",
	value,
	onChange,
	placeholder,
	required = false,
	error,
	className = "",
	inputClassName = "",
	labelClassName = "",
	disabled = false,
	helpText,
}) => {
	// Generate a unique ID if none is provided
	const inputId =
		id || `input-${name || Math.random().toString(36).substr(2, 9)}`;

	return (
		<div className={`mb-3 ${className}`}>
			{label && (
				<label htmlFor={inputId} className={`form-label ${labelClassName}`}>
					{label}
					{required && <span className="text-danger ms-1">*</span>}
				</label>
			)}

			<input
				id={inputId}
				name={name}
				type={type}
				value={value}
				onChange={onChange}
				placeholder={placeholder}
				required={required}
				disabled={disabled}
				className={`form-control ${
					error ? "is-invalid" : ""
				} ${inputClassName}`}
			/>

			{helpText && <div className="form-text">{helpText}</div>}
			{error && <div className="invalid-feedback">{error}</div>}
		</div>
	);
};

export default Input;
