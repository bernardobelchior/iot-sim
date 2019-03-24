import { IPropertyMetadata } from "./Property";

enum DataType {
  integer = "integer",
  boolean = "boolean",
  enum = "enum",
  string = "string",
  number = "number"
}

/**
 * Get the current time.
 *
 * @returns {String} The current time in the form YYYY-mm-ddTHH:MM:SS+00:00
 */
export const timestamp = (): string => {
  const date = new Date().toISOString();
  return date.replace(/\.\d{3}Z/, "+00:00");
};

export class ValueGenerator {
  type: DataType;
  metadata: IPropertyMetadata;
  values: any[] = [];

  constructor(type: string, metadata: IPropertyMetadata) {
    if (!Object.values(DataType).includes(type)) {
      throw Error("Invalid type");
    }
    const typeIdx = type as keyof typeof DataType;
    this.type = DataType[typeIdx];
    this.metadata = metadata;
  }

  generateValue(oldValue: any) {
    this.values.push(oldValue);
    return -1;
  }
}