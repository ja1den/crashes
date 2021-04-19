// Import
import Joi from 'joi';

// Crash Type
export interface CrashType {
	id: number;
	name: string;
}

export const crashType = Joi.object({
	name: Joi.string().max(255).required()
});

// Crash
export interface Crash {
	id: number;
	region_id: number;
	suburb_id: number;
	units: number;
	fatalities: number;
	injuries: number;
	date: Date;
	time: string;
	speed_limit: number;
	road_type_id: number;
	curve_id: number | null;
	slope_id: number | null;
	surface_id: number | null;
	dry: boolean | null;
	raining: boolean | null;
	day: boolean;
	crash_type_id: number;
	alcohol: boolean;
	drugs: boolean;
}

export const crash = Joi.object({
	region_id: Joi.number().required(),
	suburb_id: Joi.number().required(),
	units: Joi.number().required(),
	fatalities: Joi.number().required(),
	injuries: Joi.number().required(),
	date: Joi.date().required(),
	time: Joi.string().required(),
	speed_limit: Joi.number().required(),
	road_type_id: Joi.number().required(),
	curve_id: Joi.number().required(),
	slope_id: Joi.number().required(),
	surface_id: Joi.number().required(),
	dry: Joi.boolean().required(),
	raining: Joi.boolean().required(),
	day: Joi.boolean().required(),
	crash_type_id: Joi.number().required(),
	alcohol: Joi.boolean().required(),
	drugs: Joi.boolean().required()
});

// Curve
export interface Curve {
	id: number;
	name: string;
}

export const curve = Joi.object({
	name: Joi.string().max(255).required()
});

// Region
export interface Region {
	id: number;
	name: string;
}

export const region = Joi.object({
	name: Joi.string().max(255).required()
});

// Road Type
export interface RoadType {
	id: number;
	name: string;
}

export const roadType = Joi.object({
	name: Joi.string().max(255).required()
});

// Slope
export interface Slope {
	id: number;
	name: string;
}

export const slope = Joi.object({
	name: Joi.string().max(255).required()
});

// Suburb
export interface Suburb {
	id: number;
	name: string;
	postcode: number;
}

export const suburb = Joi.object({
	name: Joi.string().max(255).required(),
	postcode: Joi.number().required()
});

// Surface
export interface Surface {
	id: number;
	name: string;
}

export const surface = Joi.object({
	name: Joi.string().max(255).required()
});
