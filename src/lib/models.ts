// Import
import Joi from 'joi';

// Types
export interface Model {
	name: string;
	properties: string[];
	schema: Joi.Schema;
}

// Crash Type
export interface CrashType {
	id: number;
	name: string;
}

export const crashTypes: Model = {
	name: 'crash_types',
	properties: ['id', 'name'],
	schema: Joi.object({
		id: Joi.number().positive(),
		name: Joi.string().max(255).required()
	})
};

// Crash
export interface Crash {
	id: number;
	region_id: number;
	suburb_id: number;
	units: number;
	fatalities: number;
	injuries: number;
	date: string;
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

export const crashes: Model = {
	name: 'crashes',
	properties: ['id', 'region_id', 'suburb_id', 'units', 'fatalities', 'injuries', 'date', 'time', 'speed_limit', 'road_type_id', 'curve_id', 'slope_id', 'surface_id', 'dry', 'raining', 'day', 'crash_type_id', 'alcohol', 'drugs'],
	schema: Joi.object({
		id: Joi.number().positive(),
		region_id: Joi.number().required(),
		suburb_id: Joi.number().required(),
		units: Joi.number().required(),
		fatalities: Joi.number().required(),
		injuries: Joi.number().required(),
		date: Joi.string().regex(/\d{4}-\d{2}-01/).required(),
		time: Joi.string().regex(/\d{2}:\d{2}/).required(),
		speed_limit: Joi.number().required(),
		road_type_id: Joi.number().required(),
		curve_id: Joi.number().allow(null).required(),
		slope_id: Joi.number().allow(null).required(),
		surface_id: Joi.number().allow(null).required(),
		dry: Joi.boolean().allow(null).required(),
		raining: Joi.boolean().allow(null).required(),
		day: Joi.boolean().required(),
		crash_type_id: Joi.number().required(),
		alcohol: Joi.boolean().required(),
		drugs: Joi.boolean().required()
	})
};

// Curve
export interface Curve {
	id: number;
	name: string;
}

export const curves: Model = {
	name: 'curves',
	properties: ['id', 'name'],
	schema: Joi.object({
		id: Joi.number().positive(),
		name: Joi.string().max(255).required()
	})
};

// Region
export interface Region {
	id: number;
	name: string;
}

export const regions: Model = {
	name: 'regions',
	properties: ['id', 'name'],
	schema: Joi.object({
		id: Joi.number().positive(),
		name: Joi.string().max(255).required()
	})
};
// Road Type
export interface RoadType {
	id: number;
	name: string;
}

export const roadTypes: Model = {
	name: 'road_types',
	properties: ['id', 'name'],
	schema: Joi.object({
		id: Joi.number().positive(),
		name: Joi.string().max(255).required()
	})
};

// Slope
export interface Slope {
	id: number;
	name: string;
}

export const slopes: Model = {
	name: 'slopes',
	properties: ['id', 'name'],
	schema: Joi.object({
		id: Joi.number().positive(),
		name: Joi.string().max(255).required()
	})
};

// Suburb
export interface Suburb {
	id: number;
	name: string;
	postcode: number;
}

export const suburbs: Model = {
	name: 'suburbs',
	properties: ['id', 'name', 'postcode'],
	schema: Joi.object({
		id: Joi.number().positive(),
		name: Joi.string().max(255).required(),
		postcode: Joi.number().required()
	})
};

// Surface
export interface Surface {
	id: number;
	name: string;
}

export const surfaces: Model = {
	name: 'surfaces',
	properties: ['id', 'name'],
	schema: Joi.object({
		id: Joi.number().positive(),
		name: Joi.string().max(255).required()
	})
};

// Export
const models = {
	crashTypes,
	crashes,
	curves,
	regions,
	roadTypes,
	slopes,
	suburbs,
	surfaces
};

export default models;
