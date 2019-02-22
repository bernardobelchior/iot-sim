import axios from "./axios";

export async function fetchThings(): Promise<Array<{ [key: string]: any }>> {
  const { data } = await axios.get("/things");

  return data;
}
