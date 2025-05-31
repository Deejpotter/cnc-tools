"use client";
import React from "react";

export interface ConfigOption {
	value: string;
	label: string;
}

export interface MaterialConfig {
	type: string; // e.g., profile, thickness, width
	value: string;
	options: ConfigOption[];
	onChange: (value: string) => void;
}

interface ConfigPanelProps {
	configs: MaterialConfig[];
	className?: string;
}

/**
 * A generic configuration panel for material properties
 * Can be used for extrusions, sheets, or any other material type
 */
const ConfigPanel: React.FC<ConfigPanelProps> = ({
	configs,
	className = "",
}) => {
	return (
		<div className={`card mb-4 ${className}`}>
			<div className="card-body">
				<div className="row g-3">
					{configs.map((config, index) => (
						<div key={index} className="col-md-4">
							<label className="form-label">{config.type}</label>
							<select
								className="form-select"
								value={config.value}
								onChange={(e) => config.onChange(e.target.value)}
							>
								{config.options.map((opt) => (
									<option key={opt.value} value={opt.value}>
										{opt.label}
									</option>
								))}
							</select>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default ConfigPanel;
