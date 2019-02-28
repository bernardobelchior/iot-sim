import axios from "./axios";
import { Thing } from "../models/Thing";

export async function fetchThings(): Promise<Thing[]> {
  const { data } = await axios.get("/things");

  return data;
}
