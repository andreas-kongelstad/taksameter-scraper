export class TollbothRow {
    index: number;
    id: string;
    name: string;
    barrier: string;
    tariffType: TariffType;
    tariffGroupId: number;
    tariffGroupName: string;
    tariffGroupRushHourStart: string;
    tariffGroupRushHourEnd: string;
    tariffGroupTaxName: string;
    tariffGroupTaxRateLow: number;
    tariffGroupTaxRateHigh: number; 
    geometryType: string;
    geometryLatitude: number;
    geometryLongitude: number;
    constructor() {} 
    public toString = (deliminator: string) : string => {
        return `${this.index}${deliminator}${this.id}${deliminator}${this.name}${deliminator}${this.barrier}${deliminator}${this.tariffType}${deliminator}${this.tariffGroupId}${deliminator}${this.tariffGroupName}${deliminator}${this.tariffGroupRushHourStart}${deliminator}${this.tariffGroupRushHourEnd}${deliminator}${this.tariffGroupTaxName}${deliminator}${this.tariffGroupTaxRateLow}${deliminator}${this.tariffGroupTaxRateHigh}${deliminator}${this.geometryType}${deliminator}${this.geometryLatitude}${deliminator}${this.geometryLongitude}`;
    } 
  }

export class TollBoth {
    id: string;
    name: string;   
    barrier?: string;
    tariff?: Tariff;
    geometry?: Geometry;
  }
  
  export interface Tariff {
    type: TariffType;
    groups: TariffGroup[];    
  }
  
export interface TariffGroup {
    id: number;
    name: string;
    rushhour: RushHour[];  
    tax: Tax[];
}

export interface RushHour {
    start: string;
    end: string;
}

  export interface Tax {
    name: string;
    rate: TaxRate;
  }
  
  export interface TaxRate {
    low: number;
    high: number;
  }
  
  export interface Geometry {
    type: string;
    coordinates: Array<number>
  }
  
  export enum TariffType {
    oneway = 'Enveis-betaling',
    twoway = 'Toveis-betaling'
  }
  export class Convert {
    public static toTollBoth(json: string): TollBoth[] {
        return JSON.parse(json);
    }
  
    public static TollBothToJson(value: TollBoth[]): string {
        return JSON.stringify(value);
    }
  }
  /*

  // To parse this data:
//
//   import { Convert } from "./file";
//
//   const tollBoth = Convert.toTollBoth(json);

export interface TollBoth {
    name:     string;
    barrier:  Barrier;
    tariff:   Tariff;
    geometry: Geometry;
}

export enum Barrier {
    Bygrensen = "Bygrensen",
    IndreRing = "Indre ring",
    Osloringen = "Osloringen",
}

export interface Geometry {
    type:        GeometryType;
    coordinates: number[];
}

export enum GeometryType {
    Point = "Point",
}

export interface Tariff {
    type:   TariffType;
    groups: Group[];
}

export interface Group {
    id:   number;
    name: GroupName;
    tax:  Tax[];
}

export enum GroupName {
    Takstgruppe1 = "Takstgruppe 1",
    Takstgruppe2 = "Takstgruppe 2",
}

export interface Tax {
    name: TaxName;
    rate: Rate;
}

export enum TaxName {
    Andre = "Andre",
    Bensin = "Bensin",
    Diesel = "Diesel",
    Elbil = "Elbil",
    EuroVI = "Euro VI",
    EuroVOgEldre = "Euro V og eldre",
    HybridBensin = "Hybrid bensin",
    HybridDiesel = "Hybrid diesel",
    Hydrogen = "Hydrogen",
    LadbarHybrid = "Ladbar hybrid",
    Nullutslipp = "Nullutslipp",
}

export interface Rate {
    low:  number;
    high: number;
}

export enum TariffType {
    EnveisBetaling = "Enveis-betaling",
    ToveisBetaling = "Toveis-betaling",
}

// Converts JSON strings to/from your types
export class Convert {
    public static toTollBoth(json: string): TollBoth[] {
        return JSON.parse(json);
    }

    public static tollBothToJson(value: TollBoth[]): string {
        return JSON.stringify(value);
    }
}


  */

  /*
{
    "$schema": "http://json-schema.org/draft-06/schema#",
    "type": "array",
    "items": {
        "$ref": "#/definitions/TollBothElement"
    },
    "definitions": {
        "TollBothElement": {
            "type": "object",
            "additionalProperties": false,
            "properties": {
                "name": {
                    "type": "string"
                },
                "barrier": {
                    "$ref": "#/definitions/Barrier"
                },
                "tariff": {
                    "$ref": "#/definitions/Tariff"
                },
                "geometry": {
                    "$ref": "#/definitions/Geometry"
                }
            },
            "required": [
                "barrier",
                "geometry",
                "name",
                "tariff"
            ],
            "title": "TollBothElement"
        },
        "Geometry": {
            "type": "object",
            "additionalProperties": false,
            "properties": {
                "type": {
                    "$ref": "#/definitions/GeometryType"
                },
                "coordinates": {
                    "type": "array",
                    "items": {
                        "type": "number"
                    }
                }
            },
            "required": [
                "coordinates",
                "type"
            ],
            "title": "Geometry"
        },
        "Tariff": {
            "type": "object",
            "additionalProperties": false,
            "properties": {
                "type": {
                    "$ref": "#/definitions/TariffType"
                },
                "groups": {
                    "type": "array",
                    "items": {
                        "$ref": "#/definitions/Group"
                    }
                }
            },
            "required": [
                "groups",
                "type"
            ],
            "title": "Tariff"
        },
        "Group": {
            "type": "object",
            "additionalProperties": false,
            "properties": {
                "id": {
                    "type": "integer"
                },
                "name": {
                    "$ref": "#/definitions/GroupName"
                },
                "tax": {
                    "type": "array",
                    "items": {
                        "$ref": "#/definitions/Tax"
                    }
                }
            },
            "required": [
                "id",
                "name",
                "tax"
            ],
            "title": "Group"
        },
        "Tax": {
            "type": "object",
            "additionalProperties": false,
            "properties": {
                "name": {
                    "$ref": "#/definitions/TaxName"
                },
                "rate": {
                    "$ref": "#/definitions/Rate"
                }
            },
            "required": [
                "name",
                "rate"
            ],
            "title": "Tax"
        },
        "Rate": {
            "type": "object",
            "additionalProperties": false,
            "properties": {
                "low": {
                    "type": "integer"
                },
                "high": {
                    "type": "integer"
                }
            },
            "required": [
                "high",
                "low"
            ],
            "title": "Rate"
        },
        "Barrier": {
            "type": "string",
            "enum": [
                "Bygrensen",
                "Osloringen",
                "Indre ring"
            ],
            "title": "Barrier"
        },
        "GeometryType": {
            "type": "string",
            "enum": [
                "Point"
            ],
            "title": "GeometryType"
        },
        "GroupName": {
            "type": "string",
            "enum": [
                "Takstgruppe 1",
                "Takstgruppe 2"
            ],
            "title": "GroupName"
        },
        "TaxName": {
            "type": "string",
            "enum": [
                "Diesel",
                "Bensin",
                "Hybrid diesel",
                "Hybrid bensin",
                "Ladbar hybrid",
                "Elbil",
                "Hydrogen",
                "Euro V og eldre",
                "Euro VI",
                "Nullutslipp",
                "Andre"
            ],
            "title": "TaxName"
        },
        "TariffType": {
            "type": "string",
            "enum": [
                "Enveis-betaling",
                "Toveis-betaling"
            ],
            "title": "TariffType"
        }
    }
}


  */