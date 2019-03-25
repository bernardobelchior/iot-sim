import { IPropertyMetadata } from "./Property";

enum DataType {
  integer = "integer",
  boolean = "boolean",
  enum = "enum",
  string = "string",
  number = "number"
}

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