"use client";
import React from "react";

interface ExtrusionConfigPanelProps {
	profile: string;
	color: string;
	tapping?: string;
	onProfileChange: (value: string) => void;
	onColorChange: (value: string) => void;
	onTappingChange?: (value: string) => void;
	profiles: { value: string; label: string }[];
	colors: { value: string; label: string }[];
	tappingOptions?: { value: string; label: string }[];
}

const ExtrusionConfigPanel: React.FC<ExtrusionConfigPanelProps> = ({
	profile,
	color,
	tapping,
	onProfileChange,
	onColorChange,
	onTappingChange,
	profiles,
	colors,
	tappingOptions,
}) => {
	return (
		<div className="card mb-4">
			<div className="card-body">
				<div className="row g-3">
					<div className="col-md-4">
						<label className="form-label">Profile</label>
						<select
							className="form-select"
							value={profile}
							onChange={(e) => onProfileChange(e.target.value)}
						>
							{profiles.map((p) => (
								<option key={p.value} value={p.value}>
									{p.label}
								</option>
							))}
						</select>
					</div>
					<div className="col-md-4">
						<label className="form-label">Color</label>
						<select
							className="form-select"
							value={color}
							onChange={(e) => onColorChange(e.target.value)}
						>
							{colors.map((c) => (
								<option key={c.value} value={c.value}>
									{c.label}
								</option>
							))}
						</select>
					</div>
					{tappingOptions && onTappingChange && (
						<div className="col-md-4">
							<label className="form-label">Tapping Option</label>
							<select
								className="form-select"
								value={tapping}
								onChange={(e) => onTappingChange(e.target.value)}
							>
								{tappingOptions.map((t) => (
									<option key={t.value} value={t.value}>
										{t.label}
									</option>
								))}
							</select>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default ExtrusionConfigPanel;
