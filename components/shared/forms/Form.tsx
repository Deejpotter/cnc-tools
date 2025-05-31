"use client";
import React, { useState, FormEvent } from "react";

/**
 * Form field configuration
 * @interface FormField
 * @property {string} name - Field name (used as form data key)
 * @property {string} label - Display label for the field
 * @property {"text"|"number"|"email"|"password"|"textarea"|"select"|"checkbox"|"radio"|"file"|"date"|"time"|"datetime-local"|"hidden"} type - Input type
 * @property {any} [defaultValue] - Default value for the field
 * @property {string} [placeholder] - Placeholder text
 * @property {boolean} [required=false] - Whether the field is required
 * @property {string} [helperText] - Helper text to display below the field
 * @property {Record<string, any>} [validation] - Validation rules
 * @property {string[]} [options] - Options for select, radio, checkbox
 * @property {Record<string, any>} [optionConfig] - Config for select options (label/value pairs)
 * @property {React.ReactNode} [prefix] - Content to display before the input
 * @property {React.ReactNode} [suffix] - Content to display after the input
 * @property {string} [className] - Additional CSS classes for the field
 * @property {boolean} [disabled=false] - Whether the field is disabled
 * @property {boolean} [readOnly=false] - Whether the field is read-only
 */
export interface FormField {
	name: string;
	label: string;
	type:
		| "text"
		| "number"
		| "email"
		| "password"
		| "textarea"
		| "select"
		| "checkbox"
		| "radio"
		| "file"
		| "date"
		| "time"
		| "datetime-local"
		| "hidden";
	defaultValue?: any;
	placeholder?: string;
	required?: boolean;
	helperText?: string;
	validation?: Record<string, any>;
	options?: string[];
	optionConfig?: Record<string, any>[];
	prefix?: React.ReactNode;
	suffix?: React.ReactNode;
	className?: string;
	disabled?: boolean;
	readOnly?: boolean;
}

/**
 * Props for the Form component
 * @interface FormProps
 * @property {FormField[]} fields - Array of form field configurations
 * @property {string} [submitLabel="Submit"] - Label for the submit button
 * @property {string} [cancelLabel="Cancel"] - Label for the cancel button
 * @property {boolean} [showCancel=false] - Whether to show the cancel button
 * @property {(data: Record<string, any>) => void} onSubmit - Callback when form is submitted
 * @property {() => void} [onCancel] - Callback when form is canceled
 * @property {string} [className] - Additional CSS classes
 * @property {boolean} [loading=false] - Whether the form is in a loading state
 * @property {string} [loadingText="Processing..."] - Text to display when loading
 * @property {string} [title] - Form title
 * @property {string} [description] - Form description
 * @property {"row" | "column"} [layout="column"] - Form layout direction
 * @property {string} [validationErrors] - Error message to display
 * @property {boolean} [autoComplete=true] - Whether to enable browser autocomplete
 */
export interface FormProps {
	fields: FormField[];
	submitLabel?: string;
	cancelLabel?: string;
	showCancel?: boolean;
	onSubmit: (data: Record<string, any>) => void;
	onCancel?: () => void;
	className?: string;
	loading?: boolean;
	loadingText?: string;
	title?: string;
	description?: string;
	layout?: "row" | "column";
	validationErrors?: string;
	autoComplete?: boolean;
}

/**
 * Generic form component that generates a form from a configuration object
 *
 * @example
 * // Basic usage
 * <Form
 *   fields={[
 *     {
 *       name: "email",
 *       label: "Email Address",
 *       type: "email",
 *       required: true,
 *       placeholder: "Enter your email"
 *     },
 *     {
 *       name: "password",
 *       label: "Password",
 *       type: "password",
 *       required: true
 *     }
 *   ]}
 *   onSubmit={(data) => console.log(data)}
 *   submitLabel="Log In"
 * />
 *
 * @param {FormProps} props - The component props
 * @returns {JSX.Element} The rendered Form component
 */
const Form: React.FC<FormProps> = ({
	fields,
	submitLabel = "Submit",
	cancelLabel = "Cancel",
	showCancel = false,
	onSubmit,
	onCancel,
	className = "",
	loading = false,
	loadingText = "Processing...",
	title,
	description,
	layout = "column",
	validationErrors,
	autoComplete = true,
}) => {
	// Initialize form state from fields
	const initialState = fields.reduce((acc, field) => {
		acc[field.name] =
			field.defaultValue !== undefined ? field.defaultValue : "";
		return acc;
	}, {} as Record<string, any>);

	const [formData, setFormData] = useState<Record<string, any>>(initialState);
	const [errors, setErrors] = useState<Record<string, string>>({});

	// Handle form submission
	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();

		// Validate form
		const newErrors: Record<string, string> = {};
		let isValid = true;

		fields.forEach((field) => {
			// Required validation
			if (field.required && !formData[field.name]) {
				newErrors[field.name] = `${field.label} is required`;
				isValid = false;
			}

			// Email validation
			if (
				field.type === "email" &&
				formData[field.name] &&
				!/\S+@\S+\.\S+/.test(formData[field.name])
			) {
				newErrors[field.name] = "Please enter a valid email address";
				isValid = false;
			}

			// Number validation
			if (
				field.type === "number" &&
				formData[field.name] !== "" &&
				isNaN(Number(formData[field.name]))
			) {
				newErrors[field.name] = "Please enter a valid number";
				isValid = false;
			}
		});

		setErrors(newErrors);

		if (isValid) {
			onSubmit(formData);
		}
	};

	// Handle input change
	const handleChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
		>
	) => {
		const { name, value, type } = e.target;

		// For checkboxes, we need to handle differently
		if (type === "checkbox") {
			const checked = (e.target as HTMLInputElement).checked;
			setFormData((prev) => ({ ...prev, [name]: checked }));
		} else {
			setFormData((prev) => ({ ...prev, [name]: value }));
		}

		// Clear error when field is edited
		if (errors[name]) {
			setErrors((prev) => {
				const newErrors = { ...prev };
				delete newErrors[name];
				return newErrors;
			});
		}
	};

	// Render a single form field based on its type
	const renderField = (field: FormField) => {
		const {
			name,
			label,
			type,
			placeholder,
			required,
			helperText,
			options,
			optionConfig,
			prefix,
			suffix,
			className = "",
			disabled = false,
			readOnly = false,
		} = field;

		const fieldId = `form-field-${name}`;
		const hasError = errors[name] !== undefined;

		// Common props for input elements
		const commonProps = {
			id: fieldId,
			name,
			value: formData[name] || "",
			onChange: handleChange,
			placeholder,
			required,
			disabled: disabled || loading,
			readOnly,
			className: `form-control ${hasError ? "is-invalid" : ""} ${className}`,
			"aria-describedby": helperText ? `${fieldId}-help` : undefined,
		};

		// Different types of form controls
		switch (type) {
			case "textarea":
				return <textarea {...commonProps} rows={4} />;

			case "select":
				return (
					<select {...commonProps}>
						<option value="">Select {label}</option>
						{optionConfig
							? optionConfig.map((opt, idx) => (
									<option key={idx} value={opt.value}>
										{opt.label}
									</option>
							  ))
							: options?.map((option) => (
									<option key={option} value={option}>
										{option}
									</option>
							  ))}
					</select>
				);

			case "checkbox":
				return (
					<div className="form-check">
						<input
							type="checkbox"
							id={fieldId}
							name={name}
							checked={!!formData[name]}
							onChange={handleChange}
							disabled={disabled || loading}
							className={`form-check-input ${
								hasError ? "is-invalid" : ""
							} ${className}`}
						/>
						<label className="form-check-label" htmlFor={fieldId}>
							{label}
						</label>
					</div>
				);

			case "radio":
				return (
					<div>
						{options?.map((option) => (
							<div className="form-check" key={option}>
								<input
									type="radio"
									id={`${fieldId}-${option}`}
									name={name}
									value={option}
									checked={formData[name] === option}
									onChange={handleChange}
									disabled={disabled || loading}
									className={`form-check-input ${
										hasError ? "is-invalid" : ""
									} ${className}`}
								/>
								<label
									className="form-check-label"
									htmlFor={`${fieldId}-${option}`}
								>
									{option}
								</label>
							</div>
						))}
					</div>
				);

			// Default case handles text, number, email, password, date, etc.
			default:
				return (
					<div className={`input-group ${hasError ? "has-validation" : ""}`}>
						{prefix && <span className="input-group-text">{prefix}</span>}
						<input type={type} {...commonProps} />
						{suffix && <span className="input-group-text">{suffix}</span>}
					</div>
				);
		}
	};

	return (
		<form
			onSubmit={handleSubmit}
			className={className}
			noValidate
			autoComplete={autoComplete ? "on" : "off"}
		>
			{/* Form title and description */}
			{title && <h3 className="mb-3">{title}</h3>}
			{description && <p className="mb-4">{description}</p>}

			{/* Form fields */}
			<div className={`${layout === "row" ? "row" : ""}`}>
				{fields.map((field) => (
					<div
						key={field.name}
						className={`mb-3 ${layout === "row" ? "col-md-6" : ""} ${
							field.type === "hidden" ? "d-none" : ""
						}`}
					>
						{field.type !== "checkbox" && field.type !== "hidden" && (
							<label
								htmlFor={`form-field-${field.name}`}
								className="form-label"
							>
								{field.label}
								{field.required && <span className="text-danger ms-1">*</span>}
							</label>
						)}

						{renderField(field)}

						{/* Helper text */}
						{field.helperText && !errors[field.name] && (
							<div id={`form-field-${field.name}-help`} className="form-text">
								{field.helperText}
							</div>
						)}

						{/* Field error message */}
						{errors[field.name] && (
							<div className="invalid-feedback d-block">
								{errors[field.name]}
							</div>
						)}
					</div>
				))}
			</div>

			{/* Form-level validation errors */}
			{validationErrors && (
				<div className="alert alert-danger mb-3">{validationErrors}</div>
			)}

			{/* Form actions */}
			<div className="d-flex gap-2 mt-4">
				<button type="submit" className="btn btn-primary" disabled={loading}>
					{loading ? loadingText : submitLabel}
				</button>

				{showCancel && onCancel && (
					<button
						type="button"
						className="btn btn-outline-secondary"
						onClick={onCancel}
						disabled={loading}
					>
						{cancelLabel}
					</button>
				)}
			</div>
		</form>
	);
};

export default Form;
